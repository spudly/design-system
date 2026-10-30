/**
 * Contract test for RecipeInstructionsPanel
 * (spudly/design-system#119), a recipe's instructions section —
 * the step cards in step-number order with the tapped card
 * highlighted as the active step — shared by the two recipe
 * surfaces, which each carried it inline before it moved here.
 * Its invariants: steps render sorted by stepNumber regardless
 * of input order, each step's eyebrow label is composed here as
 * "Step N" (StepList takes pre-composed labels — labels are
 * caller content), and the cards themselves are the shared
 * StepList, which owns the card treatment, the pressable
 * pattern, and the ephemeral active-step state (#119 dedupe).
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const panelSource = readFileSync(join(componentsDir, "RecipeInstructionsPanel.tsx"), "utf8");

const panelCode = panelSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeInstructionsPanel is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.RecipeInstructionsPanel,
    "function",
    "RecipeInstructionsPanel must be exported from @spudly/ui",
  );
});

test("RecipeInstructionsPanel's types are type-only exports from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /RecipeInstructionsPanelProps/);
  assert.match(types, /RecipeInstructionsPanelStep/);
});

test("steps sort by number and render through StepList with composed labels", () => {
  assert.match(panelCode, /\.sort\(\(a, b\) => a\.stepNumber - b\.stepNumber\)/);
  assert.match(panelCode, /<StepList/, "the cards are the shared StepList");
  assert.match(
    panelCode,
    /label: `Step \$\{step\.stepNumber\}`/,
    "each step's eyebrow label is composed here as Step N",
  );
  assert.match(panelCode, /body: step\.body/, "step bodies pass through verbatim");
  assert.ok(
    !panelCode.includes("useState"),
    "the panel holds no active-step state — StepList owns it",
  );
  assert.ok(
    !panelCode.includes("react-native"),
    "a root-graph component must not import react-native",
  );
  assert.ok(!panelCode.includes("lineHeight"), "the panel must not set lineHeight");
});
