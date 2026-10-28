/**
 * Coverage test for the full-page demo stories (design-system#44).
 *
 * The six page demo stories are the page-level visual spec: Chromatic
 * screenshots them on every PR, which is the layer that catches
 * page-composition and web-rendering failures at whole-screen scale.
 * (Not spudly/eciperay#162 itself: its root cause was a native-only
 * SearchField glyph defect that rendered correctly on web — the
 * on-device coverage in #43 is what guards that class.) If a page story is deleted or
 * renamed, that coverage silently disappears, so this test pins the
 * set: both story files, all six exports, the per-app theme each
 * file pins, and the fixture rules (static data only — no network, no
 * clocks — so screenshots stay deterministic).
 *
 * The set was eight until #185 retired the RecipesBrowse and
 * SharedWithMe demos: the app rewired onto the real RecipesPage
 * component, whose own stories (including the Shared* stories for
 * the Shared-with-me configuration) carry those screens now, and
 * the #162 filter-bar-above-the-list composition is guarded on the
 * real component by the recipesPage* contract tests. The last test
 * below pins the retirement so the demos cannot quietly return.
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
    stories: ["RecipeDetail", "MealPlans"],
  },
  {
    file: "MemorizePages.stories.tsx",
    title: "Pages/Memorize",
    theme: "light_quietDawn",
    stories: ["HomeVerseSearch", "PassageView", "MemorizationSession", "Progress"],
  },
];

test("all six full-page demo stories exist, in the correct theme per app", () => {
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
        `src/pages/${file} is missing the ${story} page story (#44 acceptance: the demo screens)`,
      );
    }
  }
});

test("the retired RecipesBrowse and SharedWithMe demos stay retired (#185)", () => {
  const text = readPageFile("EciperayPages.stories.tsx");
  assert.ok(text, "src/pages/EciperayPages.stories.tsx not found");
  for (const retired of ["RecipesBrowse", "SharedWithMe"]) {
    assert.ok(
      !new RegExp(String.raw`export const ${retired}\b`).test(text),
      `the ${retired} demo must not return — the RecipesPage stories are that screen's spec since #185`,
    );
  }
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
