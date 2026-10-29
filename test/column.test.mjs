/**
 * Contract test for Column (spudly/design-system#119), the DS
 * layout column pages compose instead of rendering a Tamagui
 * stack with styling props of their own — Row's vertical
 * counterpart, added in tranche 2 for the meal-plan pages.
 *
 * Pages name the intent through the same semantic props and the
 * same scale steps as Row — `spacing` (gap step), `align`
 * (cross-axis alignment), `spaceBefore` / `spaceAfter` (space
 * around the column) — and Column owns the style values on the
 * spacing scale: none/sm/md/lg/xl/2xl = 0/8/12/16/24/32px (spacing
 * tokens 0/2/3/4/6/8). The pins below hold that shape: the styled
 * base is a YStack named "Column", every variant value comes
 * from the spacing tokens, and the step tables match Row's
 * (row.test.mjs pins the Row side).
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
const columnSource = readFileSync(join(componentsDir, "Column.tsx"), "utf8");

const columnCode = columnSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Column is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Column, "function", "Column must be exported from @spudly/ui");
});

test("ColumnProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /ColumnProps/);
});

test("Column's styled base is a YStack named Column, with token-driven variants", () => {
  assert.match(columnCode, /styled\(YStack, \{\s+name: "Column",/);
  assert.match(columnCode, /sm: \{ gap: tokens\.spacing\[2\] \}/);
  assert.match(columnCode, /md: \{ gap: tokens\.spacing\[3\] \}/);
  assert.match(columnCode, /lg: \{ gap: tokens\.spacing\[4\] \}/);
  assert.match(columnCode, /xl: \{ gap: tokens\.spacing\[6\] \}/);
  assert.match(columnCode, /"2xl": \{ gap: tokens\.spacing\[8\] \}/);
  assert.match(columnCode, /sm: \{ marginTop: tokens\.spacing\[2\] \}/);
  assert.match(columnCode, /md: \{ marginTop: tokens\.spacing\[3\] \}/);
  assert.match(columnCode, /lg: \{ marginTop: tokens\.spacing\[4\] \}/);
  assert.match(columnCode, /xl: \{ marginTop: tokens\.spacing\[6\] \}/);
  assert.match(columnCode, /"2xl": \{ marginTop: tokens\.spacing\[8\] \}/);
  assert.match(columnCode, /sm: \{ marginBottom: tokens\.spacing\[2\] \}/);
  assert.match(columnCode, /md: \{ marginBottom: tokens\.spacing\[3\] \}/);
  assert.match(columnCode, /lg: \{ marginBottom: tokens\.spacing\[4\] \}/);
  assert.match(columnCode, /xl: \{ marginBottom: tokens\.spacing\[6\] \}/);
  assert.match(columnCode, /"2xl": \{ marginBottom: tokens\.spacing\[8\] \}/);
  assert.match(columnCode, /center: \{ alignItems: "center" \}/);
});

test("Column's public API is the semantic props, with Row's defaults", () => {
  assert.match(columnCode, /spacing\?: "none" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl";/);
  assert.match(columnCode, /align\?: "start" \| "center" \| "end" \| "stretch";/);
  assert.match(columnCode, /spaceBefore\?: "none" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl";/);
  assert.match(columnCode, /spaceAfter\?: "none" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl";/);
  assert.match(
    columnCode,
    /spacing = "sm",\s+align = "start",\s+spaceBefore = "none",\s+spaceAfter = "none",/,
  );
});
