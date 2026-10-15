import type { Preview } from "@storybook/react";
import { TamaguiProvider, YStack } from "tamagui";
import {
  eciperayTamaguiConfig,
  memorizeTamaguiConfig,
  tamaguiConfig,
} from "../src/tamagui.config.js";

const brandConfigs = {
  base: tamaguiConfig,
  "warm-harvest": eciperayTamaguiConfig,
  "quiet-dawn": memorizeTamaguiConfig,
} as const;

type Brand = keyof typeof brandConfigs;

const preview: Preview = {
  globalTypes: {
    brand: {
      description: "Brand theme (Tamagui config)",
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: [
          { value: "base", title: "Base (neutral)" },
          { value: "warm-harvest", title: "Warm Harvest · Eciperay" },
          { value: "quiet-dawn", title: "Quiet Dawn · Memorize" },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Light or dark theme",
      toolbar: {
        title: "Mode",
        icon: "contrast",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: "base",
    mode: "light",
  },
  decorators: [
    (Story, context) => {
      const brandValue = context.globals.brand as string;
      const brand: Brand = brandValue in brandConfigs ? (brandValue as Brand) : "base";
      const mode = context.globals.mode === "dark" ? "dark" : "light";
      return (
        <TamaguiProvider
          // Remount on switch: Tamagui reads config/defaultTheme at mount.
          key={`${brand}-${mode}`}
          config={brandConfigs[brand]}
          defaultTheme={mode}
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
