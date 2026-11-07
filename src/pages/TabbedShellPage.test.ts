/**
 * Contract + behavior tests for TabbedShellPage (#438 Part 5):
 * the tabbed app shell as a DS frame page, replacing the shell
 * Memorize's hosts hand-rolled (DS #437, memorize#100).
 *
 * The contracts pinned here:
 * 1. The frame is exported from the pages barrel; its props and
 *    tab data are type aliases (the repo-wide rule, #214). Tabs
 *    cross as DATA: button-form tabs carry id + label + optional
 *    icon NAME + slotted content; link-form tabs carry id +
 *    label + href and NO content or icon (the navigation rule's
 *    two forms, mirroring Tabs and Button).
 * 2. The page composes DS components only — no direct Tamagui
 *    imports (#297's rule), no styling props, and NO
 *    ChunkErrorBoundary: lazy content renders through the
 *    internal LazySlot view, so hosts never import the boundary.
 *    The icon NAME type is referenced from the internal registry;
 *    no icon component is imported.
 * 3. Behavior (element tree + SSR): the active tab's content —
 *    and only it — renders through the slot; the slot is keyed
 *    by the active surface (the boundary's keyed-remount
 *    contract: switching surfaces clears a failure), with the
 *    host's `contentKey` winning; an override surface (the drill
 *    case) replaces tab content with no tab selected; a pending
 *    surface shows the DS loading state and a failed one the
 *    boundary's established fallback, shell intact around both.
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

const page = codeOf("src/pages/TabbedShellPage.tsx");
const stories = readFileSync(join(root, "src/pages/TabbedShellPage.stories.tsx"), "utf8");
const barrel = readFileSync(join(root, "src/pages/index.ts"), "utf8");

function typeBlock(source: string, name: string): string {
  const match = new RegExp(`export type ${name} = \\{([\\s\\S]*?)\\n\\};`).exec(source);
  assert.ok(match, `${name} type block found`);
  return match[1]!;
}

test("TabbedShellPage is exported from the pages barrel with alias types", () => {
  assert.match(
    barrel,
    /TabbedShellPage,\s*type TabbedShellPageLinkTab,\s*type TabbedShellPageProps,\s*type TabbedShellPageTab,\s*\} from "\.\/TabbedShellPage\.js";/,
  );
  assert.match(page, /export type TabbedShellPageProps = TabbedShellPageBaseProps &/);
  assert.match(page, /export type TabbedShellPageTab = \{/);
  assert.match(page, /export type TabbedShellPageLinkTab = \{/);
  assert.doesNotMatch(page, /\binterface\s+TabbedShellPage/);
});

test("tabs cross as data: content and icon names in the button form, hrefs in the link form", () => {
  const tab = typeBlock(page, "TabbedShellPageTab");
  assert.match(tab, /id: string;/);
  assert.match(tab, /label: string;/);
  assert.match(tab, /icon\?: IconName;/);
  assert.match(tab, /content: ReactNode;/);
  const linkTab = typeBlock(page, "TabbedShellPageLinkTab");
  assert.match(linkTab, /href: string;/);
  assert.doesNotMatch(linkTab, /\bcontent\b/, "link tabs navigate — no slotted content");
  assert.doesNotMatch(linkTab, /\bicon\b/, "the href form omits the icon slot, like Button's");
});

test("the page composes DS components only and never touches the boundary itself", () => {
  assert.doesNotMatch(page, /from "tamagui"/, "pages import no Tamagui directly (#297)");
  assert.doesNotMatch(
    page,
    /ChunkErrorBoundary/,
    "lazy content goes through the internal LazySlot — the page never names the boundary",
  );
  assert.match(page, /import \{ LazySlot \} from "\.\.\/views\/LazySlot\.js";/);
  assert.match(page, /import \{ Tabs \} from "\.\.\/widgets\/Tabs\.js";/);
  assert.match(page, /<ScreenContainer scrollable=\{false\}>/);
  assert.match(page, /import type \{ IconName \} from "\.\.\/icons\/iconRegistry\.js";/);
  assert.doesNotMatch(page, /from "\.\.\/icons\/[A-Z]/, "no icon component crosses into the page");
  // The standard page footer contract (#410, pinned for every
  // page by src/widgets/BigFooter.test.ts): an optional footer prop
  // rendered through the shell — no data, no footer band.
  assert.match(page, /footer\?: BigFooterData;/);
  assert.match(page, /<BigFooterShell footer=\{footer\}>/);
});

// Runtime imports are lazy, like LandingPage.test.ts: the page
// is loaded from its own module (the pages barrel is not
// Node-importable).
let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const { TabbedShellPage }: Record<string, any> =
      await import("../../dist/pages/TabbedShellPage.js");
    const distViews: Record<string, any> = await import("../../dist/views/index.js");
    return { React, renderToString, TamaguiProvider, ...dist, TabbedShellPage, distViews };
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

const sentinelTabs = (React: any) => [
  {
    id: "verses",
    label: "My verses",
    content: React.createElement("span", null, "VERSES SURFACE"),
  },
  {
    id: "search",
    label: "Search",
    icon: "tags",
    content: React.createElement("span", null, "SEARCH SURFACE"),
  },
];

test("the slot renders only the active tab's content, keyed by the active surface", async () => {
  const { React, TabbedShellPage, distViews } = await loadRuntime();
  const onTabSelect = () => {};
  const tree = TabbedShellPage({
    title: "Memorize",
    tabsLabel: "Memorize sections",
    tabs: sentinelTabs(React),
    activeTabId: "search",
    onTabSelect,
  });
  assert.equal(tree.props.footer, undefined, "no footer data — no footer band (#410)");
  const [title, tabBar, slot] = tree.props.children.props.children;
  // #437: the header is the shared AppTopBar view, with the
  // shell's title as its brand (no href — the title navigates
  // nowhere).
  assert.deepEqual(title.props.brand, { label: "Memorize" });
  // The tab bar receives the tabs mapped to the Tabs contract:
  // id → value, icon name carried through as data.
  assert.deepEqual(tabBar.props.tabs, [
    { value: "verses", label: "My verses" },
    { value: "search", label: "Search", icon: "tags" },
  ]);
  assert.equal(tabBar.props.value, "search");
  assert.equal(tabBar.props.onValueChange, onTabSelect);
  assert.equal(tabBar.props.label, "Memorize sections");
  // The content region is the internal LazySlot, keyed by the
  // active surface so switching tabs remounts it (a failure on
  // one surface clears when another is selected).
  assert.equal(slot.type, distViews.LazySlot);
  assert.equal(slot.key, "search");
  assert.equal(slot.props.children.props.children, "SEARCH SURFACE");
});

test("an override surface replaces tab content with no tab selected; contentKey wins", async () => {
  const { React, TabbedShellPage } = await loadRuntime();
  const override = React.createElement("span", null, "DRILL SURFACE");
  const tree = TabbedShellPage({
    title: "Memorize",
    tabs: sentinelTabs(React),
    activeTabId: null,
    onTabSelect: () => {},
    children: override,
  });
  const [, tabBar, slot] = tree.props.children.props.children;
  assert.equal(tabBar.props.value, "", "no tab is selected while the override shows");
  assert.equal(slot.key, "override");
  assert.equal(slot.props.children, override);
  const keyed = TabbedShellPage({
    title: "Memorize",
    tabs: sentinelTabs(React),
    activeTabId: "verses",
    onTabSelect: () => {},
    contentKey: "verse-42",
  });
  assert.equal(
    keyed.props.children.props.children[2].key,
    "verse-42",
    "the host's contentKey wins",
  );
});

test("SSR: title, tab bar, and the active surface render; the inactive surface does not", async () => {
  const { React, TabbedShellPage } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TabbedShellPage, {
      title: "Memorize",
      tabsLabel: "Memorize sections",
      tabs: sentinelTabs(React),
      activeTabId: "verses",
      onTabSelect: () => {},
    }),
  );
  assert.match(html, /Memorize/, "the app title renders");
  assert.match(html, /aria-label="Memorize sections"/, "the tab list is named");
  assert.match(html, /VERSES SURFACE/, "the active tab's content renders");
  assert.doesNotMatch(html, /SEARCH SURFACE/, "the inactive tab's content does not render");
});

test("SSR: a pending surface shows the loading state; a failed one the boundary fallback", async () => {
  const { React, TabbedShellPage } = await loadRuntime();
  function PendingContent(): never {
    throw new Promise(() => {});
  }
  function FailingContent(): never {
    throw new Error("Failed to fetch dynamically imported module");
  }
  const pendingHtml = await renderToHtml(
    React.createElement(TabbedShellPage, {
      title: "Memorize",
      tabs: [{ id: "search", label: "Search", content: React.createElement(PendingContent) }],
      activeTabId: "search",
      onTabSelect: () => {},
    }),
  );
  assert.match(
    pendingHtml,
    /aria-label="Loading"/,
    "the slot's Suspense fallback is the DS spinner",
  );
  const failedHtml = await renderToHtml(
    React.createElement(TabbedShellPage, {
      title: "Memorize",
      tabs: [{ id: "search", label: "Search", content: React.createElement(FailingContent) }],
      activeTabId: "search",
      onTabSelect: () => {},
      onReload: () => {},
    }),
  );
  // renderToString never paints a class boundary's fallback
  // inside a Suspense boundary — it marks the segment for client
  // rendering, where ChunkErrorBoundary catches and shows its
  // fallback (the fallback copy and recovery are pinned by
  // ChunkErrorBoundary.test.ts; the composition that puts them
  // around the slot is pinned by LazySlot.test.ts). What SSR
  // proves here: the failure stays INSIDE the slot — the shell
  // and its tab bar render around the degraded segment.
  assert.match(failedHtml, /Switched to client rendering because the server rendering errored/);
  assert.match(failedHtml, /Memorize/, "the shell title renders around the failure");
  assert.match(failedHtml, /role="tablist"/, "the tab bar renders around the failure");
  assert.doesNotMatch(failedHtml, /SEARCH SURFACE/, "the failed content never renders");
});

test("SSR: the link form renders real hrefs and the host's page content", async () => {
  const { React, TabbedShellPage } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      TabbedShellPage,
      {
        variant: "link",
        title: "Memorize",
        tabsLabel: "Memorize sections",
        tabs: [
          { id: "verses", label: "My verses", href: "/verses" },
          { id: "search", label: "Search", href: "/search" },
        ],
        activeTabId: "verses",
      },
      React.createElement("span", null, "CURRENT PAGE SURFACE"),
    ),
  );
  assert.match(html, /href="\/verses"/);
  assert.match(html, /href="\/search"/);
  assert.match(html, /aria-current="page"/, "the current page's tab is marked current");
  assert.match(html, /CURRENT PAGE SURFACE/, "the host's page renders through the slot");
});

test("stories cover the shell, icon tabs, loading, failure, override, and link forms", () => {
  assert.match(stories, /title: "Pages\/Memorize\/TabbedShellPage"/);
  for (const story of [
    "TabbedShell",
    "IconTabs",
    "LoadingTabContent",
    "ChunkFailedTabContent",
    "DrillOpen",
    "LinkTabs",
  ]) {
    assert.match(stories, new RegExp(`export const ${story}: Story`), `missing story ${story}`);
  }
});
