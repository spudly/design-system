/**
 * Review-round contracts for AutocompletePicker / SearchField
 * (spudly/design-system#383, PR #384 — the findings Copilot and
 * CodeRabbit left on the picker's first head):
 *
 * 1. SearchField's clear button honors `disabled` (Copilot):
 *    with the field disabled it carries no press handler — the
 *    clear callback cannot fire — and it reports the disabled
 *    state through the platform translator; the input itself
 *    still takes `disabled`.
 * 2. The picker's search states are announced through an
 *    ALWAYS-MOUNTED polite live region (Copilot + CodeRabbit):
 *    the region renders in every state (a live region only
 *    announces changes that happen after it mounts) and its
 *    text tracks searching / no matches / results available.
 *    The visible spinner, hint, and rows are unchanged — the
 *    region's text is announcement-only.
 * 3. Selecting a result returns focus to the search input
 *    (Copilot): the selected row unmounts, so focus would fall
 *    to the page body; SearchField forwards a ref to its input
 *    and the picker's select path focuses it.
 * 4. The meal form stories' useFormProps hooks treat story
 *    props as INITIAL state (Copilot): state is seeded from
 *    the story's values and state + the derived search drive
 *    the returned props, so the NoSelection story can accept a
 *    search and add its first item — no fixed override spread
 *    over live state.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function codeOf(rel) {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const picker = codeOf("src/components/AutocompletePicker.tsx");
const searchField = codeOf("src/components/SearchField.tsx");

test("SearchField's clear button honors disabled: no press handler, disabled state reported", () => {
  assert.match(searchField, /disabled = false/, "disabled is destructured out of the input props");
  assert.match(searchField, /disabled=\{disabled\}/, "the input still receives disabled");
  assert.match(
    searchField,
    /onPress=\{disabled \? undefined : \(\) => onChangeText\(""\)\}/,
    "a disabled field's clear button carries no press handler, so the clear callback cannot fire",
  );
  assert.match(
    searchField,
    /accessibilityState: \{ disabled \}/,
    "the clear button reports its disabled state through the platform translator",
  );
});

test("SearchField forwards a ref to its input, and the picker focuses it on selection", () => {
  assert.match(searchField, /forwardRef<TamaguiElement, SearchFieldProps>/);
  assert.match(searchField, /ref=\{ref\}/, "the forwarded ref lands on the inner input");
  assert.match(picker, /useRef<TamaguiElement>\(null\)/);
  assert.match(picker, /ref=\{searchFieldRef\}/, "the picker holds the search field's ref");
  assert.match(picker, /onSelectResult\(id\)/);
  assert.match(
    picker,
    /node\?\.focus\?\.\(\)/,
    "selection returns focus to the search input (the DropdownButton optional-focus pattern)",
  );
  assert.match(
    picker,
    /onPress=\{\(\) => \{\s*handleSelectResult\(result\.id\);/,
    "result rows select through the focus-returning handler",
  );
});

test("the picker mounts a polite live region and its text tracks the search state", () => {
  assert.match(picker, /politeLiveRegionProps/, "the region uses the shared live-region props");
  assert.match(picker, /collapsable=\{false\}/, "the region's node cannot be flattened away");
  assert.match(picker, /statusMessage/, "the region's text is the search-state message");
  assert.match(picker, /\? "Searching"/, "the searching state is announced");
  assert.match(picker, /\? noResultsMessage/, "the no-matches state announces the no-results text");
  assert.match(picker, /results"} available`/, "the results state announces the result count");
});

test("the meal form story hooks seed state from the story's initial values", () => {
  for (const rel of [
    "src/pages/MealFormPage.stories.tsx",
    "src/pages/MealPlanFormPage.stories.tsx",
  ]) {
    const story = codeOf(rel);
    assert.ok(!story.includes("...overrides"), `${rel} must not spread fixed overrides over state`);
    assert.match(story, /searchText: initialSearchText/, `${rel} reads the initial search text`);
    assert.match(
      story,
      /useState\(initialSearchText \?\? fixture\.searchText\)/,
      `${rel} seeds the search state from the story's initial value`,
    );
    assert.match(
      story,
      /\.\.\.restOverrides,\s*title,/,
      `${rel} spreads only the stateless overrides, before the state-driven fields`,
    );
    assert.match(story, /searchResults,/, `${rel} returns the derived results, not an override`);
  }
  const mealFormStory = codeOf("src/pages/MealFormPage.stories.tsx");
  assert.match(mealFormStory, /selectedRecipes: initialSelectedRecipes/);
  assert.match(mealFormStory, /servingsByRecipeId: initialServingsByRecipeId/);
  const mealPlanStory = codeOf("src/pages/MealPlanFormPage.stories.tsx");
  assert.match(mealPlanStory, /selectedEntries: initialSelectedEntries/);
  assert.match(mealPlanStory, /quantityByKey: initialQuantityByKey/);
});

let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    return { React, renderToString, TamaguiProvider, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

const noop = () => null;

function pickerProps(overrides = {}) {
  return {
    searchText: "",
    onSearchTextChange: noop,
    searchResults: [],
    onSelectResult: noop,
    selectedItems: [],
    onRemoveSelectedItem: noop,
    ...overrides,
  };
}

test("SSR: the live region is mounted before any search, with nothing to announce", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const html = await renderToHtml(React.createElement(AutocompletePicker, pickerProps()));
  assert.ok(html.includes('role="status"'), "the region is mounted in the pre-search state");
  assert.ok(!html.includes("results available"), "no search, no results announcement");
  assert.ok(!html.includes("No results found."), "no search, no no-results announcement");
});

test("SSR: the live region announces the results count and the no-matches message", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const withResults = await renderToHtml(
    React.createElement(
      AutocompletePicker,
      pickerProps({
        searchText: "pep",
        searchResults: [
          { id: "peppers", label: "Classic Stuffed Peppers" },
          { id: "soup", label: "Pepper Soup" },
        ],
      }),
    ),
  );
  assert.ok(withResults.includes('role="status"'), "the region stays mounted with results");
  assert.ok(withResults.includes("2 results available"), "the results count is announced");
  const fruitless = await renderToHtml(
    React.createElement(AutocompletePicker, pickerProps({ searchText: "sushi" })),
  );
  assert.ok(fruitless.includes('role="status"'), "the region stays mounted with no matches");
  assert.ok(
    (fruitless.match(/No results found\./g) ?? []).length > 0,
    "the no-results message reaches the region",
  );
});

test("SSR: the live region stays mounted while searching", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(AutocompletePicker, pickerProps({ searchText: "pep", isSearching: true })),
  );
  assert.ok(html.includes('role="status"'), "the region stays mounted in the searching state");
});

test("SSR: a disabled SearchField's clear control reports aria-disabled; an enabled one does not", async () => {
  const { React, SearchField } = await loadRuntime();
  const renderField = (extra) =>
    renderToHtml(
      React.createElement(SearchField, {
        value: "pep",
        onChangeText: noop,
        "aria-label": "Search",
        ...extra,
      }),
    );
  const disabledHtml = await renderField({ disabled: true });
  const clearAt = disabledHtml.indexOf('aria-label="Clear search"');
  assert.ok(clearAt !== -1, "the clear control renders for a non-empty value");
  assert.ok(
    disabledHtml.slice(clearAt, clearAt + 300).includes('aria-disabled="true"'),
    "the disabled clear control must report aria-disabled",
  );
  const enabledHtml = await renderField({});
  const enabledClearAt = enabledHtml.indexOf('aria-label="Clear search"');
  assert.ok(enabledClearAt !== -1, "the clear control renders when enabled");
  assert.ok(
    !enabledHtml.slice(enabledClearAt, enabledClearAt + 300).includes('aria-disabled="true"'),
    "the enabled clear control must not report aria-disabled",
  );
});
