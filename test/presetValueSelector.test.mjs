/**
 * Contract test for PresetValueSelector (spudly/design-system#119,
 * the dedupe PR): the preset-or-custom value selector — the
 * Button-based successor to the recipedetail tranche's
 * EditableChipGroup, rebuilt when the chip components were
 * retired (buttons everywhere).
 *
 * The behavior contract (parsing, commit rules, the selected
 * custom value, presets leaving editing) is pinned in
 * servingsScaleControls.test.mjs and pageWebAria.test.mjs; the
 * pins here hold the component's shape: exported from the
 * package root, presets and the custom slot rendered as
 * Button's toggle form, the editor swapped in place of the
 * custom button, and the committed value flowing through the
 * same onChange as the presets.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, "..", "src", "components", "PresetValueSelector.tsx"),
  "utf8",
);
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("PresetValueSelector is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.PresetValueSelector,
    "function",
    "PresetValueSelector must be exported from @spudly/ui",
  );
});

test("the selector is a labeled preset row of toggle buttons plus the editable custom slot", () => {
  assert.match(code, /selected=\{value === option\.value\}/, "presets are toggle buttons");
  assert.match(
    code,
    /\{isCustomEditing \? \(/,
    "the editor replaces the custom button while editing",
  );
  assert.match(code, /<TextField\s+accessibilityLabel=\{customAccessibilityLabel\}/);
  assert.match(
    code,
    /onChange\(String\(parsed\)\)/,
    "a committed custom entry flows through the presets' onChange",
  );
  assert.ok(!code.includes("Chip"), "no chip component survives in the selector");
});
