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
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6b: the page is called directly and its element tree
 * inspected, and the built pages barrel (dist/pages/index.d.ts
 * — a built-artifact read, not a source read) pins the export.
 * The former type-shape pins (tab/link-tab type blocks, alias
 * forms, import specifiers) and story pins were deleted: prop
 * shape is enforced by the TypeScript build, and story
 * coverage is pinned by the story-parity tests (Stephen,
 * 2026-11-20).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadInternalDist } from "../../test/internalDist.js";
const here = dirname(fileURLToPath(import.meta.url));

test("TabbedShellPage is exported from the built pages barrel", async () => {
  const { TabbedShellPage } = await loadRuntime();
  assert.equal(typeof TabbedShellPage, "function");
  const types = readFileSync(join(here, "../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /TabbedShellPage/);
  assert.match(types, /type TabbedShellPageProps/);
  assert.match(types, /type TabbedShellPageTab/);
  assert.match(types, /type TabbedShellPageLinkTab/);
});

test("the shell is BigFooterShell in content scroll mode around the plain ScreenContainer", async () => {
  const { React, TabbedShellPage, BigFooterShell, ScreenContainer } = await loadRuntime();
  const footer = { note: "host footer" } as any;
  const tree = TabbedShellPage({
    title: "Memorize",
    tabs: sentinelTabs(React),
    activeTabId: "verses",
    onTabSelect: () => {},
    footer,
  });
  assert.equal(tree.type, BigFooterShell, "the page renders through the footer shell (#410)");
  assert.equal(tree.props.scrollMode, "content");
  assert.equal(tree.props.footer, footer, "the host footer data crosses unchanged");
  assert.equal(
    tree.props.children.type,
    ScreenContainer,
    "the content renders inside the plain ScreenContainer (#547)",
  );
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
    const shellModule: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
    const { TabbedShellPage }: Record<string, any> =
      await import("../../dist/pages/TabbedShellPage.js");
    const distViews: Record<string, any> = await import("../../dist/views/index.js");
    const distWidgets: Record<string, any> = await import("../../dist/widgets/index.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      BigFooterShell: shellModule.BigFooterShell,
      TabbedShellPage,
      distViews,
      distWidgets,
    };
  })();
  return runtimePromise;
}
async function renderToHtml(element: any) {
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}
const sentinelTabs = (React: any) => [
  {
    id: "verses",
    label: "My verses",
    content: <span>VERSES SURFACE</span>,
  },
  {
    id: "search",
    label: "Search",
    icon: "tags",
    content: <span>SEARCH SURFACE</span>,
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
  const [title, tabBar, , slot] = tree.props.children.props.children;
  // #437: the header is the shared AppTopBar view, with the
  // shell's title as its brand (no href — the title navigates
  // nowhere).
  assert.deepEqual(title.props.brand, {
    label: "Memorize",
  });
  // The tab bar receives the tabs mapped to the Tabs contract:
  // id → value, icon name carried through as data.
  assert.deepEqual(tabBar.props.tabs, [
    {
      value: "verses",
      label: "My verses",
    },
    {
      value: "search",
      label: "Search",
      icon: "tags",
    },
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
  const override = <span>DRILL SURFACE</span>;
  const tree = TabbedShellPage({
    title: "Memorize",
    tabs: sentinelTabs(React),
    activeTabId: null,
    onTabSelect: () => {},
    children: override,
  });
  const [, tabBar, , slot] = tree.props.children.props.children;
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
    keyed.props.children.props.children[3].key,
    "verse-42",
    "the host's contentKey wins",
  );
});
test("SSR: title, tab bar, and the active surface render; the inactive surface does not", async () => {
  const { React, TabbedShellPage } = await loadRuntime();
  const html = await renderToHtml(
    <TabbedShellPage
      title="Memorize"
      tabsLabel="Memorize sections"
      tabs={sentinelTabs(React)}
      activeTabId="verses"
      onTabSelect={() => {}}
    />,
  );
  assert.match(html, /Memorize/, "the app title renders");
  assert.match(html, /aria-label="Memorize sections"/, "the tab list is named");
  assert.match(html, /VERSES SURFACE/, "the active tab's content renders");
  assert.doesNotMatch(html, /SEARCH SURFACE/, "the inactive tab's content does not render");
});
test("SSR: a pending surface shows the loading state; a failed one the boundary fallback", async () => {
  const { TabbedShellPage } = await loadRuntime();
  function PendingContent(): never {
    throw new Promise(() => {});
  }
  function FailingContent(): never {
    throw new Error("Failed to fetch dynamically imported module");
  }
  const pendingHtml = await renderToHtml(
    <TabbedShellPage
      title="Memorize"
      tabs={[
        {
          id: "search",
          label: "Search",
          content: <PendingContent />,
        },
      ]}
      activeTabId="search"
      onTabSelect={() => {}}
    />,
  );
  assert.match(
    pendingHtml,
    /name="SkeletonBone"/,
    "the slot's Suspense fallback is the skeleton composition (#278 tranche 3)",
  );
  assert.match(pendingHtml, /aria-busy/, "the skeleton fallback marks the slot busy");
  const failedHtml = await renderToHtml(
    <TabbedShellPage
      title="Memorize"
      tabs={[
        {
          id: "search",
          label: "Search",
          content: <FailingContent />,
        },
      ]}
      activeTabId="search"
      onTabSelect={() => {}}
      onReload={() => {}}
    />,
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
  const { TabbedShellPage } = await loadRuntime();
  const html = await renderToHtml(
    <TabbedShellPage
      variant="link"
      title="Memorize"
      tabsLabel="Memorize sections"
      tabs={[
        {
          id: "verses",
          label: "My verses",
          href: "/verses",
        },
        {
          id: "search",
          label: "Search",
          href: "/search",
        },
      ]}
      activeTabId="verses"
    >
      <span>CURRENT PAGE SURFACE</span>
    </TabbedShellPage>,
  );
  assert.match(html, /href="\/verses"/);
  assert.match(html, /href="\/search"/);
  assert.match(html, /aria-current="page"/, "the current page's tab is marked current");
  assert.match(html, /CURRENT PAGE SURFACE/, "the host's page renders through the slot");
});
test("notice (#765): absent by default; when present it forwards message + action and the callback fires", async () => {
  const { React, TabbedShellPage, distWidgets } = await loadRuntime();
  const bare = TabbedShellPage({
    title: "Memorize",
    tabs: sentinelTabs(React),
    activeTabId: "verses",
    onTabSelect: () => {},
  });
  assert.equal(
    bare.props.children.props.children[2],
    null,
    "no notice data — no notice renders between the tab bar and the content",
  );
  let presses = 0;
  const onPress = () => {
    presses += 1;
  };
  const withNotice = TabbedShellPage({
    title: "Memorize",
    tabs: sentinelTabs(React),
    activeTabId: "verses",
    onTabSelect: () => {},
    notice: {
      message: "Your verses could not be refreshed.",
      action: { label: "Try again", onPress },
    },
  });
  const noticeEl = withNotice.props.children.props.children[2];
  assert.equal(noticeEl.type, distWidgets.BannerRow, "the notice renders through BannerRow");
  const [messageEl, actionEl] = noticeEl.props.children;
  assert.equal(
    messageEl.type,
    distWidgets.StatusMessage,
    "the message renders through StatusMessage",
  );
  assert.equal(messageEl.props.message, "Your verses could not be refreshed.");
  assert.equal(actionEl.type, distWidgets.Button, "the notice action renders as a DS Button");
  assert.equal(actionEl.props.children, "Try again");
  assert.equal(actionEl.props.onPress, onPress, "the host callback is forwarded to the Button");
  actionEl.props.onPress();
  assert.equal(presses, 1, "the notice action callback fires");
});
test("SSR: a notice renders its message and action above the content; content stays mounted", async () => {
  const { React, TabbedShellPage } = await loadRuntime();
  const html = await renderToHtml(
    <TabbedShellPage
      title="Memorize"
      tabs={sentinelTabs(React)}
      activeTabId="verses"
      onTabSelect={() => {}}
      notice={{
        message: "Your verses could not be refreshed.",
        action: { label: "Try again", onPress: () => {} },
      }}
    />,
  );
  assert.match(html, /Your verses could not be refreshed\./, "the notice message renders");
  assert.match(html, /Try again/, "the notice action label renders");
  assert.match(html, /role="status"/, "the notice keeps the polite live-region semantics");
  assert.match(html, /VERSES SURFACE/, "the tab content stays mounted under the notice");
});
