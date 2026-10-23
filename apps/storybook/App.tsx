import { useEffect, useMemo, useState } from "react";
import { LogBox, View } from "react-native";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SET_CURRENT_STORY, STORY_RENDERED, UPDATE_GLOBALS } from "storybook/internal/core-events";
import StorybookUIRoot, { view } from "./Storybook";

// ---------------------------------------------------------------------------
// Capture protocol (used by tools/visual-regression/run.mjs — see
// docs/android-visual-regression.md):
//
// - At boot the app logs its story index: a `DSVR INDEX_BEGIN <n>`
//   line, one `DSVR INDEX_ITEM <storyId>` line per story, and
//   `DSVR INDEX_END` (React Native logs land in logcat under the
//   ReactNativeJS tag).
// - Opening `spudlyds://capture/<storyId>?theme=<subTheme>&nonce=<n>`
//   switches to capture mode: only that story renders (no Storybook
//   chrome, LogBox suppressed). When the story has rendered, the app
//   logs `DSVR READY <nonce> <storyId>`.
// - `spudlyds://browse` (or a plain launcher start) shows the
//   Storybook UI.
// ---------------------------------------------------------------------------

type CaptureTarget = { storyId: string; theme?: string; nonce?: string };

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

function CaptureRoot({ storyId, theme, nonce }: Required<CaptureTarget>) {
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
          />
        ) : (
          <StorybookUIRoot />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
