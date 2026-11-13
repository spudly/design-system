/**
 * Voice-slot pins for the remaining recipe and form views
 * (#539 tranche 2d): RecipeCommentsView's and
 * RecipeSharingView's prop defaults, NutritionGoalsForm's
 * section title, field labels, placeholder, and save action,
 * and RatingForm's prop defaults plus its save action come
 * from the app-supplied voice object — the DS ships no
 * default strings. Caller-passed props still win over the
 * voice defaults. NutritionGoalsForm and the save action of
 * RatingForm have no label props for that copy, so it reads
 * the voice slots directly.
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

test("RecipeCommentsView reads its defaults from the voice object", () => {
  const view = read("RecipeCommentsView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["title", "emptyMessage", "composerLabel", "composerPlaceholder", "postLabel"]) {
    assert.match(view, new RegExp(`voice\\.recipeCommentsView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Comments"|"No comments yet"|"Add a comment"|"Share how it turned out…"|"Post comment"/,
  );
});

test("RecipeSharingView reads its defaults from the voice object", () => {
  const view = read("RecipeSharingView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "title",
    "consentLabel",
    "saveLabel",
    "savePendingLabel",
    "shareLinkLabel",
    "rotateShareLinkLabel",
    "copyShareLinkLabel",
    "permalinkLabel",
    "copyPermalinkLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.recipeSharingView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Sharing"|"Publishing consent"|"Save visibility"|"Saving…"|"Anyone with this link can view this recipe\."|"Generate share link"|"Copy share link"|"Public link"|"Copy public link"/,
  );
});

test("NutritionGoalsForm reads its copy from the voice object", () => {
  const view = read("NutritionGoalsForm");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "title",
    "caloriesLabel",
    "proteinLabel",
    "carbsLabel",
    "fatLabel",
    "satietyScoreLabel",
    "optionalPlaceholder",
    "saveLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.nutritionGoalsForm\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Daily nutrition goals"|"Calories"|"Protein \(g\)"|"Carbs \(g\)"|"Fat \(g\)"|"Satiety score"|"Optional"|>\s*Save goals\s*</,
  );
});

test("RatingForm reads its defaults and save action from the voice object", () => {
  const view = read("RatingForm");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["title", "notesPlaceholder", "secondaryLabel", "saveLabel"]) {
    assert.match(view, new RegExp(`voice\\.ratingForm\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(view, /"How did it go\?"|"Notes \(optional\)"|"Skip"|"Save"/);
});
