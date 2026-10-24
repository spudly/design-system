/**
 * Contract test for the RecipesPage per-row accessory slot
 * (spudly/design-system#49, stage 2 unblock).
 *
 * The Eciperay app's RecipeListCard expands its cook-log form
 * inline under the tapped card, inside the list, and hides that
 * card's "Log cook" button while the form is open (the app pins
 * this with its own tests). Stage 1's RecipesPage exposed only
 * `onLogCookPress(id)` and rendered its rows end to end, so the
 * form had nowhere to render and the rewire stopped. The slot is
 * the agreed fix, and this test pins its semantics in source:
 * 1. The prop exists with the id-in / ReactNode-out signature that
 *    matches the component's other id-based callbacks.
 * 2. It is called exactly once per row, with the row's id, and
 *    only when the prop is provided — no prop means every row's
 *    accessory is null, i.e. rendering is unchanged.
 * 3. A row whose accessory is non-null loses its "Log cook"
 *    button (the press callback is withheld), while other rows
 *    keep theirs; the callback's firing semantics are untouched.
 * 4. The accessory renders after the row's card, inside the list
 *    item, in the app's under-card wrapper shape.
 * 5. A story exercises the slot (ExpandedAccessory), so Chromatic
 *    captures the expanded layout.
 *
 * This is a source scan, not a render test, for the same reason as
 * test/recipesPageBoundedList.test.mjs: the repo has no JS
 * renderer for these components (Chromatic screenshots in CI),
 * and the invariant is a per-literal property of the source.
 * Comments are stripped before scanning so prose cannot satisfy
 * the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("the accessory slot prop is declared with the id-based signature", () => {
  assert.match(
    code,
    /renderRecipeAccessory\?: \(recipeId: string\) => ReactNode;/,
    "RecipesPageProps must declare renderRecipeAccessory?: (recipeId: string) => ReactNode",
  );
});

test("the slot is called once per row with the row id, only when provided", () => {
  assert.match(
    code,
    /const accessory = renderRecipeAccessory \? renderRecipeAccessory\(item\.id\) : null;/,
    "renderItem must resolve the row's accessory via renderRecipeAccessory(item.id), defaulting to null",
  );
  assert.equal(
    code.split("renderRecipeAccessory(item.id)").length - 1,
    1,
    "the slot must be called exactly once per row (a second call site could double-render app content)",
  );
});

test("a row with accessory content hides its Log cook button; other rows keep it", () => {
  assert.match(
    code,
    /const hasAccessory = accessory !== null && accessory !== undefined;/,
    "hasAccessory must be exactly the non-null/non-undefined check on the slot's return",
  );
  assert.match(
    code,
    /onLogCookPress && !hasAccessory/,
    "the row's onLogCookPress wiring must be withheld while its accessory renders",
  );
  assert.match(
    code,
    /onLogCookPress\(item\.id\)/,
    "when wired, the callback still fires with the row id, unchanged",
  );
});

test("the accessory renders under the row's card, inside the list item", () => {
  const rowAt = code.indexOf("<RecipeRow");
  const accessoryAt = code.indexOf("{accessory}");
  assert.ok(rowAt !== -1, "renderItem must render the RecipeRow");
  assert.ok(accessoryAt > rowAt, "the accessory must render after (under) the row's card");
  assert.match(
    code,
    /\{hasAccessory \? <YStack marginBlockEnd="\$3">\{accessory\}<\/YStack> : null\}/,
    "the accessory must render in the under-card YStack only when it has content",
  );
});

test("a story exercises the slot so Chromatic captures the expanded layout", () => {
  assert.match(
    stories,
    /export const ExpandedAccessory/,
    "RecipesPage.stories.tsx must export an ExpandedAccessory story",
  );
  assert.match(
    stories,
    /renderRecipeAccessory: \(recipeId: string\) =>/,
    "the story must pass renderRecipeAccessory with per-row content",
  );
});
