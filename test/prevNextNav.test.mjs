/**
 * Contract test for the PrevNextNav disabled-back state
 * (spudly/design-system#158).
 *
 * The eciperay app adapter `ui/PrevNextNav` could not be deleted because
 * DS `PrevNextNav` had a disabled state for Next (`nextDisabled`) but
 * none for Back. This test pins the symmetric contract: `backDisabled`
 * exists, defaults to false, and is passed to the Back ghost button's
 * `disabled` prop — while omitting `onBack` still hides the button.
 *
 * Source scan, not a render test: the invariant is a per-literal
 * property of the component source, matching this repo's other
 * component contract tests. Comments are stripped before scanning so
 * explanatory comments cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function codeOf(rel) {
  const source = readFileSync(join(here, "..", rel), "utf8");
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const code = codeOf("src/components/PrevNextNav.tsx");

test("PrevNextNav declares backDisabled alongside nextDisabled (#158)", () => {
  assert.match(code, /backDisabled\?: boolean/);
  assert.match(code, /nextDisabled\?: boolean/);
  assert.match(code, /backDisabled = false/);
});

test("backDisabled is passed to the Back ghost button (#158)", () => {
  assert.match(code, /<Button variant="ghost" onPress=\{onBack\} disabled=\{backDisabled\}>/);
  assert.match(code, /<Button variant="primary" onPress=\{onNext\} disabled=\{nextDisabled\}>/);
});

test("omitting onBack still hides the Back button (#158)", () => {
  assert.match(code, /\{onBack \? \(/);
  assert.match(code, /justifyContent=\{onBack \? "space-between" : "flex-end"\}/);
});
