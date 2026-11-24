/**
 * Disabled contract for NumberStepper (#801): follows the established
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
  const source = readFileSync(join(here, "../..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}}

const code = codeOf("src/widgets/NumberStepper.tsx");
const stories = codeOf("src/widgets/NumberStepper.stories.tsx");
test("NumberStepper declares disabled defaulting false (#801)", () => {
  assert.match(code, /disabled\?: boolean/);
  assert.match(code, /disabled = false/);
});
test("disabled dims the stepper and disables both buttons and the editable field (#801)", () => {
  assert.match(code, /opacity=\{disabled \? 0\.5 : 1\}/);
  assert.match(code, /disabled=\{disabled \|\| !canDecrement\}/);
  assert.match(code, /disabled=\{disabled \|\| !canIncrement\}/);
  assert.match(code, /disabled=\{disabled\}/);
});
test("a disabled stepper never changes or commits a value (#801)", () => {
  assert.match(code, /if \(disabled\) \{\s*return;/);
});
test("NumberStepper has a Disabled story (#801)", () => {
  assert.match(stories, /export const Disabled/);
  assert.match(stories, /disabled: true/);
});
