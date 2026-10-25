import { useEffect, useMemo, useState } from "react";
import { LogBox, View } from "react-native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SET_CURRENT_STORY, STORY_RENDERED, UPDATE_GLOBALS } from "storybook/internal/core-events";
import StorybookUIRoot, { view } from "./Storybook";
import { setCaptureThemeOverride } from "./captureTheme";

// SPIKE (design-system #137, option 3): the app-side full-content
// capture module. Required defensively: if the native module is not
// linked (e.g. a JS-only runtime), capture mode falls back to
// signalling APPCAP_ERROR instead of crashing the host app.
let captureFullPageNative:
  | typeof import("./modules/dsvr-capture/src/index").captureFullPage
  | null = null;
try {
  captureFullPageNative =
    require("./modules/dsvr-capture/src/index").captureFullPage;
} catch {
  captureFullPageNative = null;
}

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
// - SPIKE (#137, option 3): with `&appcapture=1` on the capture URL,
//   after READY the app additionally draws the story's full content
//   (including everything below the fold) into a PNG via the
//   dsvr-capture native module and logs
//   `DSVR APPCAP <nonce> <storyId> path=... w=... h=... ...` (or
//   `DSVR APPCAP_ERROR <nonce> <storyId> <message>`). The driver
//   pulls that file instead of taking a screencap.
// - `spudlyds://browse` (or a plain launcher start) shows the
//   Storybook UI.
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
  if (parsed.hostname === "browse") return null;
  return undefined;
}

function useCaptureTarget(): CaptureTarget | null {
  const [capture, setCapture] = useState<CaptureTarget | null>(null);
  useEffect(() => {
    let cancelled = false;
    Linking.getInitialURL().then((url) => {
      if (!cancelled && url) {
        const target = parseCapture(url);
        if (target !== undefined) setCapture(target);
      }
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
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

  // SPIKE (#137, option 3): app-side full-content capture. Runs
  // once per capture target, shortly after the story has rendered
  // (READY fires 250ms after the same event; this waits a beat
  // longer so it draws the same painted, settled frame the
  // screencap path would take — plus everything below the fold).
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
            `DSVR APPCAP ${nonce} ${storyId} path=${r.path} ipath=${r.internalPath} w=${r.width} h=${r.height} content=${r.contentHeight} viewport=${r.viewportHeight} root=${r.rootHeight} scrolls=${r.scrollViews} chain=${r.chainDepth} ms=${r.drawMs}`,
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
