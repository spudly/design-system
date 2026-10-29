/**
 * Contract test for the RecipesPage collapsed filters
 * (spudly/design-system#96).
 *
 * Stephen's direction (2026-10-23, reviewing PR #91 baselines):
 * the filter row took up too much room, so initially only the
 * search field and a small filter button render; clicking the
 * button gives the option to add additional filters, and a
 * filter renders only after it has been added. This test pins
 * that behavior in source:
 * 1. The controlled contract props exist (`activeFilters`,
 *    `onActiveFiltersChange`, `filterChooserOpen`,
 *    `onFilterChooserOpenChange`) plus the filter-id type.
 * 2. Search and the Filters button render unconditionally (the
 *    button only while a filter remains addable); every filter
 *    control renders only when its id is in the added set.
 * 3. The chooser renders one add control per not-yet-added
 *    filter, and adding closes the chooser.
 * 4. Removal clears the filter's values through its ordinary
 *    change callbacks before hiding it, so a hidden filter can
 *    never keep filtering invisibly.
 * 5. Stories cover the three states (initial, chooser open,
 *    filters added) so Chromatic and Android VR capture them.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipesPageAccessory.test.mjs: the repo has no JS
 * renderer for these components, and the invariant is a
 * per-literal property of the source. Comments are stripped
 * before scanning so prose cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
const removableField = readFileSync(
  join(here, "..", "src", "components", "RemovableField.tsx"),
  "utf8",
);
const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("the collapsed-filter contract props are declared", () => {
  assert.match(
    code,
    /export type RecipesPageFilterId = "status" \| "ingredient" \| "calories" \| "satiety" \| "sort";/,
    "RecipesPageFilterId must enumerate the five addable filters",
  );
  assert.match(code, /activeFilters\?: RecipesPageFilterId\[\];/);
  assert.match(code, /onActiveFiltersChange\?: \(filters: RecipesPageFilterId\[\]\) => void;/);
  assert.match(code, /filterChooserOpen\?: boolean;/);
  assert.match(code, /onFilterChooserOpenChange\?: \(open: boolean\) => void;/);
});

test("search and the Filters button are the initial render", () => {
  assert.match(code, /accessibilityLabel="Add a filter"/, "the Filters button must be named");
  assert.match(code, />\s*Filters\s*<\/Button>/, "the button label is Filters");
  const searchAt = code.indexOf("<SearchField");
  const buttonAt = code.indexOf('accessibilityLabel="Add a filter"');
  assert.ok(searchAt !== -1 && buttonAt > searchAt, "search renders before the Filters button");
});

test("each filter control renders only when its filter is added", () => {
  for (const id of ["status", "ingredient", "calories", "satiety", "sort"]) {
    assert.match(
      code,
      new RegExp(String.raw`active\.includes\("${id}"\)`),
      `the ${id} control must be gated on active.includes("${id}")`,
    );
  }
});

test("the chooser offers exactly the filters not yet added, and adding closes it", () => {
  assert.match(code, /const addable = available\.filter\(\(id\) => !active\.includes\(id\)\);/);
  assert.match(code, /accessibilityLabel=\{`Add \$\{FILTER_LABELS\[id\]\} filter`\}/);
  assert.match(code, /setActive\(\[\.\.\.active, id\]\);\s*setChooserOpen\(false\);/);
});

test("removing a filter clears its values through the change callbacks", () => {
  assert.match(code, /if \(id === "status"\) onStatusFilterChange\?\.\("all"\);/);
  assert.match(code, /if \(id === "ingredient"\) onIngredientChange\(""\);/);
  assert.match(code, /onMinCaloriesChange\(""\);\s*onMaxCaloriesChange\(""\);/);
  assert.match(code, /onMinSatietyChange\(""\);\s*onMaxSatietyChange\(""\);/);
  assert.match(code, /onSortChange\("newest"\);\s*onSortDirChange\("desc"\);/);
});

test("each added filter renders in a RemovableField named for that filter (#119)", () => {
  // The remove affordance is the RemovableField component since
  // the #119 recipes-list tranche; each usage names its filter.
  for (const id of ["status", "ingredient", "calories", "satiety", "sort"]) {
    assert.match(
      code,
      new RegExp(`removeAccessibilityLabel=\\{\`Remove \\$\\{FILTER_LABELS\\.${id}\\} filter\`\\}`),
      `the ${id} filter's remove control must be named for the ${id} filter`,
    );
  }
  assert.match(removableField, /export function RemovableField/);
  assert.match(removableField, /accessibilityLabel=\{removeAccessibilityLabel\}/);
  assert.match(removableField, />\s*Remove\s*<\/Button>/);
});

test("stories cover the initial, chooser-open and filters-added states", () => {
  assert.match(stories, /export const Default/);
  assert.match(stories, /export const FilterChooserOpen/);
  assert.match(stories, /export const WithFiltersAdded/);
  assert.match(stories, /initialActiveFilters=\{\["status", "ingredient"\]\}/);
  assert.match(stories, /activeFilters=\{activeFilters\}/);
  assert.match(stories, /filterChooserOpen=\{filterChooserOpen\}/);
});
