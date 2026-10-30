/**
 * Contract test for spudly/design-system#219: the TagsPage create
 * form's color + Add row must not overflow at narrow widths — the
 * Add button was pushed off-screen because the row did not wrap
 * and the ColorPickerField root did not shrink.
 *
 * Since the #119 meals & planning tranche the row is the generic
 * TrailingActionsRow: TagsPage composes its ColorPickerField as
 * the row's leading group, and the row carries the wrapping
 * XStack treatment verbatim.
 *
 * Source scan (same rationale as test/badgeBorder.test.mjs): the
 * invariant is a per-literal property of the two sources.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tagsPage = readFileSync(join(root, "src", "pages", "TagsPage.tsx"), "utf8");
const createFormEnd = tagsPage.indexOf("{isLoading ?");
const row = readFileSync(join(root, "src", "components", "TrailingActionsRow.tsx"), "utf8");
const picker = readFileSync(join(root, "src", "components", "ColorPickerField.tsx"), "utf8");

test("TagsPage create-form row wraps so Add stays visible (#219)", () => {
  assert.match(
    row,
    /<XStack flexWrap="wrap" gap="\$2" alignItems="center" justifyContent="space-between">\s*\{leading\}/,
    'the TrailingActionsRow XStack must set flexWrap="wrap" so the Add button wraps instead of overflowing (#219)',
  );
  assert.notEqual(createFormEnd, -1, "TagsPage must keep its loading branch boundary");
  const createForm = tagsPage.slice(0, createFormEnd);
  const createRow = createForm.match(
    /<TrailingActionsRow\s+leading=\{\s*<ColorPickerField[\s\S]*?<\/TrailingActionsRow>/,
  );
  assert.ok(
    createRow,
    "TagsPage's create form must compose its ColorPickerField as the row's leading group (#219, #119)",
  );
  assert.match(
    createRow[0],
    /<Button[\s\S]*?accessibilityLabel="Add"/,
    "TagsPage's create-form row must contain the Add button",
  );
});

test("ColorPickerField root can shrink inside a flex row (#219)", () => {
  assert.match(
    picker,
    /<YStack gap=\{tokens\.spacing\[2\]\} flexShrink=\{1\} flexGrow=\{1\} minWidth=\{0\}>/,
    "the ColorPickerField root YStack must be shrinkable (flexShrink/flexGrow/minWidth) so its wrapping swatch row can narrow (#219)",
  );
  assert.match(
    picker,
    /flexWrap="wrap"/,
    'the swatch row itself must keep flexWrap="wrap" so swatches wrap as the field narrows (#219)',
  );
});
