/**
 * Contract test for the RecipesPage row actions rework (Stephen's
 * direction, 2026-10-24, after the narrow-viewport captures of
 * eciperay #205 still showed the expanded row crowding).
 *
 * The row used to carry two text buttons, "Log cook" and "Delete".
 * They were the row's inflexible width, and Delete duplicated an
 * action that belongs on the details page. The rework:
 * 1. Delete is gone from the page entirely — no `onRecipeDelete`
 *    prop, no row delete control. (RecipeDetailPage keeps its own
 *    `onDeletePress` chip; that contract is untouched.)
 * 2. The recipe's rating is the log-cook control: the view model
 *    carries `rating`, a rated recipe renders five stars and
 *    pressing them fires the row's `onLogCookPress` — the same
 *    callback, with the same accessory-hides-the-control semantics
 *    (pinned by test/recipes-page-accessory.test.mjs).
 * 3. An unrated recipe renders a single icon-only button — one
 *    unfilled star, no text — firing the same callback.
 * 4. Both states are real buttons with an accessible name that
 *    says the action ("Log a cook of …"), because the stars alone
 *    would announce as a rating.
 * 5. The stories exercise both states, so the Chromatic / Android
 *    VR captures show stars rows and icon-button rows.
 *
 * This is a source scan, not a render test, for the same reason as
 * the other RecipesPage tests: the repo has no JS renderer for
 * these components (CI screenshots are the render check), and the
 * invariants are per-literal properties of the source. Comments
 * are stripped before scanning so prose cannot satisfy the
 * patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

test("no delete exists anywhere in the page contract", () => {
  assert.ok(
    !code.includes("onRecipeDelete"),
    "RecipesPageProps must not declare an onRecipeDelete callback",
  );
  assert.ok(!code.includes("onDeletePress"), "RecipeRow must not take a delete press handler");
  assert.ok(!code.includes("Delete"), "no Delete control or label may remain in RecipesPage");
  assert.ok(
    !stories.includes("onRecipeDelete"),
    "the stories must not pass a delete callback that no longer exists",
  );
});

test("the view model carries the display rating separately from the subtitle", () => {
  assert.match(
    code,
    /rating\?: number \| null;/,
    "RecipesPageItem must declare rating?: number | null",
  );
});

test("a rated recipe's stars are the log-cook button", () => {
  assert.match(
    code,
    /rating !== null && rating !== undefined && rating > 0/,
    "the rated branch must key on a present, positive rating",
  );
  assert.match(
    code,
    /accessibilityLabel=\{`Log a cook of \$\{item\.title\}, rated \$\{rating\} out of 5 stars`\}/,
    "the stars pressable's label must name the log-cook action, the recipe, and the exact rating",
  );
  // Filled stars follow the DS star language: warning amber when
  // filled, gray when not, filled count rounding the display
  // rating to the nearest whole star.
  assert.match(code, /Math\.min\(5, Math\.max\(1, Math\.round\(rating\)\)\)/);
  assert.match(code, /tokens\.colors\.warning\.warning6/);
  assert.match(code, /tokens\.colors\.gray\.gray4/);
});

test("an unrated recipe gets a single icon-only button with no text", () => {
  assert.match(
    code,
    /accessibilityLabel=\{`Log a cook of \$\{item\.title\}`\}/,
    "the icon button's label must name the log-cook action and the recipe",
  );
  // No text button survives: neither the old "Log cook" button nor
  // any Button element in the row's trailing control.
  assert.ok(!/>\s*Log cook\s*</.test(code), "the text Log cook button must be gone");
  const controlAt = code.indexOf("function LogCookControl");
  const rowAt = code.indexOf("function RecipeRow");
  assert.ok(controlAt >= 0 && rowAt > controlAt, "LogCookControl must be defined before RecipeRow");
  const control = code.slice(controlAt, rowAt);
  assert.ok(
    !control.includes("<Button"),
    "the log-cook control must be pressable star/icon content, not a text Button",
  );
  assert.equal(
    code.split("★").length - 1,
    2,
    "exactly two star glyph templates exist in the page: the rating row's glyph (mapped over five steps) and the unrated button's single star",
  );
});

test("both control states fire the row's log-cook callback", () => {
  const controlAt = code.indexOf("function LogCookControl");
  const rowAt = code.indexOf("function RecipeRow");
  const control = code.slice(controlAt, rowAt);
  assert.equal(
    control.split("onPress={onLogCookPress}").length - 1,
    2,
    "the stars pressable and the icon button must each wire onPress to onLogCookPress",
  );
  assert.equal(
    control.split('accessibilityRole="button"').length - 1,
    2,
    "both control states must declare the button role",
  );
  assert.match(
    code,
    /<LogCookControl item=\{item\} onLogCookPress=\{onLogCookPress\} \/>/,
    "RecipeRow must render the control with the row's item and callback",
  );
});

test("the stories exercise rated and unrated rows", () => {
  assert.ok(
    (stories.match(/rating: \d/g) ?? []).length >= 3,
    "several fixture recipes must carry a rating so star rows render in captures",
  );
  assert.match(
    stories,
    /id: "arroz-con-pollo", title: "Arroz con Pollo", subtitle: "[^"]*" \}/,
    "at least one fixture recipe (Arroz con Pollo) must stay unrated so the icon-only button renders in captures",
  );
});
