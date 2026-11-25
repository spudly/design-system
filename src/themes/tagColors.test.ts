/**
 * Contract tests for design-system#207: tag colors are named
 * design-system tokens with per-theme hex values.
 *
 * The contract:
 * 1. The twelve token names cover exactly the legacy app palette:
 *    the Warm Harvest values ARE the legacy hexes, verbatim, so
 *    stored tags map 1:1 by value.
 * 2. `tagColorNameForHex` is the single stored-data boundary: it
 *    maps every legacy palette hex (any case) to its name, and an
 *    unknown stored hex falls back to `defaultTagColorName` —
 *    unknown values never pass through as raw hex.
 * 3. `resolveTagColorValue` resolves NAMES ONLY through the given
 *    theme's values; the tag-color props across Badge,
 *    ColorPickerField, TagsPage, and RecipeDetailPage are typed
 *    `TagColorName`, so a raw hex is a compile error (the `npm run
 *    build` typecheck in the test script is the enforcement).
 * 4. Both brand themes carry a complete, distinct value set, and
 *    the registered Tamagui themes expose the active brand's hex
 *    under the tag<Name> keys the component resolver reads.
 * 5. The shared tag-color resolver hook is exported from the built
 *    widgets module (runtime check, #733 tranche 3). The former
 *    source scans — components resolving through the shared resolver,
 *    and the strictly-typed API surface — were deleted: component
 *    wiring is not runtime-observable here, and the names-only typing
 *    is enforced by the TypeScript build, not a test.
 *
 * Runtime assertions run against the built output: `npm run build`
 * first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

const {
  tagColorNames,
  defaultTagColorName,
  warmHarvestTagColors,
  quietDawnTagColors,
  baseTheme,
  eciperayTheme,
  memorizeTheme,
  tagColorNameForHex,
  resolveTagColorValue,
  resolveTagColorShade,
  warmHarvestTagColorShades,
  quietDawnTagColorShades,
  createTamaguiConfig,
  createStorybookTamaguiConfig,
}: Record<string, any> = await loadInternalDist();

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
    tagColorNames.map((name: string) => warmHarvestTagColors[name]),
    legacyPalette,
  );
});

test("tagColorNameForHex maps every legacy hex to its name, case-insensitively", () => {
  for (const [index, hex] of legacyPalette.entries()) {
    assert.equal(tagColorNameForHex(hex), tagColorNames[index], hex);
    assert.equal(tagColorNameForHex(hex.toUpperCase()), tagColorNames[index], hex);
  }
});

test("tagColorNameForHex falls back to the default name for unknown stored values", () => {
  assert.equal(defaultTagColorName, "gray");
  assert.equal(tagColorNameForHex("#123456"), defaultTagColorName);
  assert.equal(tagColorNameForHex("#b3543f"), defaultTagColorName, "non-palette hex");
  assert.equal(tagColorNameForHex("not-a-color"), defaultTagColorName);
});

test("resolveTagColorValue resolves names through the given theme's values", () => {
  assert.equal(resolveTagColorValue("blue"), "#3b82f6");
  assert.equal(resolveTagColorValue("blue", quietDawnTagColors), quietDawnTagColors.blue);
  assert.equal(resolveTagColorValue("pink", {}), "#ec4899", "missing theme value falls back");
});

test("stored hexes resolve only through the tagColorNameForHex boundary", () => {
  assert.equal(
    resolveTagColorValue(tagColorNameForHex("#3b82f6"), quietDawnTagColors),
    quietDawnTagColors.blue,
    "a stored palette hex takes the active theme's shade of its color",
  );
  assert.equal(
    resolveTagColorValue(tagColorNameForHex("#b3543f")),
    warmHarvestTagColors[defaultTagColorName],
    "an unknown stored hex renders as the default color, never as itself",
  );
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

test("the shared tag-color resolver hook ships in the built widgets module", async () => {
  const hookModule: Record<string, any> = await import("../../dist/widgets/tagColors.js");
  assert.equal(typeof hookModule.useTagColorResolver, "function");
});

test("tag shades resolve per theme and differ dark vs light (#799)", () => {
  for (const name of tagColorNames) {
    assert.notEqual(warmHarvestTagColorShades[name].dark, warmHarvestTagColorShades[name].light);
    assert.equal(resolveTagColorShade(name, "dark", warmHarvestTagColorShades), warmHarvestTagColorShades[name].dark);
    assert.equal(resolveTagColorShade(name, "light", quietDawnTagColorShades), quietDawnTagColorShades[name].light);
    assert.notEqual(warmHarvestTagColorShades[name].dark, quietDawnTagColorShades[name].dark);
  }
});
