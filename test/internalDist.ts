/**
 * Internal dist surface for the contract tests (#298).
 *
 * The published package root (dist/index.js) exports page
 * components plus the #411 additions (the brand themes and their
 * types and `createTamaguiConfig`) — no
 * other widgets, icons, tokens, tag colors, or Tamagui config
 * factories, and no subpaths. The tests in this
 * repo still exercise those internal building blocks directly,
 * so they load them from their internal dist modules instead.
 * These are file paths inside this repo, not package imports:
 * they bypass the package `exports` map and are not a consumer
 * import path. (Icons are deliberately not merged in: the icons
 * module imports react-native-svg, which does not load in plain
 * Node — icon contract tests scan its source or load its own
 * module, as before.)
 *
 * The merge mirrors the pre-#298 root surface minus the pages:
 * components and views (#438 Part 2) over themes over tokens
 * over the config factories.
 * Loads lazily so a test file's source-scan tests still run when
 * the build output is missing.
 */
export async function loadInternalDist(): Promise<Record<string, any>> {
  const [components, views, themes, tokens, config] = await Promise.all([
    import("../dist/widgets/index.js"),
    import("../dist/views/index.js"),
    import("../dist/themes/index.js"),
    import("../dist/tokens/index.js"),
    import("../dist/tamagui.config.js"),
  ]);
  return { ...tokens, ...themes, ...config, ...views, ...components };
}
