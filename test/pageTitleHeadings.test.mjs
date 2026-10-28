/**
 * Contract test for spudly/design-system#263: eight DS pages rendered
 * their standalone page title with the `subheading` Text variant, so
 * after #261 gave heading variants real web heading semantics their
 * titles were exposed as level-2 headings and the pages had no
 * level-1 heading at all — screen-reader users could not navigate to
 * the page title as the page's top heading.
 *
 * The contract now:
 * 1. Each of the eight pages (AddRecipeMenuPage, FeedbackPage,
 *    MealDetailPage, MealPlanDetailPage, MealsHubPage, ProfilePage,
 *    ShoppingListPage, TagsPage) renders its title with
 *    `variant="heading"` (level 1 on web) — exactly once, so no page
 *    gains a second level-1 heading — and no `subheading` usage
 *    remains in those files (their only subheading was the title).
 * 2. The title keeps its explicit `fontSize` xl / `fontWeight` bold
 *    overrides, so the visual rendering is unchanged (the `heading`
 *    variant's own defaults are 3xl/bold; the overrides pin xl/bold).
 * 3. HomePage is the pinned exception that proves the sweep is
 *    title-only: its page title was already `heading`, and its
 *    section title correctly stays `subheading` (level 2).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const TITLE_PAGES = [
  "AddRecipeMenuPage",
  "FeedbackPage",
  "MealDetailPage",
  "MealPlanDetailPage",
  "MealsHubPage",
  "ProfilePage",
  "ShoppingListPage",
  "TagsPage",
];

function countOccurrences(code, needle) {
  return code.split(needle).length - 1;
}

test("page titles use the heading variant exactly once, with no subheading left (#263)", () => {
  for (const page of TITLE_PAGES) {
    const code = readCode(`src/pages/${page}.tsx`);
    assert.equal(
      countOccurrences(code, 'variant="heading"'),
      1,
      `${page} must render exactly one heading-variant Text (its title)`,
    );
    assert.equal(
      countOccurrences(code, 'variant="subheading"'),
      0,
      `${page} must not keep a subheading usage — its only one was the page title`,
    );
  }
});

test("page titles keep their xl/bold overrides so rendering is unchanged (#263)", () => {
  for (const page of TITLE_PAGES) {
    const code = readCode(`src/pages/${page}.tsx`);
    const variantAt = code.indexOf('variant="heading"');
    const openAt = code.lastIndexOf("<Text", variantAt);
    const closeAt = code.indexOf(">", variantAt);
    const attrs = code.slice(openAt, closeAt);
    assert.match(
      attrs,
      /fontSize=\{tokens\.typography\.fontSize\.xl\}/,
      `${page} title must keep its fontSize xl override`,
    );
    assert.match(
      attrs,
      /fontWeight=\{tokens\.typography\.fontWeight\.bold\}/,
      `${page} title must keep its fontWeight bold override`,
    );
  }
});

test("HomePage stays the exception: heading title, subheading section title (#263)", () => {
  const code = readCode("src/pages/HomePage.tsx");
  assert.equal(
    countOccurrences(code, 'variant="heading"'),
    1,
    "HomePage must keep exactly one heading-variant Text (its page title)",
  );
  assert.ok(
    countOccurrences(code, 'variant="subheading"') >= 1,
    "HomePage's section title must stay subheading (a genuine level-2 usage)",
  );
});
