/**
 * Behavioral tests for the uniform form-control error treatment
 * (#804): every form control renders its `error` through the
 * shared FieldError — an Alert at error severity, whose
 * `role="alert"` is the one announcement pattern — with the
 * control wired to it via `aria-describedby` at `${id}-error`
 * and `aria-invalid` where the control carries those semantics.
 *
 * Behavioral / rendered-output style (per the #733 direction —
 * no source scans): the tests render the built widgets through
 * SSR and pin what a user and assistive technology actually get,
 * on a representative set: a migrated control (TextField), and
 * controls that gained `error` in #804 (SearchField, Switch,
 * NumberStepper, StarRatingInput, CheckboxSelectList,
 * PresetValueSelector, AutocompletePicker).
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const { VoiceProvider }: Record<string, any> = await import("../../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../../dist/voice/fixtures.js");
    return { React, renderToString, TamaguiProvider, VoiceProvider, fixtureVoice, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const {
    renderToString,
    TamaguiProvider,
    createTamaguiConfig,
    baseTheme,
    VoiceProvider,
    fixtureVoice,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      <VoiceProvider voice={fixtureVoice}>{element}</VoiceProvider>
    </TamaguiProvider>,
  );
}

function assertAlertError(html: string, errorText: string, context: string) {
  assert.ok(html.includes(errorText), `${context}: the error text renders`);
  assert.ok(
    html.includes('role="alert"'),
    `${context}: the error renders inside an Alert (role="alert" announces it)`,
  );
}

test("SSR: TextField renders its error through an Alert wired by describedby (#804)", async () => {
  const { TextField } = await loadRuntime();
  const html = await renderToHtml(
    <TextField
      id="name"
      label="Name"
      value=""
      onChangeText={() => null}
      error="Name is required."
    />,
  );
  assertAlertError(html, "Name is required.", "TextField");
  assert.ok(html.includes('aria-invalid="true"'), "TextField: the input reports the error state");
  assert.ok(
    html.includes('aria-describedby="name-error"'),
    "TextField: the input describes itself by the error id",
  );
  assert.ok(html.includes('id="name-error"'), "TextField: the Alert carries the error id");
});

test("SSR: SearchField gains the same Alert error treatment (#804)", async () => {
  const { SearchField } = await loadRuntime();
  const html = await renderToHtml(
    <SearchField
      id="search"
      label="Search"
      value=""
      onChangeText={() => null}
      error="Enter a term."
    />,
  );
  assertAlertError(html, "Enter a term.", "SearchField");
  assert.ok(html.includes('aria-invalid="true"'), "SearchField: the input reports the error state");
  assert.ok(
    html.includes('aria-describedby="search-error"'),
    "SearchField: the input describes itself by the error id",
  );
});

test("SSR: Switch gains the same Alert error treatment (#804)", async () => {
  const { Switch } = await loadRuntime();
  const html = await renderToHtml(
    <Switch
      id="notify"
      label="Notify me"
      checked={false}
      onCheckedChange={() => null}
      error="Choose one."
    />,
  );
  assertAlertError(html, "Choose one.", "Switch");
  assert.ok(html.includes('aria-invalid="true"'), "Switch: the switch reports the error state");
  assert.ok(
    html.includes('aria-describedby="notify-error"'),
    "Switch: the switch describes itself by the error id",
  );
});

test("SSR: NumberStepper gains the same Alert error treatment (#804)", async () => {
  const { NumberStepper } = await loadRuntime();
  const html = await renderToHtml(
    <NumberStepper
      id="servings"
      label="Servings"
      value={0}
      onChange={() => null}
      error="At least 1."
    />,
  );
  assertAlertError(html, "At least 1.", "NumberStepper");
  assert.ok(
    html.includes('aria-describedby="servings-error"'),
    "NumberStepper: the group describes itself by the error id",
  );
});

test("SSR: StarRatingInput gains the same Alert error treatment (#804)", async () => {
  const { StarRatingInput } = await loadRuntime();
  const html = await renderToHtml(
    <StarRatingInput id="rating" label="Rating" value={0} onChange={() => null} error="Rate it." />,
  );
  assertAlertError(html, "Rate it.", "StarRatingInput");
  assert.ok(
    html.includes('aria-describedby="rating-error"'),
    "StarRatingInput: the radiogroup describes itself by the error id",
  );
});

test("SSR: CheckboxSelectList gains the same Alert error treatment (#804)", async () => {
  const { CheckboxSelectList } = await loadRuntime();
  const html = await renderToHtml(
    <CheckboxSelectList
      id="tags"
      items={[{ id: "a", label: "Alpha" }]}
      selectedIds={[]}
      onToggle={() => null}
      error="Pick a tag."
    />,
  );
  assertAlertError(html, "Pick a tag.", "CheckboxSelectList");
  assert.ok(
    html.includes('aria-describedby="tags-error"'),
    "CheckboxSelectList: the list describes itself by the error id",
  );
});

test("SSR: PresetValueSelector gains the same Alert error treatment (#804)", async () => {
  const { PresetValueSelector } = await loadRuntime();
  const html = await renderToHtml(
    <PresetValueSelector
      id="scale"
      label="Scale"
      options={[{ value: "1", label: "1×" }]}
      value="1"
      onChange={() => null}
      customLabel="Custom"
      customAccessibilityLabel="Custom scale"
      error="Choose a scale."
    />,
  );
  assertAlertError(html, "Choose a scale.", "PresetValueSelector");
  assert.ok(
    html.includes('aria-describedby="scale-error"'),
    "PresetValueSelector: the group describes itself by the error id",
  );
});

test("SSR: AutocompletePicker's validation error renders through an Alert (#804)", async () => {
  const { AutocompletePicker } = await loadRuntime();
  const html = await renderToHtml(
    <AutocompletePicker
      id="picker"
      searchText=""
      onSearchTextChange={() => null}
      searchResults={[]}
      onSelectResult={() => null}
      selectedItems={[]}
      onRemoveSelectedItem={() => null}
      error="Pick at least one recipe."
    />,
  );
  assertAlertError(html, "Pick at least one recipe.", "AutocompletePicker");
  assert.ok(
    html.includes('aria-describedby="picker-error"'),
    "AutocompletePicker: the search input describes itself by the error id",
  );
});

test("SSR: no error UI renders when error is unset (#804)", async () => {
  const { SearchField, Switch } = await loadRuntime();
  const html = await renderToHtml(
    <>
      <SearchField label="Search" value="" onChangeText={() => null} />
      <Switch label="Notify me" checked={false} onCheckedChange={() => null} />
    </>,
  );
  assert.ok(!html.includes('role="alert"'), "no Alert renders without an error");
  assert.ok(!html.includes("aria-invalid"), "no invalid state is reported without an error");
});
