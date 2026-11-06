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
 * changes, no styling props), and the other variants stay
 * borderless at rest: primary/danger rely on their fills, ghost is
 * chrome-less by design.
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

test("the other variants stay borderless at rest (#459)", () => {
  for (const name of ["primary", "danger"]) {
    const block = variantBlock(name);
    assert.ok(!/borderColor/.test(block), `${name} must not gain a border`);
    assert.ok(!/borderWidth: 1/.test(block), `${name} must not gain a 1px border`);
  }
  // Ghost is chrome-less by design: it explicitly zeroes the border.
  assert.match(variantBlock("ghost"), /borderWidth: 0/);
});
