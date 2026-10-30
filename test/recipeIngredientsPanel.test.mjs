/**
 * Contract test for RecipeIngredientsPanel
 * (spudly/design-system#119), a recipe's ingredients section —
 * servings stepper, scale selector, pressable ingredient rows,
 * substitutions — shared by the two recipe surfaces, which each
 * carried it inline before it moved here. Its invariants are
 * the #73 interaction model both surfaces share: the servings
 * stepper mirrors the detail page's, the scale option set is
 * the presets 0.5–3, the scale control is the shared
 * PresetValueSelector (the Button-based selector that replaced
 * the retired chip group; it owns the non-wrapping row, the
 * custom-value editing state, and the custom slot's pressed
 * state and value-carrying accessible name), ingredient rows
 * are the shared MarkableRow (it owns the pressable pattern
 * and the marked dimming), and the substitutions block is the
 * shared SuggestionPanel, rendering only with substitutions.
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
const panelSource = readFileSync(join(componentsDir, "RecipeIngredientsPanel.tsx"), "utf8");

const panelCode = panelSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeIngredientsPanel is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.RecipeIngredientsPanel,
    "function",
    "RecipeIngredientsPanel must be exported from @spudly/ui",
  );
});

test("RecipeIngredientsPanel's types are type-only exports from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  for (const name of [
    "RecipeIngredientsPanelProps",
    "RecipeIngredientsPanelView",
    "RecipeIngredientsPanelIngredient",
    "RecipeIngredientsPanelSubstitution",
  ]) {
    assert.match(types, new RegExp(name), `${name} must be exported from the barrel types`);
  }
});

test("the servings stepper and scale presets mirror the settled model", () => {
  assert.match(
    panelCode,
    /<NumberStepper\s+label="Servings"\s+layout="inline"\s+value=\{view\.servings\}\s+min=\{1\}/,
    "the servings stepper mirrors the detail page's (label Servings, floor of 1, inline layout)",
  );
  for (const [value, label] of [
    ["0.5", "½×"],
    ["1", "1×"],
    ["2", "2×"],
    ["3", "3×"],
  ]) {
    assert.ok(
      panelCode.includes(`{ value: "${value}", label: "${label}" }`),
      `SCALE_OPTIONS must include ${value} / ${label}`,
    );
  }
  assert.match(
    panelCode,
    /<PresetValueSelector/,
    "the scale control is the shared PresetValueSelector",
  );
  assert.match(panelCode, /label="Scale"/);
  assert.match(panelCode, /onChange=\{view\.onScaleChange\}/);
  assert.match(
    panelCode,
    /customAccessibilityLabel="Custom scale"/,
    "the custom slot's accessible name is 'Custom scale'",
  );
  assert.match(
    panelCode,
    /\$\{formatScaleValue\(custom\)\}×/,
    "the custom slot shows the applied multiplier once a custom value applies",
  );
  assert.ok(!panelCode.includes("ToggleChipGroup"), "the retired chip group must not come back");
});

test("rows and substitutions keep their conditional rendering", () => {
  assert.match(panelCode, /<MarkableRow/, "ingredient rows are the shared MarkableRow");
  assert.match(
    panelCode,
    /isMarked=\{ingredient\.isMissing \?\? false\}/,
    "a row's marked state is the ingredient's missing flag (MarkableRow dims marked rows)",
  );
  assert.ok(panelCode.includes('trailingNote: "optional"'), "optional rows carry the note");
  assert.match(
    panelCode,
    /<SuggestionPanel/,
    "the substitutions block is the shared SuggestionPanel",
  );
  assert.match(panelCode, /title="Substitutions"/);
  assert.match(
    panelCode,
    /view\.substitutions && view\.substitutions\.length > 0/,
    "the substitutions panel renders only with substitutions",
  );
  assert.match(
    panelCode,
    /\{view\.isLoadingSubstitutions \? \(/,
    "the loading line is conditional",
  );
  assert.ok(
    !panelCode.includes("react-native"),
    "a root-graph component must not import react-native",
  );
  assert.ok(!panelCode.includes("lineHeight"), "the panel must not set lineHeight");
});
