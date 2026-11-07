/**
 * Contract test for the catalog components
 * (spudly/design-system#168/#119): CatalogFiltersBar and
 * CatalogHeader (views since #470), and the shared list
 * loading state — extracted from DiscoverPage in the
 * public-pages de-styling tranche so the catalog pages compose
 * them and pass data and callbacks only. (The bar's behavior
 * contract — the #96 chooser, the removal/clearing semantics —
 * is pinned here against the bar's own source;
 * test/discoverPage.test.ts pins the page's composition, not
 * the bar. This file pins the extraction shape — exports, the
 * header geometry, and the loading state's treatment — plus
 * that behavior.)
 *
 * The bar is definition-driven (Stephen's ruling on PR #311):
 * which filters exist, their labels, option sets, and defaults
 * are the caller's data passed in as filter definitions — the
 * bar owns the control shapes only and hardcodes no app filter
 * or sorter list.
 *
 * The loading state carries no offset of its own (Stephen's
 * ruling on PR #311): an internal top padding is the margin
 * loophole in another form — parents own the spacing between
 * their children — so the page centers its spinner with
 * <Center> directly (#479 removed the ListLoadingState and
 * LoadingGate wrapper components).
 *
 * There is deliberately no ListErrorState and no
 * ListLoadingFooter (Stephen's ruling on PR #320: no middleman
 * components): a list's error renders the Alert component
 * directly where it occurs, and a list's loading-more slot
 * renders the centered Spinner (Center + Spinner) directly.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../..", "src", "widgets");
const viewsDir = join(here, "../..", "src", "views");

function readCodeFrom(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

function readCode(name: string) {
  return readCodeFrom(componentsDir, name);
}

const bar = readCodeFrom(viewsDir, "CatalogFiltersBar.tsx");
const header = readCodeFrom(viewsDir, "CatalogHeader.tsx");
const discoverPage = readCodeFrom(join(here, "../..", "src", "pages"), "DiscoverPage.tsx");

test("the catalog views are exported from their built internal barrels", async () => {
  const distViews: Record<string, any> = await import("../../dist/views/index.js");
  for (const name of ["CatalogFiltersBar", "CatalogHeader"]) {
    assert.equal(
      typeof distViews[name],
      "function",
      `${name} must be exported from the internal views barrel`,
    );
  }
});

test("the middleman list states are not shipped (PR #320)", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  for (const name of ["ListErrorState", "ListLoadingFooter", "ListLoadingState", "LoadingGate"]) {
    assert.equal(
      dist[name],
      undefined,
      `${name} must not be exported from the internal components barrel`,
    );
    assert.ok(
      !existsSync(join(componentsDir, `${name}.tsx`)),
      `${name}.tsx must not exist — render Alert / Center + Spinner directly`,
    );
    assert.ok(
      !existsSync(join(componentsDir, `${name}.stories.tsx`)),
      `${name}.stories.tsx must not exist`,
    );
  }
});

test("the bar takes its filters as caller-supplied definitions, never hardcoded lists", () => {
  assert.match(bar, /export type CatalogFilterDefinition<FilterId extends string = string> =/);
  assert.match(bar, /filters: CatalogFilterDefinition<FilterId>\[\];/);
  assert.match(bar, /activeFilters\?: FilterId\[\];/);
  assert.match(bar, /onActiveFiltersChange\?: \(filters: FilterId\[\]\) => void;/);
  for (const kind of ["select", "text", "range", "sort"]) {
    assert.match(
      bar,
      new RegExp(`kind: "${kind}";`),
      `the bar's control shapes include the ${kind} definition`,
    );
  }
  // No single app's catalog data may live in the bar (PR #311):
  // the recipe option sets and filter labels are the caller's.
  for (const baked of [
    "STATUS_OPTIONS",
    "SORT_OPTIONS",
    "SORT_DIR_OPTIONS",
    "FILTER_LABELS",
    "ALL_FILTER_IDS",
    "Perfected",
    "All statuses",
  ]) {
    assert.ok(
      !bar.includes(baked),
      `the bar must not hardcode ${baked} — filter data is passed in`,
    );
  }
  assert.ok(!/\binterface\b/.test(bar), "props are type aliases, never interfaces");
});

test("the bar's chooser adds filters and each added filter removes through RemovableField", () => {
  // The chooser offers only the filters not yet added (#96),
  // and choosing one appends it and closes the chooser.
  assert.match(
    bar,
    /const addable = filters\.filter\(\(definition\) => !active\.includes\(definition\.id\)\);/,
  );
  assert.match(bar, /accessibilityLabel=\{`Add \$\{definition\.label\} filter`\}/);
  assert.match(
    bar,
    /const addFilter = \(id: FilterId\) => \{\s*setActive\(\[\.\.\.active, id\]\);\s*setChooserOpen\(false\);/,
  );
  // Added filters render as RemovableFields; removing one
  // clears its value back to its default and drops it from
  // the active set.
  assert.match(bar, /<RemovableField/);
  assert.match(bar, /removeAccessibilityLabel=\{`Remove \$\{definition\.label\} filter`\}/);
  assert.match(
    bar,
    /const removeFilter = \(definition: CatalogFilterDefinition<FilterId>\) => \{\s*clearFilter\(definition\);\s*setActive\(active\.filter\(\(filterId\) => filterId !== definition\.id\)\);/,
  );
  // One setter serves the controlled and uncontrolled forms:
  // internal state moves only when uncontrolled, and the
  // change callback always fires.
  assert.match(bar, /if \(activeFilters === undefined\) setInternalActiveFilters\(next\);/);
  assert.match(bar, /onActiveFiltersChange\?\.\(next\);/);
});

test("CatalogHeader renders the title as the heading over its controls", () => {
  assert.match(header, /<YStack paddingBlockStart="\$4" paddingBlockEnd="\$2" gap="\$4">/);
  assert.match(header, /<Text variant="heading">\{title\}<\/Text>/);
  assert.match(header, /title: string;/);
  assert.match(header, /children: ReactNode;/, "the bar composes in as the child");
});

test("the loading state is the page's own Center + Spinner composition (#479)", () => {
  assert.match(
    discoverPage,
    /<Center>\s*<Spinner label="Loading" \/>\s*<\/Center>/,
    "DiscoverPage centers its loading spinner with <Center> directly — the wrapper components are removed (#479)",
  );
  assert.ok(
    !discoverPage.includes("ListLoadingState"),
    "DiscoverPage must not render the removed ListLoadingState (#479)",
  );
  assert.ok(
    !discoverPage.includes("LoadingGate"),
    "DiscoverPage must not render the removed LoadingGate (#479)",
  );
});
