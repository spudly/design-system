/**
 * Contract tests for the MasonryGrid widget (spudly/design-system#178).
 *
 * MasonryGrid is the shuoink/ui adoption Stephen reversed from skip to
 * adopt on 2026-10-28, on the condition that its unfinished parts are
 * finished, not ported as-is. The contract pinned here:
 *
 * 1. Column count is DYNAMIC: `masonryColumnCount` derives it from the
 *    measured container width — as many columns of at least
 *    `minColumnWidth` (plus one gap each) as fit, clamped to
 *    [minColumns, maxColumns] — replacing the source's hard-coded 3
 *    columns and its "detect this dynamically" TODO. An unmeasured or
 *    non-positive width yields minColumns (the pre-layout render).
 * 2. Distribution is round-robin (reading order across each row) and
 *    never yields an empty column.
 * 3. The component measures its own container (layout callback) and
 *    feeds the width through `masonryColumnCount` — no hard-coded
 *    column count anywhere — and spaces columns/items with `gap`,
 *    never margins (the DS spacing rule).
 * 4. The widget and both helpers are exported from the package root,
 *    and its props are a type alias (Stephen's #214 rule).
 *
 * Runtime assertions run against the built output: `npm run build`
 * first (the `test` script does both). Source scans strip comments so
 * explanatory text cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const { masonryColumnCount, distributeMasonryItems, MasonryGrid } = await import(
  join(here, "..", "dist", "index.js")
);

function codeOf(rel) {
  const source = readFileSync(join(here, "..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const code = codeOf("src/components/MasonryGrid.tsx");

test("masonryColumnCount fits columns of minColumnWidth plus one gap each", () => {
  // Defaults: minColumnWidth 160, gap 12, min 1, max 4.
  // Two columns need 2*160 + 12 = 332px; three need 504; four need 676.
  assert.equal(masonryColumnCount(331), 1);
  assert.equal(masonryColumnCount(332), 2);
  assert.equal(masonryColumnCount(503), 2);
  assert.equal(masonryColumnCount(504), 3);
  assert.equal(masonryColumnCount(675), 3);
  assert.equal(masonryColumnCount(676), 4);
});

test("masonryColumnCount clamps to min/max columns", () => {
  assert.equal(masonryColumnCount(4000), 4);
  assert.equal(masonryColumnCount(4000, { maxColumns: 2 }), 2);
  assert.equal(masonryColumnCount(100, { minColumns: 2 }), 2);
  assert.equal(masonryColumnCount(100, { minColumns: 3, maxColumns: 2 }), 3);
});

test("masonryColumnCount treats an unmeasured width as minColumns", () => {
  assert.equal(masonryColumnCount(0), 1);
  assert.equal(masonryColumnCount(-50), 1);
  assert.equal(masonryColumnCount(Number.NaN), 1);
  assert.equal(masonryColumnCount(0, { minColumns: 2 }), 2);
});

test("masonryColumnCount honors custom minColumnWidth and gap", () => {
  assert.equal(masonryColumnCount(299, { minColumnWidth: 100, gap: 0 }), 2);
  assert.equal(masonryColumnCount(300, { minColumnWidth: 100, gap: 0 }), 3);
  assert.equal(masonryColumnCount(219, { minColumnWidth: 100, gap: 20 }), 1);
  assert.equal(masonryColumnCount(220, { minColumnWidth: 100, gap: 20 }), 2);
});

test("distributeMasonryItems deals items round-robin across columns", () => {
  assert.deepEqual(distributeMasonryItems([0, 1, 2, 3, 4, 5, 6], 3), [
    [0, 3, 6],
    [1, 4],
    [2, 5],
  ]);
  assert.deepEqual(distributeMasonryItems(["a", "b", "c"], 1), [["a", "b", "c"]]);
});

test("distributeMasonryItems never returns an empty column", () => {
  assert.deepEqual(distributeMasonryItems(["a", "b"], 4), [["a"], ["b"]]);
  assert.deepEqual(distributeMasonryItems([], 3), []);
  assert.deepEqual(distributeMasonryItems(["a", "b", "c"], 0), [["a", "b", "c"]]);
});

test("MasonryGrid and its helpers are exported from the package root", () => {
  assert.equal(typeof MasonryGrid, "function");
  assert.equal(typeof masonryColumnCount, "function");
  assert.equal(typeof distributeMasonryItems, "function");
  const barrel = readFileSync(join(here, "..", "src", "components", "index.ts"), "utf8");
  assert.match(barrel, /MasonryGrid,[\s\S]*from "\.\/MasonryGrid\.js"/);
});

test("the component measures its container and derives the column count", () => {
  assert.match(code, /onLayout=/);
  assert.match(code, /masonryColumnCount\(containerWidth/);
  assert.match(code, /distributeMasonryItems\(/);
  assert.doesNotMatch(code, /=\s*3\s*;/); // the source's hard-coded `columns = 3` must not survive
});

test("spacing is gap-only and props are a type alias", () => {
  assert.match(code, /gap=\{gap\}/);
  assert.doesNotMatch(code, /margin(Top|Bottom|Left|Right|Horizontal|Vertical)?=/);
  assert.match(code, /export type MasonryGridProps<Item> = \{/);
  assert.doesNotMatch(code, /name: "Spudly/);
});
