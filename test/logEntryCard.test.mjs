/**
 * Contract test for LogEntryCard (spudly/design-system#119,
 * recipes-detail tranche): the log entry card extracted from
 * RecipeDetailPage's cook history.
 *
 * The pins hold the shape the page's contract depends on: the
 * card is exported from the package root, the delete action
 * renders ONLY when its callback is provided (entry data alone
 * exposes no dead action), and the delete button carries the
 * caller-composed entry-specific accessible name (position +
 * date — recipeDetailPage.test.mjs pins the composition).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "LogEntryCard.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("LogEntryCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.LogEntryCard,
    "function",
    "LogEntryCard must be exported from @spudly/ui",
  );
});

test("the delete action renders only with its callback and carries its composed name", () => {
  assert.match(code, /\{onDeletePress \? \(/, "no callback, no delete action");
  assert.match(
    code,
    /accessibilityLabel: deleteAccessibilityLabel/,
    "the delete button's name is the caller-composed entry-specific label",
  );
  assert.match(code, /onPress=\{onDeletePress\}/, "pressing delete reports through the callback");
});

test("the header carries the date and the star rating with its accessible name", () => {
  assert.match(code, /\{dateLabel\}/);
  assert.match(code, /accessibilityLabel=\{`\$\{starRating\} stars`\}/);
  assert.match(code, /"★"\.repeat\(starRating\)/, "the stars render from the rating count");
});
