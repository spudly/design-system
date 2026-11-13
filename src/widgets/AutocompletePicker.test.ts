import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function codeOf(rel: string) {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const picker = codeOf("src/widgets/AutocompletePicker.tsx");

test("AutocompletePicker is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
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
  assert.match(picker, /<Spinner label=\{voice\.autocompletePicker\.searchingLabel\} \/>/);
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

test("a failed search is its own state: searchError replaces the no-results message (#393)", () => {
  assert.match(picker, /searchError\?: string \| null/);
  assert.match(
    picker,
    /searchError \|\| noResultsMessage/,
    "the live region announces the error instead of the no-results message (an empty-string error counts as no error, matching the visible branch)",
  );
  assert.match(
    picker,
    /<Alert\s+severity="error"\s+message=\{searchError\}\s+accessibilityRole="none"\s+accessibilityLiveRegion="none"\s+\/>/,
    "the visible empty state renders the error inside an Alert, not the no-results hint (#460) — with the Alert's own live semantics fully off (no alert role, no live region), so the polite live region is the only announcement (an error Alert's assertive role would announce the same error twice)",
  );
  for (const page of ["src/pages/MealFormPage.tsx", "src/pages/MealPlanFormPage.tsx"]) {
    const source = codeOf(page);
    assert.match(source, /searchError\?: string \| null/, `${page} accepts searchError`);
    assert.match(
      source,
      /searchError=\{searchError\}/,
      `${page} threads searchError to the picker`,
    );
  }
});

test("selecting a result and removing a selected item report their ids", () => {
  assert.match(picker, /onSelectResult: \(id: string\) => void/);
  // Selection routes through handleSelectResult (#384: it also
  // returns focus to the search field — see the review-round
  // contracts below), which reports the row's id onward.
  assert.match(picker, /handleSelectResult\(result\.id\)/);
  assert.match(picker, /onSelectResult\(id\)/);
  assert.match(picker, /selectedItems: AutocompletePickerSelectedItem\[\]/);
  assert.match(picker, /onRemoveSelectedItem: \(id: string\) => void/);
  // Removal routes through handleRemoveSelectedItem (#384: it
  // also returns focus to the search field, like selection),
  // which reports the item's id onward.
  assert.match(picker, /handleRemoveSelectedItem\(item\.id\)/);
  assert.match(picker, /onRemoveSelectedItem\(id\)/);
  assert.match(
    picker,
    /accessibilityLabel=\{voice\.autocompletePicker\.removeItemLabel\(item\.label\)\}/,
    "each Remove action names the item it removes, through the voice formatter (#539)",
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
  const story = readFileSync(join(root, "src/widgets/AutocompletePicker.stories.tsx"), "utf8");
  assert.ok(story.includes('title: "Widgets/AutocompletePicker"'));
  for (const name of ["WithResults", "NoSelection", "Searching", "NoResults", "SearchError"]) {
    assert.ok(story.includes(`export const ${name}`), `missing the ${name} story`);
  }
});

let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
    const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
    const { MealFormPage }: Record<string, any> = await import("../../dist/pages/MealFormPage.js");
    const { MealPlanFormPage }: Record<string, any> =
      await import("../../dist/pages/MealPlanFormPage.js");
    return { React, renderToString, TamaguiProvider, MealFormPage, MealPlanFormPage, ...dist, ...voiceFixtures, ...voiceModule };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, VoiceProvider, fixtureVoice } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(VoiceProvider, { voice: fixtureVoice }, element),
    ),
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

test("SSR: a failed search shows the error and never the no-results message (#393)", async () => {
  const { React, AutocompletePicker } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      AutocompletePicker,
      pickerProps({
        searchText: "chicken",
        searchError: "Could not load recipes: network error.",
        noResultsMessage: "No recipes found.",
      }),
    ),
  );
  // Assert the two presentations SEPARATELY (Copilot review on
  // PR #395, head 1a28c6e): a whole-page includes() passes if
  // the error survives in only one of them, so the live region
  // (role="status" through its closing tag) and the markup
  // outside it are each checked for the error on their own.
  const regionAt = html.indexOf('role="status"');
  assert.ok(regionAt !== -1, "the live region is mounted");
  const regionEnd = html.indexOf("</div>", regionAt);
  const region = html.slice(regionAt, regionEnd);
  const visible = html.slice(0, regionAt) + html.slice(regionEnd);
  const errorText = "Could not load recipes: network error.";
  assert.ok(region.includes(errorText), "the live region announces the search error");
  assert.ok(visible.includes(errorText), "the visible empty state shows the search error");
  assert.ok(
    visible.includes('aria-live="off"'),
    "the visible Alert's live semantics are off — the polite live region is the only announcement, so the error is not announced twice (assertively) by the Alert's role",
  );
  assert.ok(
    !visible.includes('role="alert"'),
    'the visible Alert carries no alert role — an alert role can fire a system alert event even with aria-live off, so the role itself is removed (accessibilityRole="none")',
  );
  assert.ok(
    !html.includes("No recipes found."),
    "a failed search must not read as no matches — visibly or in the live region",
  );
});

test("SSR: both meal form pages thread searchError to the picker (#393)", async () => {
  const { React, MealFormPage, MealPlanFormPage } = await loadRuntime();
  const mealHtml = await renderToHtml(
    React.createElement(MealFormPage, mealFormSsrPropsWithSearchError()),
  );
  assert.ok(mealHtml.includes("Could not load recipes: network error."));
  assert.ok(!mealHtml.includes("No recipes found."));
  const planHtml = await renderToHtml(
    React.createElement(MealPlanFormPage, mealPlanFormSsrPropsWithSearchError()),
  );
  assert.ok(planHtml.includes("Could not load recipes: network error."));
  assert.ok(!planHtml.includes("No meals or recipes found."));
  // Same split as the picker test above: each page's live
  // region must announce the error, not just the page as a
  // whole (Copilot review on PR #395, head 1a28c6e).
  for (const pageHtml of [mealHtml, planHtml]) {
    const at = pageHtml.indexOf('role="status"');
    assert.ok(at !== -1, "the page's live region is mounted");
    const regionText = pageHtml.slice(at, pageHtml.indexOf("</div>", at));
    assert.ok(regionText.includes("Could not load recipes:"), "the region announces the error");
  }
});

function mealFormSsrPropsWithSearchError() {
  return {
    ...mealFormSsrProps(),
    searchText: "chicken",
    searchError: "Could not load recipes: network error.",
  };
}

function mealPlanFormSsrPropsWithSearchError() {
  return {
    ...mealPlanFormSsrProps(),
    searchText: "chicken",
    searchError: "Could not load recipes: network error.",
  };
}

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

describe("autocompletePickerReview", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "../..");

  function codeOf(rel: string) {
    const source = readFileSync(join(root, rel), "utf8");
    return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const picker = codeOf("src/widgets/AutocompletePicker.tsx");
  const searchField = codeOf("src/views/SearchField.tsx");

  test("SearchField's clear button honors disabled: no press handler, disabled state reported", () => {
    assert.match(
      searchField,
      /disabled = false/,
      "disabled is destructured out of the input props",
    );
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

  test("removing a selected item returns focus to the search input through the shared helper", () => {
    assert.match(
      picker,
      /const returnFocusToSearch = \(\) => \{/,
      "one shared focus-return helper",
    );
    assert.match(picker, /onRemoveSelectedItem\(id\)/);
    assert.match(
      picker,
      /const handleRemoveSelectedItem[\s\S]*?returnFocusToSearch\(\);/,
      "the remove path returns focus after reporting the removal",
    );
    assert.match(
      picker,
      /onPress=\{\(\) => \{\s*handleRemoveSelectedItem\(item\.id\);/,
      "Remove buttons act through the focus-returning handler",
    );
    assert.ok(
      !picker.includes("onRemoveSelectedItem(item.id)"),
      "no Remove button calls the raw callback directly, bypassing the focus return",
    );
  });

  test("the picker mounts a polite live region and its text tracks the search state", () => {
    assert.match(picker, /politeLiveRegionProps/, "the region uses the shared live-region props");
    assert.match(picker, /collapsable=\{false\}/, "the region's node cannot be flattened away");
    assert.match(picker, /statusMessage/, "the region's text is the search-state message");
    assert.match(picker, /\? voice\.autocompletePicker\.searchingLabel/, "the searching state is announced");
    assert.match(
      picker,
      /\|\| noResultsMessage/,
      "the no-matches state announces the no-results text (falling back from a search error; an empty-string error counts as no error, #393)",
    );
    assert.match(picker, /voice\.autocompletePicker\.resultsAvailableLabel\(visibleResults\.length\)/, "the results state announces the result count");
    assert.ok(
      !picker.includes("opacity={0}"),
      "the region is not transparent on every platform — iOS VoiceOver drops alpha-0 views",
    );
    assert.match(
      picker,
      /\{\.\.\.\(isWeb \? \{ opacity: 0 \} : \{\}\)\}/,
      "full transparency applies on web only; native keeps the clipped 1×1 region opaque",
    );
  });

  test("the meal form story hooks seed state from the story's initial values", () => {
    for (const rel of [
      "src/pages/MealFormPage.stories.tsx",
      "src/pages/MealPlanFormPage.stories.tsx",
    ]) {
      const story = codeOf(rel);
      assert.ok(
        !story.includes("...overrides"),
        `${rel} must not spread fixed overrides over state`,
      );
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
      const { TamaguiProvider }: Record<string, any> = await import("tamagui");
      const dist: Record<string, any> = await loadInternalDist();
      return { React, renderToString, TamaguiProvider, ...dist };
    })();
    return runtimePromise;
  }

  async function renderToHtml(element: any) {
    const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
      await loadRuntime();
    const config = createTamaguiConfig(baseTheme);
    return renderToString(
      React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
    );
  }

  /**
   * The status region's own markup: from its role="status" tag
   * to its closing tag. Announcements must be asserted HERE —
   * the visible spinner/hint can carry the same words elsewhere
   * in the page even when the region itself is empty.
   */
  function statusRegion(html: string) {
    const at = html.indexOf('role="status"');
    assert.ok(at !== -1, "the status region is mounted");
    const end = html.indexOf("</div>", at);
    assert.ok(end !== -1, "the status region closes");
    return html.slice(at, end);
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
    assert.ok(
      statusRegion(withResults).includes("2 results available"),
      "the results count is announced inside the region",
    );
    const fruitless = await renderToHtml(
      React.createElement(AutocompletePicker, pickerProps({ searchText: "sushi" })),
    );
    assert.ok(
      statusRegion(fruitless).includes("No results found."),
      "the no-results message is inside the region, not just in the visible hint",
    );
  });

  test("SSR: the live region announces Searching while a search is in flight", async () => {
    const { React, AutocompletePicker } = await loadRuntime();
    const html = await renderToHtml(
      React.createElement(
        AutocompletePicker,
        pickerProps({ searchText: "pep", isSearching: true }),
      ),
    );
    assert.ok(
      statusRegion(html).includes("Searching"),
      "the searching state is announced inside the region, not just that the region exists",
    );
  });

  test("SSR: an empty-string searchError is no error — the region announces the no-results message (#393)", async () => {
    const { React, AutocompletePicker } = await loadRuntime();
    const html = await renderToHtml(
      React.createElement(
        AutocompletePicker,
        pickerProps({
          searchText: "chicken",
          searchError: "",
          noResultsMessage: "No recipes found.",
        }),
      ),
    );
    assert.ok(
      statusRegion(html).includes("No recipes found."),
      "an empty-string error falls back to the no-results announcement, not silence",
    );
  });

  test("SSR: a disabled SearchField's clear control reports aria-disabled; an enabled one does not", async () => {
    const { React, SearchField } = await loadRuntime();
    const renderField = (extra: any) =>
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
});
