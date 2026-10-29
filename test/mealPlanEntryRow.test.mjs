/**
 * Contract test for MealPlanEntryRow (spudly/design-system#119),
 * the meal-plan entry row extracted from MealPlanDetailPage in
 * tranche 2: a hairline row whose title line names the entry
 * kind ("Meal · " / "Recipe · ") over an optional meta line.
 *
 * The row lived inside MealPlanDetailPage with its pressable
 * area, hairline, and disabled treatment applied by the page —
 * styling a page may not apply itself under #119 — so it is a
 * widget here and the page composes rows, keeping only the kind
 * dispatch (meal vs recipe open callbacks) in its own closure.
 * The pins hold the extraction faithful, including the
 * unavailable treatment: no press, no focus, marked disabled.
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
const entryRowSource = readFileSync(join(componentsDir, "MealPlanEntryRow.tsx"), "utf8");

const entryRowCode = entryRowSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("MealPlanEntryRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.MealPlanEntryRow,
    "function",
    "MealPlanEntryRow must be exported from @spudly/ui",
  );
});

test("MealPlanEntryRowProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /MealPlanEntryRowProps/);
});

test("MealPlanEntryRow's contract is kind, title, optional subtitle, availability, press", () => {
  assert.match(entryRowCode, /kind: "meal" \| "recipe";/);
  assert.match(entryRowCode, /title: string;/);
  assert.match(entryRowCode, /subtitle\?: string;/);
  assert.match(entryRowCode, /isUnavailable\?: boolean;/);
  assert.match(entryRowCode, /onPress: \(\) => void;/);
});

test("MealPlanEntryRow keeps the hairline row and the kind-prefixed title line", () => {
  assert.match(
    entryRowCode,
    /<YStack borderBottomWidth=\{1\} borderBottomColor=\{tokens\.colors\.gray\.gray2\}>/,
  );
  assert.match(entryRowCode, /paddingVertical="\$3"/);
  assert.match(
    entryRowCode,
    /fontSize=\{tokens\.typography\.fontSize\.md\}\s+fontWeight=\{tokens\.typography\.fontWeight\.medium\}/,
  );
  assert.match(entryRowCode, /\{kind === "meal" \? "Meal" : "Recipe"\} · \{title\}/);
  assert.match(entryRowCode, /\{isUnavailable \? " \(unavailable\)" : ""\}/);
  assert.match(entryRowCode, /\{subtitle \? <Text variant="hint">\{subtitle\}<\/Text> : null\}/);
});

test("MealPlanEntryRow's available row is a keyboard-operable button; the unavailable row is disabled", () => {
  assert.match(
    entryRowCode,
    /platformAccessibilityProps\(\{ accessibilityState: \{ disabled: true \} \}\)/,
  );
  assert.match(
    entryRowCode,
    /\.\.\.platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)/,
  );
  assert.match(entryRowCode, /tabIndex: 0,/);
  assert.match(entryRowCode, /cursor: "web:pointer",/);
  assert.match(entryRowCode, /event\.key === "Enter" \|\| event\.key === " "/);
});
