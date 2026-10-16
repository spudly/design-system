import type { Preview } from "@storybook/react";
import { TamaguiProvider, YStack } from "tamagui";
import { storybookTamaguiConfig, type StorybookThemeName } from "../src/tamagui.config.js";

const themeNames: StorybookThemeName[] = [
  "light",
  "dark",
  "light_warmHarvest",
  "dark_warmHarvest",
  "light_quietDawn",
  "dark_quietDawn",
];

function isStorybookThemeName(value: string): value is StorybookThemeName {
  return (themeNames as string[]).includes(value);
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme (brand + light/dark mode)",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Base · Light" },
          { value: "dark", title: "Base · Dark" },
          { value: "light_warmHarvest", title: "Warm Harvest · Light" },
          { value: "dark_warmHarvest", title: "Warm Harvest · Dark" },
          { value: "light_quietDawn", title: "Quiet Dawn · Light" },
          { value: "dark_quietDawn", title: "Quiet Dawn · Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const themeValue = context.globals.theme as string;
      const theme: StorybookThemeName = isStorybookThemeName(themeValue) ? themeValue : "light";
      return (
        <TamaguiProvider
          // Remount on switch so Tamagui re-reads defaultTheme. All brands
          // live in this one config as sub-themes — swapping configs at
          // runtime does not restyle (see storybookTamaguiConfig).
          key={theme}
          config={storybookTamaguiConfig}
          defaultTheme={theme}
        >
          <YStack backgroundColor="$background" padding={24} style={{ minHeight: "100vh" }}>
            <Story />
          </YStack>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
