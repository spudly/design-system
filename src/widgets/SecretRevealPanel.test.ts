/**
 * Voice-slot pins for SecretRevealPanel (#539 tranche 1d): the
 * panel's title, copy label, show-once hint, and dismiss label
 * come from the app-supplied voice object — the DS ships no
 * default strings — while the title and copyLabel props still
 * override their slots when a caller passes them.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "SecretRevealPanel.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("SecretRevealPanel reads its text from the voice object", () => {
  assert.match(code, /useVoice\(\)/);
  assert.match(code, /voice\.secretRevealPanel\.title/);
  assert.match(code, /voice\.secretRevealPanel\.copyLabel/);
  assert.match(code, /voice\.secretRevealPanel\.hint/);
  assert.match(code, /voice\.secretRevealPanel\.dismissLabel/);
});

test("SecretRevealPanel carries no hard-coded copy defaults", () => {
  assert.doesNotMatch(code, /"Your secret"/);
  assert.doesNotMatch(code, /"Copy"/);
  assert.doesNotMatch(code, /Copy it now/);
  assert.doesNotMatch(code, />\s*Dismiss\s*</);
});

test("the title and copyLabel props override the voice slots", () => {
  assert.match(code, /title \?\? voice\.secretRevealPanel\.title/);
  assert.match(code, /copyLabel \?\? voice\.secretRevealPanel\.copyLabel/);
});
