/**
 * Contract test for the secondary Button border
 * (spudly/design-system#459, Stephen's 2026-11-05 Storybook review).
 *
 * The secondary variant carries a 1px border in the SAME color as
 * its text (the gray10 token that also inks its label): without a
 * border the light-gray fill reads borderless and looks bad on
 * tinted surfaces — the case Stephen named is a secondary button
 * inside an info Alert. The border lives inside Button's own
 * variant styling (Button owns its styles completely; no caller
 * changes, no styling props), and the other variants show no
 * visible border at rest: primary/danger carry the base frame's
 * 1px TRANSPARENT border (shared geometry, so a secondary is
 * never 2px larger than its row peers), ghost is chrome-less by
 * design. A selected secondary button's border follows its label
 * color onto the primary fill.
 *
 * Source scan like this repo's other contract tests (comments
 * stripped first, so the assertions pin the styling code itself,
 * not this file's or Button's explanatory comments).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const button = readCode("src/components/Button.tsx");

/** The body of one variant block in the shared button frame config. */
function variantBlock(name: string) {
  const match = new RegExp(String.raw`${name}: \{([^}]*)\}`).exec(button);
  assert.ok(match, `the ${name} variant block must exist in the button frame config`);
  return match[1];
}

test("the secondary variant has a 1px border in its text color (#459)", () => {
  const secondary = variantBlock("secondary");
  assert.match(secondary, /borderWidth: 1/);
  assert.match(secondary, /borderColor: tokens\.colors\.gray\.gray10/);
  // Border and text match: the variant's own `color` is the same token.
  assert.match(secondary, /color: tokens\.colors\.gray\.gray10/);
});

test("the border color token matches the secondary label color the wrapper passes (#459)", () => {
  assert.match(button, /secondary: tokens\.colors\.gray\.gray10,/);
});

test("the other variants have no VISIBLE border at rest (#459)", () => {
  for (const name of ["primary", "danger"]) {
    const block = variantBlock(name);
    assert.ok(!/borderColor/.test(block), `${name} must not set a visible border color`);
    assert.ok(!/borderWidth/.test(block), `${name} inherits the shared frame geometry`);
  }
  // Ghost is chrome-less by design: it explicitly zeroes the border.
  assert.match(variantBlock("ghost"), /borderWidth: 0/);
});

test("all filled variants share one geometry: the base frame carries a 1px transparent border (#459)", () => {
  // If only secondary had a border, it would render 2px wider and
  // taller than a primary/danger button with the same label in a
  // ButtonRow (CodeRabbit finding on PR #490). The base frame
  // therefore carries the 1px border for every variant, transparent
  // except where a variant (secondary) colors it.
  const base = /borderColor: "transparent",\s*borderWidth: 1,/.exec(button);
  assert.ok(base, "the base frame must carry borderColor transparent + borderWidth 1");
});

test("a selected secondary button's border follows its label color (#459)", () => {
  // Selected takes the primary fill and the on-primary label, so a
  // gray10 border would no longer match the text. The wrapper
  // passes the label color as the border color for that one case.
  assert.match(
    button,
    /\{\.\.\.\(selected && variant === "secondary" \? \{ borderColor: labelColor \} : null\)\}/,
  );
});
