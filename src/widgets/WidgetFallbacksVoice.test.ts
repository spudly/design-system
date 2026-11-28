/**
 * Voice-slot contract for the remaining widget literals
 * (#539 tranche 1f; #733 tranche 4b).
 *
 * Converted from source scans to runtime checks: each widget
 * is SSR-rendered against the built output under a voice whose
 * tested slots carry sentinel strings, in the state that
 * renders each slot, and the rendered output is asserted to
 * carry the sentinels — so AutocompletePicker's search
 * defaults and announcements, Alert's and FixedActionBanner's
 * dismiss labels, BulkSelectToolbar's search placeholder and
 * selection count, and the form-field fallbacks
 * (CheckboxSelectList, SelectField, ColorPickerField,
 * StarRatingInput, and CatalogFiltersBar's added-filter
 * remove pairing — the former RemovableField, inlined in
 * #740) provably come from the
 * app-supplied voice object, not from strings baked into the
 * widget (the DS ships no default strings). Function slots are
 * replaced by sentinel functions, so their outputs are checked
 * the same way: a hard-coded literal would render instead of
 * the sentinel and fail the test.
 *
 * Deleted in the conversion (not runtime-observable here):
 * SelectField's selectOptionLabel source pin — that slot is
 * the aria-label of the touch-platform Sheet (`Adapt
 * platform="touch"`), which web SSR never renders, so no
 * server-rendered output can observe it; SelectField's
 * placeholder slot is covered at runtime above.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const { createElement: h } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const { VoiceProvider }: Record<string, any> = await import("../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../dist/voice/fixtures.js");
    return { h, renderToString, TamaguiProvider, VoiceProvider, fixtureVoice, ...distRuntime };
  })();
  return runtimePromise;
}

/** The fixture voice with one section's slots replaced by sentinels. */
function sentinelVoice(fixtureVoice: any, section: string, overrides: Record<string, any>) {
  return { ...fixtureVoice, [section]: { ...fixtureVoice[section], ...overrides } };
}

async function renderWithVoice(element: any, voice: any): Promise<string> {
  const { h, renderToString, TamaguiProvider, VoiceProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    h(TamaguiProvider, { config, defaultTheme: "light" }, h(VoiceProvider, { voice }, element)),
  );
  return html.replaceAll("&#x27;", "'");
}

const noop = () => {};

const pickerSentinels = {
  searchPlaceholder: "SENT search placeholder",
  searchLabel: "SENT search label",
  searchingLabel: "SENT searching",
  noResultsMessage: "SENT no results",
  resultsAvailableLabel: (count: number) => `SENT ${count} results available`,
  removeLabel: "SENT remove",
  removeItemLabel: (label: string) => `SENT remove ${label}`,
};

const pickerBase = {
  onSearchTextChange: noop,
  onSelectResult: noop,
  onRemoveSelectedItem: noop,
};

test("AutocompletePicker renders its search defaults and announcements from the voice object", async () => {
  const { h, AutocompletePicker, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "autocompletePicker", pickerSentinels);
  const idle = await renderWithVoice(
    h(AutocompletePicker, {
      ...pickerBase,
      searchText: "",
      searchResults: [],
      selectedItems: [{ id: "beans", label: "Beans" }],
    }),
    voice,
  );
  assert.ok(
    idle.includes(pickerSentinels.searchPlaceholder),
    "the search placeholder renders from the voice object",
  );
  assert.ok(
    idle.includes(pickerSentinels.searchLabel),
    "the search accessible name renders from the voice object",
  );
  assert.ok(
    idle.includes("×"),
    "the selected item renders as a removable chip whose × is the remove control (#805 — the removeLabel text no longer renders; the accessible name below carries the voice string)",
  );
  assert.ok(
    idle.includes(pickerSentinels.removeItemLabel("Beans")),
    "the remove-item accessible name renders through the voice formatter",
  );
  const searching = await renderWithVoice(
    h(AutocompletePicker, {
      ...pickerBase,
      searchText: "bea",
      searchResults: [],
      selectedItems: [],
      isSearching: true,
    }),
    voice,
  );
  assert.ok(
    searching.includes(pickerSentinels.searchingLabel),
    "the searching announcement renders from the voice object",
  );
  const noResults = await renderWithVoice(
    h(AutocompletePicker, {
      ...pickerBase,
      searchText: "zzz",
      searchResults: [],
      selectedItems: [],
    }),
    voice,
  );
  assert.ok(
    noResults.includes(pickerSentinels.noResultsMessage),
    "the no-results message renders from the voice object",
  );
  const results = await renderWithVoice(
    h(AutocompletePicker, {
      ...pickerBase,
      searchText: "bea",
      searchResults: [{ id: "beans", label: "Beans" }],
      selectedItems: [],
    }),
    voice,
  );
  assert.ok(
    results.includes(pickerSentinels.resultsAvailableLabel(1)),
    "the results-available announcement renders through the voice formatter",
  );
});

test("Alert and FixedActionBanner render their dismiss labels from the voice object", async () => {
  const { h, Alert, FixedActionBanner, fixtureVoice } = await loadRuntime();
  const alertVoice = sentinelVoice(fixtureVoice, "alert", { dismissLabel: "SENT alert dismiss" });
  const alert = await renderWithVoice(
    h(Alert, { severity: "info", message: "Caller message", dismissible: true, onDismiss: noop }),
    alertVoice,
  );
  assert.ok(alert.includes("SENT alert dismiss"), "the alert dismiss name renders from the voice");
  const bannerVoice = sentinelVoice(fixtureVoice, "fixedActionBanner", {
    dismissLabel: "SENT banner dismiss",
  });
  const banner = await renderWithVoice(
    h(FixedActionBanner, { message: "Caller message", onDismiss: noop }),
    bannerVoice,
  );
  assert.ok(
    banner.includes("SENT banner dismiss"),
    "the banner dismiss label renders from the voice object",
  );
});

test("BulkSelectToolbar renders its search placeholder and selection count from the voice object", async () => {
  const { h, BulkSelectToolbar, fixtureVoice } = await loadRuntime();
  const sentinels = {
    searchPlaceholder: "SENT toolbar search",
    selectedLabel: (count: number) => `SENT ${count} chosen`,
    selectAllLabel: "SENT select all",
    clearSelectionLabel: "SENT clear selection",
  };
  const voice = sentinelVoice(fixtureVoice, "bulkSelectToolbar", sentinels);
  const html = await renderWithVoice(
    h(BulkSelectToolbar, {
      search: "",
      onSearchChange: noop,
      selectedCount: 2,
      filteredCount: 3,
      onSelectAll: noop,
      onClearSelection: noop,
    }),
    voice,
  );
  assert.ok(
    html.includes(sentinels.searchPlaceholder),
    "the search placeholder renders from the voice object",
  );
  assert.ok(
    html.includes(sentinels.selectedLabel(2)),
    "the selection count renders through the voice formatter",
  );
  assert.ok(html.includes(sentinels.selectAllLabel), "the select-all label renders from the voice");
  assert.ok(
    html.includes(sentinels.clearSelectionLabel),
    "the clear-selection label renders from the voice object",
  );
});

test("form-field fallbacks render from the voice object", async () => {
  const {
    h,
    CheckboxSelectList,
    SelectField,
    ColorPickerField,
    StarRatingInput,
    CatalogFiltersBar,
    fixtureVoice,
  } = await loadRuntime();

  const listVoice = sentinelVoice(fixtureVoice, "checkboxSelectList", {
    emptyMessage: "SENT empty message",
  });
  const list = await renderWithVoice(
    h(CheckboxSelectList, { items: [], selectedIds: [], onToggle: noop }),
    listVoice,
  );
  assert.ok(list.includes("SENT empty message"), "the empty message renders from the voice object");

  const selectVoice = sentinelVoice(fixtureVoice, "selectField", {
    placeholder: "SENT select placeholder",
  });
  const select = await renderWithVoice(
    h(SelectField, { options: [{ value: "a", label: "Option A" }] }),
    selectVoice,
  );
  assert.ok(
    select.includes("SENT select placeholder"),
    "the select placeholder renders from the voice object",
  );

  const colorVoice = sentinelVoice(fixtureVoice, "colorPickerField", {
    chooseColorLabel: "SENT choose a color",
    selectColorLabel: (color: string) => `SENT pick ${color}`,
  });
  const color = await renderWithVoice(
    h(ColorPickerField, { colors: ["orange", "gray"] }),
    colorVoice,
  );
  assert.ok(
    color.includes("SENT choose a color"),
    "the choose-color name renders from the voice object",
  );
  assert.ok(
    color.includes("SENT pick orange"),
    "the per-color name renders through the voice formatter",
  );

  const starVoice = sentinelVoice(fixtureVoice, "starRatingInput", {
    label: "SENT star rating",
    ratedLabel: (value: number) => `SENT rated ${value}`,
    rateLabel: (star: number) => `SENT rate ${star}`,
  });
  const rated = await renderWithVoice(
    h(StarRatingInput, { value: 3, onChange: noop, readOnly: true }),
    starVoice,
  );
  assert.ok(rated.includes("SENT rated 3"), "the rated name renders through the voice formatter");
  const stars = await renderWithVoice(h(StarRatingInput, { value: 0, onChange: noop }), starVoice);
  assert.ok(stars.includes("SENT star rating"), "the group name renders from the voice object");
  assert.ok(stars.includes("SENT rate 4"), "the per-star name renders through the voice formatter");

  const removableVoice = sentinelVoice(fixtureVoice, "removableField", {
    removeLabel: "SENT remove field",
  });
  const removable = await renderWithVoice(
    h(CatalogFiltersBar, {
      searchPlaceholder: "Search",
      search: "",
      onSearchChange: noop,
      // A non-default value seeds the filter as added, so its
      // remove pairing renders.
      filters: [
        {
          kind: "select",
          id: "status",
          label: "Status",
          options: [{ value: "a", label: "Option A" }],
          value: "a",
          onChange: noop,
          defaultValue: "",
        },
      ],
    }),
    removableVoice,
  );
  assert.ok(
    removable.includes("SENT remove field"),
    "the remove label renders from the voice object",
  );
});
