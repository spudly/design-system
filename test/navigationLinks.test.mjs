/**
 * Contract test for the navigation-rule widget prerequisites
 * (spudly/design-system#248, stage 1).
 *
 * Stephen's navigation rule (2026-10-28): a control that navigates
 * to another page is a link with an href; anything else is a button
 * element with a callback. The #248 audit found the rule
 * unimplementable in pages because no DS control could carry an
 * href — TextLink/BackLink exposed link semantics but accepted only
 * onPress, and Button had no href form (an href passed to it
 * rendered as a stray attribute on a <button>). This stage ships
 * the widget prerequisites only; the page remodels are stage 2.
 *
 * The contract now:
 * 1. Button has two activation forms over ONE shared frame config:
 *    `onPress` renders the Tamagui Button (a <button> on web);
 *    `href` renders a Tamagui Anchor with the identical frame (a
 *    real <a href> on web; on native the Anchor opens the href
 *    through the platform link path). The forms are mutually
 *    exclusive in the props type (href form: no onPress, no icon),
 *    `href` is destructured by the wrapper so it can never leak
 *    onto the button element, and a disabled link renders WITHOUT
 *    its href (the ARIA disabled-link pattern) while still
 *    announcing `aria-disabled`.
 * 2. TextLink likewise: `href` renders a styled Anchor; `onPress`
 *    keeps the text pressable (with its tabIndex/Enter shim, which
 *    the anchor form does not need — a real anchor is
 *    keyboard-operable by default).
 * 3. BackLink's `href` is optional: with one, the back row (drawn
 *    arrow + label, unchanged) renders inside a styled Anchor; with
 *    `onPress` it renders the XStack pressable exactly as before.
 * 4. Tabs ships both variants (Stephen's tabs ruling on #248): the
 *    default button variant keeps the Tamagui Tabs primitive
 *    (role="tab", in-page switching via onValueChange); the link
 *    variant renders each tab as an anchor carrying the item's
 *    href, marks the current tab `aria-current="page"` on web, and
 *    takes no change callback.
 *
 * Source scans strip comments first, like the other contract tests
 * here, so prose cannot satisfy or trip the patterns. Runtime
 * checks SSR against the built output.
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

const button = readCode("src/components/Button.tsx");
const textLink = readCode("src/components/TextLink.tsx");
const backLink = readCode("src/components/BackLink.tsx");
const tabs = readCode("src/components/Tabs.tsx");
const index = readCode("src/components/index.ts");

test("Button: one shared frame config feeds the button and anchor frames (#248)", () => {
  assert.match(button, /const buttonFrameConfig = \{/);
  assert.match(button, /styled\(TamaguiButton, \{\s*name: "Button",\s*\.\.\.buttonFrameConfig,/);
  assert.match(button, /styled\(Anchor, \{\s*name: "ButtonLink",\s*\.\.\.buttonFrameConfig,/);
  assert.match(
    button,
    /import \{ Anchor, Button as TamaguiButton, styled, useTheme \} from "tamagui";/,
  );
});

test("Button: the href form is a distinct props shape — href required, onPress and icon excluded (#248)", () => {
  assert.match(button, /type ButtonLinkProps = /);
  assert.match(button, /href: string;/);
  assert.match(button, /onPress\?: never;/);
  assert.match(button, /icon\?: never;/);
  assert.match(
    button,
    /export type ButtonProps =\s*\(ButtonOwnProps & \{ href\?: undefined \} & ButtonIconShapes\) \| ButtonLinkProps;/,
  );
});

test("Button: href is destructured by the wrapper and withheld while disabled (#248)", () => {
  assert.match(button, /const isLink = href !== undefined;/);
  assert.match(button, /accessibilityRole: accessibilityRole \?\? \(isLink \? "link" : "button"\)/);
  assert.match(button, /\{\.\.\.\(disabled \? \{\} : \{ href \}\)\}/);
  assert.match(button, /<StyledLinkButton/);
});

test("TextLink: href form renders a styled Anchor over the shared frame; the forms are exclusive (#248)", () => {
  assert.match(textLink, /const textLinkFrameConfig = \{/);
  assert.match(
    textLink,
    /styled\(Anchor, \{\s*name: "TextLinkAnchor",\s*\.\.\.textLinkFrameConfig,/,
  );
  assert.match(textLink, /href: string;/);
  assert.match(textLink, /onPress\?: never;/);
  assert.match(textLink, /if \(href !== undefined\) \{/);
  assert.match(textLink, /<StyledTextAnchor \{\.\.\.a11yProps\} href=\{href\}/);
});

test("BackLink: href is optional and renders the row inside a styled Anchor (#248)", () => {
  assert.match(backLink, /styled\(Anchor, \{\s*name: "BackLinkAnchor",/);
  // The Anchor is text-based (display: inline on web by default),
  // so the styled frame must pin a web flex display or the row's
  // flexDirection/gap/min-height never take effect (CodeRabbit
  // finding on PR #283, verified in the SSR-generated CSS).
  assert.match(backLink, /display: "web:flex",/);
  assert.match(backLink, /href: string;/);
  assert.match(backLink, /onPress\?: never;/);
  assert.match(backLink, /if \(props\.href !== undefined\) \{/);
  assert.match(backLink, /<StyledBackAnchor href=\{props\.href\}/);
  // The callback form is untouched: the pinned XStack pressable and
  // its translator call survive (see also test/backLink.test.mjs).
  assert.match(backLink, /platformAccessibilityProps\(\{ accessibilityRole: "link" \}\)/);
});

test("Tabs: link variant items carry hrefs, the variant takes no change callback, LinkTabItem is exported (#248)", () => {
  assert.match(tabs, /export type LinkTabItem = \{/);
  assert.match(tabs, /href: string;/);
  assert.match(tabs, /variant: "link";/);
  assert.match(tabs, /onValueChange\?: never;/);
  assert.match(tabs, /styled\(Anchor, \{\s*name: "TabsLinkTab",/);
  assert.match(tabs, /aria-current/);
  assert.match(index, /type LinkTabItem/);
  assert.match(index, /from "\.\/Tabs\.js"/);
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

test("SSR: a Button with href renders a real anchor, not a button (#248)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Button, { href: "/recipes" }, "Browse recipes"),
  );
  assert.match(
    html,
    /<a[^>]*href="\/recipes"/,
    `expected an anchor with the href in: ${html.slice(-600)}`,
  );
  assert.ok(!html.includes("<button"), "the href form must not render a <button>");
  assert.ok(html.includes('role="link"'), "the href form carries link semantics");
});

test("SSR: a Button with onPress renders a button and no stray href (#248)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(React.createElement(Button, { onPress: noop }, "Save recipe"));
  assert.ok(html.includes("<button"), "the callback form renders a <button>");
  assert.ok(!/<button[^>]*href=/.test(html), "the href must never leak onto the button element");
  assert.ok(!/<a[\s>]/.test(html), "the callback form renders no anchor");
});

test("SSR: a disabled href Button renders no href but announces aria-disabled (#248)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Button, { href: "/recipes", disabled: true }, "Browse recipes"),
  );
  assert.ok(/<a[\s>]/.test(html), "the href form still renders the anchor element");
  assert.ok(
    !/<a[^>]*href=/.test(html),
    "a disabled link is not followable — the anchor carries no href",
  );
  assert.ok(html.includes('aria-disabled="true"'), "the disabled state is still announced");
});

test("SSR: TextLink's href form is an anchor; its callback form is not (#248)", async () => {
  const { React, TextLink } = await loadRuntime();
  const linked = await renderToHtml(
    React.createElement(TextLink, { href: "/forgot-password" }, "Forgot your password?"),
  );
  assert.match(linked, /<a[^>]*href="\/forgot-password"/);
  const pressed = await renderToHtml(
    React.createElement(TextLink, { onPress: noop }, "Forgot your password?"),
  );
  assert.ok(!/<a[\s>]/.test(pressed), "the callback form must not render an anchor");
  assert.ok(pressed.includes('role="link"'), "the callback form keeps link semantics");
});

test("SSR: BackLink's href form is an anchor carrying the label; its callback form is not (#248)", async () => {
  const { React, BackLink } = await loadRuntime();
  const linked = await renderToHtml(
    React.createElement(BackLink, { href: "/recipes", label: "Back to recipes" }),
  );
  assert.match(linked, /<a[^>]*href="\/recipes"/);
  assert.ok(linked.includes("Back to recipes"), "the label renders inside the anchor");
  const pressed = await renderToHtml(React.createElement(BackLink, { onPress: noop }));
  assert.ok(!/<a[\s>]/.test(pressed), "the callback form must not render an anchor");
  assert.ok(pressed.includes("Back"), "the default label renders");
});

test("SSR: Tabs' link variant renders anchors and marks the current tab; the button variant keeps tab semantics (#248)", async () => {
  const { React, Tabs } = await loadRuntime();
  const linked = await renderToHtml(
    React.createElement(Tabs, {
      variant: "link",
      value: "search",
      tabs: [
        { value: "verses", label: "My verses", href: "/verses" },
        { value: "search", label: "Search", href: "/search" },
      ],
    }),
  );
  assert.match(linked, /<a[^>]*href="\/verses"/);
  assert.match(linked, /<a[^>]*href="\/search"/);
  assert.ok(linked.includes('aria-current="page"'), "the current tab is marked");
  assert.ok(!linked.includes('role="tab"'), "navigating tabs are links, not tab-role elements");

  const buttoned = await renderToHtml(
    React.createElement(Tabs, {
      value: "overview",
      onValueChange: noop,
      tabs: [
        { value: "overview", label: "Overview" },
        { value: "ingredients", label: "Ingredients" },
      ],
    }),
  );
  assert.ok(buttoned.includes('role="tab"'), "the button variant keeps tab semantics");
  assert.ok(!/<a[^>]*href=/.test(buttoned), "the button variant renders no anchors");
});
