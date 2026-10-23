import type { Preview } from "@storybook/react";
import { TamaguiProvider, YStack } from "tamagui";
import { createOnDeviceStorybookTamaguiConfig } from "../../../src/tamagui.config.js";
import { getCaptureThemeOverride } from "../captureTheme";

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
      return (
        <TamaguiProvider key={themeName} config={config} defaultTheme={themeName}>
          <YStack flex={1} backgroundColor="$background" padding={24}>
            <Story />
          </YStack>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
