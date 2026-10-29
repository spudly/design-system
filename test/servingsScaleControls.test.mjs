/**
 * Contract test for spudly/design-system#73: the RecipeDetailPage
 * ingredients servings/scale controls are reworked for usability —
 * clear current value, one-tap changes, and no layout jumps when
 * values change — with the SAME props contract (servings value, scale
 * value, change handlers), so the app wiring does not change.
 *
 * Stephen's decision (2026-10-24) extends the rework: the goal is
 * choosing any arbitrary multiplier or number of servings, so
 * stepping is no longer the only way to reach a large batch.
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
 *    non-wrapping equal-width chip row beside its label (the
 *    EditableChipGroup the #119 pass extracted from this row), in
 *    one controls block above the ingredient rows.
 * 5. NumberStepper gains an additive `editable` prop (default
 *    false): the value renders as an editable numeric field —
 *    `keyboardType`/`inputMode` numeric (a text input on web, NOT
 *    `type="number"`: browsers add native spin buttons to number
 *    inputs, duplicating the stepper's own −/+ buttons, #181) — whose
 *    entry commits on blur/submit, snapped to the step and clamped
 *    to min/max; an empty or non-numeric entry commits nothing.
 *    The panel passes `editable`, so servings takes any typed
 *    number through the same onServingsChange handler.
 * 6. The scale row gains a Custom chip beside the presets: pressing
 *    it swaps it in place for a number input; committing a positive
 *    entry applies it through the same onScaleChange (arbitrary
 *    scales like "4" or "2.5"), an invalid entry commits nothing,
 *    and a non-preset scaleValue renders the chip selected showing
 *    that value. Pressing a preset leaves custom editing. (The
 *    chip lives in EditableChipGroup since the #119 extraction;
 *    its pins below read that component's source, and the page's
 *    pins hold the wiring: options in, the same onScaleChange
 *    out, the value format with its × suffix.)
 *
 * Source-pinning test in the style of recipeDetailPage.test.mjs;
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
const chipGroup = readFileSync(join(root, "src/components/EditableChipGroup.tsx"), "utf8");
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
    "value display pins minWidth to spacing[10]",
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
    /<EditableChipGroup\s+label="Scale"\s+options=\{SCALE_OPTIONS\}/,
    "the panel composes the scale row as an EditableChipGroup over the same options",
  );
  assert.match(
    chipGroup,
    /<ToggleChipGroup\s+options=\{options\}\s+mode="single"\s+wrap=\{false\}/,
    "scale renders as one non-wrapping chip row",
  );
  // The contract is unchanged: the same handlers feed both controls.
  assert.match(page, /onChange=\{view\.onServingsChange\}/, "servings handler unchanged");
  assert.match(page, /onChange=\{view\.onScaleChange\}/, "scale handler unchanged");
});

test("NumberStepper editable is additive, off by default, and renders a numeric text input", () => {
  assert.match(stepper, /editable\?: boolean;/, "editable prop is declared");
  assert.match(stepper, /editable = false/, "direct entry is off by default");
  // #181: NOT type="number" — browsers render native spin buttons inside
  // a number input, duplicating the stepper's own −/+ buttons. A text
  // input with a numeric inputMode keeps direct entry without them; the
  // commit path parses/snaps/clamps the typed text itself.
  assert.doesNotMatch(stepper, /type="number"/, "web must not render an input[type=number]");
  assert.match(stepper, /type="text"/, "web renders an input[type=text]");
  assert.match(
    stepper,
    /keyboardType="numeric"/,
    "native renders the numeric keyboard (keyboardType)",
  );
  assert.match(stepper, /inputMode="numeric"/, "inputMode is numeric");
  assert.match(
    stepper,
    /width=\{tokens\.spacing\[16\]\}/,
    "the editable box is fixed-width (spacing[16]) so buttons never shift",
  );
});

test("the stepper commits typed entries snapped and clamped, and ignores invalid ones", () => {
  assert.match(stepper, /const parsed = Number\(draft\.trim\(\)\);/, "the entry is parsed");
  assert.match(
    stepper,
    /if \(draft\.trim\(\) === ""\) \{\s+setDraft\(null\);\s+return;/,
    'an empty entry commits nothing (Number("") is 0, so it needs its own guard)',
  );
  assert.match(
    stepper,
    /if \(!Number\.isFinite\(parsed\)\) \{\s+return;/,
    "non-numeric entries commit nothing",
  );
  assert.match(
    stepper,
    /Math\.round\(parsed \/ step\) \* step/,
    "the entry snaps to the step grid",
  );
  assert.match(stepper, /next = Math\.max\(min, next\);/, "the entry clamps to min");
  assert.match(stepper, /next = Math\.min\(max, next\);/, "the entry clamps to max");
  assert.match(stepper, /onBlur=\{commitDraft\}/, "the entry commits on blur");
  assert.match(stepper, /onSubmitEditing=\{commitDraft\}/, "the entry commits on submit");
  assert.match(
    stepper,
    /value=\{draft \?\? String\(value\)\}/,
    "the field shows the draft while editing and the value otherwise",
  );
});

test("the ingredients panel makes servings directly editable", () => {
  assert.match(
    page,
    /<NumberStepper\s+label="Servings"\s+layout="inline"\s+value=\{view\.servings\}\s+min=\{1\}\s+onChange=\{view\.onServingsChange\}\s+editable\s*\/>/,
    "servings passes editable to the stepper (direct entry, same handler)",
  );
});

test("the scale row has a Custom chip that turns into a number input in place", () => {
  assert.match(page, /const CUSTOM_SCALE_LABEL = "Custom";/, "the custom chip label is Custom");
  assert.match(
    page,
    /customAccessibilityLabel="Custom scale"/,
    "the page names the custom control for assistive tech",
  );
  assert.match(
    chipGroup,
    /accessibilityLabel=\{customAccessibilityLabel\}/,
    "the custom editor carries that label",
  );
  assert.match(chipGroup, /onPress=\{startCustomEdit\}/, "pressing the chip starts editing");
  assert.match(
    chipGroup,
    /keyboardType="decimal-pad"/,
    "the custom scale input uses the decimal keypad (fractions allowed)",
  );
  assert.match(
    chipGroup,
    /type="number"/,
    "web renders an input[type=number] for the custom scale",
  );
  assert.match(chipGroup, /isCustomEditing \? \(/, "the input replaces the chip while editing");
});

test("committing a custom scale applies any positive multiplier and ignores invalid entries", () => {
  assert.match(chipGroup, /const parsed = Number\(customDraft\.trim\(\)\);/, "the entry is parsed");
  assert.match(
    chipGroup,
    /if \(Number\.isFinite\(parsed\) && parsed > 0\) \{\s+onChange\(String\(parsed\)\);/,
    "a positive entry (e.g. 4 or 2.5) applies through onChange; else nothing commits",
  );
  assert.match(chipGroup, /onBlur=\{commitCustom\}/, "the custom entry commits on blur");
  assert.match(chipGroup, /onSubmitEditing=\{commitCustom\}/, "the custom entry commits on submit");
});

test("a non-preset scale renders the custom chip selected with its value; presets leave editing", () => {
  assert.match(
    chipGroup,
    /const isPreset = options\.some\(\(option\) => option\.value === value\);/,
    "preset membership is derived from the option set",
  );
  assert.match(
    chipGroup,
    /const isCustomSelected = !isPreset && !isCustomEditing;/,
    "a non-preset value selects the custom chip",
  );
  assert.match(
    page,
    /formatCustomValue=\{\(value\) => `\$\{formatScaleValue\(value\)\}×`\}/,
    "the page formats the selected custom value with its × suffix (e.g. 4×)",
  );
  assert.match(
    chipGroup,
    /isCustomSelected \? formattedCustom : customLabel/,
    "the selected custom chip shows the formatted applied value",
  );
  assert.match(
    chipGroup,
    /aria-pressed=\{isCustomSelected\}/,
    "the custom chip exposes its selected state",
  );
  assert.match(
    chipGroup,
    /setCustomEditing\(false\);\s+onChange\(next\);/,
    "choosing a preset leaves custom editing and applies the preset",
  );
});
