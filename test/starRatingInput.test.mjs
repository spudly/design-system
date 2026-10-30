/**
 * Contract test for the StarRatingInput adapter-parity props
 * (spudly/design-system#159).
 *
 * The eciperay app adapter `ui/StarRatingInput` wrapped the DS component
 * to supply four behaviors it lacked: a `tone` (dark cooking-overlay
 * variant), toggle-off (tap the current rating to clear), readOnly, and
 * disabled. This test pins the DS-side contract so the adapter can be
 * deleted: the props exist, toggle-off is opt-in via `allowClear` and
 * clears through `onChange(0)`, readOnly renders no radio buttons, and
 * disabled blocks presses.
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
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const code = codeOf("src/components/StarRatingInput.tsx");

test("StarRatingInput declares tone, allowClear, readOnly and disabled props (#159)", () => {
  assert.match(code, /tone\?: StarRatingTone/);
  assert.match(code, /allowClear\?: boolean/);
  assert.match(code, /readOnly\?: boolean/);
  assert.match(code, /disabled\?: boolean/);
  assert.match(code, /tone = "default"/);
  assert.match(code, /allowClear = false/);
});

test("dark tone renders unselected stars near-white at reduced opacity (#159)", () => {
  assert.match(code, /tone === "dark"/);
  assert.match(code, /tokens\.colors\.gray\.gray1/);
});

test("dark tone renders the label in near-white ink so it stays legible on dark surfaces (#334)", () => {
  assert.match(
    code,
    /style=\{tone === "dark" \? \{ color: tokens\.colors\.gray\.gray1 \} : undefined\}/,
  );
});

test("allowClear clears through onChange(0) only when enabled (#159)", () => {
  assert.match(code, /onChange\(allowClear && star === value \? 0 : star\)/);
});

test("readOnly renders a static image-role display, not radio buttons (#159)", () => {
  assert.match(code, /readOnly \? \(/);
  // #235: the role crosses through platformAccessibilityProps (the
  // helper-call object form), which maps image -> img + aria-label
  // on web instead of leaking the RN props as raw HTML attributes.
  assert.match(code, /accessibilityRole: "image"/);
  assert.match(code, /Rated \$\{value\} out of 5 stars/);
});

test("disabled blocks presses and dims the radiogroup (#159)", () => {
  assert.match(code, /if \(disabled\) \{\s*return;/);
  assert.match(code, /opacity=\{disabled \? 0\.5 : 1\}/);
  assert.match(code, /accessibilityState: \{ disabled \}/);
});
