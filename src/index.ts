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
 *   each app uses to create its own app-level Tamagui config;
 * - `ChunkErrorBoundary` (and its prop/state types), the recovery
 *   boundary for lazily loaded surfaces, lifted from Memorize's
 *   app shell.
 *
 * #438 Part 1 (2026-11-05) adds back exactly one more category:
 * the design tokens (`tokens` and its `Tokens` type, from
 * src/tokens/) and the tag-color data/helpers (from src/themes/),
 * which hosts consume as data alongside the themes. Nothing else
 * comes back: no widget components (ChunkErrorBoundary is the one
 * named exception), no icons, no composite (form) components, and
 * no Storybook config factories. There are no subpath exports
 * either — apps consume everything from the package root, full
 * stop.
 *
 * Widgets, icons, and the Storybook factories remain in the repo
 * as internal building blocks (src/components, src/icons,
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
export { tokens, type Tokens } from "./tokens/index.js";
export { baseTheme, eciperayTheme, memorizeTheme } from "./themes/index.js";
export {
  tagColorNames,
  defaultTagColorName,
  warmHarvestTagColors,
  quietDawnTagColors,
  isTagColorName,
  tagColorNameForHex,
  resolveTagColorValue,
  tagColorThemeKey,
  type TagColorName,
  type TagColorValues,
} from "./themes/index.js";
export type { Theme, SemanticColors, EciperayTheme, MemorizeTheme } from "./themes/index.js";
export { createTamaguiConfig } from "./tamagui.config.js";
export {
  ChunkErrorBoundary,
  type ChunkErrorBoundaryProps,
  type ChunkErrorBoundaryState,
} from "./components/ChunkErrorBoundary.js";
