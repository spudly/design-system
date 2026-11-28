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
 * Converted from source scans to runtime checks in #733
 * tranche 6b: the shared RecipeRow is called directly and its
 * element tree inspected (the MediaRow it composes and the
 * RatingStars log-cook control it wires), HomePage's own tree
 * is checked for RecipeRow elements carrying the host's items
 * and callback, and the SSR tests render the built page and
 * pin what a row actually shows. The former type-alias pins
 * (HomePageRecipe / RecipesPageItem) were deleted: prop shape
 * is enforced by the TypeScript build (Stephen, 2026-11-20).
 * RecipesPage rendering this same row component is pinned by
 * RecipesPage's own contract tests.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";

// Collect, in document order, every element in a tree whose
// type is the given component.
function findAllByType(node: any, type: any, out: any[] = []): any[] {
  if (node === null || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    for (const child of node) findAllByType(child, type, out);
    return out;
  }
  if (node.type === type) out.push(node);
  findAllByType(node.props?.children, type, out);
  return out;
}

async function loadRow() {
  const runtime = await loadRuntime();
  const rowModule: Record<string, any> = await import("../../../dist/pages/shared/recipeRow.js");
  const mediaRow: Record<string, any> = await import("../../../dist/widgets/data/MediaRow.js");
  const formWidgets: Record<string, any> =
    await import("../../../dist/widgets/form/RatingStars.js");
  return {
    ...runtime,
    RecipeRow: rowModule.RecipeRow,
    MediaRow: mediaRow.MediaRow,
    RatingStars: formWidgets.RatingStars,
  };
}

test("HomePage renders the shared RecipeRow for each recipe, forwarding items and the log-cook callback (#657)", async () => {
  const { HomePage, RecipeRow } = await loadRow();
  const onLogCookPress = () => { /* noop */ };
  const tree = HomePage({
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
    recipes: RECIPES,
    onLogCookPress,
  });
  const rows = findAllByType(tree, RecipeRow);
  assert.equal(rows.length, RECIPES.length, "one shared row per recipe — no render slot remains");
  assert.deepEqual(
    rows.map((r: any) => r.props.item),
    RECIPES,
    "the host's item data crosses unchanged",
  );
  for (const row of rows) {
    assert.equal(row.props.onLogCookPress, onLogCookPress, "the host's log-cook callback crosses");
  }
});

test("the shared row wires the stars to onLogCookPress with the item id (#657)", async () => {
  const { RecipeRow, MediaRow, RatingStars } = await loadRow();
  const logged: string[] = [];
  const tree = RecipeRow({
    item: RECIPES[0],
    onLogCookPress: (id: string) => logged.push(id),
  });
  assert.equal(tree.type, MediaRow, "the row composes the shared MediaRow");
  assert.equal(tree.props.href, "/recipes/r1");
  assert.equal(tree.props.title, "Tuscan Chicken");
  const stars = tree.props.subtitleAction;
  assert.equal(stars.type, RatingStars, "the log-cook control is the RatingStars composition");
  assert.equal(
    stars.props.accessibilityLabel,
    "Log a cook of Tuscan Chicken, rated 4 out of 5 stars",
  );
  stars.props.onPress();
  assert.deepEqual(logged, ["r1"], "pressing the stars logs a cook for the item's id");
  const unrated = RecipeRow({ item: RECIPES[1], onLogCookPress: () => { /* noop */ } });
  assert.equal(
    unrated.props.subtitleAction.props.accessibilityLabel,
    "Log a cook of Fudgy Brownies",
    "an unrated recipe's icon-only star carries the plain log-cook label",
  );
});

test("the shared row renders no log-cook control when the host omits the callback or the item cannot log cooks (#657)", async () => {
  const { RecipeRow } = await loadRow();
  assert.equal(
    RecipeRow({ item: RECIPES[0] }).props.subtitleAction,
    undefined,
    "no callback — no control",
  );
  assert.equal(
    RecipeRow({ item: { ...RECIPES[0], canLogCook: false }, onLogCookPress: () => { /* noop */ } }).props
      .subtitleAction,
    undefined,
    "canLogCook false — no control",
  );
});

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
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
  const html = await renderHome({ recipes: RECIPES, onLogCookPress: () => { /* noop */ } });
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
  const html = await renderHome({ recipes: RECIPES, onLogCookPress: () => { /* noop */ } });
  assert.doesNotMatch(html, />Delete</);
  assert.doesNotMatch(html, />Log cook</);
});

test("SSR: omitting onLogCookPress renders no log-cook control (#657)", async () => {
  const html = await renderHome({ recipes: RECIPES });
  assert.ok(html.includes("Tuscan Chicken"), "rows still render as links");
  assert.doesNotMatch(html, /Log a cook of/);
});
