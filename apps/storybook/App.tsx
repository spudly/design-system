import { useEffect, useMemo, useState } from "react";
import { Linking as RNLinking, LogBox, View } from "react-native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SET_CURRENT_STORY, STORY_RENDERED, UPDATE_GLOBALS } from "storybook/internal/core-events";
import StorybookUIRoot, { view } from "./Storybook";
import { setCaptureThemeOverride } from "./captureTheme";
import { createStoryLinkOpenURL } from "./storyLinks";

// App-side full-content capture module (design-system #137).
// Required defensively: if the native module is not linked (e.g. a
// JS-only runtime), capture mode signals APPCAP_ERROR instead of
// crashing the host app, and the driver fails that capture loudly.
let captureFullPageNative:
  typeof import("./modules/dsvr-capture/src/index").captureFullPage | null = null;
try {
  captureFullPageNative = require("./modules/dsvr-capture/src/index").captureFullPage;
} catch {
  captureFullPageNative = null;
}

// Story link routing (#300 — see storyLinks.ts): wrap the
// platform Linking.openURL, the call Tamagui's Anchor makes for
// every href press, so scheme-less app paths from stories route
// to this host's browse URL instead of rejecting. The browse URL
// comes from expo-linking's createURL so it matches how the host
// was started: spudlyds://browse in a native build, the
// exp://…/--/browse form in Expo Go (which registers no custom
// scheme). Installed at module scope so it is in place before
// any story renders, in browse and capture mode alike (capture
// never presses links; the wrap is inert there).
RNLinking.openURL = createStoryLinkOpenURL(
  RNLinking.openURL.bind(RNLinking),
  Linking.createURL("browse"),
);

// ---------------------------------------------------------------------------
// Capture protocol (used by tools/visualRegression/run.mjs — see
// docs/android-visual-regression.md):
//
// - At boot the app logs its story index: a `DSVR INDEX_BEGIN <n>`
//   line, one `DSVR INDEX_ITEM <storyId>` line per story, and
//   `DSVR INDEX_END` (React Native logs land in logcat under the
//   logcat).
// - Opening `spudlyds://capture/<storyId>?theme=<subTheme>&nonce=<n>`
//   switches to capture mode: only that story renders (no Storybook
//   chrome, LogBox suppressed). When the story has rendered, the app
//   logs `DSVR READY <nonce> <storyId>`. The requested theme reaches
//   the preview decorator through captureTheme.ts, not only the
//   globals channel — story-pinned globals outrank UPDATE_GLOBALS
//   (see that module).
// - With `&appcapture=1` on the capture URL (the driver sends it
//   unless run with --no-app-capture), after READY the app also
//   draws the story's full content — including everything below
//   the fold — into a PNG via the dsvr-capture native module and
//   logs `DSVR APPCAP <nonce> <storyId> path=... w=... h=...
//   mode=... ...` (or `DSVR APPCAP_ERROR <nonce> <storyId>
//   <message>`). The driver pulls that file instead of taking a
//   screencap. mode is "scroll" (full ScrollView content drawn) or
//   "root" (no ScrollView: root hierarchy drawn at natural height —
//   the single-viewport fallback, logged explicitly by the driver).
// - `spudlyds://browse` (or a plain launcher start) shows the
//   Storybook UI.
// - Story link presses: stories carry web-style app hrefs
//   ("/recipes/..."), which scheme-less would reject in
//   Linking.openURL. The wrap installed above (storyLinks.ts,
//   #300) routes them to the host's browse URL with the
//   original path attached (`…/browse?path=<original>` — the
//   spudlyds: form in a native build, the exp://…/--/ form in
//   Expo Go); the host logs the pressed path as a `DS LINK
//   <path>` line and stays in browse mode.
// ---------------------------------------------------------------------------

type CaptureTarget = { storyId: string; theme?: string; nonce?: string; appCapture: boolean };

function parseCapture(url: string): CaptureTarget | null | undefined {
  const parsed = Linking.parse(url);
  if (parsed.hostname === "capture") {
    const storyId = (parsed.path ?? "").replace(/^\//, "");
    if (!storyId) return undefined;
    const theme = parsed.queryParams?.theme;
    const nonce = parsed.queryParams?.nonce;
    return {
      storyId,
      theme: typeof theme === "string" ? theme : undefined,
      nonce: typeof nonce === "string" ? nonce : undefined,
      appCapture: parsed.queryParams?.appcapture === "1",
    };
  }
  // Browse arrives as hostname "browse" from a native build
  // (spudlyds://browse) and as path "browse" from Expo Go
  // (exp://<host>/--/browse — expo-linking's parse strips the
  // prefix and nulls the hostname there).
  if (parsed.hostname === "browse" || parsed.path === "browse") return null;
  return undefined;
}

// A browse URL carrying a `path` is a story link press that the
// storyLinks.ts wrap routed back to this host (#300): log the
// path the story originally carried, so a press while browsing
// on-device leaves a visible trace instead of a rejected
// openURL promise.
function logStoryLink(url: string) {
  const parsed = Linking.parse(url);
  const path = parsed.queryParams?.path;
  const isBrowse = parsed.hostname === "browse" || parsed.path === "browse";
  if (isBrowse && typeof path === "string") {
    console.log(`DS LINK ${path}`);
  }
}

function useCaptureTarget(): CaptureTarget | null {
  const [capture, setCapture] = useState<CaptureTarget | null>(null);
  useEffect(() => {
    let cancelled = false;
    Linking.getInitialURL().then((url) => {
      if (!cancelled && url) {
        logStoryLink(url);
        const target = parseCapture(url);
        if (target !== undefined) setCapture(target);
      }
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      logStoryLink(url);
      const target = parseCapture(url);
      if (target !== undefined) setCapture(target);
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
  return capture;
}

function useStoryIndexLog() {
  useEffect(() => {
    let logged = false;
    const timer = setInterval(() => {
      if (logged) return;
      const entries = view._storyIndex?.entries;
      if (!entries) return;
      const stories = Object.values(entries).filter((e) => e.type === "story");
      if (stories.length === 0) return;
      logged = true;
      console.log(`DSVR INDEX_BEGIN ${stories.length}`);
      for (const story of stories) console.log(`DSVR INDEX_ITEM ${story.id}`);
      console.log("DSVR INDEX_END");
    }, 500);
    return () => clearInterval(timer);
  }, []);
}

function CaptureRoot({ storyId, theme, nonce, appCapture }: Required<CaptureTarget>) {
  // Hand the requested theme to the preview decorator directly (see
  // captureTheme.ts): page stories pin a light theme in their story
  // globals, and story globals outrank the UPDATE_GLOBALS emitted
  // below, so the channel alone cannot switch a page story to dark.
  // Set during render — children render before this component's
  // effects run, so an effect would be too late for the first frame
  // the driver screenshots — and cleared on unmount so browse mode
  // is unaffected. The value is idempotent per capture target.
  setCaptureThemeOverride(theme || null);
  useEffect(() => {
    return () => setCaptureThemeOverride(null);
  }, []);

  const Root = useMemo(
    () =>
      view.getStorybookUI({
        onDeviceUI: false,
        shouldPersistSelection: false,
        // Story ids are `<kind>--<name>` — the InitialSelection
        // string form the view accepts.
        initialSelection: storyId as `${string}--${string}`,
      }),
    [storyId],
  );

  useEffect(() => {
    if (theme) {
      view._channel.emit(UPDATE_GLOBALS, { globals: { theme } });
    }
    view._channel.emit(SET_CURRENT_STORY, { storyId });
  }, [storyId, theme]);

  useEffect(() => {
    let fired = false;
    const fire = () => {
      if (fired) return;
      fired = true;
      console.log(`DSVR READY ${nonce} ${storyId}`);
    };
    const handler = (payload?: { storyId?: string }) => {
      if (!payload || payload.storyId === undefined || payload.storyId === storyId) {
        // Let the rendered frame actually paint before signalling.
        setTimeout(fire, 250);
      }
    };
    view._channel.on(STORY_RENDERED, handler);
    // Fallback: if the rendered event's payload shape ever changes,
    // still signal (the driver adds its own settle delay) rather
    // than hanging the capture run.
    const fallback = setTimeout(fire, 5000);
    return () => {
      view._channel.off(STORY_RENDERED, handler);
      clearTimeout(fallback);
    };
  }, [storyId, nonce]);

  // App-side full-content capture (#137). Runs once per capture
  // target, shortly after the story has rendered (READY fires
  // 250ms after the same event; this waits a beat longer so it
  // draws the same painted, settled frame — plus everything below
  // the fold).
  useEffect(() => {
    if (!appCapture) return;
    let cancelled = false;
    let started = false;
    const run = async () => {
      if (started || cancelled) return;
      started = true;
      try {
        if (!captureFullPageNative) {
          throw new Error("dsvr-capture native module not linked");
        }
        const r = await captureFullPageNative(`dsvr-appcap-${nonce}.png`);
        if (!cancelled) {
          console.log(
            `DSVR APPCAP ${nonce} ${storyId} path=${r.path} ipath=${r.internalPath} w=${r.width} h=${r.height} content=${r.contentHeight} viewport=${r.viewportHeight} root=${r.rootHeight} mode=${r.mode} scrolls=${r.scrollViews} chain=${r.chainDepth} ms=${r.drawMs}`,
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.log(
            `DSVR APPCAP_ERROR ${nonce} ${storyId} ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    };
    const handler = (payload?: { storyId?: string }) => {
      if (!payload || payload.storyId === undefined || payload.storyId === storyId) {
        setTimeout(run, 650);
      }
    };
    view._channel.on(STORY_RENDERED, handler);
    const fallback = setTimeout(run, 6000);
    return () => {
      cancelled = true;
      view._channel.off(STORY_RENDERED, handler);
      clearTimeout(fallback);
    };
  }, [appCapture, storyId, nonce]);

  return <Root key={`${storyId}:${nonce}`} />;
}

export default function App() {
  // The library's font contract: apps register faces under these
  // exact names (see src/tokens/typography.ts — "Raleway" for body in
  // every theme, "Alegreya" for Quiet Dawn verse text).
  const [fontsLoaded, fontError] = useFonts({
    Raleway: require("./assets/fonts/Raleway.ttf"),
    Alegreya: require("./assets/fonts/Alegreya.ttf"),
  });
  const capture = useCaptureTarget();
  useStoryIndexLog();

  useEffect(() => {
    // Dev warning overlays (LogBox) would pollute screenshots.
    LogBox.ignoreAllLogs(capture !== null);
  }, [capture]);

  const ready = fontsLoaded || fontError != null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {!ready ? (
          <View style={{ flex: 1 }} />
        ) : capture ? (
          <CaptureRoot
            storyId={capture.storyId}
            theme={capture.theme ?? ""}
            nonce={capture.nonce ?? "0"}
            appCapture={capture.appCapture}
          />
        ) : (
          <StorybookUIRoot />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
