/**
 * Contract test for the RecipesPage shared configuration
 * (spudly/design-system#185).
 *
 * SharedWithMePage — the #49 sibling port of Eciperay's
 * Shared-with-me screen — is consolidated into RecipesPage:
 * one recipes-list page serves both screens. What was separate
 * about the shared screen, and must survive the consolidation,
 * is pinned here:
 * 1. SharedWithMePage is gone: no component file, no stories
 *    file, and no export from src/pages/index.ts — RecipesPage
 *    is the single recipes-list page.
 * 2. The empty-state copy is per-screen props (`emptyTitle` /
 *    `emptyBody`): the Recipes default is unchanged
 *    ("No recipes found.", no body), and the shared
 *    configuration's stories pass the app's shared-with-me
 *    message verbatim, both sentences.
 * 3. The shared configuration is press-only: its stories pass
 *    neither `onLogCookPress` nor `renderRecipeAccessory`, so
 *    shared rows render no log-cook control and no accessory —
 *    the #49 contract (in the app the press opens the recipe's
 *    permalink externally).
 * 4. The shared configuration leaves the collapsed filter bar
 *    uncontrolled (no `activeFilters` / `filterChooserOpen`
 *    props): the shared host adopts the bar with no new state,
 *    its added set seeded from non-default values.
 * 5. The stories render the shared configuration in the four
 *    states the SharedWithMePage stories carried (Default,
 *    Filtered, Empty, Loading) for Chromatic and Android VR.
 *
 * This is a source scan, not a render test, for the same reason
 * as test/recipesPageBoundedList.test.mjs: the failures it
 * guards happen in native layout, which no JS renderer in this
 * repo performs, and the invariant is a per-literal property of
 * the source. Comments are stripped before scanning so prose
 * cannot satisfy the patterns.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(here, "..", "src", "pages");
const source = readFileSync(join(pagesDir, "RecipesPage.tsx"), "utf8");
const stories = readFileSync(join(pagesDir, "RecipesPage.stories.tsx"), "utf8");
const index = readFileSync(join(pagesDir, "index.ts"), "utf8");

// Strip block and line comments so documented patterns in prose
// cannot pass the scan.
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

// The shared configuration's demo, scoped to its own function so
// the Recipes configuration's props cannot satisfy the checks.
const sharedStart = stories.indexOf("function SharedRecipesPageDemo");
assert.notEqual(sharedStart, -1, "SharedRecipesPageDemo function not found in the stories");
const sharedEnd = stories.indexOf("export const SharedDefault", sharedStart);
assert.notEqual(sharedEnd, -1, "SharedDefault story export not found after the shared demo");
const sharedDemo = stories.slice(sharedStart, sharedEnd);

test("SharedWithMePage is retired: no file, no stories, no export (#185)", () => {
  assert.ok(
    !existsSync(join(pagesDir, "SharedWithMePage.tsx")),
    "SharedWithMePage.tsx must not exist — RecipesPage is the single recipes-list page",
  );
  assert.ok(
    !existsSync(join(pagesDir, "SharedWithMePage.stories.tsx")),
    "SharedWithMePage.stories.tsx must not exist — its states live in RecipesPage.stories.tsx",
  );
  assert.ok(
    !index.includes("SharedWithMePage"),
    "src/pages/index.ts must not export SharedWithMePage (#185)",
  );
});

test("the empty state is per-screen copy props with the Recipes default unchanged", () => {
  assert.match(code, /emptyTitle\?: string;/, "RecipesPageProps must declare emptyTitle");
  assert.match(code, /emptyBody\?: string;/, "RecipesPageProps must declare emptyBody");
  assert.match(
    code,
    /emptyTitle = "No recipes found\."/,
    'the default empty title must stay the Recipes screen\'s "No recipes found."',
  );
  assert.match(
    code,
    /<EmptyState title=\{emptyTitle\}/,
    "the empty state must render the emptyTitle prop, not a hardcoded title",
  );
});

test("the shared configuration passes the app's shared-with-me empty message verbatim", () => {
  assert.ok(
    sharedDemo.includes('emptyTitle="Recipes others share with you will appear here."'),
    "the shared demo must pass the first sentence of the app's empty message as emptyTitle",
  );
  assert.ok(
    sharedDemo.includes(
      'emptyBody="Open a share link while signed in to save recipes to this list."',
    ),
    "the shared demo must pass the second sentence of the app's empty message as emptyBody",
  );
});

test("the shared configuration is press-only: no row actions, no accessory slot", () => {
  for (const banned of ["onLogCookPress", "renderRecipeAccessory"]) {
    assert.ok(
      !sharedDemo.includes(banned),
      `the shared demo must not pass ${banned} — shared rows are press-only (#49 contract)`,
    );
  }
  assert.match(
    sharedDemo,
    /onRecipePress=\{\(\) => undefined\}/,
    "the shared demo must still wire the row press",
  );
});

test("the shared configuration leaves the collapsed filter bar uncontrolled", () => {
  for (const prop of ["activeFilters", "filterChooserOpen"]) {
    assert.ok(
      !sharedDemo.includes(prop),
      `the shared demo must not pass ${prop} — the shared host adopts the bar uncontrolled`,
    );
  }
});

test("stories render the shared configuration in its four states", () => {
  for (const story of ["SharedDefault", "SharedFiltered", "SharedEmpty", "SharedLoading"]) {
    assert.ok(
      new RegExp(String.raw`export const ${story}\b`).test(stories),
      `RecipesPage.stories.tsx must export a ${story} story (the shared configuration's states)`,
    );
  }
});
