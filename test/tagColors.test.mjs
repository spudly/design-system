/**
 * Contract tests for design-system#207: tag colors are named
 * design-system tokens with per-theme hex values.
 *
 * The contract:
 * 1. The twelve token names cover exactly the legacy app palette:
 *    the Warm Harvest values ARE the legacy hexes, verbatim, so
 *    stored tags map 1:1 by value.
 * 2. `tagColorNameForHex` maps every legacy palette hex (any case)
 *    to its name, and nothing else.
 * 3. `resolveTagColorValue` resolves a name through the given
 *    theme's values; a known legacy hex resolves through its name
 *    (so a stored tag takes the active theme's shade); an unknown
 *    value passes through unchanged.
 * 4. Both brand themes carry a complete, distinct value set, and
 *    the registered Tamagui themes expose the active brand's hex
 *    under the tag<Name> keys the component resolver reads.
 * 5. Source scan: TagPill, ColorPickerField, TagsPage, and
 *    RecipeDetailPage all resolve through the one shared resolver
 *    (src/components/tagColors.ts) instead of consuming raw hex.
 *
 * Runtime assertions run against the built output: `npm run build`
 * first (the `test` script does both).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const {
  tagColorNames,
  warmHarvestTagColors,
  quietDawnTagColors,
  baseTheme,
  eciperayTheme,
  memorizeTheme,
  tagColorNameForHex,
  resolveTagColorValue,
  createTamaguiConfig,
  createStorybookTamaguiConfig,
} = await import("../dist/index.js");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

/** The legacy app palette, in display order (the pre-#207 raw hexes). */
const legacyPalette = [
  "#6366f1",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#6b7280",
];

test("the twelve names cover exactly the legacy palette, as the Warm Harvest values", () => {
  assert.equal(tagColorNames.length, 12);
  assert.deepEqual(
    tagColorNames.map((name) => warmHarvestTagColors[name]),
    legacyPalette,
  );
});

test("tagColorNameForHex maps every legacy hex to its name, case-insensitively", () => {
  for (const [index, hex] of legacyPalette.entries()) {
    assert.equal(tagColorNameForHex(hex), tagColorNames[index], hex);
    assert.equal(tagColorNameForHex(hex.toUpperCase()), tagColorNames[index], hex);
  }
  assert.equal(tagColorNameForHex("#123456"), undefined);
  assert.equal(tagColorNameForHex("blue"), undefined);
});

test("resolveTagColorValue resolves names through the given theme's values", () => {
  assert.equal(resolveTagColorValue("blue"), "#3b82f6");
  assert.equal(resolveTagColorValue("blue", quietDawnTagColors), quietDawnTagColors.blue);
  assert.equal(resolveTagColorValue("pink", {}), "#ec4899", "missing theme value falls back");
});

test("resolveTagColorValue maps a stored legacy hex through its name", () => {
  assert.equal(resolveTagColorValue("#3b82f6"), "#3b82f6", "identity under the default values");
  assert.equal(
    resolveTagColorValue("#3b82f6", quietDawnTagColors),
    quietDawnTagColors.blue,
    "a stored hex takes the active theme's shade of its color",
  );
  assert.equal(resolveTagColorValue("#b3543f", quietDawnTagColors), "#b3543f");
  assert.equal(resolveTagColorValue("not-a-color"), "not-a-color");
});

test("both brand themes carry complete, distinct tag color values", () => {
  assert.deepEqual(eciperayTheme.tagColors, warmHarvestTagColors);
  assert.deepEqual(memorizeTheme.tagColors, quietDawnTagColors);
  assert.deepEqual(baseTheme.tagColors, warmHarvestTagColors);
  for (const name of tagColorNames) {
    assert.match(quietDawnTagColors[name], /^#[0-9a-f]{6}$/, `Quiet Dawn ${name} is a hex`);
    assert.notEqual(
      quietDawnTagColors[name],
      warmHarvestTagColors[name],
      `Quiet Dawn ${name} differs from Warm Harvest`,
    );
  }
});

test("registered Tamagui themes expose the active brand's tag hexes", () => {
  const dawn = createTamaguiConfig(memorizeTheme);
  assert.equal(dawn.themes.light.tagBlue.val, quietDawnTagColors.blue);
  assert.equal(dawn.themes.dark.tagPink.val, quietDawnTagColors.pink);
  const harvest = createTamaguiConfig(eciperayTheme);
  assert.equal(harvest.themes.light.tagBlue.val, "#3b82f6");
  const storybook = createStorybookTamaguiConfig();
  assert.equal(storybook.themes.light_quietDawn.tagBlue.val, quietDawnTagColors.blue);
  assert.equal(storybook.themes.light_warmHarvest.tagBlue.val, "#3b82f6");
});

test("components resolve tag colors through the one shared resolver", () => {
  const hook = read("src/components/tagColors.ts");
  assert.match(hook, /export function useTagColorResolver/);
  assert.match(hook, /resolveTagColorValue\(value, themeColors\)/);

  const tagPill = read("src/components/TagPill.tsx");
  assert.match(tagPill, /useTagColorResolver\(\)/);
  assert.match(tagPill, /resolveTagColor\(color\)/);
  assert.doesNotMatch(tagPill, /backgroundColor=\{`\$\{color\}22`\}/);

  const picker = read("src/components/ColorPickerField.tsx");
  assert.match(picker, /colors: TagColorName\[\]/);
  assert.match(picker, /useTagColorResolver\(\)/);

  const tagsPage = read("src/pages/TagsPage.tsx");
  assert.match(tagsPage, /colorOptions: TagColorName\[\]/);

  const recipeDetail = read("src/pages/RecipeDetailPage.tsx");
  assert.match(recipeDetail, /useTagColorResolver\(\)/);
  assert.match(recipeDetail, /resolveTagColor\(tag\.color\)/);
});
