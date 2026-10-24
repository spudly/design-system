/**
 * Contract test for spudly/design-system#73: the RecipeDetailPage
 * ingredients servings/scale controls are reworked for usability —
 * clear current value, one-tap changes, and no layout jumps when
 * values change — with the SAME props contract (servings value, scale
 * value, change handlers), so the app wiring does not change.
 *
 * The contract:
 * 1. NumberStepper gains an additive `layout` prop; "inline" renders
 *    label + stepper on ONE row, "stacked" (the default) keeps the
 *    original label-above form for existing consumers.
 * 2. The stepper's value box is a fixed width (spacing[10]) so a
 *    digit-count change never shifts the + button.
 * 3. ToggleChipGroup gains an additive `wrap` prop (default true);
 *    `wrap: false` renders ONE non-wrapping row whose chips flex to
 *    equal shares of the row width.
 * 4. The ingredients panel uses both: servings inline, scale as a
 *    non-wrapping equal-width chip row beside its label, in one
 *    controls block above the ingredient rows.
 *
 * Source-pinning test in the style of recipe-detail-page.test.mjs;
 * run via `npm test` (which builds first).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stepper = readFileSync(join(root, "src/components/NumberStepper.tsx"), "utf8");
const chips = readFileSync(join(root, "src/components/ToggleChipGroup.tsx"), "utf8");
const page = readFileSync(join(root, "src/pages/RecipeDetailPage.tsx"), "utf8");

test("NumberStepper layout is additive with stacked as the default", () => {
  assert.match(stepper, /layout\?: "stacked" \| "inline";/, "layout prop is declared");
  assert.match(stepper, /layout = "stacked"/, "stacked stays the default");
  assert.match(stepper, /layout === "inline"/, "the inline branch renders");
});

test("the stepper value box is fixed-width so digit changes cannot shift the buttons", () => {
  assert.match(
    stepper,
    /minWidth=\{tokens\.spacing\[10\]\}/,
    "value Text pins minWidth to spacing[10]",
  );
  assert.ok(!stepper.includes("spacing[8]"), "the old narrower value box is gone");
});

test("ToggleChipGroup wrap is additive with wrapping as the default", () => {
  assert.match(chips, /wrap\?: boolean;/, "wrap prop is declared");
  assert.match(chips, /wrap = true/, "wrapping stays the default");
  assert.match(
    chips,
    /flexWrap=\{wrap \? "wrap" : "nowrap"\}/,
    "wrap=false renders a single non-wrapping row",
  );
  assert.match(
    chips,
    /\{\.\.\.\(wrap \? \{\} : \{ flex: 1 \}\)\}/,
    "chips flex equally when nowrap",
  );
});

test("the ingredients panel uses the inline stepper and the nowrap scale row", () => {
  assert.match(
    page,
    /<NumberStepper\s+label="Servings"\s+layout="inline"/,
    "servings renders inline (label beside the stepper)",
  );
  assert.match(
    page,
    /<ToggleChipGroup\s+options=\{SCALE_OPTIONS\}\s+mode="single"\s+wrap=\{false\}/,
    "scale renders as one non-wrapping chip row",
  );
  // The contract is unchanged: the same handlers feed both controls.
  assert.match(page, /onChange=\{view\.onServingsChange\}/, "servings handler unchanged");
  assert.match(page, /onChange=\{view\.onScaleChange\}/, "scale handler unchanged");
});
