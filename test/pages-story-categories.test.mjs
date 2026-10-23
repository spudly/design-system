/**
 * Contract test for spudly/design-system#70: the Pages stories are
 * organized under exactly two top-level page categories, Eciperay
 * and Memorize, with every page story nested under the app it
 * belongs to.
 *
 * The contract:
 * 1. Each real page story (#49) declares its categorized title:
 *    `Pages/Eciperay/<Page>` for the five Eciperay pages,
 *    `Pages/Memorize/<Page>` for the four Memorize pages.
 * 2. No page story file declares a flat `Pages/<Page>` title — the
 *    pre-#70 single mixed level must not come back.
 * 3. The two #44 demo collections keep their `Pages/Eciperay` /
 *    `Pages/Memorize` titles: they are the category collections,
 *    and page-stories.test.mjs pins their story sets separately.
 *
 * Component (non-page) stories are out of scope — #70 is only
 * about the page stories' titles.
 *
 * Source scan, like the other story contract tests: the invariant
 * is a per-file property of the source, and Chromatic consumes the
 * resulting story ids in CI.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const pagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "pages");

const categorized = [
  ["RecipesPage.stories.tsx", "Pages/Eciperay/RecipesPage"],
  ["SharedWithMePage.stories.tsx", "Pages/Eciperay/SharedWithMePage"],
  ["RecipeDetailPage.stories.tsx", "Pages/Eciperay/RecipeDetailPage"],
  ["MealPlansPage.stories.tsx", "Pages/Eciperay/MealPlansPage"],
  ["MealPlanDetailPage.stories.tsx", "Pages/Eciperay/MealPlanDetailPage"],
  ["MyVersesPage.stories.tsx", "Pages/Memorize/MyVersesPage"],
  ["VerseSearchPage.stories.tsx", "Pages/Memorize/VerseSearchPage"],
  ["MemorizationSessionPage.stories.tsx", "Pages/Memorize/MemorizationSessionPage"],
  ["MemorizeReviewPage.stories.tsx", "Pages/Memorize/MemorizeReviewPage"],
];

const demoCollections = [
  ["EciperayPages.stories.tsx", "Pages/Eciperay"],
  ["MemorizePages.stories.tsx", "Pages/Memorize"],
];

function readPagesFile(name) {
  return readFileSync(join(pagesDir, name), "utf8");
}

function declaredTitle(source) {
  const match = /title: "([^"]+)"/.exec(source);
  return match ? match[1] : null;
}

test("every page story is nested under its app's category (#70)", () => {
  for (const [file, title] of categorized) {
    assert.equal(
      declaredTitle(readPagesFile(file)),
      title,
      `${file} must declare title "${title}" (#70)`,
    );
  }
});

test("no page story keeps a flat Pages/<Page> title (#70)", () => {
  for (const [file] of [...categorized, ...demoCollections]) {
    const title = declaredTitle(readPagesFile(file));
    assert.ok(
      title === "Pages/Eciperay" ||
        title === "Pages/Memorize" ||
        title?.startsWith("Pages/Eciperay/") ||
        title?.startsWith("Pages/Memorize/"),
      `${file} declares "${title}" — page stories live only under Pages/Eciperay or Pages/Memorize (#70)`,
    );
  }
});

test("the demo collections keep the two category titles (#70)", () => {
  for (const [file, title] of demoCollections) {
    assert.equal(
      declaredTitle(readPagesFile(file)),
      title,
      `${file} must keep title "${title}" — it is the category collection (#70)`,
    );
  }
});
