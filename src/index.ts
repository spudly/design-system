/**
 * Package root (#298, amended by #411): page components, plus the
 * minimal theme/config surface the consumer apps build on.
 *
 * The root entry re-exports the pages barrel, and — Stephen's
 * #411 amendment to the #298 pages-only cut (2026-11-03: "DS
 * should own themes and tamagui configs") — exactly these
 * additions:
 *
 * - the brand themes (`baseTheme`, `eciperayTheme`,
 *   `memorizeTheme`) and their types from src/themes/;
 * - `createTamaguiConfig` from src/tamagui.config.ts, the factory
 *   each app uses to create its own app-level Tamagui config.
 *
 * #438 Part 1 (2026-11-05) adds back exactly the 5 specifiers
 * dispositioned as TOKENS in the Part 0 audit: `tokens` (from
 * src/tokens/) and `warmHarvestTagColors`, `tagColorNames`,
 * `tagColorNameForHex`, and the `TagColorName` type (from
 * src/themes/), which hosts consume as data alongside the themes.
 * Nothing else comes back: no widget components, no icons, no
 * composite (form) components, and no Storybook config factories.
 * There are no subpath exports either — apps consume everything
 * from the package root, full stop.
 *
 * #438's final major (2026-11-07) removes the last named exception:
 * `ChunkErrorBoundary` (and its prop/state types) is no longer
 * exported from the package root. The boundary stays in the repo
 * as an internal view (src/views/) composed by the internal
 * lazy-slot view, so hosts keep the same recovery behavior by
 * passing lazy components into pages — they just no longer
 * import the boundary themselves.
 *
 * #539 (2026-11-08, approved plan) adds the voice-as-theme surface
 * beside the #411 additions: `VoiceProvider`, `useVoice`, and the
 * `Voice`, `VoiceFormatter`, and `VoiceProviderProps` types from
 * src/voice/ — the DS owns the text system the way it owns themes,
 * so the provider and slot types are part of the published surface.
 *
 * Widgets, icons, and the Storybook factories remain in the repo
 * as internal building blocks (src/widgets, src/icons,
 * src/tamagui.config.ts) that the pages are composed from and that
 * this repo's own Storybook apps and tests reach by relative path;
 * they are not part of the published package surface.
 *
 * Note the superseded invariant: the root entry used to stay
 * importable in plain Node, which is why pages used to live
 * behind a subpath. Under the pages-only contract the root IS
 * the pages entry, and page components may import react-native.
 */
export * from "./pages/index.js";
export { tokens } from "./tokens/index.js";
export { baseTheme, eciperayTheme, memorizeTheme } from "./themes/index.js";
export {
  tagColorNames,
  warmHarvestTagColors,
  tagColorNameForHex,
  type TagColorName,
} from "./themes/index.js";
export type { Theme, SemanticColors, EciperayTheme, MemorizeTheme } from "./themes/index.js";
export { createTamaguiConfig } from "./tamagui.config.js";
export { VoiceProvider, useVoice, type Voice, type VoiceFormatter, type VoiceProviderProps } from "./voice/index.js";
