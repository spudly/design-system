/**
 * Coverage test for the full-page demo stories (design-system#44).
 *
 * The eight page stories are the page-level visual spec: Chromatic
 * screenshots them on every PR, which is the layer that catches
 * page-composition and web-rendering failures at whole-screen scale.
 * (Not spudly/eciperay#162 itself: its root cause was a native-only
 * SearchField glyph defect that rendered correctly on web — the
 * on-device coverage in #43 is what guards that class.) If a page story is deleted or
 * renamed, that coverage silently disappears, so this test pins the
 * set: both story files, all eight exports, the per-app theme each
 * file pins, and the fixture rules (static data only — no network, no
 * clocks — so screenshots stay deterministic).
 *
 * This is a source scan, not a render test, for the same reason as
 * test/glyphLineHeight.test.mjs: the invariant is a per-file
 * property of the source, and no JS renderer in this repo performs
 * the screenshot comparison (Chromatic does, in CI).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const pagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "pages");

function readPageFile(name) {
  try {
    return readFileSync(join(pagesDir, name), "utf8");
  } catch {
    return null;
  }
}

const expected = [
  {
    file: "EciperayPages.stories.tsx",
    title: "Pages/Eciperay",
    theme: "light_warmHarvest",
    stories: ["RecipesBrowse", "RecipeDetail", "MealPlans", "SharedWithMe"],
  },
  {
    file: "MemorizePages.stories.tsx",
    title: "Pages/Memorize",
    theme: "light_quietDawn",
    stories: ["HomeVerseSearch", "PassageView", "MemorizationSession", "Progress"],
  },
];

test("all eight full-page demo stories exist, in the correct theme per app", () => {
  for (const { file, title, theme, stories } of expected) {
    const text = readPageFile(file);
    assert.ok(text, `src/pages/${file} not found — the #44 page stories are missing`);
    assert.ok(
      text.includes(`title: "${title}"`),
      `src/pages/${file} must declare title "${title}"`,
    );
    assert.ok(
      text.includes(`theme: "${theme}"`),
      `src/pages/${file} must pin the ${theme} Storybook theme (the app's brand theme)`,
    );
    for (const story of stories) {
      assert.ok(
        new RegExp(String.raw`export const ${story}\b`).test(text),
        `src/pages/${file} is missing the ${story} page story (#44 acceptance: eight screens)`,
      );
    }
  }
});

test("the Recipes page story composes the filter bar above the list (#162 sanity)", () => {
  const text = readPageFile("EciperayPages.stories.tsx");
  assert.ok(text, "src/pages/EciperayPages.stories.tsx not found");
  // Scope every check to the RecipesBrowseDemo function itself — a
  // file-wide match could be satisfied by an import or a type in
  // RecipeCard while the demo's own list JSX was deleted (Copilot
  // finding on PR #48). The demo function runs from its declaration
  // to the story export that follows it.
  const start = text.indexOf("function RecipesBrowseDemo");
  assert.notEqual(start, -1, "RecipesBrowseDemo function not found");
  const end = text.indexOf("export const RecipesBrowse", start);
  assert.notEqual(end, -1, "RecipesBrowse story export not found after the demo function");
  const demo = text.slice(start, end);
  // This is the composition of the screen #162 broke: the real filter
  // bar (SearchField + the status/sort SelectFields) rendered above
  // the recipe list. Each control must be present, and the list
  // render must come after the filter bar.
  const searchAt = demo.indexOf("<SearchField");
  assert.notEqual(searchAt, -1, "RecipesBrowseDemo must render the real SearchField (#162)");
  assert.ok(
    demo.includes("<SelectField"),
    "RecipesBrowseDemo must render the filter bar's SelectFields (status / sort), mirroring RecipeListFiltersBar",
  );
  const listAt = demo.indexOf("recipeFixtures.map");
  assert.notEqual(
    listAt,
    -1,
    "RecipesBrowseDemo must render the recipe list from recipeFixtures.map — the list JSX is the composition under test",
  );
  assert.ok(
    searchAt < listAt,
    "RecipesBrowseDemo must render the filter bar above the recipe list (the #162 composition)",
  );
});

test("page fixtures are static: no network, no clocks, no external images", () => {
  const text = readPageFile("fixtures.ts");
  assert.ok(text, "src/pages/fixtures.ts not found");
  for (const banned of ["fetch(", "http://", "https://", "Date.now", "new Date("]) {
    assert.ok(
      !text.includes(banned),
      `fixtures.ts must not contain "${banned}" — page screenshots must be deterministic (#44)`,
    );
  }
});
