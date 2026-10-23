/**
 * Contract test for the RecipesPage row a11y fix (spudly/design-system#60).
 *
 * Found during the PR #58 review: Copilot flagged that SharedWithMePage's
 * row thumbnail TouchableOpacity had no accessibility label/role, and the
 * same gap shipped in RecipesPage's RecipeRow. #58 named the
 * SharedRecipeRow press targets (test/shared-with-me-page.test.mjs pins
 * that contract); this file pins the identical contract for RecipeRow:
 * both press targets (thumbnail and text block) must declare the button
 * role and take the recipe title as their accessible name.
 *
 * Source scan, not a render test: the failures it guards happen on native
 * screen readers, which no JS renderer in this repo exercises, and the
 * invariant is a per-literal property of the source. Comments are stripped
 * before scanning so the explanatory comment on the fix cannot satisfy
 * the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "pages", "RecipesPage.tsx"), "utf8");
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipesPage source is readable and non-trivial", () => {
  assert.ok(code.length > 1000, "expected the full RecipesPage source");
  assert.match(code, /function RecipeRow/);
});

test("both RecipeRow press targets are named buttons for screen readers (#60)", () => {
  assert.equal(
    code.split('accessibilityRole="button"').length - 1,
    2,
    "the thumbnail and text press targets must each declare the button role",
  );
  assert.equal(
    code.split("accessibilityLabel={item.title}").length - 1,
    2,
    "each press target must take the recipe title as its accessible name (the thumbnail target wraps only an image)",
  );
});
