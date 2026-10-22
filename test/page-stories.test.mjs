/**
 * Coverage test for the full-page demo stories (design-system#44).
 *
 * The eight page stories are the page-level visual spec: Chromatic
 * screenshots them on every PR, which is the only layer that can catch
 * a page-composition failure like spudly/eciperay#162 (the Recipes
 * screen rendering as one giant empty box — every individual component
 * was fine; the composition was not). If a page story is deleted or
 * renamed, that coverage silently disappears, so this test pins the
 * set: both story files, all eight exports, the per-app theme each
 * file pins, and the fixture rules (static data only — no network, no
 * clocks — so screenshots stay deterministic).
 *
 * This is a source scan, not a render test, for the same reason as
 * test/glyph-line-height.test.mjs: the invariant is a per-file
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
        new RegExp(`export const ${story}\\b`).test(text),
        `src/pages/${file} is missing the ${story} page story (#44 acceptance: eight screens)`,
      );
    }
  }
});

test("the Recipes page story composes the SearchField filter bar above the list (#162 sanity)", () => {
  const text = readPageFile("EciperayPages.stories.tsx");
  assert.ok(text, "src/pages/EciperayPages.stories.tsx not found");
  // The #162 failure mode lives in this composition: if the page story
  // stopped rendering the real SearchField, a glyph/layout explosion
  // like #162 could pass the page screenshot again.
  assert.ok(
    text.includes("<SearchField"),
    "RecipesBrowse must render the real SearchField — the #162 regression surface",
  );
  assert.ok(
    text.includes("recipeFixtures"),
    "RecipesBrowse must render the fixture recipe list below the filter bar",
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
