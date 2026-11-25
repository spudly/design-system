/**
 * Disabled contract for ColorPickerField (#801): follows the established
 * Slider/StarRatingInput disabled treatment — `disabled?: boolean`
 * defaulting false, root/control opacity 0.5, handlers guarded,
 * and the disabled state announced via accessibilityState /
 * aria-disabled as appropriate for the control.
 *
 * Source scan, matching this repo's other component contract
 * tests; comments are stripped first so prose cannot satisfy
 * the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
function codeOf(rel: string) {{
  const source = readFileSync(join(here, "../../..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}}

const code = codeOf("src/widgets/form/ColorPickerField.tsx");
const stories = codeOf("src/widgets/form/ColorPickerField.stories.tsx");
test("ColorPickerField declares disabled defaulting false (#801)", () => {
  assert.match(code, /disabled\?: boolean/);
  assert.match(code, /disabled = false/);
});
test("disabled dims the group and disables every swatch (#801)", () => {
  assert.match(code, /opacity=\{disabled \? 0\.5 : 1\}/);
  assert.match(code, /disabled=\{disabled\}/);
  assert.match(code, /accessibilityState: \{ disabled \}/);
  assert.match(code, /aria-disabled=\{disabled \|\| undefined\}/);
});
test("disabled swatches leave the focus order and carry no press handler (#801)", () => {
  assert.match(code, /tabIndex=\{disabled \? -1 : 0\}/);
  assert.match(code, /disabled\s*\?\s*undefined/);
});
test("ColorPickerField has a Disabled story (#801)", () => {
  assert.match(stories, /export const Disabled/);
  assert.match(stories, /disabled: true/);
});
