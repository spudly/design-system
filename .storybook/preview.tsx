import { useEffect } from "react";
import type { Preview } from "@storybook/react";
import { TamaguiProvider, View, YStack } from "tamagui";
import { createStorybookTamaguiConfig, type StorybookThemeName } from "../src/tamagui.config.js";

// Created here, in Storybook-owned code: creating a config installs it
// as Tamagui's global config, so the package must not create it at
// module scope (see src/tamagui.config.ts).
const storybookTamaguiConfig = createStorybookTamaguiConfig();
import { baseTheme, eciperayTheme, memorizeTheme } from "../src/themes/index.js";
import { VoiceProvider } from "../src/voice/index.js";
import { fixtureVoice } from "../src/voice/fixtures.js";

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

/** The verse-text stack for a Storybook theme (#66): Alegreya under Quiet Dawn, the base serif stack otherwise. */
function verseFontStackFor(theme: StorybookThemeName): string {
  if (theme.includes("quietDawn")) return memorizeTheme.tokens.typography.fontFamily.verse;
  if (theme.includes("warmHarvest")) return eciperayTheme.tokens.typography.fontFamily.verse;
  return baseTheme.tokens.typography.fontFamily.verse;
}

function FontStackSync({ theme }: { theme: StorybookThemeName }) {
  useEffect(() => {
    document.documentElement.style.setProperty("--dsFontStack", fontStackFor(theme));
    document.documentElement.style.setProperty("--dsVerseFontStack", verseFontStackFor(theme));
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
    dsViewport: {
      description: "Story viewport (frame width for page stories)",
      toolbar: {
        title: "Viewport",
        icon: "mobile",
        items: [
          { value: "phone", title: "Phone · 430×844" },
          { value: "wide", title: "Wide · 1024×844" },
          { value: "desktop", title: "Desktop · 1280×844" },
          { value: "full", title: "Full · fluid width" },
          { value: "shortPhone", title: "Short phone · 430×430" },
        ],
        dynamicTitle: true,
      },
    },
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
    // #668: captures (Chromatic / built-Storybook baselines) load stories
    // with the initial globals, so the phone preset IS the capture pin —
    // captures keep rendering page stories at exactly 430×844, and only
    // an interactive toolbar switch changes the frame.
    dsViewport: "phone",
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
          {/* #539: stories render under the fixture voice — fixtures only, never defaults. */}
          <VoiceProvider voice={fixtureVoice}>
          {context.parameters.phoneWidthFrame ? (
            // Phone-width frame stories (#564) keep their own pinned
            // phone frame (their story-level decorators supply it) in
            // interactive mode too — the parameter is the opt-out
            // from the viewport-driven frame below.
            <YStack backgroundColor="$background">
              <Story />
            </YStack>
          ) : context.title.startsWith("Pages/") ? (
            // Page stories (#547, #668): full-bleed — the page shell
            // owns the viewport exactly as in an app, with no
            // padded 100vh wrapper around it (that wrapper was
            // half of the #547 Storybook overlap: a 100dvh page
            // shell nested inside a padded viewport-height
            // decorator mis-measured its height distribution).
            // The frame size comes from the dsViewport global: the
            // toolbar switches a page story between phone, wide,
            // desktop and full fluid widths so desktop layouts
            // (e.g. #628's centered 1200px column and full-width
            // Big Footer) can be evaluated interactively; the
            // initial "phone" value pins captures at 430×844.
            <YStack backgroundColor="$background">
              <View
                width={
                  context.globals.dsViewport === "desktop"
                    ? 1280
                    : context.globals.dsViewport === "wide"
                      ? 1024
                      : context.globals.dsViewport === "full"
                        ? "100%"
                        : 430
                }
                maxWidth="100%"
                height={context.globals.dsViewport === "shortPhone" ? 430 : 844}
                position="relative"
              >
                <Story />
              </View>
            </YStack>
          ) : (
            <YStack backgroundColor="$background" padding={24} style={{ minHeight: "100vh" }}>
              <Story />
            </YStack>
          )}
          </VoiceProvider>
        </TamaguiProvider>
      );
    },
  ],
};

export default preview;
