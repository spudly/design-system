/**
 * Contract test for spudly/design-system#73: the recipe pages'
 * servings/scale controls — clear current value, one-tap changes,
 * and no layout jumps when values change — with the SAME props
 * contract (servings value, scale value, change handlers), so the
 * app wiring does not change.
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
 * 3. The scale selector is PresetValueSelector (#119 dedupe — the
 *    Button-based successor to the retired chip group): ONE
 *    non-wrapping row of equal-width toggle Buttons (Button's
 *    `selected` form), presets plus a Custom slot.
 * 4. Both recipe panels use both controls: servings inline, scale
 *    as the PresetValueSelector beside its label, in one controls
 *    block above the ingredient rows.
 * 5. NumberStepper gains an additive `editable` prop (default
 *    false): the value renders as an editable numeric field —
 *    `keyboardType`/`inputMode` numeric (a text input on web, NOT
 *    `type="number"`: browsers add native spin buttons to number
 *    inputs, duplicating the stepper's own −/+ buttons, #181) — whose
 *    entry commits on blur/submit, snapped to the step and clamped
 *    to min/max; an empty or non-numeric entry commits nothing.
 *    The panel passes `editable`, so servings takes any typed
 *    number through the same onServingsChange handler.
 * 6. The selector's Custom slot: pressing it swaps it in place for
 *    a number input; committing a positive entry applies it
 *    through the same onChange (arbitrary scales like "4" or
 *    "2.5"), an invalid entry commits nothing, and a non-preset
 *    value renders the Custom button selected showing that value
 *    (the page's formatCustomValue appends the multiplier sign).
 *    Pressing a preset leaves custom editing.
 * 7. Commit timing (#315): the custom entry commits on submit,
 *    and on blur only when focus leaves the selector entirely.
 *    A blur whose focus lands inside the group (web: the blur
 *    event's relatedTarget is contained by the group element)
 *    ends the edit WITHOUT committing, so a preset press that
 *    follows applies its own value instead of being swallowed
 *    or overridden by the draft; on native, where blur carries
 *    no relatedTarget, a preset's onPressIn ahead of the blur
 *    suppresses that blur's commit the same way.
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
const selector = readFileSync(join(root, "src/components/PresetValueSelector.tsx"), "utf8");
const page = readFileSync(join(root, "src/pages/RecipeDetailPage.tsx"), "utf8");
// PublicRecipePage's ingredients section is the shared library
// panel since the #331 extraction, so its control pins scan the
// panel source (the page wires its view-model into the panel;
// test/publicRecipePage.test.mjs pins that wiring).
const ingredientsPanel = readFileSync(
  join(root, "src/components/RecipeIngredientsPanel.tsx"),
  "utf8",
);

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

test("PresetValueSelector renders one non-wrapping row of toggle buttons, presets at equal width", () => {
  assert.ok(!selector.includes('flexWrap="wrap"'), "the row never wraps");
  assert.match(
    selector,
    /selected=\{value === option\.value\}/,
    "each preset is a toggle button carrying its selected state",
  );
  assert.match(selector, /grow/, "the preset buttons flex to equal shares of their row");
  // #327: the custom slot's share is deliberately wider than a
  // preset's — at the old quarter share (flex 0.25 of the row,
  // level with one preset) the slot was ~68px at the ~430px VR
  // capture width and the "Custom" label wrapped mid-word.
  assert.match(selector, /flex=\{0\.35\}/, "the custom slot keeps its widened share (#327)");
});

test("the ingredients panels use the inline stepper and the PresetValueSelector", () => {
  for (const [name, source] of [
    ["RecipeDetailPage", page],
    ["PublicRecipePage (via RecipeIngredientsPanel)", ingredientsPanel],
  ]) {
    assert.match(
      source,
      /<NumberStepper\s+label="Servings"\s+layout="inline"/,
      `${name}: servings renders inline (label beside the stepper)`,
    );
    assert.match(
      source,
      /<PresetValueSelector\s+label="Scale"\s+options=\{SCALE_OPTIONS\}\s+value=\{view\.scaleValue\}\s+onChange=\{view\.onScaleChange\}/,
      `${name}: scale renders as the preset-or-custom selector on the same handlers`,
    );
    // The contract is unchanged: the same handlers feed both controls.
    assert.match(
      source,
      /onChange=\{view\.onServingsChange\}/,
      `${name}: servings handler unchanged`,
    );
  }
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

test("the selector's Custom slot turns into a number input in place", () => {
  assert.match(page, /const CUSTOM_SCALE_LABEL = "Custom";/, "the custom button label is Custom");
  assert.match(
    page,
    /customAccessibilityLabel="Custom scale"/,
    "the custom control is labelled through the selector",
  );
  assert.match(selector, /\{isCustomEditing \? \(/, "the input replaces the button while editing");
  assert.match(
    selector,
    /keyboardType="decimal-pad"/,
    "the custom scale input uses the decimal keypad (fractions allowed)",
  );
  assert.match(
    selector,
    /onPress=\{startCustomEdit\}/,
    "pressing the Custom button starts editing",
  );
  assert.match(selector, /type="number"/, "web renders an input[type=number] for the custom scale");
});

test("committing a custom scale applies any positive multiplier and ignores invalid entries", () => {
  assert.match(selector, /const parsed = Number\(customDraft\.trim\(\)\);/, "the entry is parsed");
  assert.match(
    selector,
    /if \(Number\.isFinite\(parsed\) && parsed > 0\) \{\s+onChange\(String\(parsed\)\);/,
    "a positive entry (e.g. 4 or 2.5) applies through onChange; else nothing commits",
  );
  assert.match(
    selector,
    /onBlur=\{handleCustomBlur\}/,
    "blur goes through the within-group guard before it can commit",
  );
  assert.match(selector, /onSubmitEditing=\{commitCustom\}/, "the custom entry commits on submit");
});

test("on web, blurring the custom editor to inside the group does not commit (#315)", () => {
  assert.match(
    selector,
    /const groupRef = useRef<TamaguiElement>\(null\);/,
    "the selector keeps a ref on its group element",
  );
  assert.match(selector, /<XStack\s+ref=\{groupRef\}/, "the group element carries the ref");
  assert.match(
    selector,
    /const relatedTarget = blurEvent\.relatedTarget \?\? blurEvent\.nativeEvent\?\.relatedTarget;/,
    "the blur destination is read from relatedTarget (direct or nativeEvent-wrapped)",
  );
  assert.match(
    selector,
    /groupElement\?\.contains\(relatedTarget as Node\)\) \{\s+setCustomEditing\(false\);\s+return;/,
    "focus landing inside the group ends the edit without committing",
  );
});

test("on native, a preset press in flight suppresses the blur commit (#315)", () => {
  // Native blur carries no relatedTarget, so the press stands in.
  assert.match(
    selector,
    /onPressIn=\{\(\) => \{\s+if \(isCustomEditing\) \{\s+presetPressPendingRef\.current = true;/,
    "a preset's onPressIn ahead of the blur marks the press pending",
  );
  assert.match(
    selector,
    /if \(presetPressPendingRef\.current\) \{\s+presetPressPendingRef\.current = false;\s+setCustomEditing\(false\);\s+return;/,
    "the blur handler consumes a pending preset press without committing",
  );
  assert.match(
    selector,
    /onPress=\{\(\) => \{\s+presetPressPendingRef\.current = false;/,
    "the preset press clears the pending flag so a later blur still commits",
  );
  assert.match(
    selector,
    /onPressOut=\{\(\) => \{\s+\/\/ #315 cancel path:[\s\S]*?queueMicrotask\(\(\) => \{\s+presetPressPendingRef\.current = false;/,
    "a canceled preset press (press-out with no onPress) clears the pending flag in a microtask, so a later genuine blur still commits",
  );
  assert.match(
    selector,
    /onPointerCancel=\{\(\) => \{\s+\/\/ #315 web touch-cancel path:[\s\S]*?queueMicrotask\(\(\) => \{\s+presetPressPendingRef\.current = false;/,
    "a web touch-canceled preset press (pointer-cancel, which Tamagui does not map to press-out) clears the pending flag in a microtask, so a canceled touch followed by an outside blur still commits the draft",
  );
  assert.match(
    selector,
    /const handleCustomBlur =[\s\S]*?commitCustom\(\);\s+\};/,
    "a blur leaving the group falls through to commitCustom",
  );
});

test("a non-preset scale renders the Custom button selected with its value; presets leave editing", () => {
  assert.match(
    selector,
    /const isPreset = options\.some\(\(option\) => option\.value === value\);/,
    "preset membership is derived from the option set",
  );
  assert.match(
    selector,
    /const isCustomSelected = !isPreset && !isCustomEditing;/,
    "a non-preset value selects the Custom button",
  );
  assert.match(
    page,
    /formatCustomValue=\{\(custom\) => `\$\{formatScaleValue\(custom\)\}×`\}/,
    "the selected custom button shows the applied value with the multiplier (e.g. 4×)",
  );
  assert.match(
    selector,
    /selected=\{isCustomSelected\}/,
    "the Custom button exposes its selected state through Button's toggle form",
  );
  assert.match(
    selector,
    /setCustomEditing\(false\);\s+onChange\(option\.value\);/,
    "choosing a preset leaves custom editing and applies the preset",
  );
});
