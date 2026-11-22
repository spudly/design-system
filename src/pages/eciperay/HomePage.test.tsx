/**
 * Contract test for HomePage's shared recipe rows (#657).
 *
 * Stephen's requirement (2026-11-15): Home's recently-viewed
 * cards are the exact same rows RecipesPage renders — the shared
 * RecipeRow composition (recipeRow.tsx) — with the star rating
 * as the log-cook control (Stephen's 2026-10-24 ruling: Delete
 * removed from list rows, no "Log cook" text button). The
 * `renderRecipeRow` slot is removed; the host supplies item
 * data, hrefs, and `onLogCookPress` only.
 *
 * Source scans pin the contract literals; the SSR tests render
 * the built page and pin what a row actually shows.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const pagesDir = join(root, "src", "pages", "eciperay");

function readCode(path: string) {
  return readFileSync(path, "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const homeSource = readCode(join(pagesDir, "HomePage.tsx"));
const rowSource = readCode(join(root, "src", "pages", "shared", "recipeRow.tsx"));
const recipesSource = readCode(join(pagesDir, "RecipesPage.tsx"));

test("HomePage renders the shared row; the render slot is gone (#657)", () => {
  assert.match(homeSource, /<RecipeRow key=\{recipe\.id\} item=\{recipe\}/);
  assert.doesNotMatch(homeSource, /renderRecipeRow/);
  assert.match(homeSource, /export type HomePageRecipe = RecipeRowItem/);
  assert.match(homeSource, /onLogCookPress\?: \(recipeId: string\) => void/);
});

test("RecipesPage renders the same shared row (#657 extraction is shared, not copied)", () => {
  assert.match(recipesSource, /<RecipeRow item=\{item\} onLogCookPress=\{onLogCookPress\}/);
  assert.match(recipesSource, /export type RecipesPageItem = RecipeRowItem/);
  assert.doesNotMatch(recipesSource, /function MediaRow|function RatingStars/);
});

test("the shared row wires the stars to onLogCookPress with the item id (#657)", () => {
  assert.match(rowSource, /onLogCookPress\(item\.id\)/);
  assert.match(
    rowSource,
    /Log a cook of \$\{item\.title\}, rated \$\{item\.rating\} out of 5 stars/,
  );
  assert.match(rowSource, /item\.canLogCook !== false/);
});

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const React = (await import("react")).default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const voiceModule: Record<string, any> = await import("../../../dist/voice/index.js");
    const voiceFixtures: Record<string, any> = await import("../../../dist/voice/fixtures.js");
    const pages: Record<string, any> = await import("../../../dist/pages/eciperay/HomePage.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      ...voiceModule,
      ...voiceFixtures,
      ...pages,
    };
  })();
  return runtimePromise;
}

async function renderHome(props: Record<string, any>) {
  const {
    React,
    renderToString,
    TamaguiProvider,
    createTamaguiConfig,
    baseTheme,
    VoiceProvider,
    fixtureVoice,
    HomePage,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(
      TamaguiProvider,
      { config },
      React.createElement(
        VoiceProvider,
        { voice: fixtureVoice },
        React.createElement(HomePage, {
          title: "Home",
          subtitle: "Welcome back",
          browseLabel: "Browse recipes",
          addLabel: "Add a recipe",
          sharedWithMeLabel: "Shared with me",
          recipesTitle: "Recently viewed",
          emptyMessage: "Nothing here yet",
          browseHref: "/recipes",
          addHref: "/recipes/new",
          sharedWithMeHref: "/shared-with-me",
          ...props,
        }),
      ),
    ),
  );
}

const RECIPES = [
  {
    id: "r1",
    href: "/recipes/r1",
    title: "Tuscan Chicken",
    subtitle: "4 servings · 45 min",
    rating: 4,
  },
  { id: "r2", href: "/recipes/r2", title: "Fudgy Brownies", subtitle: "12 servings · 35 min" },
];

test("SSR: rows render title, subtitle and rating from the items (#657)", async () => {
  const html = await renderHome({ recipes: RECIPES, onLogCookPress: () => {} });
  assert.ok(html.includes("Tuscan Chicken"), "rated row title renders");
  assert.ok(html.includes("4 servings · 45 min"), "rated row subtitle renders");
  assert.ok(html.includes("Fudgy Brownies"), "unrated row title renders");
  assert.ok(
    html.includes("Log a cook of Tuscan Chicken, rated 4 out of 5 stars"),
    "the rated row's stars carry the log-cook label",
  );
  assert.ok(
    html.includes("Log a cook of Fudgy Brownies"),
    "the unrated row's icon-only star carries the log-cook label",
  );
});

test("SSR: no Delete and no Log cook text button exists in the rows (#657)", async () => {
  const html = await renderHome({ recipes: RECIPES, onLogCookPress: () => {} });
  assert.doesNotMatch(html, />Delete</);
  assert.doesNotMatch(html, />Log cook</);
});

test("SSR: omitting onLogCookPress renders no log-cook control (#657)", async () => {
  const html = await renderHome({ recipes: RECIPES });
  assert.ok(html.includes("Tuscan Chicken"), "rows still render as links");
  assert.doesNotMatch(html, /Log a cook of/);
});
