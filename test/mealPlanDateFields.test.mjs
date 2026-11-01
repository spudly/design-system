/**
 * Contract test for spudly/eciperay#334: on the create meal
 * plan form, the Starts on / Ends on fields were not date
 * fields on web and their placeholders were not visible on
 * Android, making the dates hard to fill in on either
 * platform.
 *
 * The contract now:
 * 1. `MealPlanFormPage` renders Starts on / Ends on as date
 *    fields: both `TextField`s pass `type="date"` (TextField's
 *    web translation preserves a caller-supplied `type`, so
 *    web renders a real `<input type="date">` with the existing
 *    YYYY-MM-DD value contract) plus
 *    `keyboardType="numbers-and-punctuation"` for native text
 *    entry, where `type` has no date-picker equivalent (the
 *    iOS digits-and-punctuation pad; Android has no
 *    digits-and-hyphen RN keyboardType, so it falls back to
 *    the default keyboard, whose characters are set by the
 *    user's IME).
 * 2. `TextField` gives placeholders a visible theme color by
 *    default: it destructures `placeholderTextColor` out of its
 *    rest props and passes
 *    `placeholderTextColor ?? "$textMuted"` explicitly to the
 *    underlying input — a caller-supplied value wins. On
 *    native this is the color Android/iOS paint the
 *    placeholder with; on web it becomes the `::placeholder`
 *    color.
 * 3. Runtime (SSR, against the built output): a TextField with
 *    `type="date"` renders `<input type="date">` carrying its
 *    YYYY-MM-DD value; a default TextField's `::placeholder`
 *    rule uses the theme's textMuted color; a caller
 *    `placeholderTextColor` replaces that rule's color; and
 *    MealPlanFormPage renders exactly two date inputs (Starts
 *    on / Ends on, with their values) while its other fields
 *    stay plain inputs.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const textField = readCode("src/components/TextField.tsx");
const mealPlanFormPage = readCode("src/pages/MealPlanFormPage.tsx");

const noop = () => null;

function mealPlanFormProps() {
  return {
    title: "Plan",
    onTitleChange: noop,
    notes: "",
    onNotesChange: noop,
    startsOn: "2026-11-02",
    onStartsOnChange: noop,
    endsOn: "2026-11-09",
    onEndsOnChange: noop,
    entryOptions: [],
    selectedKeys: [],
    quantityByKey: {},
    servingsByRecipeId: {},
    onToggleEntry: noop,
    onQuantityChange: noop,
    onRecipeServingsChange: noop,
    onSubmit: noop,
  };
}

test("TextField destructures placeholderTextColor out of rest (eciperay#334)", () => {
  assert.match(textField, /\n {2}placeholderTextColor,/);
});

test("TextField defaults placeholderTextColor to $textMuted, caller wins (eciperay#334)", () => {
  assert.match(
    textField,
    /placeholderTextColor=\{\s*placeholderTextColor \?\? \(changed \? tokens\.colors\.warning\.warning10 : "\$textMuted"\)\s*\}/,
    'the input must receive placeholderTextColor ?? (changed ? warning10 : "$textMuted") explicitly',
  );
});

test("MealPlanFormPage passes type=date to both date fields (eciperay#334)", () => {
  assert.match(
    mealPlanFormPage,
    /label="Starts on"\s+type="date"\s+keyboardType="numbers-and-punctuation"/,
  );
  assert.match(
    mealPlanFormPage,
    /label="Ends on"\s+type="date"\s+keyboardType="numbers-and-punctuation"/,
  );
  assert.equal(
    (mealPlanFormPage.match(/type="date"/g) ?? []).length,
    2,
    "exactly the two date fields carry type=date",
  );
});

// Runtime imports are lazy (inside the SSR tests) so the source-scan
// tests above still run and report when the build output is missing
// or broken, instead of the whole file failing at import time.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    const { MealPlanFormPage } = await import("../dist/pages/MealPlanFormPage.js");
    return { React, renderToString, TamaguiProvider, MealPlanFormPage, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

function inputTags(html) {
  return html.match(/<input[^>]*>/g) ?? [];
}

/**
 * The placeholder color an input actually gets on web: the
 * `::placeholder` rule for the input's own `_ptc-*` class.
 */
function placeholderColorOf(html, inputTag) {
  const ptc = inputTag.match(/_ptc-(\d+)/);
  assert.ok(ptc, `expected a placeholder-color class on the input: ${inputTag}`);
  const rule = html.match(new RegExp(String.raw`\._ptc-${ptc[1]}::placeholder\{color:([^;]+);`));
  assert.ok(rule, `expected a ::placeholder rule for _ptc-${ptc[1]} in the SSR CSS`);
  return rule[1];
}

test("SSR: TextField type=date renders a real date input with its value (eciperay#334)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Starts on",
      type: "date",
      value: "2026-11-02",
      placeholder: "YYYY-MM-DD",
      onChangeText: noop,
    }),
  );
  const [input] = inputTags(html);
  assert.ok(input.includes('type="date"'), `expected type="date" in: ${input}`);
  assert.ok(
    input.includes('value="2026-11-02"'),
    `the YYYY-MM-DD value contract must be preserved in: ${input}`,
  );
});

test("SSR: a plain TextField does not render type=date (eciperay#334)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Title",
      value: "Plan",
      placeholder: "Plan title",
      onChangeText: noop,
    }),
  );
  const [input] = inputTags(html);
  assert.ok(!input.includes('type="date"'), `unexpected type="date" in: ${input}`);
});

test("SSR: the default placeholder color is the theme textMuted color (eciperay#334)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Title",
      value: "",
      placeholder: "Plan title",
      onChangeText: noop,
    }),
  );
  const [input] = inputTags(html);
  assert.equal(placeholderColorOf(html, input), "var(--textMuted)");
});

test("SSR: a caller placeholderTextColor wins over the default (eciperay#334)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Title",
      value: "",
      placeholder: "Plan title",
      placeholderTextColor: "#123456",
      onChangeText: noop,
    }),
  );
  const [input] = inputTags(html);
  assert.equal(placeholderColorOf(html, input), "#123456");
});

test("SSR: a changed TextField defaults its placeholder to warning10 for contrast on the warning wash (eciperay#334)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Title",
      value: "",
      placeholder: "Plan title",
      changed: true,
      onChangeText: noop,
    }),
  );
  const [input] = inputTags(html);
  assert.equal(placeholderColorOf(html, input), "#78350f");
});

test("SSR: a caller placeholderTextColor wins on a changed field too (eciperay#334)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Title",
      value: "",
      placeholder: "Plan title",
      changed: true,
      placeholderTextColor: "#123456",
      onChangeText: noop,
    }),
  );
  const [input] = inputTags(html);
  assert.equal(placeholderColorOf(html, input), "#123456");
});

test("SSR: MealPlanFormPage renders exactly two date inputs, Starts on and Ends on (eciperay#334)", async () => {
  const { React, MealPlanFormPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(MealPlanFormPage, mealPlanFormProps()));
  const inputs = inputTags(html);
  const dateInputs = inputs.filter((tag) => tag.includes('type="date"'));
  assert.equal(dateInputs.length, 2, `expected two date inputs in: ${inputs.join("\n")}`);
  assert.ok(
    dateInputs.some((tag) => tag.includes('value="2026-11-02"')),
    "Starts on must carry its YYYY-MM-DD value",
  );
  assert.ok(
    dateInputs.some((tag) => tag.includes('value="2026-11-09"')),
    "Ends on must carry its YYYY-MM-DD value",
  );
  assert.ok(
    inputs.some((tag) => !tag.includes('type="date"')),
    "the page's other fields (Title) must stay plain inputs",
  );
});
