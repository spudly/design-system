/**
 * Contract test for the catalog components
 * (spudly/design-system#168/#119): CatalogFiltersBar,
 * CatalogHeader, and the shared list states (ListLoadingState,
 * ListErrorState, ListLoadingFooter) — extracted from
 * DiscoverPage in the public-pages de-styling tranche so the
 * catalog pages compose them and pass data and callbacks only.
 * (The bar's behavior contract — the #96 chooser, the clearing
 * semantics — is pinned by test/discoverPage.test.mjs, which
 * scans this component's source; this file pins the extraction
 * shape: exports, the header geometry, and the list states'
 * treatments.)
 *
 * The list states carry their header offset as padding, never a
 * margin: inter-item spacing belongs to the parent (the
 * no-margin-spacing direction, #209), and RecipesPage's catalog
 * established the padding form for this exact slot.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const errorState = readCode("ListErrorState.tsx");
const loadingFooter = readCode("ListLoadingFooter.tsx");

test("the catalog components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of [
    "CatalogFiltersBar",
    "CatalogHeader",
    "ListLoadingState",
    "ListErrorState",
    "ListLoadingFooter",
  ]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
});

test("the bar carries the five addable filters as its own vocabulary", () => {
  assert.match(
    bar,
    /export type CatalogFilterId = "status" \| "ingredient" \| "calories" \| "satiety" \| "sort";/,
  );
  assert.match(bar, /FILTER_LABELS: Record<CatalogFilterId, string>/);
  assert.match(bar, /activeFilters\?: CatalogFilterId\[\];/);
  assert.match(bar, /onActiveFiltersChange\?: \(filters: CatalogFilterId\[\]\) => void;/);
  assert.ok(!/\binterface\b/.test(bar), "props are type aliases, never interfaces");
});

test("CatalogHeader renders the title as the heading over its controls", () => {
  assert.match(header, /<YStack paddingBlockStart="\$4" paddingBlockEnd="\$2" gap="\$4">/);
  assert.match(header, /<Text variant="heading">\{title\}<\/Text>/);
  assert.match(header, /title: string;/);
  assert.match(header, /children: ReactNode;/, "the bar composes in as the child");
});

test("the list states own their treatments — padding offsets, never margins", () => {
  assert.match(loadingState, /<YStack paddingBlockStart="\$8" alignItems="center">/);
  assert.match(loadingState, /<Spinner label=\{label\} \/>/);
  assert.match(errorState, /<YStack paddingBlockStart="\$8">/);
  assert.match(errorState, /<Alert severity="error">\{message\}<\/Alert>/);
  assert.match(
    loadingFooter,
    /<YStack alignItems="center" justifyContent="center" paddingVertical="\$4">/,
  );
  assert.match(loadingFooter, /<Spinner label=\{label\} \/>/);
  for (const [name, source] of [
    ["ListLoadingState", loadingState],
    ["ListErrorState", errorState],
    ["ListLoadingFooter", loadingFooter],
  ]) {
    assert.ok(!/margin/.test(source), `${name} must not space itself with margins (#209)`);
  }
});
