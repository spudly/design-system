/**
 * Voice-slot pins for the remaining recipe and form views
 * (#539 tranche 2d): RecipeCommentsView's and
 * RecipeSharingView's prop defaults, NutritionGoalsForm's
 * section title, field labels, placeholder, and save action,
 * and RatingForm's prop defaults plus its save action come
 * from the app-supplied voice object — the DS ships no
 * default strings. Caller-passed props still win over the
 * voice defaults.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: each view is SSR-rendered under the fixture
 * voice with no label props supplied, and the rendered output
 * is asserted to carry the fixture's slot strings. Slots that
 * only render in a particular state (a pending save, a share
 * link present, the comment composer) are asserted in that
 * state.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

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

async function renderWithVoice(element: any): Promise<string> {
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
  const html = renderToString(
    h(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      h(VoiceProvider, { voice: fixtureVoice }, element),
    ),
  );
  return html.replaceAll("&#x27;", "'");
}

const noop = () => {};

test("RecipeCommentsView renders its defaults from the voice object", async () => {
  const { h, RecipeCommentsView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.recipeCommentsView;
  const base = { comments: [], draft: "", onDraftChange: noop, onPost: noop };
  const html = await renderWithVoice(h(RecipeCommentsView, base));
  for (const slot of [
    "title",
    "emptyMessage",
    "composerLabel",
    "composerPlaceholder",
    "postLabel",
  ]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
});

test("RecipeSharingView renders its defaults from the voice object", async () => {
  const { h, RecipeSharingView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.recipeSharingView;
  const base = {
    options: [{ value: "private", label: "Private" }],
    value: "private",
    onValueChange: noop,
    onSave: noop,
    consentChecked: false,
    onConsentCheckedChange: noop,
    consentDescription: "I agree to publish this recipe.",
    shareLinkUrl: "https://example.com/s/abc",
    onRotateShareLink: noop,
    onCopyShareLink: noop,
    permalinkUrl: "https://example.com/r/abc",
    onCopyPermalink: noop,
  };
  const html = await renderWithVoice(h(RecipeSharingView, base));
  for (const slot of [
    "title",
    "consentLabel",
    "saveLabel",
    "shareLinkLabel",
    "rotateShareLinkLabel",
    "copyShareLinkLabel",
    "permalinkLabel",
    "copyPermalinkLabel",
  ]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const pending = await renderWithVoice(h(RecipeSharingView, { ...base, pending: true }));
  assert.ok(pending.includes(v.savePendingLabel), "the save pending label renders");
});

test("NutritionGoalsForm renders its copy from the voice object", async () => {
  const { h, NutritionGoalsForm, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.nutritionGoalsForm;
  const goals = {
    caloriesMin: null,
    caloriesMax: null,
    proteinGMin: null,
    proteinGMax: null,
    carbsGMin: null,
    carbsGMax: null,
    fatGMin: null,
    fatGMax: null,
    satietyScoreMin: null,
    satietyScoreMax: null,
  };
  const html = await renderWithVoice(
    h(NutritionGoalsForm, { goals, onChange: noop, onSave: noop }),
  );
  for (const slot of [
    "title",
    "caloriesLabel",
    "proteinLabel",
    "netCarbsLabel",
    "fatLabel",
    "satietyScoreLabel",
    "optionalPlaceholder",
    "saveLabel",
  ]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
});

test("RatingForm renders its defaults and save action from the voice object", async () => {
  const { h, RatingForm, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.ratingForm;
  const html = await renderWithVoice(
    h(RatingForm, { onSubmit: noop, onSkip: noop, isPending: false }),
  );
  for (const slot of ["title", "notesPlaceholder", "secondaryLabel", "saveLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
});
