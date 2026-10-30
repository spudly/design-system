/**
 * Contract test for NutritionPanel (spudly/design-system#119,
 * recipes-detail tranche): the nutrition panel extracted from
 * RecipeDetailPage's nutrition section.
 *
 * The pins hold the panel's shape: exported from the package
 * root, three states branched on the data union (the union
 * itself is pinned in recipeDetailPage.test.mjs), the Estimate
 * and Refresh actions render only with their callbacks, and
 * the ready state renders one row per nutrient plus the
 * disclaimer.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "NutritionPanel.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("NutritionPanel is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.NutritionPanel,
    "function",
    "NutritionPanel must be exported from @spudly/ui",
  );
});

test("the panel branches on its three states", () => {
  assert.match(code, /nutrition\.state === "loading"/);
  assert.match(code, /nutrition\.state === "unavailable"/);
  assert.match(code, /Estimating nutrition…/);
  assert.match(code, /Nutrition is not available yet\./);
});

test("the Estimate and Refresh actions render only with their callbacks", () => {
  assert.match(code, /\{nutrition\.onEstimatePress \? \(/, "no callback, no Estimate action");
  assert.match(code, /\{nutrition\.onRefreshPress \? \(/, "no callback, no Refresh action");
  assert.match(
    code,
    /disabled=\{\(nutrition\.isRefreshing \?\? false\) \|\| \(nutrition\.isFetching \?\? false\)\}/,
    "Refresh disables while a refresh or a background fetch is in flight",
  );
});

test("the ready state renders a row per nutrient and the disclaimer", () => {
  assert.match(code, /nutrition\.rows\.map\(\(row\) => \(/);
  assert.match(
    code,
    /<NutritionRow key=\{row\.label\} label=\{row\.label\} valueLabel=\{row\.valueLabel\} \/>/,
  );
  assert.match(code, /\{nutrition\.disclaimer\}/);
});
