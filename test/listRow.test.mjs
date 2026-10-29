/**
 * Contract test for ListRow (spudly/design-system#119), the
 * generic hairline list row: a title line — an optional
 * caller-supplied prefix, the title, an optional caller-supplied
 * suffix — over an optional meta line, with a hairline below.
 *
 * Extracted from MealPlanDetailPage's entry rows in tranche 2
 * and generalized the same day at Stephen's direction:
 * components extracted under #119 must be reusable across
 * sites/apps, so the row carries no app domain in its name or
 * API — the entry kind's "Meal · " / "Recipe · " lead-in crosses
 * as a caller-supplied `prefix`, the "(unavailable)" text as a
 * caller-supplied `titleSuffix`, and the recipe-access state as
 * a generic `isDisabled` treatment (no press, no focus, marked
 * disabled). The page keeps only its kind dispatch in its own
 * onPress closure. The pins hold the shape, including the
 * disabled treatment.
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
const listRowSource = readFileSync(join(componentsDir, "ListRow.tsx"), "utf8");

const listRowCode = listRowSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ListRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.ListRow, "function", "ListRow must be exported from @spudly/ui");
});

test("ListRowProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /ListRowProps/);
});

test("ListRow's contract is caller-supplied content plus a disabled flag and a press", () => {
  assert.match(listRowCode, /prefix\?: string;/);
  assert.match(listRowCode, /title: string;/);
  assert.match(listRowCode, /titleSuffix\?: string;/);
  assert.match(listRowCode, /subtitle\?: string;/);
  assert.match(listRowCode, /isDisabled\?: boolean;/);
  assert.match(listRowCode, /onPress: \(\) => void;/);
});

test("ListRow keeps the hairline row and composes the title line from its parts", () => {
  assert.match(
    listRowCode,
    /<YStack borderBottomWidth=\{1\} borderBottomColor=\{tokens\.colors\.gray\.gray2\}>/,
  );
  assert.match(listRowCode, /paddingVertical="\$3"/);
  assert.match(
    listRowCode,
    /fontSize=\{tokens\.typography\.fontSize\.md\}\s+fontWeight=\{tokens\.typography\.fontWeight\.medium\}/,
  );
  assert.match(listRowCode, /\{prefix\}\s+\{title\}\s+\{titleSuffix\}/);
  assert.match(listRowCode, /\{subtitle \? <Text variant="hint">\{subtitle\}<\/Text> : null\}/);
});

test("ListRow's enabled row is a keyboard-operable button; the disabled row is marked disabled", () => {
  assert.match(
    listRowCode,
    /platformAccessibilityProps\(\{ accessibilityState: \{ disabled: true \} \}\)/,
  );
  assert.match(
    listRowCode,
    /\.\.\.platformAccessibilityProps\(\{ accessibilityRole: "button" \}\)/,
  );
  assert.match(listRowCode, /tabIndex: 0,/);
  assert.match(listRowCode, /cursor: "web:pointer",/);
  assert.match(listRowCode, /event\.key === "Enter" \|\| event\.key === " "/);
});
