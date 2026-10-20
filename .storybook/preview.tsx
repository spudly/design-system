import { useEffect } from "react";
import type { Preview } from "@storybook/react";
import { TamaguiProvider, YStack } from "tamagui";
import { createStorybookTamaguiConfig, type StorybookThemeName } from "../src/tamagui.config.js";

// Created here, in Storybook-owned code: creating a config installs it
// as Tamagui's global config, so the package must not create it at
// module scope (see src/tamagui.config.ts).
const storybookTamaguiConfig = createStorybookTamaguiConfig();
import { baseTheme, eciperayTheme, memorizeTheme } from "../src/themes/index.js";

/**
 * The body/UI font stack for a Storybook theme, from the brand theme's
 * own tokens. The combined Storybook Tamagui config points its font
 * family at the `--dsFontStack` CSS var (Tamagui font definitions are
 * config-global and cannot vary per sub-theme), so the preview sets the
 * var on the document root for the selected brand — see
 * createStorybookTamaguiConfig in src/tamagui.config.ts.
 */
function fontStackFor(theme: StorybookThemeName): string {
  if (theme.includes("warmHarvest")) return eciperayTheme.tokens.typography.fontFamily.sans;
  if (theme.includes("quietDawn")) return memorizeTheme.tokens.typography.fontFamily.sans;
  return baseTheme.tokens.typography.fontFamily.sans;
}

function FontStackSync({ theme }: { theme: StorybookThemeName }) {
  useEffect(() => {
    document.documentElement.style.setProperty("--dsFontStack", fontStackFor(theme));
  }, [theme]);
  return null;
}

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
          <FontStackSync theme={theme} />
          <YStack backgroundColor="$background" padding={24} style={{ minHeight: "100vh" }}>
            <Story />
          </YStack>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
