/**
 * Voice-slot pins for the recipe panels (#539 tranche 1e):
 * RecipeOverviewPanel's stat band labels and
 * RecipeIngredientsPanel's servings/scale labels, stepper
 * accessible names, missing-ingredients hint, substitutions
 * status and title come from the app-supplied voice object —
 * the DS ships no default strings.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const overview = strip(readFileSync(join(here, "RecipeOverviewPanel.tsx"), "utf8"));
const ingredients = strip(readFileSync(join(here, "RecipeIngredientsPanel.tsx"), "utf8"));

test("RecipeOverviewPanel reads its stat labels from the voice object", () => {
  assert.match(overview, /useVoice\(\)/);
  assert.match(overview, /voice\.recipeOverviewPanel\.servingsLabel/);
  assert.match(overview, /voice\.recipeOverviewPanel\.prepLabel/);
  assert.match(overview, /voice\.recipeOverviewPanel\.cookLabel/);
  assert.doesNotMatch(overview, /label="Servings"|label="Prep"|label="Cook"/);
});

test("RecipeIngredientsPanel reads its labels from the voice object", () => {
  assert.match(ingredients, /useVoice\(\)/);
  for (const slot of [
    "servingsLabel",
    "scaleLabel",
    "customScaleLabel",
    "customScaleAccessibilityLabel",
    "decreaseServingsLabel",
    "increaseServingsLabel",
    "missingIngredientsHint",
    "findingSubstitutionsLabel",
    "substitutionsTitle",
  ]) {
    assert.match(ingredients, new RegExp(`panelVoice\\.${slot}`), `slot ${slot} is read`);
  }
  // The loaded stepper must receive the voice names too — without
  // the overrides it generates `Decrease ${label}` from the label.
  assert.match(
    ingredients,
    /decreaseAccessibilityLabel=\{panelVoice\.decreaseServingsLabel\}/,
    "the loaded stepper's decrease button uses the voice name",
  );
  assert.match(
    ingredients,
    /increaseAccessibilityLabel=\{panelVoice\.increaseServingsLabel\}/,
    "the loaded stepper's increase button uses the voice name",
  );
  assert.doesNotMatch(ingredients, /label="Servings"|label="Scale"|title="Substitutions"/);
  assert.doesNotMatch(ingredients, /"Custom scale"|"Decrease Servings"|"Increase Servings"/);
  assert.doesNotMatch(ingredients, /Tap an ingredient to mark it missing/);
});
