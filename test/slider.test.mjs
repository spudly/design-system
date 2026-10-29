/**
 * Contract tests for the Slider field (spudly/design-system#178,
 * adopting shuoink/ui's Slider as spec).
 *
 * The contracts pinned here:
 * 1. Slider and the SliderTick type are exported from the package
 *    root (dist).
 * 2. The contract is scalar and controlled, like every DS field:
 *    `value: number` + `onValueChange(value)` (the SelectField /
 *    RadioOptionGroup shape). Tamagui's array-valued Slider API is
 *    adapted inside the component — `value={[value]}` in, the first
 *    element out — and never leaks into the props.
 * 3. The spec's range props carry over with the Tamagui defaults:
 *    min 0, max 100, step 1 — and out-of-contract values (non-finite
 *    bounds, max <= min, non-positive or non-finite step) are
 *    normalized inside the component, never forwarded: the
 *    primitive divides by both the range and the step.
 * 4. Field chrome follows the DS field pattern (SelectField /
 *    CheckboxField): `label` renders through a Label associated by
 *    id and is also the thumb's accessible name (routed through
 *    platformAccessibilityProps — the thumb is the focusable,
 *    slider-role element); a bare slider with no `label` takes its
 *    name from the explicit `accessibilityLabel` prop instead
 *    (which wins when both are set). `error` renders as the error
 *    Text variant with a generated id, wired to the thumb via
 *    aria-describedby / aria-invalid.
 * 5. Ticks are data, not children: `ticks?: SliderTick[]`
 *    ({ value, label }), each label positioned under its value's
 *    clamped percentage along the track, centered except the first
 *    (flush left) and last (flush right) — the spec's datalist row,
 *    as a view-model instead of <option> children.
 * 6. The spec's form-library integration does NOT carry over: no
 *    `meta` prop, no field-group decorator (the #178 audit: the
 *    FieldMeta pattern conflicts with the DS controlled-props
 *    convention; DS fields carry label + error instead).
 * 7. DS hard rules: type aliases only (no `interface`), no margins
 *    for spacing (#209), no direct import of react-native /
 *    react-native-svg, no "Spudly"-prefixed styled names, and no
 *    styling props (`style` / `className`) in the props type — DS
 *    components own their styles completely.
 * 8. Runtime (SSR, against the built output): the thumb renders
 *    with role="slider" and the primitive's aria-value* attributes,
 *    the label as its accessible name, the tick labels and error
 *    text in the markup, the error wired via aria-describedby, and
 *    no raw React Native accessibility attributes leaking to the DOM.
 * 9. Native adjust actions: the primitive declares no
 *    accessibilityActions, so the thumb carries increment /
 *    decrement actions on native only (web already has the arrow
 *    keys, and RN props would leak to the DOM there), each moving
 *    the controlled value by one step, clamped to the range, inert
 *    while disabled.
 *
 * Source scan for the per-literal invariants (like this repo's other
 * component contract tests; comments are stripped first so prose
 * cannot satisfy the patterns), plus a dist import for the export
 * contract — `npm test` builds before running. The dist root graph
 * reaches the icons module (Accordion/DropdownButton), so this file
 * registers the harness's react-native-svg stub before importing
 * dist (see registerSvgStub.mjs).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const dist = await import("../dist/index.js");

function codeOf(rel) {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const slider = codeOf("src/components/Slider.tsx");

test("Slider is exported from the package root", () => {
  assert.equal(typeof dist.Slider, "function", "Slider must be exported from dist/index.js");
});

test("the contract is scalar and controlled; the Tamagui array API stays inside", () => {
  assert.match(slider, /export type SliderProps = \{/);
  assert.match(slider, /value: number/);
  assert.match(slider, /onValueChange: \(value: number\) => void/);
  assert.match(slider, /value=\{\[value\]\}/);
  assert.match(slider, /const next = values\[0\]/);
  assert.match(slider, /onValueChange\(next\)/);
  assert.doesNotMatch(slider, /value: number\[\]/, "the array form must not leak into the props");
});

test("range props carry the spec's shape with the Tamagui defaults", () => {
  assert.match(slider, /min\?: number/);
  assert.match(slider, /max\?: number/);
  assert.match(slider, /step\?: number/);
  assert.match(slider, /minProp = 0/);
  assert.match(slider, /maxProp = 100/);
  assert.match(slider, /stepProp = 1/);
  assert.match(slider, /min=\{min\}/);
  assert.match(slider, /max=\{max\}/);
  assert.match(slider, /step=\{step\}/);
});

test("out-of-contract range values are normalized, never forwarded", () => {
  // The primitive divides by (max - min) and by step, so the raw
  // props must not reach it: finite bounds, max > min, positive step.
  assert.match(slider, /const min = Number\.isFinite\(minProp\) \? minProp : 0/);
  assert.match(slider, /Number\.isFinite\(maxProp\) && maxProp > min \? maxProp : min \+ 1/);
  assert.match(slider, /Number\.isFinite\(stepProp\) && stepProp > 0 \? stepProp : 1/);
});

test("field chrome: label by id, error text with its generated id", () => {
  assert.match(slider, /label\?: string/);
  assert.match(slider, /error\?: string/);
  assert.match(slider, /<Label htmlFor=\{id\}/);
  assert.match(slider, /const errorId = `\$\{id\}-error`/);
  assert.match(slider, /<Text variant="error" id=\{errorId\}>/);
});

test("the thumb carries the label as its accessible name and the error wiring", () => {
  // The thumb is the focusable slider-role element, so the field's
  // accessible name and error description land on it — the name
  // through the shared translator (#235), never as raw RN props.
  // A bare slider (no visible label) is named by the explicit
  // accessibilityLabel prop, which wins when both are set.
  assert.match(slider, /accessibilityLabel\?: string/);
  assert.match(slider, /const accessibleName = accessibilityLabel \?\? label/);
  assert.match(slider, /platformAccessibilityProps\(\{ accessibilityLabel: accessibleName \}\)/);
  assert.match(slider, /aria-invalid=\{error \? true : undefined\}/);
  assert.match(slider, /aria-describedby=\{error \? errorId : undefined\}/);
  assert.match(slider, /index=\{0\}/);
});

test("the thumb carries native increment/decrement adjust actions, native only", () => {
  // The primitive declares no accessibilityActions, so VoiceOver /
  // TalkBack adjust gestures need these on the thumb. Web is
  // excluded (the empty branch): the primitive handles the arrow
  // keys there, and raw RN props leak to the DOM (#235).
  assert.match(slider, /const nativeAdjustProps/);
  assert.match(slider, /isWeb\s+\?\s+\{\}/);
  assert.match(
    slider,
    /accessibilityActions: \[\{ name: "increment" \}, \{ name: "decrement" \}\]/,
  );
  assert.match(slider, /onAccessibilityAction: \(event\) =>/);
  assert.match(slider, /nativeEvent\.actionName === "increment"/);
  assert.match(slider, /nativeEvent\.actionName === "decrement"/);
  assert.match(slider, /onValueChange\(Math\.min\(max, Math\.max\(min, value \+ delta\)\)\)/);
  assert.match(slider, /\{\.\.\.nativeAdjustProps\}/);
});

test("disabled passes through to the primitive and dims the control", () => {
  assert.match(slider, /disabled\?: boolean/);
  assert.match(slider, /disabled = false/);
  assert.match(slider, /disabled=\{disabled\}/);
  assert.match(slider, /opacity=\{disabled \? 0\.5 : 1\}/);
});

test("ticks are a { value, label } view-model positioned by clamped percentage", () => {
  assert.match(slider, /export type SliderTick = \{/);
  assert.match(slider, /ticks\?: SliderTick\[\]/);
  assert.match(
    slider,
    /Math\.min\(100, Math\.max\(0, \(\(tick\.value - min\) \/ range\) \* 100\)\)/,
  );
  // Middle labels center on their value; the ends stay flush with
  // the track instead of overflowing it.
  assert.match(slider, /percent <= 0 \? "0%" : percent >= 100 \? "-100%" : "-50%"/);
  assert.match(slider, /<Text variant="hint">\{tick\.label\}<\/Text>/);
});

test("the spec's form-library integration does not carry over", () => {
  assert.doesNotMatch(slider, /\bmeta\?:/, "FieldMeta is a form-library pattern, not a DS prop");
  assert.doesNotMatch(slider, /withFieldGroup/, "DS fields carry their own label + error");
  assert.doesNotMatch(slider, /SliderGroup/, "the field-group decorator has no DS counterpart");
});

test("the styled parts are token-driven and the thumb target is 44px around a 24px knob", () => {
  assert.match(slider, /name: "SliderTrack"/);
  assert.match(slider, /name: "SliderTrackActive"/);
  assert.match(slider, /name: "SliderThumb"/);
  assert.match(slider, /name: "SliderThumbKnob"/);
  // Track and fill reuse the progress pairing (ProgressBar / Spinner
  // ring): $progressTrack under a $primary fill.
  assert.match(slider, /backgroundColor: "\$progressTrack"/);
  assert.match(slider, /backgroundColor: "\$primary"/);
  assert.match(slider, /width: 44/);
  assert.match(slider, /height: 44/);
  assert.match(slider, /width: tokens\.spacing\[6\]/);
});

test("Slider follows the DS hard rules: aliases only, no margins, no direct native imports, no styling props", () => {
  assert.doesNotMatch(slider, /\binterface\s/, "Slider must use type aliases, not interfaces");
  assert.doesNotMatch(
    slider,
    /\bmargin(Top|Bottom|Left|Right|Vertical|Horizontal)?=/,
    "Slider must space with gap/padding, not margins (#209)",
  );
  assert.doesNotMatch(
    slider,
    /from "(react-native|react-native-svg)/,
    "Slider must not import react-native/react-native-svg directly",
  );
  assert.doesNotMatch(slider, /name: "Spudly/, "Slider must not prefix styled names with Spudly");
  assert.doesNotMatch(slider, /\bstyle\?:/, "Slider must not accept a style prop");
  assert.doesNotMatch(slider, /className/, "Slider must not accept a className prop");
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
    const distModule = await import("../dist/index.js");
    return { React, renderToString, TamaguiProvider, ...distModule };
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

test("SSR: the thumb renders slider semantics with the label as its name", async () => {
  const { React, Slider } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Slider, {
      label: "Rating",
      min: 1,
      max: 10,
      value: 5,
      onValueChange: () => null,
    }),
  );
  assert.ok(html.includes("Rating"), "the field label must render");
  assert.ok(html.includes('role="slider"'), "the thumb must carry the slider role");
  assert.ok(html.includes('aria-valuemin="1"'), "the thumb must report the range minimum");
  assert.ok(html.includes('aria-valuemax="10"'), "the thumb must report the range maximum");
  assert.ok(html.includes('aria-valuenow="5"'), "the thumb must report the current value");
  assert.ok(html.includes('aria-label="Rating"'), "the label must be the slider's accessible name");
  assert.ok(!html.includes("accessibilitylabel"), "no raw RN accessibility attributes may leak");
  assert.ok(
    !html.includes("accessibilityactions"),
    "the native adjust actions must not leak to the DOM on web",
  );
});

test("SSR: a bare slider takes its accessible name from accessibilityLabel", async () => {
  const { React, Slider } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Slider, {
      accessibilityLabel: "Portion size",
      value: 3,
      onValueChange: () => null,
    }),
  );
  assert.ok(html.includes('role="slider"'), "the thumb must carry the slider role");
  assert.ok(
    html.includes('aria-label="Portion size"'),
    "accessibilityLabel must name a slider that has no visible label",
  );
});

test("SSR: tick labels and the error render, the error wired to the thumb", async () => {
  const { React, Slider } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Slider, {
      label: "Rating",
      min: 1,
      max: 10,
      value: 5,
      onValueChange: () => null,
      ticks: [
        { value: 1, label: "One" },
        { value: 5, label: "Five" },
        { value: 10, label: "Ten" },
      ],
      error: "Choose a level before continuing.",
    }),
  );
  assert.ok(html.includes("One"), "the first tick label must render");
  assert.ok(html.includes("Five"), "the middle tick label must render");
  assert.ok(html.includes("Ten"), "the last tick label must render");
  assert.ok(html.includes("Choose a level before continuing."), "the error text must render");
  assert.ok(html.includes('aria-invalid="true"'), "the thumb must report the error state");
  const describedBy = /aria-describedby="([^"]+)"/.exec(html);
  assert.ok(describedBy, "the thumb must point at the error text");
  assert.ok(
    html.includes(`id="${describedBy[1]}"`),
    "the aria-describedby target must be the rendered error element",
  );
});
