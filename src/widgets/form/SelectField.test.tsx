/**
 * Disabled contract for SelectField (#801): follows the established
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
function codeOf(rel: string) {
  const source = readFileSync(join(here, "../../..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const code = codeOf("src/widgets/form/SelectField.tsx");
const stories = codeOf("src/widgets/form/SelectField.stories.tsx");
test("SelectField declares disabled defaulting false (#801)", () => {
  assert.match(code, /disabled\?: boolean/);
  assert.match(code, /disabled = false/);
});
test("disabled passes to the select primitive and its trigger, dimmed (#801)", () => {
  assert.match(code, /disabled=\{disabled\}/);
  assert.match(code, /opacity=\{disabled \? 0\.5 : 1\}/);
  assert.match(code, /aria-disabled=\{disabled \|\| undefined\}/);
});
test("a disabled select never forwards a value change (#801)", () => {
  assert.match(code, /if \(disabled\) \{\s*return;/);
});
test("SelectField has a Disabled story (#801)", () => {
  assert.match(stories, /export const Disabled/);
  assert.match(stories, /disabled: true/);
});
