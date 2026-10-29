/**
 * Contract test for EditableChipGroup (spudly/design-system#119,
 * recipes-detail tranche): the preset-or-custom chip group
 * extracted from RecipeDetailPage's scale row (#73 — the
 * foundation left the custom-scale editable chip to this
 * tranche).
 *
 * The behavior contract (parsing, commit rules, the selected
 * custom chip, presets leaving editing) is pinned in
 * servingsScaleControls.test.mjs and pageWebAria.test.mjs; the
 * pins here hold the component's shape: exported from the
 * package root, a labeled non-wrapping ToggleChipGroup, the
 * editor swapped in place of the chip, and the committed value
 * flowing through the same onChange as the presets.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "EditableChipGroup.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("EditableChipGroup is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.EditableChipGroup,
    "function",
    "EditableChipGroup must be exported from @spudly/ui",
  );
});

test("the group is a labeled preset row plus the editable custom chip", () => {
  assert.match(code, /<ToggleChipGroup\s+options=\{options\}\s+mode="single"\s+wrap=\{false\}/);
  assert.match(code, /\{isCustomEditing \? \(/, "the editor replaces the chip while editing");
  assert.match(code, /<TextField\s+accessibilityLabel=\{customAccessibilityLabel\}/);
  assert.match(
    code,
    /onChange\(String\(parsed\)\)/,
    "a committed custom entry flows through the presets' onChange",
  );
});
