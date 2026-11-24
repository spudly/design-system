/**
 * Contract test for DetailRow (spudly/design-system#119), the
 * label/value detail row extracted from MealPlanDetailPage's
 * nutrition-goal rows in tranche 2: a muted label on the leading
 * edge and its value on the trailing edge, over a hairline.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: the row is called directly and the element it
 * returns is inspected — the XStack props it passes (space-
 * between, hairline, vertical padding) and the Text treatments
 * it gives the label (`hint`) and value (small size) ARE the
 * rendered contract, observable without reading source. The
 * former type-shape scan was deleted: the prop shape is
 * enforced by the TypeScript build, not a test (Stephen,
 * 2026-11-20). The dist `.d.ts` read below is a built-artifact
 * read, not a source read, and stays.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

test("DetailRow is exported from the built internal views barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.DetailRow,
    "function",
    "DetailRow must be exported from the internal views barrel",
  );
});

test("DetailRowProps is a type-only export from the built views barrel", () => {
  const types = readFileSync(join(here, "../..", "dist", "views", "index.d.ts"), "utf8");
  assert.match(types, /DetailRowProps/);
});

test("DetailRow renders a space-between hairline row with its text treatments", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  const element = dist.DetailRow({ label: "Calories", value: "1,800" });
  assert.equal(element.props.justifyContent, "space-between");
  assert.equal(element.props.borderBottomWidth, 1);
  assert.equal(element.props.borderBottomColor, dist.tokens.colors.gray.gray2);
  assert.equal(element.props.paddingVertical, "$2");
  const [labelEl, valueEl] = element.props.children;
  assert.equal(labelEl.type, dist.Text);
  assert.equal(labelEl.props.variant, "hint", "the label takes Text's hint treatment");
  assert.equal(labelEl.props.children, "Calories");
  assert.equal(valueEl.type, dist.Text);
  assert.equal(valueEl.props.fontSize, dist.tokens.typography.fontSize.sm);
  assert.equal(valueEl.props.children, "1,800");
});
