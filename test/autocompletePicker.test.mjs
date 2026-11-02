/**
 * Contract tests for AutocompletePicker (spudly/design-system#383):
 * the multi-select search autocomplete that replaces the meal
 * forms' checkbox-list picker (Stephen's directive from
 * eciperay#359 — a search autocomplete over the full library,
 * NOT a longer checkbox list).
 *
 * The contracts pinned here:
 * 1. AutocompletePicker is exported from the package root.
 * 2. The search is the caller's: `searchText` in,
 *    `onSearchTextChange` out, `searchResults` / `isSearching`
 *    back in — the picker never fetches. While searching, a
 *    Spinner replaces the (stale) results.
 * 3. Results render only for a non-empty search; an empty
 *    result set for a non-empty search shows the no-results
 *    message; a result already selected is not offered again.
 * 4. Selection reports the result id (`onSelectResult`) and
 *    the picker stays available to add more; each selected
 *    item renders as a removable row reporting its id through
 *    `onRemoveSelectedItem`, with a per-item accessible name.
 * 5. DS hard rules: type aliases only, no styling props in the
 *    props type, no react-native import.
 * 6. Runtime (SSR, against the built output): the states in
 *    2–4 render as contracted, and both meal form pages render
 *    a selected item's servings stepper from the SELECTED
 *    view-models even when the item is absent from the current
 *    search results — the separation #383 requires.
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

test("AutocompletePicker is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.AutocompletePicker, "function");
});

test("the search contract is controlled: text out, results and searching flag in", () => {
  assert.match(picker, /searchText: string/);
  assert.match(picker, /onSearchTextChange: \(text: string\) => void/);
  assert.match(picker, /searchResults: AutocompletePickerResult\[\]/);
  assert.match(picker, /isSearching\?: boolean/);
  assert.match(picker, /value=\{searchText\}/, "the field renders the caller's search text");
  assert.match(
    picker,
    /onChangeText=\{onSearchTextChange\}/,
    "text changes report through onSearchTextChange",
  );
  assert.ok(!picker.includes("fetch("), "the picker never fetches — the host runs the search");
});

test("while searching, a spinner replaces the results", () => {
  assert.match(picker, /isSearching \? \(/);
  assert.match(picker, /<Spinner label="Searching" \/>/);
});

test("results render only for a non-empty search, and selected results are not offered again", () => {
  assert.match(picker, /searchText\.trim\(\)\.length > 0/);
  assert.match(
    picker,
    /!selectedIds\.has\(result\.id\)/,
    "already-selected results are filtered out",
  );
  assert.match(picker, /noResultsMessage/, "an empty result set shows the no-results message");
});

test("selecting a result and removing a selected item report their ids", () => {
  assert.match(picker, /onSelectResult: \(id: string\) => void/);
  assert.match(picker, /onSelectResult\(result\.id\)/);
  assert.match(picker, /selectedItems: AutocompletePickerSelectedItem\[\]/);
  assert.match(picker, /onRemoveSelectedItem: \(id: string\) => void/);
  assert.match(picker, /onRemoveSelectedItem\(item\.id\)/);
  assert.match(
    picker,
    /accessibilityLabel=\{`Remove \$\{item\.label\}`\}/,
    "each Remove action names the item it removes",
  );
});

test("DS hard rules: type aliases only, no styling props, no react-native import", () => {
  assert.ok(!/\binterface\b/.test(picker), "type aliases, never interfaces");
  assert.ok(!picker.includes("react-native"), "no react-native import in the root graph");
  const propsType = picker.slice(picker.indexOf("AutocompletePickerProps"));
  assert.ok(!/style\??:/.test(propsType), "no style prop — the picker owns its styles");
  assert.ok(!propsType.includes("className"), "no className prop");
});

test("stories cover the picker's captured states", () => {
  const story = readFileSync(join(root, "src/components/AutocompletePicker.stories.tsx"), "utf8");
  assert.ok(story.includes('title: "Components/AutocompletePicker"'));
  for (const name of ["WithResults", "NoSelection", "Searching", "NoResults"]) {
    assert.ok(story.includes(`export const ${name}`), `missing the ${name} story`);
  }
});

let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    const { MealFormPage } = await import("../dist/pages/MealFormPage.js");
    const { MealPlanFormPage } = await import("../dist/pages/MealPlanFormPage.js");
    return { React, renderToString, TamaguiProvider, MealFormPage, MealPlanFormPage, ...dist };
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

test("SSR: results, their details, and the selected list render for a search", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      AutocompletePicker,
      pickerProps({
        searchText: "pep",
        searchResults: [
          { id: "peppers", label: "Classic Stuffed Peppers", detail: "6 servings" },
          { id: "selected-1", label: "Duplicate Soup" },
        ],
        selectedItems: [{ id: "selected-1", label: "Selected Soup" }],
      }),
    ),
  );
  assert.ok(html.includes("Classic Stuffed Peppers"), `result label missing in: ${html}`);
  assert.ok(html.includes("6 servings"), "the result detail renders under its label");
  assert.ok(html.includes("Selected Soup"), "the selected item renders in the removable list");
  assert.ok(html.includes("Remove"), "the selected item carries its Remove action");
  assert.ok(
    !html.includes("Duplicate Soup"),
    "a result whose id is already selected must not be offered again",
  );
});

test("SSR: the searching state hides the stale results behind the spinner", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      AutocompletePicker,
      pickerProps({
        searchText: "pep",
        isSearching: true,
        searchResults: [{ id: "peppers", label: "Classic Stuffed Peppers" }],
      }),
    ),
  );
  assert.ok(!html.includes("Classic Stuffed Peppers"), "stale results must not render");
  assert.ok(html.includes("Searching"), `expected the searching spinner in: ${html}`);
});

test("SSR: a fruitless search shows the no-results message; an empty search shows neither", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const fruitless = await renderToHtml(
    React.createElement(AutocompletePicker, pickerProps({ searchText: "sushi" })),
  );
  assert.ok(fruitless.includes("No results found."), `expected the message in: ${fruitless}`);
  const preSearch = await renderToHtml(
    React.createElement(
      AutocompletePicker,
      pickerProps({ searchResults: [{ id: "a", label: "Hidden Result" }] }),
    ),
  );
  assert.ok(!preSearch.includes("Hidden Result"), "results need a search text to render");
  assert.ok(!preSearch.includes("No results found."), "the pre-search state shows no message");
});

/** SSR props for the two page tests: one selected recipe/entry
 * and NO search results — the separation #383 requires. */
function mealFormSsrProps() {
  return {
    title: "Dinner",
    onTitleChange: noop,
    notes: "",
    onNotesChange: noop,
    searchText: "",
    onSearchTextChange: noop,
    searchResults: [],
    selectedRecipes: [{ id: "solo", label: "Solo Recipe", servings: 4 }],
    servingsByRecipeId: {},
    onSelectRecipe: noop,
    onRemoveRecipe: noop,
    onServingsChange: noop,
    onSubmit: noop,
  };
}

function mealPlanFormSsrProps() {
  return {
    title: "Plan",
    onTitleChange: noop,
    notes: "",
    onNotesChange: noop,
    startsOn: "2026-11-02",
    onStartsOnChange: noop,
    endsOn: "2026-11-09",
    onEndsOnChange: noop,
    searchText: "",
    onSearchTextChange: noop,
    searchResults: [],
    selectedEntries: [
      { key: "recipe:solo", kind: "recipe", title: "Solo Recipe", recipeId: "solo", servings: 4 },
    ],
    quantityByKey: {},
    servingsByRecipeId: {},
    onSelectEntry: noop,
    onRemoveEntry: noop,
    onQuantityChange: noop,
    onRecipeServingsChange: noop,
    onSubmit: noop,
  };
}

test("SSR: MealFormPage steppers read the selected view-models, not the results (#383)", async () => {
  const { React, MealFormPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(MealFormPage, mealFormSsrProps()));
  assert.ok(html.includes("Solo Recipe"), "the selected recipe renders without any results");
  assert.ok(
    html.includes("Servings · Solo Recipe"),
    "its servings stepper renders from the selection",
  );
});

test("SSR: MealPlanFormPage steppers read the selected entries, not the results (#383)", async () => {
  const { React, MealPlanFormPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(MealPlanFormPage, mealPlanFormSsrProps()));
  assert.ok(html.includes("Quantity · Solo Recipe"), "the quantity stepper renders");
  assert.ok(html.includes("Servings · Solo Recipe"), "the servings stepper renders");
});
