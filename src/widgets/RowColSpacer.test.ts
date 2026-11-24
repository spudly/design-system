/**
 * Runtime tests for the Row / Col / Spacer layout primitives
 * (spudly/design-system#746, tranche 1).
 *
 * The contracts pinned here, exercised against the built dist —
 * no source reads:
 * 1. Row, Col, Spacer, and the layout resolver are exported from
 *    the internal components barrel.
 * 2. The axis translation: position props name the visual intent
 *    and resolve to justify-content vs align-items per axis
 *    (Stephen's table, 2026-11-21) — e.g. `middle` is align-center
 *    on a Row and justify-center on a Col; `center` is the mirror.
 * 3. The distribution props set justify-content AND
 *    align-content together; `stretch` sets both align properties.
 * 4. Same-axis conflicts resolve by the documented precedence:
 *    distribution > center/middle > end > start on the main axis;
 *    stretch/baseline above the position props on the cross axis.
 * 5. grow/shrink accept booleans (true → 1, false → 0) and numbers
 *    (passed through, e.g. grow={0.35}); wrap maps to flex-wrap.
 * 6. gap takes t-shirt sizes and resolves to the spacing scale
 *    (xs 4, s 8, m 12, l 16, xl 24, xxl 32).
 * 7. Padding (Stephen's amendment, 2026-11-24): `p` / `px` / `py`
 *    take the same t-shirt sizes and resolve to uniform padding —
 *    `p` all four sides, `px` the horizontal pair, `py` the
 *    vertical pair. There are no single-side padding props.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

const dist: Record<string, any> = await loadInternalDist();
const resolve = dist.resolveLayoutStyle as (
  axis: "row" | "col",
  props: Record<string, unknown>,
) => Record<string, unknown>;

test("Row, Col, Spacer, and the layout resolver are exported from the barrel", () => {
  for (const name of ["Row", "Col", "Spacer", "resolveLayoutStyle", "layoutSizeValues"]) {
    assert.notEqual(dist[name], undefined, `${name} must be exported`);
  }
});

test("row axis: left/center/right justify, top/middle/bottom align", () => {
  assert.equal(resolve("row", { left: true }).justifyContent, "flex-start");
  assert.equal(resolve("row", { center: true }).justifyContent, "center");
  assert.equal(resolve("row", { right: true }).justifyContent, "flex-end");
  assert.equal(resolve("row", { top: true }).alignItems, "flex-start");
  assert.equal(resolve("row", { middle: true }).alignItems, "center");
  assert.equal(resolve("row", { bottom: true }).alignItems, "flex-end");
});

test("col axis: top/middle/bottom justify, left/center/right align", () => {
  assert.equal(resolve("col", { top: true }).justifyContent, "flex-start");
  assert.equal(resolve("col", { middle: true }).justifyContent, "center");
  assert.equal(resolve("col", { bottom: true }).justifyContent, "flex-end");
  assert.equal(resolve("col", { left: true }).alignItems, "flex-start");
  assert.equal(resolve("col", { center: true }).alignItems, "center");
  assert.equal(resolve("col", { right: true }).alignItems, "flex-end");
});

test("distribution props set justify-content and align-content together", () => {
  for (const [prop, value] of [
    ["between", "space-between"],
    ["around", "space-around"],
    ["evenly", "space-evenly"],
  ] as const) {
    const resolved = resolve("row", { [prop]: true });
    assert.equal(resolved.justifyContent, value);
    assert.equal(resolved.alignContent, value);
  }
  const stretched = resolve("col", { stretch: true });
  assert.equal(stretched.alignItems, "stretch");
  assert.equal(stretched.alignContent, "stretch");
  assert.equal(resolve("row", { baseline: true }).alignItems, "baseline");
});

test("conflict precedence: distribution > center/middle > end > start; stretch/baseline top the cross axis", () => {
  assert.equal(
    resolve("row", { left: true, right: true, center: true, between: true }).justifyContent,
    "space-between",
  );
  assert.equal(resolve("row", { left: true, right: true }).justifyContent, "flex-end");
  assert.equal(resolve("col", { top: true, middle: true }).justifyContent, "center");
  assert.equal(resolve("row", { middle: true, stretch: true }).alignItems, "stretch");
  assert.equal(resolve("row", { middle: true, baseline: true }).alignItems, "baseline");
});

test("grow/shrink booleans and numbers, wrap, and the t-shirt gap scale", () => {
  assert.equal(resolve("row", { grow: true }).flexGrow, 1);
  assert.equal(resolve("row", { grow: false }).flexGrow, 0);
  assert.equal(resolve("col", { grow: 0.35, shrink: true }).flexGrow, 0.35);
  assert.equal(resolve("col", { grow: 0.35, shrink: true }).flexShrink, 1);
  assert.equal(resolve("row", { wrap: true }).flexWrap, "wrap");
  assert.equal(resolve("row", { wrap: false }).flexWrap, "nowrap");
  assert.deepEqual(dist.layoutSizeValues, { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 });
  assert.equal(resolve("row", { gap: "m" }).gap, 12);
  assert.deepEqual(resolve("row", {}), {});
});

test("padding props resolve uniformly per direction on both axes", () => {
  assert.equal(resolve("row", { p: "m" }).padding, 12);
  assert.equal(resolve("row", { px: "l" }).paddingHorizontal, 16);
  assert.equal(resolve("row", { py: "xs" }).paddingVertical, 4);
  assert.equal(resolve("col", { p: "xl" }).padding, 24);
  const combined = resolve("col", { p: "s", px: "l", py: "xxl" });
  assert.equal(combined.padding, 8);
  assert.equal(combined.paddingHorizontal, 16);
  assert.equal(combined.paddingVertical, 32);
  // No padding prop set → no padding keys at all.
  assert.equal("padding" in resolve("row", { gap: "s" }), false);
});
