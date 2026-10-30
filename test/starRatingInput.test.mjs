/**
 * Contract test for the StarRatingInput adapter-parity props
 * (spudly/design-system#159).
 *
 * The eciperay app adapter `ui/StarRatingInput` wrapped the DS component
 * to supply four behaviors it lacked: a `tone` (dark cooking-overlay
 * variant), toggle-off (tap the current rating to clear), readOnly, and
 * disabled. This test pins the DS-side contract so the adapter can be
 * deleted: the props exist, toggle-off is opt-in via `allowClear` and
 * clears through `onChange(0)`, readOnly renders no radio buttons, and
 * disabled blocks presses.
 *
 * Source scan, not a render test: the invariant is a per-literal
 * property of the component source, matching this repo's other
 * component contract tests. Comments are stripped before scanning so
 * explanatory comments cannot satisfy the patterns.
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

const code = codeOf("src/components/StarRatingInput.tsx");

test("StarRatingInput declares tone, allowClear, readOnly and disabled props (#159)", () => {
  assert.match(code, /tone\?: StarRatingTone/);
  assert.match(code, /allowClear\?: boolean/);
  assert.match(code, /readOnly\?: boolean/);
  assert.match(code, /disabled\?: boolean/);
  assert.match(code, /tone = "default"/);
  assert.match(code, /allowClear = false/);
});

test("dark tone renders unselected stars near-white at reduced opacity (#159)", () => {
  assert.match(code, /tone === "dark"/);
  assert.match(code, /tokens\.colors\.gray\.gray1/);
});

test("allowClear clears through onChange(0) only when enabled (#159)", () => {
  assert.match(code, /onChange\(allowClear && star === value \? 0 : star\)/);
});

test("readOnly renders a static image-role display, not radio buttons (#159)", () => {
  assert.match(code, /readOnly \? \(/);
  // #235: the role crosses through platformAccessibilityProps (the
  // helper-call object form), which maps image -> img + aria-label
  // on web instead of leaking the RN props as raw HTML attributes.
  assert.match(code, /accessibilityRole: "image"/);
  assert.match(code, /Rated \$\{value\} out of 5 stars/);
});

test("disabled blocks presses and dims the radiogroup (#159)", () => {
  assert.match(code, /if \(disabled\) \{\s*return;/);
  assert.match(code, /opacity=\{disabled \? 0\.5 : 1\}/);
  assert.match(code, /accessibilityState: \{ disabled \}/);
});

test("disabled stars leave the focus order on both platforms (#316)", () => {
  // Native: `focusable={false}` alongside the Tamagui `disabled`
  // prop, riding a native-only spread (Tamagui's stack types do not
  // declare the RN View prop) — a disabled star is not a focus stop.
  assert.match(code, /disabled=\{disabled\}/);
  assert.match(code, /disabled && !isWeb/);
  assert.match(code, /focusable: false/);
  // Web: the tab order mirrors it — disabled stars carry
  // tabIndex -1, enabled stars 0 (the Badge / TextAction pattern).
  assert.match(code, /tabIndex=\{disabled \? -1 : 0\}/);
});

test("the disabled announcement is consistent on web (#316)", () => {
  // The translator's aria-disabled (from accessibilityState) is
  // restated explicitly on web AFTER the Tamagui `disabled` prop,
  // so a disabled star can never render `aria-disabled="false"`
  // alongside its disabled state.
  assert.match(code, /isWeb \? \{ "aria-disabled": disabled \} : null/);
});

test("enabled stars activate from the keyboard on web (#316)", () => {
  // Focusable enabled stars must be activatable: Enter and Space
  // invoke the same change as a press, held-key repeats ignored,
  // and disabled stars never activate.
  assert.match(code, /onKeyDown=\{handleKeyDown\}/);
  assert.match(code, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(code, /!event\.repeat/);
});

// Runtime (SSR, against the built output) pins for #316, mirroring
// the buttonWebAria harness: the source pins above hold the shape,
// these hold what web actually renders.
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

function starTags(html) {
  return html.match(/<[a-z]+[^>]*aria-label="Rate [^>]*>/g) ?? [];
}

const noop = () => null;

test("SSR: disabled stars render aria-disabled=true and tabindex=-1, never a contradiction (#316)", async () => {
  const { React, StarRatingInput } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(StarRatingInput, { value: 3, onChange: noop, disabled: true }),
  );
  const tags = starTags(html);
  assert.equal(tags.length, 5, "five star controls render");
  for (const tag of tags) {
    assert.ok(tag.includes('aria-disabled="true"'), `disabled is announced: ${tag}`);
    assert.ok(!tag.includes('aria-disabled="false"'), `no contradictory announcement: ${tag}`);
    assert.ok(tag.includes('tabindex="-1"'), `out of the tab order: ${tag}`);
    assert.ok(!/ disabled[ =>]/.test(tag), `no native disabled attribute fighting aria: ${tag}`);
  }
});

test("SSR: enabled stars stay in the tab order with aria-disabled=false (#316)", async () => {
  const { React, StarRatingInput } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(StarRatingInput, { value: 3, onChange: noop }),
  );
  const tags = starTags(html);
  assert.equal(tags.length, 5, "five star controls render");
  for (const tag of tags) {
    assert.ok(tag.includes('tabindex="0"'), `enabled star is focusable: ${tag}`);
    assert.ok(tag.includes('aria-disabled="false"'), `enabled star announces enabled: ${tag}`);
  }
});

test("SSR: readOnly renders no focusable star controls (#316)", async () => {
  const { React, StarRatingInput } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(StarRatingInput, { value: 3, onChange: noop, readOnly: true }),
  );
  assert.equal(starTags(html).length, 0, "no radio star controls in the static display");
  assert.ok(html.includes('aria-label="Rated 3 out of 5 stars"'), "the static display is named");
  assert.ok(!html.includes('tabindex="-1"'), "no disabled-star treatment in the read-only display");
});
