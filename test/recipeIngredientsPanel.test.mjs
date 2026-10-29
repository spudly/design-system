/**
 * Contract test for RecipeIngredientsPanel
 * (spudly/design-system#119), a recipe's ingredients section —
 * servings stepper, scale presets plus the custom-scale chip,
 * pressable ingredient rows, substitutions — shared by the two
 * recipe surfaces, which each carried it inline before it moved
 * here. Its invariants are the #73 interaction model both
 * surfaces share: the servings stepper mirrors the detail
 * page's, the scale option set is the presets 0.5–3, the chip
 * group never wraps, the custom chip exposes its pressed state
 * and carries the applied value in its accessible name, missing
 * rows dim, and the substitutions panel renders only with
 * substitutions.
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
  assert.match(panelCode, /wrap=\{false\}/, "the scale chip row never wraps");
});

test("the custom scale chip keeps its button semantics and commit rules", () => {
  assert.match(panelCode, /aria-pressed=\{isCustomScaleSelected\}/);
  assert.match(
    panelCode,
    /`Custom scale \$\{formatScaleValue\(view\.scaleValue\)\}×`/,
    "the selected chip's accessible name carries the applied multiplier",
  );
  assert.match(
    panelCode,
    /: "Custom scale",/,
    "the unselected chip's accessible name is the resting label",
  );
  assert.match(
    panelCode,
    /Number\.isFinite\(parsed\) && parsed > 0/,
    "only a finite positive entry commits",
  );
  assert.match(panelCode, /onBlur=\{commitCustomScale\}/);
  assert.match(panelCode, /onSubmitEditing=\{commitCustomScale\}/);
});

test("rows and substitutions keep their conditional rendering", () => {
  assert.match(
    panelCode,
    /opacity=\{ingredient\.isMissing \? 0\.4 : undefined\}/,
    "missing rows dim",
  );
  assert.match(
    panelCode,
    /accessibilityRole: "button"/,
    "rows carry the button role (the ListRow pressable pattern, no react-native import)",
  );
  assert.match(
    panelCode,
    /aria-pressed=\{ingredient\.isMissing \?\? false\}/,
    "a row exposes its missing (toggled) state to assistive technology",
  );
  assert.ok(
    !panelCode.includes("react-native"),
    "a root-graph component must not import react-native",
  );
  assert.match(panelCode, /\{ingredient\.isOptional \? \(/, "optional rows carry the note");
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
  assert.ok(!panelCode.includes("lineHeight"), "the panel must not set lineHeight");
});
