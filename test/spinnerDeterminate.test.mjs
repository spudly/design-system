/**
 * Contract test for the Spinner's determinate mode (design-system
 * #178, the shuoink/ui ProgressSpinner adoption).
 *
 * Stephen's decision on #178: ProgressSpinner is NOT a standalone
 * widget — it folds into `Spinner` as its determinate variant (a
 * 0–100 `value`), alongside the existing indeterminate mode, for
 * waits with known progress (uploads, AI generation). The contract
 * pinned here:
 *
 * 1. `value` is an optional prop; when it is absent the component
 *    renders the original indeterminate Tamagui spinner path,
 *    untouched (aria-label from `label`, "$" token prefix stripped
 *    for Tamagui's color lookup).
 * 2. With a `value`, the determinate ring renders instead: the value
 *    clamped 0–100 (ProgressBar's idiom), the arc built from two
 *    half-clipped bordered rings over a full $progressTrack track,
 *    fill from the `color` prop (default "$primary").
 * 3. The ring carries progressbar semantics through the shared
 *    platformAccessibilityProps translator (ProgressBar's pattern):
 *    role "progressbar", accessibilityValue {min 0, max 100, now}.
 * 4. The component source imports NO react-native-svg and NO
 *    react-native: Spinner is exported from the package root, whose
 *    entry must stay importable in plain Node (the icons module
 *    lives behind ./icons for exactly this reason), and the dist
 *    root still loads with the ring in its graph.
 * 5. Stories cover the determinate mode in the shared CSF (both
 *    storybooks read the same file): determinate stories with value
 *    args, a complete (100) story, a large story, and a states story
 *    sweeping 0/25/50/75/100.
 *
 * Source scan like this repo's other contract tests (comments are
 * stripped so explanatory comments cannot satisfy the patterns),
 * plus a dist import smoke test for (4) and an SSR render check for
 * (3): the source scan alone cannot catch the ring's View losing its
 * translated props spread, so the rendered ARIA output is asserted
 * too, the same way pageWebAria.test.mjs pins ProgressBar's.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function codeOf(rel) {
  const source = readFileSync(join(here, "..", rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const code = codeOf("src/components/Spinner.tsx");
const stories = codeOf("src/components/Spinner.stories.tsx");

test("Spinner declares the optional determinate value prop (#178)", () => {
  assert.match(code, /value\?: number/);
  assert.match(code, /if \(value !== undefined\)/);
  assert.match(code, /<ProgressRing label=\{label\} color=\{color\} value=\{value\}/);
});

test("the indeterminate path is the original Tamagui spinner, untouched (#178)", () => {
  assert.match(code, /color\.startsWith\("\$"\) \? color\.slice\(1\) : color/);
  assert.match(code, /<TamaguiSpinner color=\{resolvedColor\} aria-label=\{label\}/);
});

test("the ring clamps its value and builds the arc from two clipped half-rings (#178)", () => {
  assert.match(code, /Math\.min\(100, Math\.max\(0, value\)\)/);
  // Full track in the theme's progressTrack role, as ProgressBar.
  assert.match(code, /borderColor="\$progressTrack"/);
  // Two half clips (one per side), each hiding its ring's other half.
  assert.equal(code.match(/overflow="hidden"/g)?.length, 2);
  // Right semicircle: bottom+left colored, rotated past the 45°
  // border-diagonal offset by the capped progress angle.
  assert.match(code, /borderBottomColor=\{color\}/);
  assert.match(code, /borderLeftColor=\{color\}/);
  assert.match(code, /rightAngle \+ 45/);
  // Left semicircle: top+right colored, driven by the angle past 180°.
  assert.match(code, /borderTopColor=\{color\}/);
  assert.match(code, /borderRightColor=\{color\}/);
  assert.match(code, /leftAngle \+ 45/);
  assert.match(code, /Math\.min\(angle, 180\)/);
  assert.match(code, /Math\.max\(angle - 180, 0\)/);
});

test("the ring exposes progressbar semantics through the shared translator (#178)", () => {
  assert.match(code, /platformAccessibilityProps\(/);
  assert.match(code, /accessibilityRole: accessibilityRole \?\? "progressbar"/);
  assert.match(code, /accessibilityValue: accessibilityValue \?\? \{ min: 0, max: 100, now:/);
  assert.match(code, /accessibilityLabel: accessibilityLabel \?\? label/);
});

test("Spinner stays free of react-native-svg and react-native imports (#178)", () => {
  assert.doesNotMatch(code, /from "react-native-svg"/);
  assert.doesNotMatch(code, /from "react-native"/);
  // Stephen's conventions: type aliases only, no interface declarations.
  assert.doesNotMatch(code, /\binterface\s/);
});

test("the dist root still loads in plain Node with the ring in its graph (#178)", async () => {
  const mod = await import("../dist/index.js");
  assert.equal(typeof mod.Spinner, "function");
});

// Runtime imports are lazy (inside the SSR test) so the source-scan
// tests above still run and report when the build output is missing
// or broken, instead of the whole file failing at import time —
// pageWebAria.test.mjs's pattern.
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
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  // Strip the Tamagui CSS block: the assertions are about the rendered
  // elements' attributes, not stylesheet text.
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

test("SSR: the determinate ring renders its progressbar semantics (#178)", async () => {
  const { React, Spinner } = await loadRuntime();
  const html = await renderToHtml(React.createElement(Spinner, { value: 25 }));
  assert.ok(
    html.includes('role="progressbar"'),
    `expected progressbar role in: ${html.slice(0, 600)}`,
  );
  assert.ok(html.includes('aria-valuenow="25"'));
  assert.ok(html.includes('aria-valuemin="0"'));
  assert.ok(html.includes('aria-valuemax="100"'));
  // The default `label` is the accessible name.
  assert.ok(html.includes('aria-label="Loading"'));
  // No leaked RN attributes, no stringified value object.
  assert.ok(!/accessibilityvalue/i.test(html), "accessibilityvalue must not leak to the DOM");
  assert.ok(!html.includes("[object Object]"), "no stringified value object in the DOM");
  // A non-finite value (a 0/0 progress ratio) announces as 0, not NaN.
  const nan = await renderToHtml(React.createElement(Spinner, { value: Number.NaN }));
  assert.ok(
    nan.includes('aria-valuenow="0"'),
    `expected NaN to announce as 0 in: ${nan.slice(0, 600)}`,
  );
});

test("stories cover the determinate mode (#178)", () => {
  assert.match(stories, /title: "Components\/Spinner"/);
  assert.match(stories, /export const Determinate: Story = \{\s*args: \{ value: 65/);
  assert.match(stories, /export const DeterminateComplete: Story = \{\s*args: \{ value: 100/);
  assert.match(
    stories,
    /export const DeterminateLarge: Story = \{\s*args: \{ value: 30, size: "large"/,
  );
  assert.match(stories, /export const DeterminateStates: Story/);
  for (const v of [0, 25, 50, 75, 100]) {
    assert.match(
      stories,
      new RegExp(String.raw`value=\{${v}\}`),
      `states story must include value ${v}`,
    );
  }
  // The indeterminate stories remain.
  assert.match(stories, /export const Default: Story/);
  assert.match(stories, /export const Large: Story/);
});
