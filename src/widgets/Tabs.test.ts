import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadInternalDist } from "../../test/internalDist.js";

describe("tabsAriaControls", () => {
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

  // Runtime imports are lazy, like the tabsIcon block in this file, so the
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
});

describe("tabsIcon", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "../..");

  function codeOf(rel: string): string {
    const source = readFileSync(join(root, rel), "utf8");
    return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  }

  const tabs = codeOf("src/widgets/Tabs.tsx");

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
    const accessibility = codeOf("src/widgets/accessibility.ts");
    assert.match(
      accessibility,
      /export const navigationRoleProps = isWeb \? \(\{ role: "navigation" \} as const\) : \(\{\} as const\);/,
    );
  });

  // Runtime imports are lazy, like the buttonIcon block in Button.test.ts, so the
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
});
