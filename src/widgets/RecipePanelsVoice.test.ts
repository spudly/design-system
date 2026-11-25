/**
 * Voice-slot contract for the recipe panels (#539 tranche 1e;
 * #733 tranche 4b).
 *
 * Converted from source scans to runtime checks: each panel
 * is SSR-rendered against the built output under a voice whose
 * tested slots carry sentinel strings, in the state that
 * renders each slot, and the rendered output is asserted to
 * carry the sentinels — so RecipeOverviewPanel's stat band
 * labels and RecipeIngredientsPanel's servings/scale labels,
 * stepper accessible names, missing-ingredients hint,
 * substitutions status and title provably come from the
 * app-supplied voice object, not from strings baked into the
 * panel (the DS ships no default strings). The stepper-name
 * pins are covered the same way: the decrease/increase
 * sentinels only reach the rendered output through the
 * stepper's accessible names. Nothing was deleted in this
 * conversion: a hard-coded literal would render instead of
 * the sentinel and fail the test.
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

test("RecipeOverviewPanel renders its stat labels from the voice object", async () => {
  const { h, RecipeOverviewPanel, fixtureVoice } = await loadRuntime();
  const sentinels = {
    servingsLabel: "SENT servings label",
    prepLabel: "SENT prep label",
    cookLabel: "SENT cook label",
  };
  const voice = sentinelVoice(fixtureVoice, "recipeOverviewPanel", sentinels);
  const html = await renderWithVoice(
    h(RecipeOverviewPanel, {
      title: "Caller recipe title",
      servingsLabel: "4",
      prepTimeLabel: "10 min",
      cookTimeLabel: "20 min",
      tags: [],
    }),
    voice,
  );
  for (const slot of ["servingsLabel", "prepLabel", "cookLabel"] as const) {
    assert.ok(html.includes(sentinels[slot]), `slot ${slot} renders from the voice object`);
  }
});

const ingredientsSentinels = {
  servingsLabel: "SENT servings label",
  scaleLabel: "SENT scale label",
  customScaleLabel: "SENT custom scale",
  customScaleAccessibilityLabel: "SENT custom scale name",
  decreaseServingsLabel: "SENT decrease servings",
  increaseServingsLabel: "SENT increase servings",
  missingIngredientsHint: "SENT missing hint",
  findingSubstitutionsLabel: "SENT finding substitutions",
  substitutionsTitle: "SENT substitutions title",
};

const ingredientsView = {
  servings: 2,
  onServingsChange: noop,
  scaleValue: "1",
  onScaleChange: noop,
  ingredients: [{ id: "flour", label: "Flour", isMissing: true }],
  onIngredientPress: noop,
  substitutions: [{ ingredient: "Flour", suggestions: "Rice flour" }],
};

test("RecipeIngredientsPanel renders its labels from the voice object", async () => {
  const { h, RecipeIngredientsPanel, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "recipeIngredientsPanel", ingredientsSentinels);
  const html = await renderWithVoice(
    h(RecipeIngredientsPanel, { ingredients: ingredientsView }),
    voice,
  );
  for (const slot of [
    "servingsLabel",
    "scaleLabel",
    "customScaleLabel",
    "customScaleAccessibilityLabel",
    "decreaseServingsLabel",
    "increaseServingsLabel",
    "missingIngredientsHint",
    "substitutionsTitle",
  ] as const) {
    assert.ok(
      html.includes(ingredientsSentinels[slot]),
      `slot ${slot} renders from the voice object`,
    );
  }
});

test("RecipeIngredientsPanel renders its substitutions status from the voice object", async () => {
  const { h, RecipeIngredientsPanel, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "recipeIngredientsPanel", ingredientsSentinels);
  const html = await renderWithVoice(
    h(RecipeIngredientsPanel, {
      ingredients: { ...ingredientsView, substitutions: undefined, loadingSubstitutions: true },
    }),
    voice,
  );
  assert.ok(
    html.includes(ingredientsSentinels.findingSubstitutionsLabel),
    "the finding-substitutions status renders from the voice object",
  );
});
