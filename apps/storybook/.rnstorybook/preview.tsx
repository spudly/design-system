import type { Preview } from "@storybook/react";
import { TamaguiProvider, View, YStack } from "tamagui";
import { createOnDeviceStorybookTamaguiConfig } from "../../../src/tamagui.config.js";
import { fixtureVoice } from "../../../src/voice/fixtures.js";
import { VoiceProvider } from "../../../src/voice/index.js";
import { SkeletonClock } from "../../../src/widgets/feedback/SkeletonClock.js";
import { getCaptureThemeOverride, isCaptureModeActive } from "../captureTheme";

// On-device mirror of the web .storybook/preview.tsx: same decorator
// shape and the same theme global, but the config comes from the
// on-device factory — the web combined config registers CSS-variable
// font stacks that are invalid on native (see the factory's comment in
// src/tamagui.config.ts). One process-wide config either way: Tamagui
// cannot swap brand configs at runtime (spudly/eciperay#149).
const config = createOnDeviceStorybookTamaguiConfig();

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Design-system theme (brand + color scheme)",
      defaultValue: "light",
    },
    // #668: same viewport resolution as the web preview — toolbar
    // global first, then the story's dsViewport parameter, then the
    // phone preset — so native page-story captures keep the bounded
    // frames the stories' removed local Viewport helpers set.
    dsViewport: {
      description: "Story viewport (frame width for page stories)",
    },
  },
  decorators: [
    (Story, context) => {
      // Capture mode (visual regression) overrides the theme global:
      // page stories pin `light_<brand>` in their story globals, and
      // Storybook spreads story globals over user globals, so the
      // driver's UPDATE_GLOBALS cannot switch them to dark — the
      // deep link's theme arrives via captureTheme.ts instead (see
      // that module). Null outside capture mode.
      const themeName = getCaptureThemeOverride() ?? (context.globals.theme as string) ?? "light";
      // Capture mode freezes the skeleton pulse (#648) so
      // loading-state captures are reproducible between the shard
      // capture and the merge-verify re-capture: provider-less
      // bones are frozen via the shared default clock (App.tsx),
      // and this frozen provider covers any provider-scoped
      // subtree. Browse mode never freezes.
      const captureMode = isCaptureModeActive();
      const toolbarViewport = context.globals.dsViewport as string | undefined;
      const viewport =
        toolbarViewport ??
        (context.parameters.dsViewport as string | undefined) ??
        "phone";
      // Same toolbar-owns-the-frame rule as the web preview: a
      // dsViewportHeight pin applies only to the no-toolbar default.
      const frameHeight = toolbarViewport
        ? toolbarViewport === "shortPhone"
          ? 430
          : 844
        : ((context.parameters.dsViewportHeight as number | undefined) ??
          (viewport === "shortPhone" ? 430 : 844));
      return (
        <TamaguiProvider key={themeName} config={config} defaultTheme={themeName}>
          <VoiceProvider voice={fixtureVoice}>
            {context.title.startsWith("Pages/") ? (
              // Page stories (#668): the same bounded frame as the web
              // preview, no padded wrapper — native captures keep
              // their previous dimensions (430×844 phone, 1024×844
              // AppShellPage, 1024×900 PublicRecipePage).
              <YStack flex={1} backgroundColor="$background">
                <View
                  width={
                    viewport === "desktop"
                      ? 1280
                      : viewport === "wide"
                        ? 1024
                        : viewport === "full"
                          ? "100%"
                          : 430
                  }
                  maxWidth="100%"
                  height={frameHeight}
                  position="relative"
                >
                  {captureMode ? (
                    <SkeletonClock frozen>
                      <Story />
                    </SkeletonClock>
                  ) : (
                    <Story />
                  )}
                </View>
              </YStack>
            ) : (
              <YStack flex={1} backgroundColor="$background" padding={24}>
                {captureMode ? (
                  <SkeletonClock frozen>
                    <Story />
                  </SkeletonClock>
                ) : (
                  <Story />
                )}
              </YStack>
            )}
          </VoiceProvider>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
