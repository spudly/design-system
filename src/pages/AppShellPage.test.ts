/**
 * Contract + behavior tests for AppShellPage (#437): the routed
 * app shell as a DS frame page, replacing the shell Eciperay's
 * hosts hand-rolled (its header, routed nav, and footer band).
 *
 * The contracts pinned here:
 * 1. The frame is exported from the pages barrel; its props and
 *    nav/action data are type aliases (the repo-wide rule,
 *    #214). Nav crosses as DATA: id + label + href + optional
 *    icon NAME (the navigation rule: a nav item navigates, so
 *    it is a link — there is no callback nav form). Actions
 *    follow the href-vs-callback split: an `href` action
 *    navigates, an `onPress` action acts in place.
 * 2. The page composes DS components only — no direct Tamagui
 *    imports (#297's rule), no styling props, and NO
 *    ChunkErrorBoundary: content renders through the internal
 *    LazySlot view, so hosts never import the boundary. The
 *    header is the shared AppTopBar view — the same composition
 *    TabbedShellPage's header is aligned onto, so the two
 *    shells are one chrome.
 * 3. Behavior (element tree + SSR): the brand renders as a real
 *    link home; nav items render as links with the given hrefs
 *    and exactly the active item is marked current; header
 *    actions render in their two forms; the content renders
 *    through the slot, keyed by the active item (the boundary's
 *    keyed-remount contract), with the host's `contentKey`
 *    winning; a pending surface shows the DS loading state and
 *    a failed one stays inside the slot, shell intact around it.
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

const page = codeOf("src/pages/AppShellPage.tsx");
const topBar = codeOf("src/views/AppTopBar.tsx");
const tabbedShell = codeOf("src/pages/TabbedShellPage.tsx");
const barrel = readFileSync(join(root, "src/pages/index.ts"), "utf8");
const stories = readFileSync(join(root, "src/pages/AppShellPage.stories.tsx"), "utf8");

function typeBlock(source: string, name: string): string {
  const match = new RegExp(`export type ${name} = \\{([\\s\\S]*?)\\n\\};`).exec(source);
  assert.ok(match, `${name} type block found`);
  return match[1]!;
}

test("AppShellPage is exported from the pages barrel with alias types", () => {
  assert.match(
    barrel,
    /AppShellPage,\s*type AppShellPageAction,\s*type AppShellPageNavItem,\s*type AppShellPageProps,\s*\} from "\.\/AppShellPage\.js";/,
  );
  assert.match(page, /export type AppShellPageProps = \{/);
  assert.match(page, /export type AppShellPageNavItem = AppTopBarNavItem;/);
  assert.match(page, /export type AppShellPageAction = AppTopBarAction;/);
  assert.doesNotMatch(page, /\binterface\s+AppShellPage/);
});

test("nav crosses as data: hrefs and icon names, never components or callbacks", () => {
  const navItem = typeBlock(topBar, "AppTopBarNavItem");
  assert.match(navItem, /id: string;/);
  assert.match(navItem, /label: string;/);
  assert.match(navItem, /href: string;/);
  assert.match(navItem, /icon\?: IconName;/);
  assert.doesNotMatch(navItem, /onPress|onSelect/, "nav items navigate — no callback form");
  assert.doesNotMatch(navItem, /content/, "the shell's content is the page child, not nav data");
});

test("header actions follow the href-vs-callback split", () => {
  assert.match(topBar, /export type AppTopBarAction =/);
  assert.match(topBar, /href: string;\s*onPress\?: never;/);
  assert.match(topBar, /onPress: \(\) => void;\s*href\?: never;/);
});

test("the page composes DS components only and never touches the boundary itself", () => {
  assert.doesNotMatch(page, /from "tamagui"/, "pages import no Tamagui directly (#297)");
  assert.doesNotMatch(
    page,
    /ChunkErrorBoundary/,
    "lazy content goes through the internal LazySlot — the page never names the boundary",
  );
  assert.match(page, /import \{ LazySlot \} from "\.\.\/views\/LazySlot\.js";/);
  assert.match(page, /import \{\s*AppTopBar,/);
  assert.match(page, /<ScreenContainer scrollable=\{false\}>/);
  // The standard page footer contract (#410, pinned for every
  // page by test/bigFooter.test.ts): an optional footer prop
  // rendered through the shell — no data, no footer band.
  assert.match(page, /footer\?: BigFooterData;/);
  assert.match(page, /<BigFooterShell footer=\{footer\}>/);
});

test("the top bar is one shared chrome: TabbedShellPage renders it too", () => {
  assert.match(topBar, /import \{ BrandLink \} from "\.\.\/widgets\/BrandLink\.js";/);
  assert.match(topBar, /iconsByName/);
  assert.match(topBar, /navigationRoleProps/);
  assert.match(
    tabbedShell,
    /<AppTopBar brand=\{\{ label: title \}\} \/>/,
    "the tabbed shell's header is the shared top bar with the title as its brand",
  );
});

test("the stories cover the shell's contracted cases", () => {
  for (const name of ["Default", "NoIcons", "LinkActions", "NoFooter", "ChunkFailedContent"]) {
    assert.match(stories, new RegExp(`export const ${name}: Story`), `${name} story exists`);
  }
});

// Runtime imports are lazy, like tabbedShellPage.test.ts: the
// page is loaded from its own module (the pages barrel is not
// Node-importable).
let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const { AppShellPage }: Record<string, any> = await import("../../dist/pages/AppShellPage.js");
    const distViews: Record<string, any> = await import("../../dist/views/index.js");
    return { React, renderToString, TamaguiProvider, ...dist, AppShellPage, distViews };
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

const sentinelNav = [
  { id: "home", label: "Home", href: "/", icon: "home" as const },
  { id: "recipes", label: "Recipes", href: "/recipes", icon: "recipes" as const },
  { id: "profile", label: "Profile", href: "/profile" },
];

test("the slot renders the page content, keyed by the active nav item; contentKey wins", async () => {
  const { React, AppShellPage, distViews } = await loadRuntime();
  const surface = React.createElement("span", null, "PAGE SURFACE");
  const tree = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    children: surface,
  });
  assert.equal(tree.props.footer, undefined, "no footer data — no footer band (#410)");
  const [topBarEl, slot] = tree.props.children.props.children;
  assert.equal(topBarEl.type, distViews.AppTopBar, "the header is the shared top-bar view");
  assert.deepEqual(topBarEl.props.brand, { label: "Eciperay", href: "/" });
  assert.deepEqual(topBarEl.props.navItems, sentinelNav);
  assert.equal(topBarEl.props.activeItemId, "recipes");
  assert.equal(topBarEl.props.navLabel, "Eciperay sections");
  assert.equal(slot.type, distViews.LazySlot);
  assert.equal(slot.key, "recipes", "the slot is keyed by the active surface");
  assert.equal(slot.props.children, surface);
  const keyed = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    contentKey: "recipe-42",
    children: surface,
  });
  assert.equal(
    keyed.props.children.props.children[1].key,
    "recipe-42",
    "the host's contentKey wins",
  );
});

test("SSR: brand and nav render as real links; exactly the active item is current", async () => {
  const { React, AppShellPage } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      AppShellPage,
      {
        brand: { label: "Eciperay", href: "/" },
        navItems: sentinelNav,
        navLabel: "Eciperay sections",
        activeItemId: "recipes",
        actions: [
          { id: "sign-in", label: "Sign in", href: "/sign-in" },
          { id: "sign-out", label: "Sign out", onPress: () => {} },
        ],
      },
      React.createElement("span", null, "PAGE SURFACE"),
    ),
  );
  assert.match(html, /href="\/"/, "the brand is a real link home");
  assert.match(html, /href="\/recipes"/, "nav items render their hrefs");
  assert.match(html, /href="\/profile"/, "nav items render their hrefs");
  assert.match(html, /aria-label="Eciperay sections"/, "the nav list is named");
  const currents = html.match(/aria-current="page"/g) ?? [];
  assert.equal(currents.length, 1, "exactly one nav item is marked current");
  assert.match(html, /href="\/sign-in"/, "an href action renders the link form");
  assert.match(html, /Sign out/, "a callback action renders the button form");
  assert.match(html, /PAGE SURFACE/, "the page content renders through the slot");
  assert.doesNotMatch(html, /contentinfo/, "no footer data — no footer band");
});

test("SSR: footer data renders the one BigFooter band", async () => {
  const { React, AppShellPage } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      AppShellPage,
      {
        brand: { label: "Eciperay", href: "/" },
        navItems: sentinelNav,
        activeItemId: "home",
        footer: {
          brand: { label: "Eciperay", href: "/" },
          columns: [{ title: "Product", links: [{ label: "Recipes", href: "/recipes" }] }],
          storeLinks: [],
          socialLinks: [],
        },
      },
      React.createElement("span", null, "PAGE SURFACE"),
    ),
  );
  assert.match(html, /contentinfo/, "the footer band renders");
  assert.match(html, /Product/, "the footer columns render");
});

test("SSR: a pending surface shows the loading state; a failed one stays in the slot", async () => {
  const { React, AppShellPage } = await loadRuntime();
  function PendingContent(): never {
    throw new Promise(() => {});
  }
  function FailingContent(): never {
    throw new Error("Failed to fetch dynamically imported module");
  }
  const pendingHtml = await renderToHtml(
    React.createElement(
      AppShellPage,
      {
        brand: { label: "Eciperay", href: "/" },
        navItems: sentinelNav,
        activeItemId: "recipes",
      },
      React.createElement(PendingContent),
    ),
  );
  assert.match(
    pendingHtml,
    /aria-label="Loading"/,
    "the slot's Suspense fallback is the DS spinner",
  );
  const failedHtml = await renderToHtml(
    React.createElement(
      AppShellPage,
      {
        brand: { label: "Eciperay", href: "/" },
        navItems: sentinelNav,
        activeItemId: "recipes",
        onReload: () => {},
      },
      React.createElement(FailingContent),
    ),
  );
  // As in tabbedShellPage.test.ts: SSR marks the errored segment
  // for client rendering; what it proves here is the failure
  // stays INSIDE the slot — the shell renders around it.
  assert.match(failedHtml, /Switched to client rendering because the server rendering errored/);
  assert.match(failedHtml, /Eciperay/, "the shell brand renders around the failure");
  assert.match(failedHtml, /href="\/recipes"/, "the nav renders around the failure");
});
