/**
 * Contract test for DetailRow (spudly/design-system#119), the
 * label/value detail row extracted from MealPlanDetailPage's
 * nutrition-goal rows in tranche 2: a muted label on the leading
 * edge and its value on the trailing edge, over a hairline.
 *
 * The row lived inside MealPlanDetailPage as its private GoalRow
 * helper with the hairline, padding, and text treatments applied
 * by the page — styling a page may not apply itself under #119 —
 * so it is a widget here and the page composes rows. The label
 * takes Text's `hint` treatment (the muted-sm treatment the page
 * applied by hand) and the value the same small size at the
 * default tone.
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
const detailRowSource = readFileSync(join(componentsDir, "DetailRow.tsx"), "utf8");

const detailRowCode = detailRowSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("DetailRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.DetailRow, "function", "DetailRow must be exported from @spudly/ui");
});

test("DetailRowProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /DetailRowProps/);
});

test("DetailRow's contract is a label and a value", () => {
  assert.match(
    detailRowCode,
    /export type DetailRowProps = \{\s+label: string;\s+value: string;\s+\};/,
  );
});

test("DetailRow keeps the space-between hairline row and its text treatments", () => {
  assert.match(detailRowCode, /justifyContent="space-between"/);
  assert.match(detailRowCode, /borderBottomWidth=\{1\}/);
  assert.match(detailRowCode, /borderBottomColor=\{tokens\.colors\.gray\.gray2\}/);
  assert.match(detailRowCode, /paddingVertical="\$2"/);
  assert.match(detailRowCode, /<Text variant="hint">\{label\}<\/Text>/);
  assert.match(
    detailRowCode,
    /<Text fontSize=\{tokens\.typography\.fontSize\.sm\}>\{value\}<\/Text>/,
  );
});
