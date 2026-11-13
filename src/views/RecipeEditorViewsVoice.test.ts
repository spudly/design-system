/**
 * Voice-slot pins for the recipe-editor views (#539 tranche 2a):
 * RecipeImageView's label / empty-message defaults and its own
 * chrome, the ingredient and instruction lists' label /
 * empty-message / add defaults and add-action names, and the
 * rows' position-built accessible names come from the
 * app-supplied voice object — the DS ships no default strings.
 * ScaledIngredientsView is pinned as the exception: its heading
 * and lines are caller-composed, so it reads no voice slots.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const read = (name: string) => strip(readFileSync(join(here, `${name}.tsx`), "utf8"));

test("RecipeImageView reads its defaults and chrome from the voice object", () => {
  const view = read("RecipeImageView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "label",
    "emptyMessage",
    "previewLabel",
    "browseLabel",
    "uploadingLabel",
    "takePhotoLabel",
    "generateLabel",
    "generatingLabel",
    "generateAccessibilityLabel",
    "removeLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.recipeImageView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Recipe image"|"Choose an image from your library or generate one with AI"|"Recipe preview"|"Browse images"|"Uploading…"|"Take photo"|"Generate with AI"|"Generating…"|"Generate image with AI"|"Remove image"/,
  );
});

test("RecipeIngredientListView reads its defaults and add-action name from the voice object", () => {
  const list = read("RecipeIngredientListView");
  assert.match(list, /useVoice\(\)/);
  for (const slot of ["label", "emptyMessage", "addLabel", "addIngredientLabel"]) {
    assert.match(
      list,
      new RegExp(`voice\\.recipeIngredientListView\\.${slot}`),
      `slot ${slot} is read`,
    );
  }
  assert.doesNotMatch(list, /"Ingredients"|"No ingredients yet"|"\+ Add"|"Add ingredient"/);
});

test("RecipeIngredientRowView builds its field and remove names through the voice formatters", () => {
  const row = read("RecipeIngredientRowView");
  assert.match(row, /useVoice\(\)/);
  for (const slot of ["quantityPlaceholder", "unitPlaceholder", "namePlaceholder", "removeLabel"]) {
    assert.match(
      row,
      new RegExp(`voice\\.recipeIngredientRowView\\.${slot}`),
      `slot ${slot} is read`,
    );
  }
  for (const formatter of ["quantityLabel", "unitLabel", "nameLabel", "removeIngredientLabel"]) {
    assert.match(
      row,
      new RegExp(`voice\\.recipeIngredientRowView\\.${formatter}\\(position\\)`),
      `formatter ${formatter} is called with the position`,
    );
  }
  assert.doesNotMatch(
    row,
    /`Ingredient \$\{position\} (quantity|unit|name)`|`Remove ingredient \$\{position\}`|"Qty"|"Unit"|"Name"|>\s*Remove\s*</,
  );
});

test("RecipeInstructionListView reads its defaults and add-action name from the voice object", () => {
  const list = read("RecipeInstructionListView");
  assert.match(list, /useVoice\(\)/);
  for (const slot of ["label", "emptyMessage", "addLabel", "addInstructionLabel"]) {
    assert.match(
      list,
      new RegExp(`voice\\.recipeInstructionListView\\.${slot}`),
      `slot ${slot} is read`,
    );
  }
  assert.doesNotMatch(list, /"Instructions"|"No instructions yet"|"\+ Add"|"Add instruction"/);
});

test("RecipeInstructionRowView builds its step and remove names through the voice formatters", () => {
  const row = read("RecipeInstructionRowView");
  assert.match(row, /useVoice\(\)/);
  assert.match(row, /voice\.recipeInstructionRowView\.stepLabel\(position\)/);
  assert.match(row, /voice\.recipeInstructionRowView\.removeStepLabel\(position\)/);
  assert.match(row, /voice\.recipeInstructionRowView\.removeLabel/);
  assert.doesNotMatch(row, /`Step \$\{position\}`|`Remove step \$\{position\}`|>\s*Remove\s*</);
});

test("the en-XA fixture voice pseudo-localizes formatter results, not just plain strings", () => {
  const fixtures = readFileSync(join(here, "../voice/fixtures.ts"), "utf8");
  assert.match(fixtures, /typeof node === "function"/);
  assert.match(fixtures, /pseudoLocalize\(result\)/);
});

test("ScaledIngredientsView reads no voice slots — its heading and lines are caller-composed", () => {
  const view = read("ScaledIngredientsView");
  assert.doesNotMatch(view, /useVoice/);
  assert.match(view, /heading: string/);
  assert.match(view, /lines: string\[\]/);
});
