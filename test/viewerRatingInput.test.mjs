/**
 * Regression pins for #330: the page-local ViewerRatingInput
 * copies in PublicRecipePage and RecipeDetailPage rendered
 * StarRatingInput with neither readOnly nor disabled and faked
 * non-interactivity with a pointerEvents: "none" wrapper, so the
 * star buttons stayed keyboard-focusable and operable while the
 * control presented as non-interactive.
 *
 * The #119 tranche rebuilds (#308, #314) deleted both page-local
 * copies: the pages now render the shared RatingsCard, whose
 * adapter (fixed for the same defect class in #316 / PR #325)
 * passes readOnly={onChange === undefined} and
 * disabled={isPending} to StarRatingInput, so the semantics
 * reach the star controls themselves. The card- and input-level
 * behavior is pinned in ratingsCard.test.mjs and
 * starRatingInput.test.mjs (including the SSR pins: no focusable
 * controls when read-only, unfocusable + announced disabled +
 * dimmed exactly once while pending). These pins hold the page
 * surface so the defect cannot return page-locally.
 *
 * Source scans (comments stripped first, like the other contract
 * tests here, so prose cannot satisfy or trip the patterns).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const pages = [
  ["PublicRecipePage", "src/pages/PublicRecipePage.tsx"],
  ["RecipeDetailPage", "src/pages/RecipeDetailPage.tsx"],
];

for (const [name, rel] of pages) {
  const code = readCode(rel);

  test(`${name} carries no page-local viewer rating input (#330)`, () => {
    assert.ok(
      !code.includes("ViewerRatingInput"),
      "the page-local ViewerRatingInput copy stays deleted",
    );
    assert.ok(
      !code.includes("StarRatingInput"),
      "the page does not render StarRatingInput directly",
    );
    assert.ok(!code.includes("pointerEvents"), "no pointerEvents wrapper fakes non-interactivity");
  });

  test(`${name} routes the viewer rating through the shared RatingsCard (#330)`, () => {
    // RatingsCard's adapter owns the readOnly/disabled semantics
    // (pinned in ratingsCard.test.mjs); the page only threads its
    // view-model and change handler through.
    assert.match(
      code,
      /<RatingsCard ratings=\{ratings\} onViewerRatingChange=\{onViewerRatingChange\} \/>/,
    );
    assert.match(code, /onViewerRatingChange\?: \(stars: number \| null\) => void;/);
  });
}
