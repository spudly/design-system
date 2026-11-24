/**
 * Contract test for NutritionPanel (spudly/design-system#119,
 * recipes-detail tranche; FDA label restyle #722): the nutrition
 * panel extracted from RecipeDetailPage's nutrition section.
 *
 * The pins hold the panel's shape: exported from the package
 * root, three states branched on the data union (the union
 * itself is pinned in RecipeDetailPage.test.ts), the Estimate
 * and Refresh actions render only with their callbacks, and
 * the ready state renders the fixed black-on-white Nutrition
 * Facts label from the structured NutritionFacts view-model —
 * graded rules, large Calories, the % Daily Value column, the
 * FDA kind hierarchy (indented sub-nutrients, net carbs with no
 * %DV, the vitamin/mineral block), and the %DV footnote.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "data", "NutritionPanel.tsx"), "utf8");
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

test("the ready state takes the structured NutritionFacts view-model, not free-form rows (#722)", () => {
  assert.match(code, /facts: NutritionFacts/);
  assert.match(code, /servingSizeLabel: string/);
  assert.match(code, /servingsPerContainerLabel\?: string/);
  assert.match(code, /caloriesLabel: string/);
  assert.match(code, /nutrients: NutritionFact\[\]/);
  assert.doesNotMatch(code, /NutritionPanelRow/, "the free-form row contract is removed");
  assert.doesNotMatch(code, /nutrition\.rows/, "the ready state no longer renders caller rows");
});

test("the label is a fixed black-on-white panel, a deliberate token exception (#722)", () => {
  assert.match(code, /const LABEL_SURFACE = "#ffffff"/);
  assert.match(code, /const LABEL_INK = "#000000"/);
  assert.match(code, /borderWidth=\{2\}/, "the label carries a strong black border");
  assert.match(code, /borderColor=\{LABEL_INK\}/);
  assert.match(code, /backgroundColor=\{LABEL_SURFACE\}/);
  assert.match(
    code,
    /voice\.nutritionPanel\.titleLabel/,
    "the 'Nutrition Facts' title copy comes from the voice object",
  );
  assert.match(
    code,
    /fontSize=\{tokens\.typography\.fontSize\["4xl"\]\}[\s\S]*?\{facts\.caloriesLabel\}/,
    "calories render very large and bold",
  );
});

test("the graded rules render in the label's order (#722)", () => {
  assert.match(code, /const THICK_BAR_HEIGHT = 12/);
  assert.match(code, /const MEDIUM_BAR_HEIGHT = 6/);
  const thickAt = code.indexOf("<LabelBar height={THICK_BAR_HEIGHT} />");
  const caloriesAt = code.indexOf("{facts.caloriesLabel}");
  const mediumAt = code.indexOf("<LabelBar height={MEDIUM_BAR_HEIGHT} />", caloriesAt);
  const footnoteAt = code.indexOf("voice.nutritionPanel.dailyValueFootnote");
  assert.ok(thickAt > -1 && thickAt < caloriesAt, "the very thick bar sits under the serving block, above Calories");
  assert.ok(mediumAt > caloriesAt, "a medium bar follows the calories block");
  assert.ok(footnoteAt > mediumAt, "the %DV footnote renders inside the panel, after a medium bar");
  assert.match(code, /voice\.nutritionPanel\.dailyValueHeaderLabel/, "the % Daily Value column header renders");
  assert.match(code, /textAlign="right"/, "the %DV header is right-aligned");
});

test("the kind hierarchy drives indent, bold, and block placement (#722)", () => {
  assert.match(code, /SUB_NUTRIENT_KINDS/);
  assert.match(code, /"netCarbs"/, "net carbs is a first-class kind");
  assert.match(code, /MICRO_NUTRIENT_KINDS/);
  for (const kind of ["vitaminD", "calcium", "iron", "potassium"]) {
    assert.match(code, new RegExp(`"${kind}"`), `${kind} belongs to the vitamin/mineral block`);
  }
  assert.match(
    code,
    /ordered\.filter\(\(fact\) => !MICRO_NUTRIENT_KINDS\.has\(fact\.kind\)\)/,
    "the macronutrient block excludes the vitamin/mineral kinds",
  );
  assert.match(code, /const FACT_ORDER/, "the widget owns the FDA nutrient order");
  assert.match(
    code,
    /FACT_ORDER\.indexOf\(a\.kind\) - FACT_ORDER\.indexOf\(b\.kind\)/,
    "nutrients render in FDA order whatever order the app supplies, so net carbs lands under Total Carbohydrate",
  );
  assert.match(
    code,
    /voice\.nutritionPanel\.factLabels/,
    "nutrient display names come from the voice object",
  );
  assert.match(
    code,
    /fact\.dailyValueLabel \?\? ""/,
    "a nutrient with no %DV (net carbs, trans fat, total sugars) renders an empty %DV cell rather than an invented value",
  );
});

test("the loading state renders skeletons mirroring the new label shape (#278, #722)", () => {
  assert.doesNotMatch(code, /Estimating nutrition…/);
  assert.match(code, /\bloading\?: boolean/);
  assert.match(code, /useLoadingScope\(loading\)/);
  assert.match(code, /LOADING_ROW_KEYS/);
  assert.match(code, /<NutritionFactsSkeleton/);
  assert.match(
    code,
    /microRowKeys=\{microRowKeys\}/,
    "the skeleton mirrors the ready label's vitamin/mineral section",
  );
  assert.match(
    code,
    /nutrition\.facts\.nutrients/,
    "a loading panel over ready data mirrors its own nutrient count",
  );
  assert.match(code, /<TextSkeleton size="4xl" lines=\{1\} \/>/, "the title and calories blocks are 4xl bones");
  assert.match(code, /<TextSkeleton size="sm" lines=\{1\} \/>/, "the header, serving, and row bones are sm");
  assert.match(code, /<TextSkeleton size="xs" lines=\{1\} \/>/, "the footnote and disclaimer are xs bones");
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

test("the ready state renders the label and the app disclaimer below it", () => {
  assert.match(code, /<NutritionFactsLabel facts=\{nutrition\.facts\} \/>/);
  assert.match(code, /\{nutrition\.disclaimer\}/);
});

test("the panel passes no styling props into Button (#480)", () => {
  assert.doesNotMatch(code, /backgroundColor=\{tokens\.colors\.gray/);
  assert.doesNotMatch(code, /color=\{tokens\.colors\.gray\.gray[19]\}/);
  assert.match(code, /variant="primary"/);
});
