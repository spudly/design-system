/**
 * Voice-slot pins for the recipe-editor views (#539 tranche 2a):
 * RecipeImageView's label / empty-message defaults and its own
 * chrome, the ingredient and instruction lists' label /
 * empty-message / add defaults and add-action names, and the
 * rows' position-built accessible names come from the
 * app-supplied voice object — the DS ships no default strings.
 * ScaledIngredientsView is pinned as the exception: its heading
 * and lines are caller-composed, so it reads no voice slots.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: each view is SSR-rendered under the fixture
 * voice and the rendered output is asserted to carry the
 * fixture's slot strings (formatter slots are asserted through
 * the accessible names they build for a row at a known
 * position). The pseudo-locale formatter check runs against
 * the built fixture voices at runtime. ScaledIngredientsView
 * is rendered with NO provider: a view that read voice slots
 * would throw the fail-fast error, so a successful render
 * carrying only caller copy is the runtime form of the
 * exception.
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
    const fixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
    return { h, renderToString, TamaguiProvider, VoiceProvider, ...fixtures, ...distRuntime };
  })();
  return runtimePromise;
}

async function render(element: any, withVoice = true): Promise<string> {
  const {
    h,
    renderToString,
    TamaguiProvider,
    VoiceProvider,
    fixtureVoice,
    createTamaguiConfig,
    baseTheme,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const tree = withVoice ? h(VoiceProvider, { voice: fixtureVoice }, element) : element;
  const html = renderToString(h(TamaguiProvider, { config, defaultTheme: "light" }, tree));
  return html.replaceAll("&#x27;", "'");
}

const noop = () => { /* noop */ };

test("RecipeImageView renders its defaults and chrome from the voice object", async () => {
  const { h, RecipeImageView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.recipeImageView;
  const base = {
    onPickImageRequest: noop,
    onTakePhotoRequest: noop,
    onGenerateImageRequest: noop,
    onRemoveImage: noop,
  };
  const html = await render(h(RecipeImageView, base));
  for (const slot of [
    "label",
    "emptyMessage",
    "browseLabel",
    "takePhotoLabel",
    "generateLabel",
    "generateAccessibilityLabel",
  ]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const withPreview = await render(
    h(RecipeImageView, { ...base, imagePreviewUri: "https://example.com/r.jpg" }),
  );
  assert.ok(withPreview.includes(v.previewLabel), "the preview label renders");
  assert.ok(withPreview.includes(v.removeLabel), "the remove label renders");
  const busy = await render(
    h(RecipeImageView, {
      ...base,
      imagePreviewUri: "https://example.com/r.jpg",
      isUploading: true,
      isGenerating: true,
    }),
  );
  assert.ok(busy.includes(v.uploadingLabel), "the uploading label renders");
  assert.ok(busy.includes(v.generatingLabel), "the generating label renders");
});

test("RecipeIngredientListView and its rows render their names from the voice object", async () => {
  const { h, RecipeIngredientListView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.recipeIngredientListView;
  const rowVoice = fixtureVoice.recipeIngredientRowView;
  const rows = [{ key: "chicken", quantity: "1", unit: "lb", name: "Chicken" }];
  const html = await render(
    h(RecipeIngredientListView, { rows, onAdd: noop, onFieldChange: noop, onRemove: noop }),
  );
  assert.ok(html.includes(v.label), "the list label renders");
  assert.ok(html.includes(v.addLabel), "the add label renders");
  assert.ok(html.includes(v.addIngredientLabel), "the add action's accessible name renders");
  assert.ok(html.includes(rowVoice.quantityPlaceholder), "the quantity placeholder renders");
  assert.ok(html.includes(rowVoice.unitPlaceholder), "the unit placeholder renders");
  assert.ok(html.includes(rowVoice.namePlaceholder), "the name placeholder renders");
  assert.ok(html.includes(rowVoice.quantityLabel(1)), "the quantity formatter names the first row");
  assert.ok(html.includes(rowVoice.unitLabel(1)), "the unit formatter names the first row");
  assert.ok(html.includes(rowVoice.nameLabel(1)), "the name formatter names the first row");
  assert.ok(html.includes(rowVoice.removeLabel), "the remove label renders");
  assert.ok(
    html.includes(rowVoice.removeIngredientLabel(1)),
    "the remove formatter names the first row",
  );
  const empty = await render(
    h(RecipeIngredientListView, { rows: [], onAdd: noop, onFieldChange: noop, onRemove: noop }),
  );
  assert.ok(empty.includes(v.emptyMessage), "the empty message renders");
});

test("RecipeInstructionListView and its rows render their names from the voice object", async () => {
  const { h, RecipeInstructionListView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.recipeInstructionListView;
  const rowVoice = fixtureVoice.recipeInstructionRowView;
  const rows = [{ key: "sear", body: "Sear the chicken." }];
  const html = await render(
    h(RecipeInstructionListView, { rows, onAdd: noop, onBodyChange: noop, onRemove: noop }),
  );
  assert.ok(html.includes(v.label), "the list label renders");
  assert.ok(html.includes(v.addLabel), "the add label renders");
  assert.ok(html.includes(v.addInstructionLabel), "the add action's accessible name renders");
  assert.ok(html.includes(rowVoice.stepLabel(1)), "the step formatter names the first row");
  assert.ok(html.includes(rowVoice.removeStepLabel(1)), "the remove formatter names the first row");
  assert.ok(html.includes(rowVoice.removeLabel), "the remove label renders");
  const empty = await render(
    h(RecipeInstructionListView, { rows: [], onAdd: noop, onBodyChange: noop, onRemove: noop }),
  );
  assert.ok(empty.includes(v.emptyMessage), "the empty message renders");
});

test("the en-XA fixture voice pseudo-localizes formatter results, not just plain strings", async () => {
  const { fixtureVoice, fixtureVoicePseudoLocale } = await loadRuntime();
  const plain = fixtureVoice.recipeIngredientRowView.quantityLabel(2);
  const pseudo = fixtureVoicePseudoLocale.recipeIngredientRowView.quantityLabel(2);
  assert.notEqual(pseudo, plain);
  assert.ok(pseudo.includes("⟦"), "the formatter result is pseudo-localized");
  assert.ok(
    pseudo.replaceAll("⟦", "").replaceAll("⟧", "").includes(plain) || pseudo.length > plain.length,
    "the pseudo-localized result derives from the plain result",
  );
});

test("ScaledIngredientsView reads no voice slots — its heading and lines are caller-composed", async () => {
  const { h, ScaledIngredientsView } = await loadRuntime();
  const html = await render(
    h(ScaledIngredientsView, { heading: "Ingredients · 4 servings", lines: ["1 lb chicken"] }),
    false,
  );
  assert.ok(
    html.includes("Ingredients · 4 servings"),
    "the caller heading renders with no provider",
  );
  assert.ok(html.includes("1 lb chicken"), "the caller lines render with no provider");
});
