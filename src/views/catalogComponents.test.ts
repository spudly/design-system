/**
 * Contract test for the catalog components
 * (spudly/design-system#168/#119): CatalogFiltersBar and
 * CatalogHeader (views since #470), extracted from
 * DiscoverPage in the public-pages de-styling tranche so the
 * catalog pages compose them and pass data and callbacks only.
 *
 * The bar is definition-driven (Stephen's ruling on PR #311):
 * which filters exist, their labels, option sets, and defaults
 * are the caller's data passed in as filter definitions — the
 * bar owns the control shapes only and hardcodes no app filter
 * or sorter list.
 *
 * There is deliberately no ListErrorState and no
 * ListLoadingFooter (Stephen's ruling on PR #320: no middleman
 * components): a list's error renders the Alert component
 * directly where it occurs, and a list's loading-more slot
 * renders the centered Spinner (Center + Spinner) directly.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5:
 * - The middleman absence check now runs against the built
 *   widgets module only; the former file-absence checks were
 *   deleted (file layout is implementation trivia — what
 *   ships is the contract).
 * - The bar's definition-driven contract is pinned by SSR:
 *   caller-supplied definitions render their labels and
 *   controls, added filters carry their "Remove <label>
 *   filter" names, and the open chooser offers only the
 *   not-yet-added filters under "Add <label> filter" names.
 *   The add/remove interaction wiring (state updates and
 *   callbacks on press) is not SSR-observable and its source
 *   scan was deleted; the rendered names are the observable
 *   half of that contract.
 * - CatalogHeader's composition is pinned by SSR: its title
 *   renders over the controls composed in as children. The
 *   stack's owned geometry scan was deleted — a styled
 *   component's default geometry is not observable from the
 *   rendered output.
 * - The RecipesPage loading-state source scan was deleted:
 *   page composition is pinned by the pages' own tests, and
 *   this tranche does not read page source.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../test/internalDist.js";

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
  }
});

async function renderBar(props: Record<string, unknown>): Promise<string> {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const distRuntime = await loadInternalDist();
  const { createTamaguiConfig, baseTheme, CatalogFiltersBar } = distRuntime;
  const { VoiceProvider }: Record<string, any> = await import("../../dist/voice/index.js");
  const { fixtureVoice }: Record<string, any> = await import("../../dist/voice/fixtures.js");
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    h(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      h(VoiceProvider, { voice: fixtureVoice }, h(CatalogFiltersBar, props)),
    ),
  );
}

const FILTERS = [
  {
    kind: "text",
    id: "ingredient",
    label: "Ingredient",
    value: "",
    onChange: () => { /* noop */ },
    placeholder: "e.g. chicken",
    defaultValue: "",
  },
  {
    kind: "select",
    id: "status",
    label: "Status",
    value: "all",
    onChange: () => { /* noop */ },
    options: [
      { value: "all", label: "All statuses" },
      { value: "perfected", label: "Perfected" },
    ],
    defaultValue: "all",
  },
];

test("the bar renders caller-supplied filter definitions, never a hardcoded list", async () => {
  const html = await renderBar({
    searchPlaceholder: "Search the catalog…",
    search: "",
    onSearchChange: () => { /* noop */ },
    filters: FILTERS,
    activeFilters: ["ingredient"],
  });
  assert.ok(html.includes("Ingredient"), "the caller's text filter label renders");
  assert.ok(html.includes("e.g. chicken"), "the caller's text filter placeholder renders");
  assert.ok(
    html.includes("Remove Ingredient filter"),
    "an added filter carries its remove name, built from the caller's label",
  );
  assert.ok(!html.includes("Status"), "a filter that was not added does not render its control");
});

test("the open chooser offers only the filters not yet added, under caller labels", async () => {
  const html = await renderBar({
    searchPlaceholder: "Search the catalog…",
    search: "",
    onSearchChange: () => { /* noop */ },
    filters: FILTERS,
    activeFilters: ["ingredient"],
    filterChooserOpen: true,
  });
  assert.ok(html.includes("Add Status filter"), "the chooser offers the not-yet-added filter");
  assert.ok(!html.includes("Add Ingredient filter"), "the chooser omits the already-added filter");
});

test("CatalogHeader renders its title as the heading over its controls", async () => {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const dist: Record<string, any> = await loadInternalDist();
  const config = dist.createTamaguiConfig(dist.baseTheme);
  const html = renderToString(
    h(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      h(dist.CatalogHeader, { title: "Recipes" }, h("span", null, "CONTROLS")),
    ),
  );
  assert.ok(html.includes("Recipes"), "the title renders");
  assert.ok(html.includes("CONTROLS"), "the controls compose in as the children");
  assert.ok(
    html.indexOf("Recipes") < html.indexOf("CONTROLS"),
    "the title renders over its controls",
  );
});
