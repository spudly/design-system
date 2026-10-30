/**
 * Contract test for spudly/design-system#299: ScreenContainer's
 * content column (StyledContent) carries the shell's static 16px
 * section gap (`gap: tokens.spacing[4]`), and pages rely on it as
 * their only section separation (e.g. MealPlansPage's loading
 * spinner sits "16px below the create button" per
 * docs/manual-tests.md). On web the gap never reached the children:
 * every scrollable-shell page stacked its blocks flush (measured
 * 0px at every joint in the react Storybook), while native rendered
 * the 16dp separation correctly.
 *
 * Root cause (reproduced in SSR against the built output): the
 * #265 fix destructured `gap` out of ScreenContainer's props and
 * passed it back unconditionally as `gap={gap}`. When the caller
 * passes no gap — the normal case — that is an explicit
 * `gap={undefined}` prop, and in Tamagui's web style merge an
 * explicitly-present prop overrides the styled component's static
 * value: the `gap:16px` CSS rule is generated but its class is
 * never applied to the element, so the column's computed rowGap is
 * `normal`. Native's merge ignores the undefined and keeps the
 * static gap, which is why only web lost the separation. A styled
 * component with a static gap renders the gap class when no gap
 * prop is passed, and loses it the moment `gap={undefined}` is
 * passed — both halves are pinned by the runtime tests below via
 * ScreenContainer itself.
 *
 * The contract now:
 * 1. Source: ScreenContainer spreads the caller's gap into
 *    StyledContent ONLY when one was actually passed (the PageFrame
 *    conditional-spread idiom); it never passes `gap={gap}`
 *    unconditionally.
 * 2. Runtime (SSR, against the built output): the ScreenContainer
 *    element carries a class whose generated CSS rule is
 *    `gap:16px`, in both the scrollable (default) and
 *    non-scrollable shells, when the caller passes no gap.
 * 3. A caller's explicit gap still wins (the #265 contract):
 *    `gap={24}` renders `gap:24px` on the shell column, and the
 *    auth variant's capped inner column carries the 16px gap when
 *    no caller gap is passed.
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

test("the caller's gap is spread into StyledContent only when actually passed (#299)", () => {
  const code = readCode("src/components/ScreenContainer.tsx");
  assert.ok(
    !/gap=\{gap\}/.test(code),
    "an unconditional gap={gap} passes gap={undefined} when no caller gap exists, clobbering the static 16px gap on web",
  );
  assert.match(
    code,
    /\{\.\.\.\(gap !== undefined \? \{ gap \} : null\)\}/,
    "StyledContent must receive the caller's gap via a conditional spread so an absent gap leaves the styled static gap in place",
  );
});

// Runtime imports are lazy (inside the SSR tests) so the source scan
// above still runs and reports when the build output is missing or
// broken, instead of the whole file failing at import time.
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

/** The generated CSS declarations for one class in the SSR style block. */
function declarationsFor(html, className) {
  const match = html.match(new RegExp(String.raw`\.${className}\{([^}]*)\}`));
  return match ? match[1] : "";
}

/** The gap value (e.g. "16px") the named element's classes generate, or null. */
function renderedGap(html, elementName) {
  const element = html.match(new RegExp(`<div name="${elementName}" class="([^"]*)"`));
  assert.ok(element, `expected a rendered element named ${elementName} in: ${html.slice(-600)}`);
  for (const className of element[1].split(/\s+/)) {
    const declarations = declarationsFor(html, className);
    const gap = declarations.match(/(?:^|;)gap:([\d.]+px)/);
    if (gap) return gap[1];
  }
  return null;
}

async function renderShell(props) {
  const { React, ScreenContainer } = await loadRuntime();
  const child = (label) => React.createElement("div", { key: label }, label);
  return renderToHtml(React.createElement(ScreenContainer, props, child("a"), child("b")));
}

test("SSR: the scrollable shell's column carries the 16px gap with no caller gap (#299)", async () => {
  const html = await renderShell(null);
  assert.equal(renderedGap(html, "ScreenContainer"), "16px");
});

test("SSR: the non-scrollable shell's column carries the 16px gap with no caller gap (#299)", async () => {
  const html = await renderShell({ scrollable: false });
  assert.equal(renderedGap(html, "ScreenContainer"), "16px");
});

test("SSR: a caller's explicit gap still overrides the shell column's gap (#265/#299)", async () => {
  const html = await renderShell({ gap: 24 });
  assert.equal(renderedGap(html, "ScreenContainer"), "24px");
});

test("SSR: the auth shell's capped column carries the 16px gap with no caller gap (#299)", async () => {
  const html = await renderShell({ variant: "auth", scrollable: false });
  assert.equal(renderedGap(html, "ScreenContainerAuthContent"), "16px");
});
