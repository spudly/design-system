/**
 * Contract test for the catalog components
 * (spudly/design-system#168/#119): CatalogFiltersBar,
 * CatalogHeader, and the shared list loading state
 * (ListLoadingState) — extracted from DiscoverPage in the
 * public-pages de-styling tranche so the catalog pages compose
 * them and pass data and callbacks only. (The bar's behavior
 * contract — the #96 chooser, the clearing semantics — is
 * pinned by test/discoverPage.test.mjs, which scans this
 * component's source; this file pins the extraction shape:
 * exports, the header geometry, and the loading state's
 * treatment.)
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
 * their children — so the state centers its spinner with
 * <Center>.
 *
 * There is deliberately no ListErrorState and no
 * ListLoadingFooter (Stephen's ruling on PR #320: no middleman
 * components): a list's error renders the Alert component
 * directly where it occurs, and a list's loading-more slot
 * renders ListLoadingState directly.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");

function readCode(name) {
  return readFileSync(join(componentsDir, name), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const bar = readCode("CatalogFiltersBar.tsx");
const header = readCode("CatalogHeader.tsx");
const loadingState = readCode("ListLoadingState.tsx");

test("the catalog components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["CatalogFiltersBar", "CatalogHeader", "ListLoadingState"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
});

test("the middleman list states are not shipped (PR #320)", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["ListErrorState", "ListLoadingFooter"]) {
    assert.equal(dist[name], undefined, `${name} must not be exported from @spudly/ui`);
    assert.ok(
      !existsSync(join(componentsDir, `${name}.tsx`)),
      `${name}.tsx must not exist — render Alert / ListLoadingState directly`,
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

test("CatalogHeader renders the title as the heading over its controls", () => {
  assert.match(header, /<YStack paddingBlockStart="\$4" paddingBlockEnd="\$2" gap="\$4">/);
  assert.match(header, /<Text variant="heading">\{title\}<\/Text>/);
  assert.match(header, /title: string;/);
  assert.match(header, /children: ReactNode;/, "the bar composes in as the child");
});

test("the loading state centers with <Center> and carries no offset of its own", () => {
  assert.match(loadingState, /<Center>\s*<Spinner label=\{label\} \/>\s*<\/Center>/);
  assert.ok(
    !/margin/.test(loadingState),
    "ListLoadingState must not space itself with margins (#209)",
  );
  assert.ok(
    !/padding/.test(loadingState),
    "ListLoadingState must not carry a padding offset — parents own spacing between children (PR #311)",
  );
});
