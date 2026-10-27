/**
 * Contract test for spudly/design-system#174: the Badge must render
 * with a 1px border in the same color as its text, for every tone.
 *
 * This is a source scan, not a render test: the invariant is a
 * per-literal property of the Badge source (same rationale as
 * test/blankWordLinePosition.test.mjs) — the styled pill carries a
 * fixed 1px border width, and the tone's text color is passed as the
 * border color so border and label always match.
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
  "Badge.tsx",
);
const text = readFileSync(srcPath, "utf8");

test("the badge pill has a 1px border (#174)", () => {
  assert.ok(
    /borderWidth: 1,/.test(text),
    "StyledBadge must set borderWidth: 1 so the Badge renders a 1px border (#174)",
  );
});

test("the badge border uses the tone's text color (#174)", () => {
  assert.ok(
    /borderColor=\{styles\.text\}/.test(text),
    "Badge must pass borderColor={styles.text} so the border is the same color as the badge text for every tone (#174)",
  );
});
