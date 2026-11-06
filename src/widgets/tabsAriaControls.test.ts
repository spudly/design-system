/**
 * Regression tests for #454: the Tabs widget renders triggers
 * only — it has never rendered tab panels for any consumer — so
 * a tab must not carry an `aria-controls` reference to a panel
 * that does not exist. Tamagui's headless useTab generates a
 * panel id per tab (`<baseId>-content-<value>`) and puts it in
 * `aria-controls` unconditionally; the DS wrapper suppresses
 * that dangling reference at the widget level (Option 2,
 * approved by Stephen 2026-11-05), because the generated id is
 * internal to the widget and no consumer can render a panel
 * that matches it.
 *
 * Acceptance (#454): for the button variant, every rendered
 * `aria-controls` resolves to an element in the same document
 * or is not emitted. The link variant is audited for the same
 * class of reference: it renders plain anchors, which carry no
 * `aria-controls` at all.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadInternalDist } from "../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

test("source: the button variant suppresses the primitive's dangling aria-controls", () => {
  const tabs = codeOf("src/widgets/Tabs.tsx");
  assert.match(
    tabs,
    /"aria-controls": undefined/,
    "StyledTab is rendered with aria-controls explicitly suppressed (#454)",
  );
});

// Runtime imports are lazy, like tabsIcon.test.ts, so the
// source scans still report when the build output is missing.
let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    return { React, renderToString, TamaguiProvider, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

function assertNoDanglingAriaControls(html: string) {
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
  const controls = [...html.matchAll(/ aria-controls="([^"]+)"/g)].map((match) => match[1]!);
  for (const target of controls) {
    assert.ok(ids.has(target), `aria-controls="${target}" resolves to a rendered element`);
  }
  return controls;
}

test("SSR: button-variant tabs emit no dangling aria-controls", async () => {
  const { React, Tabs } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Tabs, {
      tabs: [
        { value: "overview", label: "Overview" },
        { value: "ingredients", label: "Ingredients" },
      ],
      value: "overview",
      onValueChange: () => {},
      label: "Recipe sections",
    }),
  );
  assert.match(html, /role="tablist"/);
  assert.match(html, /role="tab"/, "the triggers keep their tab semantics");
  assert.equal(
    assertNoDanglingAriaControls(html).length,
    0,
    "no panel is rendered, so no aria-controls is emitted",
  );
});

test("SSR: link-variant tabs emit no aria-controls either", async () => {
  const { React, Tabs } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Tabs, {
      variant: "link",
      tabs: [
        { value: "verses", label: "My verses", href: "/verses" },
        { value: "search", label: "Search", href: "/search" },
      ],
      value: "verses",
      label: "Memorize sections",
    }),
  );
  assert.equal(assertNoDanglingAriaControls(html).length, 0);
});
