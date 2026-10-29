/**
 * Contract test for spudly/design-system#235: on web, `Button`
 * rendered React Native accessibility props as raw HTML attributes
 * instead of their ARIA equivalents. A hidden `BlankWord` produced
 *
 *   <button accessibilityrole="button"
 *     accessibilitystate="[object Object]"
 *     accessibilitylabel="Reveal blank word 1 of 2"
 *     aria-disabled="false" …>
 *
 * — no `aria-label`, so the button had NO accessible name (Memorize's
 * Playwright e2e, spudly/memorize#53, found an unnamed button in the
 * accessibility tree). Root cause: Tamagui's web renderer does not
 * translate RN accessibility props; it forwards unknown props to the
 * DOM verbatim. Native rendering is unaffected — the RN props are
 * the correct props there.
 *
 * The contract now:
 * 1. `platformAccessibilityProps` in src/components/accessibility.ts
 *    is the single shared translation: on web it maps
 *    accessibilityLabel -> aria-label, accessibilityLabelledBy ->
 *    aria-labelledby, accessibilityRole -> role (image -> img,
 *    imagebutton -> button, header -> heading, adjustable ->
 *    slider), every accessibilityState field -> its aria-*
 *    counterpart, accessibilityValue -> aria-value*, liveRegion ->
 *    aria-live, elementsHidden -> aria-hidden, and drops the RN-only
 *    props; on native it returns the input unchanged.
 * 2. The DS primitives that forward caller accessibility props —
 *    Button and Text (the pressable paths: BlankWord, TextAction,
 *    TextLink, BackLink, and every Button caller) — destructure the
 *    RN accessibility props OUT of their rest props and route them
 *    through the translator, so the RN forms can never reach a
 *    Tamagui element through them. Button keeps its defaults through
 *    the same path (role "button" — "link" in the #248 href form —
 *    disabled mirrored into state).
 * 3. The component-internal pressables/containers that set the RN
 *    props on raw Tamagui stacks — ToggleChipGroup chips,
 *    RatingForm's two actions, ColorPickerField swatches,
 *    SearchField's clear button, StarRatingInput's stars and
 *    containers, StepDots, Avatar, NumberStepper's group — route
 *    them through the translator too; none of them passes a raw
 *    `accessibilityLabel=` / `accessibilityState=` /
 *    `accessibilityRole=` JSX prop anymore.
 * 4. Runtime (SSR, against the built output): a labeled Button and
 *    a hidden BlankWord render `aria-label="Reveal blank word 1 of
 *    2"` and NO `accessibilitylabel` / `accessibilitystate` /
 *    `accessibilityrole` attributes and no "[object Object]";
 *    state fields render as their aria-* attributes.
 *
 * The source scan strips comments first, like the other contract
 * tests here, so prose cannot satisfy or trip the patterns.
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

const accessibility = readCode("src/components/accessibility.ts");
const button = readCode("src/components/Button.tsx");
const text = readCode("src/components/Text.tsx");
const blankWord = readCode("src/components/BlankWord.tsx");

test("platformAccessibilityProps is the shared translator with a web and a native branch (#235)", () => {
  assert.match(accessibility, /export function platformAccessibilityProps/);
  assert.match(accessibility, /if \(!isWeb\)/, "native must short-circuit unchanged");
  assert.match(accessibility, /ariaLabel \?\? accessibilityLabel/);
  assert.match(accessibility, /translated\["aria-label"\] = label/);
  assert.match(accessibility, /translated\["aria-labelledby"\] = labelledByResolved/);
  assert.match(accessibility, /translated\.role = resolvedRole/);
  assert.match(accessibility, /webRoleByNativeRole/);
  assert.match(accessibility, /image: "img"/);
  assert.match(accessibility, /imagebutton: "button"/);
  for (const field of ["disabled", "selected", "checked", "busy", "expanded"]) {
    assert.ok(
      accessibility.includes(`accessibilityState?.${field}`),
      `accessibilityState.${field} must be read for translation`,
    );
    assert.ok(
      accessibility.includes(`translated["aria-${field}"]`),
      `accessibilityState.${field} must map to aria-${field}`,
    );
  }
  assert.match(accessibility, /accessibilityValue\?\.now/);
  assert.match(accessibility, /translated\["aria-valuenow"\]/);
  assert.match(accessibility, /accessibilityLiveRegion === "none" \? "off"/);
  assert.match(accessibility, /ariaHidden \?\? accessibilityElementsHidden/);
});

test("Button destructures the RN accessibility props out of rest and routes them through the translator (#235)", () => {
  assert.match(button, /from "\.\/accessibility\.js"/);
  assert.match(button, /platformAccessibilityProps\(\{/);
  for (const prop of [
    "accessibilityLabel",
    "accessibilityState",
    "accessibilityRole",
    "accessibilityHint",
    "accessibilityLabelledBy",
    "accessibilityValue",
  ]) {
    assert.ok(button.includes(prop), `Button must handle ${prop} explicitly, not in rest`);
  }
  assert.match(
    button,
    /accessibilityRole: accessibilityRole \?\? \(isLink \? "link" : "button"\)/,
    "the default role (button, or link in the #248 href form) must survive the translation",
  );
  assert.match(
    button,
    /accessibilityState: \{ disabled, \.\.\.accessibilityState \}/,
    "disabled must still mirror into the state, under any caller state",
  );
  assert.ok(
    !/accessibility(State|Label|Role)=/.test(button),
    "Button must not pass raw RN accessibility JSX props to the Tamagui button",
  );
});

test("Text routes caller accessibility props through the same translator (#235)", () => {
  assert.match(text, /from "\.\/accessibility\.js"/);
  assert.match(text, /platformAccessibilityProps\(\{/);
  assert.match(text, /\{\.\.\.a11yProps\}/);
  assert.ok(
    !/accessibility(State|Label|Role)=/.test(text),
    "Text must not pass raw RN accessibility JSX props to the Tamagui text",
  );
});

test("BlankWord still labels its hidden button through Button (the label text is unchanged) (#235)", () => {
  assert.match(
    blankWord,
    /accessibilityLabel=\{`Reveal blank word \$\{index \+ 1\} of \$\{total\}`\}/,
  );
  assert.match(blankWord, /from "\.\/Button\.js"/);
});

const STACK_PRESSABLES = [
  "src/components/ToggleChipGroup.tsx",
  "src/components/RatingForm.tsx",
  "src/components/ColorPickerField.tsx",
  "src/components/SearchField.tsx",
  "src/components/StarRatingInput.tsx",
  "src/components/StepDots.tsx",
  "src/components/Avatar.tsx",
];

test("NumberStepper: group container and value input route through the translator; its buttons are DS Buttons (#235)", () => {
  const code = readCode("src/components/NumberStepper.tsx");
  assert.ok(code.includes("platformAccessibilityProps"));
  // The only raw accessibilityLabel props left in the file are the
  // ones passed TO the DS Button primitive (Decrease / Increase),
  // which is the sanctioned caller API — Button translates them.
  const rawLabels = code.match(/accessibilityLabel=\{/g) ?? [];
  assert.equal(rawLabels.length, 2, "only the two DS Button labels may remain as raw JSX props");
  assert.match(code, /accessibilityLabel=\{label \? `Decrease \$\{label\}` : "Decrease value"\}/);
  assert.match(code, /accessibilityLabel=\{label \? `Increase \$\{label\}` : "Increase value"\}/);
});

test("component-internal stack pressables route through the translator, never raw RN JSX props (#235)", () => {
  for (const rel of STACK_PRESSABLES) {
    const code = readCode(rel);
    assert.ok(
      code.includes("platformAccessibilityProps"),
      `${rel} must route its accessibility props through platformAccessibilityProps`,
    );
    assert.ok(
      !/accessibility(Label|State|Role)=/.test(code),
      `${rel} must not pass a raw accessibilityLabel/accessibilityState/accessibilityRole JSX prop to a Tamagui element`,
    );
  }
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
    return { React, renderToString, TamaguiProvider, ...dist };
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

const noop = () => null;

test("SSR: a labeled Button renders aria-label and no leaked RN attributes (#235)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      Button,
      {
        accessibilityLabel: "Reveal blank word 1 of 2",
        accessibilityState: { selected: true },
        onPress: noop,
      },
      "x",
    ),
  );
  assert.ok(
    html.includes('aria-label="Reveal blank word 1 of 2"'),
    `expected aria-label in: ${html.slice(html.indexOf("<button"), html.indexOf("<button") + 400)}`,
  );
  assert.ok(html.includes('aria-selected="true"'), "state.selected must render as aria-selected");
  assert.ok(!/accessibilitylabel/i.test(html), "accessibilitylabel must not leak to the DOM");
  assert.ok(!/accessibilitystate/i.test(html), "accessibilitystate must not leak to the DOM");
  assert.ok(!/accessibilityrole/i.test(html), "accessibilityrole must not leak to the DOM");
  assert.ok(!html.includes("[object Object]"), "no stringified state object in the DOM");
});

test("SSR: a disabled Button reports aria-disabled (#235)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Button, { disabled: true, accessibilityLabel: "Save" }, "Save"),
  );
  assert.ok(html.includes('aria-label="Save"'));
  assert.ok(html.includes('aria-disabled="true"'));
  assert.ok(!/accessibilitystate/i.test(html));
});

test("SSR: a hidden BlankWord's button has the accessible name from the issue (#235)", async () => {
  const { React, BlankWord } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(BlankWord, {
      word: "faith",
      revealed: false,
      onReveal: noop,
      index: 0,
      total: 2,
    }),
  );
  assert.ok(
    html.includes('aria-label="Reveal blank word 1 of 2"'),
    "the blank must be findable by role+name (spudly/memorize#53)",
  );
  assert.ok(!/accessibilitylabel/i.test(html));
  assert.ok(!/accessibilitystate/i.test(html));
  assert.ok(!html.includes("[object Object]"));
});

test("SSR: a revealed BlankWord's text carries its label as aria-label via Text (#235)", async () => {
  const { React, BlankWord } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(BlankWord, {
      word: "faith",
      revealed: true,
      onReveal: noop,
      index: 0,
      total: 2,
    }),
  );
  assert.ok(html.includes('aria-label="Revealed: faith"'));
  assert.ok(!/accessibilitylabel/i.test(html));
});
