/**
 * Contract test for spudly/design-system#93: in hidden mode the
 * BlankWord underline must sit at the BOTTOM of the text line, like
 * an underline blank — not floating at mid x-height.
 *
 * Stephen spotted the defect reviewing the Android VR baselines in
 * PR #91 (2026-10-23): on Android the line rendered mid-line. The
 * overlay anchors `bottom` inside the invisible sizing word's box,
 * but that box differs per platform: on web it is the full line box
 * (lineHeight = 1.5 × font size), where bottom: 4 lands just below
 * the baseline; on native Yoga measures the tighter glyph box, so
 * the same offset leaves the line ~5dp above the baseline (measured
 * against the mid-session baseline: line center y≈646px vs baseline
 * y≈657px at 3x, with the line's own 2dp height). The anchor is
 * therefore platform-conditional: web 4, native -1 (1px below the
 * box's bottom edge, just under the baseline).
 *
 * This is a source scan, not a render test: the failure happens in
 * Android's Yoga layout, which no JS renderer in this repo performs,
 * and the invariant is a per-literal property of the source (same
 * rationale as test/glyphLineHeight.test.mjs).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const srcPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "components",
  "BlankWord.tsx",
);
const text = readFileSync(srcPath, "utf8");

test("the blank line anchor is platform-conditional: web 4, native -1 (#93)", () => {
  assert.ok(
    /const blankLineBottom = isWeb \? 4 : -1;/.test(text),
    "BlankWord must define blankLineBottom as `isWeb ? 4 : -1` — a single fixed offset cannot sit at the bottom of both the web line box and the tighter native glyph box (#93)",
  );
});

test("the blank line overlay uses the conditional anchor, not a fixed bottom", () => {
  assert.ok(
    /bottom=\{blankLineBottom\}/.test(text),
    "the blank line overlay must anchor with bottom={blankLineBottom} (#93)",
  );
  assert.ok(
    !/bottom=\{4\}/.test(text),
    "a fixed bottom={4} on the overlay is the #93 defect form on native",
  );
});

test("the sizing word still guarantees zero layout shift (overlay stays absolute, word invisible)", () => {
  assert.ok(/position="absolute"/.test(text), "the blank line must stay an absolute overlay");
  assert.ok(/opacity=\{0\}/.test(text), "the sizing word must stay invisible");
});
