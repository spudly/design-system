/**
 * Contract + behavior tests for the Tabs icon slot and tab-list
 * label (#438 Part 5, building on Part 4's icon-name registry):
 *
 * 1. A button-variant tab item may carry an icon NAME (`icon`,
 *    the internal registry's `IconName` type) — data, never a
 *    component. Tabs resolves the name through `iconsByName` and
 *    renders the glyph left of the label, the way Button's icon
 *    slot resolves names (Part 4). (Glyph rendering itself is
 *    pinned by source scan: this harness renders icons inert —
 *    see test/registerSvgStub.ts.)
 * 2. The link variant takes NO icon: its item type has no `icon`
 *    field, mirroring Button (the href form's props omit the icon
 *    slot — a link tab's label is its content).
 * 3. Both variants accept `label`, the tab list's accessible
 *    name, applied through the platform accessibility props —
 *    SSR shows it as the tab list's aria-label, and the active
 *    tab is the selected one.
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

const tabs = codeOf("src/components/Tabs.tsx");

function typeBlock(source: string, name: string): string {
  const match = new RegExp(`export type ${name} = \\{([\\s\\S]*?)\\n\\};`).exec(source);
  assert.ok(match, `${name} type block found`);
  return match[1]!;
}

test("the button-variant item carries an icon name; the link item does not", () => {
  const buttonItem = typeBlock(tabs, "TabItem");
  assert.match(buttonItem, /icon\?: IconName;/);
  const linkItem = typeBlock(tabs, "LinkTabItem");
  assert.doesNotMatch(linkItem, /\bicon\b/, "the href form omits the icon slot, like Button's");
  assert.match(linkItem, /href: string;/);
});

test("Tabs resolves names through the registry and labels the list", () => {
  assert.match(tabs, /iconsByName\[tab\.icon\]/);
  assert.match(tabs, /label\?: string;/);
  assert.match(tabs, /platformAccessibilityProps\(\{ accessibilityLabel: label \}\)/);
  // The link list is a plain container, so its label needs the
  // web navigation landmark to be exposed at all (the button
  // list's tablist role carries its label natively).
  assert.match(tabs, /\{\.\.\.navigationRoleProps\}/);
  const accessibility = codeOf("src/components/accessibility.ts");
  assert.match(
    accessibility,
    /export const navigationRoleProps = isWeb \? \(\{ role: "navigation" \} as const\) : \(\{\} as const\);/,
  );
});

// Runtime imports are lazy, like buttonIcon.test.ts, so the
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

test("SSR: the button variant names its tab list and marks the active tab selected", async () => {
  const { React, Tabs } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Tabs, {
      tabs: [
        { value: "home", label: "Home", icon: "home" },
        { value: "search", label: "Search" },
      ],
      value: "home",
      onValueChange: () => {},
      label: "App sections",
    }),
  );
  assert.match(html, /aria-label="App sections"/, "the tab list carries its accessible name");
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-selected="true"[^>]*>.*?Home/s, "the active tab is selected");
  assert.match(html, /Search/, "the inactive tab renders its label");
});

test("SSR: link tabs render as anchors carrying their hrefs", async () => {
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
  assert.match(html, /aria-label="Memorize sections"/);
  assert.match(html, /role="navigation"/, "the link list is a navigation landmark on web");
  assert.match(html, /href="\/verses"/, "the current tab is a real link with its href");
  assert.match(html, /href="\/search"/);
  assert.match(html, /aria-current="page"/, "the current page's tab is marked current");
});
