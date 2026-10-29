/**
 * Contract test for MealPlanRow (spudly/design-system#119), the
 * meal-plan list row extracted from MealPlansPage in tranche 2:
 * an elevated card whose text block — title over its meta line —
 * is the press target, with an optional soft-danger Delete beside
 * it when the delete callback is wired.
 *
 * The row lived inside MealPlansPage with its layout, pressable
 * area, and button treatment applied by the page — styling a page
 * may not apply itself under #119 — so it is a widget here and
 * the page composes rows. The pins hold the extraction faithful:
 * the card treatment, the div-button pressable pattern (the
 * OptionCard pattern: a Tamagui view, not a Pressable, so web
 * keeps the layout), the keyboard activation, and the Delete
 * guard.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const mealPlanRowSource = readFileSync(join(componentsDir, "MealPlanRow.tsx"), "utf8");

const mealPlanRowCode = mealPlanRowSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MealPlanRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.MealPlanRow, "function", "MealPlanRow must be exported from @spudly/ui");
});

test("MealPlanRowProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /MealPlanRowProps/);
});

test("MealPlanRow's contract is title, optional subtitle, press, optional delete press", () => {
  assert.match(mealPlanRowCode, /title: string;/);
  assert.match(mealPlanRowCode, /subtitle\?: string;/);
  assert.match(mealPlanRowCode, /onPress: \(\) => void;/);
  assert.match(mealPlanRowCode, /onDeletePress\?: \(\) => void;/);
});

test("MealPlanRow keeps the elevated card and the div-button pressable pattern", () => {
  assert.match(
    mealPlanRowCode,
    /<Card variant="elevated" flexDirection="row" alignItems="center" gap="\$3">/,
  );
  assert.match(
    mealPlanRowCode,
    /\{\.\.\.platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)\}/,
  );
  assert.match(mealPlanRowCode, /onPress=\{onPress\}/);
  assert.match(mealPlanRowCode, /tabIndex=\{0\}/);
  assert.match(mealPlanRowCode, /cursor="web:pointer"/);
  assert.match(mealPlanRowCode, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(mealPlanRowCode, /<YStack paddingBlockEnd="\$3">/);
});

test("MealPlanRow's title takes the md semibold treatment and the subtitle the hint variant", () => {
  assert.match(
    mealPlanRowCode,
    /fontSize=\{tokens\.typography\.fontSize\.md\}\s+fontWeight=\{tokens\.typography\.fontWeight\.semibold\}/,
  );
  assert.match(mealPlanRowCode, /\{subtitle \? <Text variant="hint">\{subtitle\}<\/Text> : null\}/);
});

test("MealPlanRow's Delete renders only when the delete callback is wired", () => {
  assert.match(mealPlanRowCode, /\{onDeletePress \? \(/);
  assert.match(mealPlanRowCode, /variant="secondary"/);
  assert.match(mealPlanRowCode, /size="sm"/);
  assert.match(mealPlanRowCode, /backgroundColor=\{tokens\.colors\.danger\.danger1\}/);
  assert.match(mealPlanRowCode, /color=\{tokens\.colors\.danger\.danger8\}/);
  assert.match(mealPlanRowCode, /onPress=\{onDeletePress\}/);
});
