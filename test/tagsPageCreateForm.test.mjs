/**
 * Contract test for spudly/design-system#219: the TagsPage create
 * form's color + Add row must not overflow at narrow widths — the
 * Add button was pushed off-screen because the row did not wrap
 * and the ColorPickerField root did not shrink.
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
const picker = readFileSync(join(root, "src", "components", "ColorPickerField.tsx"), "utf8");

test("TagsPage create-form row wraps so Add stays visible (#219)", () => {
  assert.match(
    tagsPage,
    /<XStack flexWrap="wrap" gap="\$2" alignItems="center" justifyContent="space-between">\s*<ColorPickerField/,
    'the color + Add XStack must set flexWrap="wrap" so the Add button wraps instead of overflowing (#219)',
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
