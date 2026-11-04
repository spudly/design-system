/**
 * Package root (#298): page components only.
 *
 * The root entry re-exports the pages barrel and nothing else:
 * no widget components, no icons, no composite (form) components,
 * and no tokens, themes, tag colors, or Tamagui config factories.
 * There are no subpath exports either — apps consume pages from
 * the package root, full stop.
 *
 * Widgets, icons, tokens, themes, and the config factories remain
 * in the repo as internal building blocks (src/components,
 * src/icons, src/tokens, src/themes, src/tamagui.config.ts) that
 * the pages are composed from and that this repo's own Storybook
 * apps and tests reach by relative path; they are not part of the
 * published package surface.
 *
 * Note the superseded invariant: the root entry used to stay
 * importable in plain Node, which is why pages used to live
 * behind a subpath. Under the pages-only contract the root IS
 * the pages entry, and page components may import react-native.
 */
export * from "./pages/index.js";
