/**
 * Contract test for Column (spudly/design-system#119), the DS
 * layout column pages compose instead of rendering a Tamagui
 * stack with styling props of their own — Row's vertical
 * counterpart.
 *
 * Column takes ONE semantic prop — its `variant`, the role the
 * column plays — and the role pins every style value in the
 * component (Stephen's direction, 2026-10-29: named scale steps
 * at call sites are style props with friendlier names, and
 * per-call-site choice is how page spacing drifts). The roles:
 * - `sections`: a page's major blocks — gap spacing[8] (32px),
 *   the page rhythm; children stretch to the column's width.
 * - `group`: related content inside a card — gap spacing[3]
 *   (12px), stretch.
 * - `list`: rows of one list — gap spacing[2] (8px), stretch.
 * - `state`: a centered page-state block — gap spacing[2],
 *   align center.
 * The pins hold that shape and, just as importantly, the absence
 * of any step/margin API: no `spacing` / `spaceBefore` /
 * `spaceAfter` / `align` props exist to pass — separation
 * between blocks is the parent stack's role gap.
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

test("Column's styled base is a YStack named Column, with the role variants pinning the styles", () => {
  assert.match(columnCode, /styled\(YStack, \{\s+name: "Column",/);
  assert.match(
    columnCode,
    /sections: \{\s+gap: tokens\.spacing\[8\],\s+alignItems: "stretch",\s+\}/,
  );
  assert.match(columnCode, /group: \{\s+gap: tokens\.spacing\[3\],\s+alignItems: "stretch",\s+\}/);
  assert.match(columnCode, /list: \{\s+gap: tokens\.spacing\[2\],\s+alignItems: "stretch",\s+\}/);
  assert.match(columnCode, /state: \{\s+gap: tokens\.spacing\[2\],\s+alignItems: "center",\s+\}/);
});

test("Column's public API is the required role prop, and no step or margin props exist", () => {
  assert.match(columnCode, /variant: "sections" \| "group" \| "list" \| "state";/);
  assert.match(columnCode, /export function Column\(\{ variant, \.\.\.rest \}: ColumnProps\)/);
  assert.match(
    columnCode,
    /Omit<StyledColumnProps, "gap" \| "alignItems">/,
    "the role-owned style keys must be omitted from ColumnProps so call sites cannot override the role",
  );
  for (const banned of ["spacing", "spaceBefore", "spaceAfter", "align"]) {
    assert.ok(
      !new RegExp(String.raw`${banned}\?:`).test(columnCode),
      `ColumnProps must not carry a ${banned} prop — the role owns the styling (#119)`,
    );
  }
});
