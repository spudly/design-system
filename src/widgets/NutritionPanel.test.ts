/**
 * Contract test for NutritionPanel (spudly/design-system#119,
 * recipes-detail tranche): the nutrition panel extracted from
 * RecipeDetailPage's nutrition section.
 *
 * The pins hold the panel's shape: exported from the package
 * root, three states branched on the data union (the union
 * itself is pinned in RecipeDetailPage.test.ts), the Estimate
 * and Refresh actions render only with their callbacks, and
 * the ready state renders one row per nutrient plus the
 * disclaimer.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "NutritionPanel.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("NutritionPanel is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  assert.equal(
    typeof dist.NutritionPanel,
    "function",
    "NutritionPanel must be exported from the internal components barrel",
  );
});

test("the panel branches on its three states", () => {
  assert.match(code, /nutrition\.state === "loading"/);
  assert.match(code, /nutrition\.state === "unavailable"/);
  assert.match(code, /voice\.nutritionPanel\.unavailableLabel/, "the unavailable copy comes from the voice object (#539)");
});

test("the loading state renders skeletons mirroring the ready layout (#278)", () => {
  // The plain loading line is gone: the loading union state (and
  // the explicit loading prop / an enclosing scope) render the
  // ready layout's skeleton instead.
  assert.doesNotMatch(code, /Estimating nutrition…/);
  assert.match(code, /\bloading\?: boolean/);
  assert.match(code, /useLoadingScope\(loading\)/);
  assert.match(code, /LOADING_ROW_KEYS/);
  assert.match(code, /<TextSkeleton size="sm" lines=\{1\} \/>/, "the header is an sm bone");
  assert.match(code, /<TextSkeleton size="md" lines=\{1\} \/>/, "each row is label/value md bones");
  assert.match(code, /<TextSkeleton size="xs" lines=\{1\} \/>/, "the disclaimer is an xs bone");
  assert.match(
    code,
    /borderBottomColor="transparent"/,
    "skeleton rows keep their geometry with transparent hairlines",
  );
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

test("the panel passes no styling props into Button (#480)", () => {
  assert.doesNotMatch(code, /backgroundColor=\{tokens\.colors\.gray/);
  assert.doesNotMatch(code, /color=\{tokens\.colors\.gray\.gray[19]\}/);
  assert.match(code, /variant="primary"/);
});
