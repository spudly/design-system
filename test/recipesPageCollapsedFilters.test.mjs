/**
 * Contract test for the RecipesPage collapsed filters
 * (spudly/design-system#96).
 *
 * Stephen's direction (2026-10-23, reviewing PR #91 baselines):
 * the filter row took up too much room, so initially only the
 * search field and a small filter button render; clicking the
 * button gives the option to add additional filters, and a
 * filter renders only after it has been added.
 *
 * Since the #119 dedupe, the bar itself is the shared
 * CatalogFiltersBar: its behavior (chooser, add/remove,
 * removal clearing values through the change callbacks so a
 * hidden filter can never keep filtering invisibly) is pinned
 * in test/catalogComponents.test.mjs. This test pins the PAGE
 * side of the contract:
 * 1. The controlled contract props exist (`activeFilters`,
 *    `onActiveFiltersChange`, `filterChooserOpen`,
 *    `onFilterChooserOpenChange`) plus the filter-id type.
 * 2. The page renders CatalogFiltersBar as its list header and
 *    passes the controlled props through.
 * 3. The page supplies its filters as definitions — the five
 *    filters with their kinds, labels, option sets, and
 *    defaults as this catalog's data; the status filter joins
 *    only when the host wires it.
 * 4. The page carries no bar implementation of its own anymore
 *    (the in-page RecipesFiltersBar/NumberFilter stay retired).
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

test("the page renders the shared CatalogFiltersBar with its search copy", () => {
  assert.match(code, /<CatalogFiltersBar/);
  assert.match(code, /searchPlaceholder="Search recipes…"/);
  assert.match(code, /filters=\{catalogFilters\}/);
  assert.match(code, /\{\.\.\.\(activeFilters \? \{ activeFilters \} : \{\}\)\}/);
  assert.match(code, /\{\.\.\.\(onActiveFiltersChange \? \{ onActiveFiltersChange \} : \{\}\)\}/);
  assert.match(
    code,
    /\{\.\.\.\(filterChooserOpen !== undefined \? \{ filterChooserOpen \} : \{\}\)\}/,
  );
  assert.match(
    code,
    /\{\.\.\.\(onFilterChooserOpenChange \? \{ onFilterChooserOpenChange \} : \{\}\)\}/,
  );
});

test("the page supplies its five filters as definitions, in chooser order", () => {
  // Status: a select over the page's option set, defaulting to
  // "all", joining only when the host wires it.
  assert.match(
    code,
    /showStatusFilter !== false &&\s*statusFilter !== undefined &&\s*onStatusFilterChange !== undefined/,
    "the status filter joins only when the host wires it (value + callback, not hidden)",
  );
  assert.match(code, /kind: "select",\s*id: "status",\s*label: "Status",/);
  assert.match(code, /options: STATUS_OPTIONS,/);
  assert.match(code, /defaultValue: "all",/);
  // Ingredient: free text with the page's placeholder.
  assert.match(code, /kind: "text",\s*id: "ingredient",\s*label: "Ingredient",/);
  assert.match(code, /placeholder: "e\.g\. chicken",/);
  assert.match(code, /defaultValue: "",/);
  // Calories and satiety: one range filter each, min/max labels.
  assert.match(code, /kind: "range",\s*id: "calories",\s*label: "Calories",/);
  assert.match(code, /minLabel: "Min cal",\s*maxLabel: "Max cal",/);
  assert.match(code, /kind: "range",\s*id: "satiety",\s*label: "Satiety",/);
  assert.match(code, /minLabel: "Min satiety",\s*maxLabel: "Max satiety",/);
  // Sort: the Sort by / Order pair with the page's defaults.
  assert.match(code, /kind: "sort",\s*id: "sort",\s*label: "Sort",/);
  assert.match(code, /sortLabel: "Sort by",/);
  assert.match(code, /sortOptions: SORT_OPTIONS,/);
  assert.match(code, /defaultSortValue: "newest",/);
  assert.match(code, /dirLabel: "Order",/);
  assert.match(code, /dirOptions: SORT_DIR_OPTIONS,/);
  assert.match(code, /defaultDirValue: "desc",/);
});

test("the page carries no filter-bar implementation of its own (#119 dedupe)", () => {
  for (const retired of ["RecipesFiltersBar", "NumberFilter", "FILTER_LABELS", "ALL_FILTER_IDS"]) {
    assert.ok(
      !code.includes(retired),
      `${retired} was the in-page bar's machinery — the shared CatalogFiltersBar owns it now and it must not come back`,
    );
  }
});

test("stories cover the initial, chooser-open and filters-added states", () => {
  assert.match(stories, /export const Default/);
  assert.match(stories, /export const FilterChooserOpen/);
  assert.match(stories, /export const WithFiltersAdded/);
  assert.match(stories, /initialActiveFilters=\{\["status", "ingredient"\]\}/);
  assert.match(stories, /activeFilters=\{activeFilters\}/);
  assert.match(stories, /filterChooserOpen=\{filterChooserOpen\}/);
});
