/**
 * Contract test for the on-device capture theme override (#43, PR #91).
 *
 * The bug: the Android VR driver's `dark_*` captures rendered in
 * light mode — the dark baselines were byte-identical to the light
 * ones. Page stories pin their brand theme in their CSF meta
 * (`globals: { theme: "light_warmHarvest" }` / `"light_quietDawn"`)
 * so web Storybook / Chromatic render them in-brand by default, and
 * Storybook composes the globals a decorator receives as
 * `{ ...userGlobals, ...storyGlobals }` — story globals spread last,
 * so the driver's UPDATE_GLOBALS could never override the pin.
 *
 * The fix keeps the pins (web behavior unchanged) and routes the
 * capture deep link's theme around the globals channel:
 * `apps/storybook/captureTheme.ts` holds the override, App.tsx sets
 * it from the capture link, and the on-device preview decorator
 * prefers it over `context.globals.theme`.
 *
 * The contract:
 * 1. captureTheme.ts exports the setter/getter pair.
 * 2. App.tsx sets the override from the capture target's theme.
 * 3. The on-device preview decorator consults the override before
 *    falling back to the theme global.
 * 4. Premise: every page story file still pins a `light_*` theme
 *    global — if the pins are ever removed, this override becomes
 *    unnecessary and this test should be revisited, not just edited.
 *
 * Source scan, like the other story contract tests: the invariant is
 * a per-file property of the source, and the behavioral proof is the
 * CI visual-regression run comparing regenerated dark baselines.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("capture theme override module exposes the setter/getter pair", () => {
  const path = join(root, "apps/storybook/captureTheme.ts");
  assert.ok(existsSync(path), "apps/storybook/captureTheme.ts exists");
  const source = read("apps/storybook/captureTheme.ts");
  assert.match(source, /export function setCaptureThemeOverride/);
  assert.match(source, /export function getCaptureThemeOverride/);
});

test("App.tsx feeds the capture deep link's theme into the override", () => {
  const source = read("apps/storybook/App.tsx");
  assert.match(source, /from "\.\/captureTheme"/);
  assert.match(source, /setCaptureThemeOverride\(theme \|\| null\)/);
});

test("on-device preview decorator prefers the capture override over the theme global", () => {
  const source = read("apps/storybook/.rnstorybook/preview.tsx");
  assert.match(source, /getCaptureThemeOverride/);
  assert.match(
    source,
    /getCaptureThemeOverride\(\) \?\? \(context\.globals\.theme as string\) \?\? "light"/,
  );
});

test("premise: page stories pin a light theme global", () => {
  const pagesDir = join(root, "src", "pages");
  const storyFiles = readdirSync(pagesDir).filter((f) => f.endsWith(".stories.tsx"));
  assert.ok(storyFiles.length > 0, "page story files exist");
  for (const file of storyFiles) {
    const source = readFileSync(join(pagesDir, file), "utf8");
    assert.match(
      source,
      /globals:\s*\{\s*theme:\s*"light_(warmHarvest|quietDawn)"\s*\}/,
      `${file} pins a light_<brand> theme global`,
    );
  }
});
