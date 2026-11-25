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

/** The page background for a Storybook theme (#754): the brand theme's semantic background; dark themes share the dark background (gray10, per buildTamaguiThemes). */
function bodyBackgroundFor(theme: StorybookThemeName): string {
  if (theme.startsWith("dark")) return baseTheme.tokens.colors.gray.gray10;
  if (theme.includes("warmHarvest")) return eciperayTheme.semantic.background;
  if (theme.includes("quietDawn")) return memorizeTheme.semantic.background;
  return baseTheme.semantic.background;
}

/**
 * Paints the story background on the body itself (#754) instead of
 * wrapping every story in a YStack whose only job was the background,
 * and zeroes the body padding for page stories: Storybook's padded
 * layout pads the story root, and page components already carry their
 * own padding, so pages got doubled spacing.
 */
function BodyStyleSync({ theme, isPage }: { theme: StorybookThemeName; isPage: boolean }) {
  useEffect(() => {
    document.body.style.backgroundColor = bodyBackgroundFor(theme);
    document.body.style.padding = isPage ? "0" : "";
  }, [theme, isPage]);
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
  parameters: {
    options: {
      // #710: stories sort alphabetically within each heading
      // (Widgets/<Category>/, Views/<App>/, Pages/<App>/), so
      // components are easy to find in the sidebar.
      storySort: {
        method: "alphabetical",
        locales: "en-US",
      },
    },
  },
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
  },
  decorators: [
    (Story, context) => {
      // #668/#754: the frame viewport resolves toolbar-first, then
      // the story's own default frame (a `dsViewport` PARAMETER — a
      // global here would lock the toolbar control and disable
      // switching), then the responsive full-width preset (#754:
      // pages present full-width by default, not in a phone frame).
      // Captures load stories without touching the toolbar, so a
      // story's parameter IS its capture pin: stories that must keep
      // a pinned capture size declare it (AppShellPage 1024×844 and
      // PublicRecipePage 1024×900 via their parameters); unpinned
      // page stories now capture at full width — a deliberate
      // baseline change called out in the #754 PR.
      const toolbarViewport = context.globals.dsViewport as string | undefined;
      const viewport =
        toolbarViewport ??
        (context.parameters.dsViewport as string | undefined) ??
        "full";
      // A toolbar selection owns the frame entirely: the story's
      // dsViewportHeight pin (e.g. PublicRecipePage's 900) applies
      // only to the no-toolbar capture default, never over a
      // Phone/Short phone switch.
      const frameHeight = toolbarViewport
        ? toolbarViewport === "shortPhone"
          ? 430
          : 844
        : ((context.parameters.dsViewportHeight as number | undefined) ??
          (viewport === "shortPhone" ? 430 : 844));
      // Same capture-default rule for width (#754): a story's
      // dsViewportWidth pin (e.g. MealsHubPage's 864px regression
      // stories) overrides the preset width only when the toolbar
      // has no selection — a toolbar selection owns the frame.
      const widthOverride = toolbarViewport
        ? undefined
        : (context.parameters.dsViewportWidth as number | undefined);
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
          <BodyStyleSync theme={theme} isPage={context.title.startsWith("Pages/")} />
          {/* #539: stories render under the fixture voice — fixtures only, never defaults. */}
          <VoiceProvider voice={fixtureVoice}>
          {context.parameters.phoneWidthFrame ? (
            // Phone-width frame stories (#564) keep their own pinned
            // phone frame (their story-level decorators supply it) in
            // interactive mode too — the parameter is the opt-out
            // from the viewport-driven frame below.
            <Story />
          ) : context.title.startsWith("Pages/") ? (
            // Page stories (#547, #668): full-bleed — the page shell
            // owns the viewport exactly as in an app, with no
            // padded 100vh wrapper around it (that wrapper was
            // half of the #547 Storybook overlap: a 100dvh page
            // shell nested inside a padded viewport-height
            // decorator mis-measured its height distribution).
            // The frame size comes from the resolved viewport above:
            // the toolbar switches a page story between phone, wide,
            // desktop and full fluid widths so desktop layouts
            // (e.g. #628's centered 1200px column and full-width
            // Big Footer) can be evaluated interactively; with no
            // toolbar selection the story's parameter pins captures
            // at its declared dimensions; unpinned stories capture
            // at the full-width default (#754).
            <View
                width={
                  widthOverride ??
                  (viewport === "desktop"
                    ? 1280
                    : viewport === "wide"
                      ? 1024
                      : viewport === "full"
                        ? "100%"
                        : 430
                  )
                }
                maxWidth="100%"
                height={frameHeight}
                position="relative"
                // #854: center a fixed-width page frame in the
                // Storybook canvas — a pinned frame (e.g. the old
                // 1024px AppShellPage pin) otherwise hugs the left
                // edge and masquerades as a shell layout defect.
                // The page itself centers its content column
                // (PageContentColumn, #628) and its footer stays
                // full-width inside the frame.
                style={{ marginLeft: "auto", marginRight: "auto" }}
              >
                <Story />
            </View>
          ) : (
            <YStack padding={24} style={{ minHeight: "100vh" }}>
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
