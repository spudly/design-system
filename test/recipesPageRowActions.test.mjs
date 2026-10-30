/**
 * RecipesPage row action contract: the rows carry a log-cook
 * control mirroring the app card's affordance — the recipe's
 * stars when it has a rating, a single unfilled star when it
 * does not — and no other row action. "Log cook" is a callback
 * only: the cook-log form and its mutation stay in the app (the
 * inline form arrives through the accessory slot; see
 * recipesPageAccessory.test.mjs). Deleting a recipe is a
 * RecipeDetailPage action, not a list action, so the list
 * exposes no delete callback at all.
 *
 * Since the #119 recipes-list tranche the control and the row
 * are RecipesPage's page-local RatingStars / MediaRow
 * compositions (bottom of the page file — Stephen's tranche
 * rule, 2026-10-29); the page composes the accessible names
 * and places the control in the row's subtitle flow via
 * MediaRow's subtitleAction slot.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(here, "..", "src", "pages", "RecipesPage.tsx"), "utf8")
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
// The page-local compositions live at the bottom of the page
// file; slice them out so page-level code cannot satisfy the
// composition pins.
const mediaRow = code.slice(code.indexOf("const textBlockStyle"), code.indexOf("const STAR_STEPS"));
const ratingStars = code.slice(code.indexOf("const STAR_STEPS"));
const stories = readFileSync(join(here, "..", "src", "pages", "RecipesPage.stories.tsx"), "utf8");

test("the log-cook callback is optional and keyed by recipe id", () => {
  assert.match(code, /onLogCookPress\?: \(recipeId: string\) => void;/);
  assert.match(code, /onLogCookPress\(item\.id\)/);
});

test("there is no delete affordance on the list", () => {
  assert.ok(!code.includes("onDelete"), "RecipesPage must not expose a delete callback");
  assert.ok(!code.includes("Delete"), "RecipesPage rows render no delete control");
});

test("rows place the RatingStars control in the subtitle flow, rated names carrying the rating", () => {
  const dollar = String.raw`\$`;
  assert.match(code, /<RatingStars/);
  assert.match(
    code,
    new RegExp(
      `\`Log a cook of ${dollar}{item\\.title}, rated ${dollar}{item\\.rating} out of 5 stars\``,
    ),
    "the rated control's name must carry the rating — the stars alone would mislead a screen reader",
  );
  assert.match(
    code,
    new RegExp(`\`Log a cook of ${dollar}{item\\.title}\``),
    "the unrated control's name is just the action and the title",
  );
  assert.match(
    code,
    /subtitleAction=\{/,
    "the control renders through MediaRow's subtitleAction slot",
  );
  assert.match(
    mediaRow,
    /flexWrap="wrap"\s+alignItems="center"\s+gap="\$1"\s+paddingTop="\$1"/,
    "MediaRow's subtitle flow is a wrapping inline row — the action sits in the subtitle's flow",
  );
  assert.match(mediaRow, /\{subtitleAction\}/);
});

test("RatingStars fills by rounding, in the DS star colors", () => {
  assert.match(
    ratingStars,
    /Math\.min\(5, Math\.max\(1, Math\.round\(rating\)\)\)/,
    "display averages fill by rounding to whole stars, clamped to 1–5",
  );
  assert.match(ratingStars, /tokens\.colors\.warning\.warning6/);
  assert.match(ratingStars, /tokens\.colors\.gray\.gray4/);
  assert.equal(
    ratingStars.split("★").length - 1,
    2,
    "two glyph literals: the star row's and the unrated button's single star",
  );
});

test("the pressable form cancels the click default before firing (the row's links must not also navigate)", () => {
  assert.match(ratingStars, /event\.preventDefault\(\);\s*onPress\(\);/);
  assert.match(ratingStars, /accessibilityRole: "button"/);
  assert.match(
    ratingStars,
    /if \(!props\.onPress\) \{\s*return <RatingStarRow rating=\{props\.rating\} \/>;/,
    "without onPress the stars are a static display, never a button",
  );
});

test("the stories exercise the control across rated and unrated rows", () => {
  assert.match(stories, /onLogCookPress/);
  assert.match(stories, /rating: 5/);
  assert.match(stories, /rating: 4\.5/);
  assert.match(
    stories,
    /unrated rows \(Arroz con Pollo, Beef Chili\)/,
    "the fixture's unrated rows (rating omitted) render the icon-only button",
  );
});
