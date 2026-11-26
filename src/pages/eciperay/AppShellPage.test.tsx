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
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6b: the page and the shared top bar are called
 * directly and their element trees inspected, and the built
 * pages barrel (dist/pages/index.d.ts — a built-artifact read,
 * not a source read) pins the export. The former type-shape
 * pins (nav/search/action type blocks, alias forms) and story
 * pins were deleted: prop shape is enforced by the TypeScript
 * build, and story coverage is pinned by the story-parity
 * tests (Stephen, 2026-11-20). The SearchField wiring inside
 * AppTopBar (submit/change props, accessible name) is
 * AppTopBar's own contract — AppTopBar calls hooks, so it
 * cannot be invoked directly here; the page-level forwarding
 * and SSR landmark tests below pin the page's half of it.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadInternalDist } from "../../../test/internalDist.js";
const here = dirname(fileURLToPath(import.meta.url));

test("AppShellPage is exported from the built pages barrel", async () => {
  const { AppShellPage } = await loadRuntime();
  assert.equal(typeof AppShellPage, "function");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /AppShellPage/);
  assert.match(types, /type AppShellPageProps/);
  assert.match(types, /type AppShellPageNavItem/);
  assert.match(types, /type AppShellPageAction/);
  assert.match(types, /type AppShellPageSearch/);
  assert.match(types, /type AppShellPageConsentBanner/);
  assert.match(types, /type AppShellPageInstallBanner/);
});

test("the shell is BigFooterShell in content scroll mode around the plain ScreenContainer", async () => {
  const { AppShellPage, BigFooterShell, ScreenContainer } = await loadRuntime();
  const footer = { note: "host footer" } as any;
  const tree = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    footer,
    children: <span>PAGE SURFACE</span>,
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

test("the top bar is one shared chrome: TabbedShellPage renders it too", async () => {
  const { TabbedShellPage, distWidgets } = await loadRuntime();
  const tree = TabbedShellPage({
    title: "Memorize",
    tabs: [{ id: "verses", label: "My verses", content: <span>VERSES SURFACE</span> }],
    activeTabId: "verses",
    onTabSelect: () => {},
  });
  const header = tree.props.children.props.children[0];
  assert.equal(
    header.type,
    distWidgets.AppTopBar,
    "the tabbed shell's header is the shared AppTopBar widget",
  );
  assert.deepEqual(header.props.brand, { label: "Memorize" }, "the title crosses as its brand");
});

// Runtime imports are lazy, like TabbedShellPage.test.ts: the
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
    const shellModule: Record<string, any> =
      await import("../../../dist/widgets/content/BigFooter.js");
    const { AppShellPage }: Record<string, any> =
      await import("../../../dist/pages/eciperay/AppShellPage.js");
    const { TabbedShellPage }: Record<string, any> =
      await import("../../../dist/pages/memorize/TabbedShellPage.js");
    const distViews: Record<string, any> = await import("../../../dist/views/index.js");
    const distWidgets: Record<string, any> = await import("../../../dist/widgets/index.js");
    const { VoiceProvider }: Record<string, any> = await import("../../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../../dist/voice/fixtures.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      BigFooterShell: shellModule.BigFooterShell,
      AppShellPage,
      TabbedShellPage,
      distViews,
      distWidgets,
      VoiceProvider,
      fixtureVoice,
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
const sentinelNav = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: "home" as const,
  },
  {
    id: "recipes",
    label: "Recipes",
    href: "/recipes",
    icon: "recipes" as const,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
  },
];
test("the slot renders the page content, keyed by the active nav item; contentKey wins", async () => {
  const { AppShellPage, distViews, distWidgets } = await loadRuntime();
  const surface = <span>PAGE SURFACE</span>;
  const tree = AppShellPage({
    brand: {
      label: "Eciperay",
      href: "/",
    },
    navItems: sentinelNav,
    navLabel: "Eciperay sections",
    activeItemId: "recipes",
    children: surface,
  });
  assert.equal(tree.props.footer, undefined, "no footer data — no footer band (#410)");
  const [topBarEl, , slot] = tree.props.children.props.children;
  assert.equal(topBarEl.type, distWidgets.AppTopBar, "the header is the shared top-bar widget");
  assert.deepEqual(topBarEl.props.brand, {
    label: "Eciperay",
    href: "/",
  });
  assert.deepEqual(topBarEl.props.navItems, sentinelNav);
  assert.equal(topBarEl.props.activeItemId, "recipes");
  assert.equal(topBarEl.props.navLabel, "Eciperay sections");
  assert.equal(slot.type, distViews.LazySlot);
  assert.equal(slot.key, "recipes", "the slot is keyed by the active surface");
  assert.equal(slot.props.children, surface);
  const keyed = AppShellPage({
    brand: {
      label: "Eciperay",
      href: "/",
    },
    navItems: sentinelNav,
    activeItemId: "recipes",
    contentKey: "recipe-42",
    children: surface,
  });
  assert.equal(
    keyed.props.children.props.children[2].key,
    "recipe-42",
    "the host's contentKey wins",
  );
});
test("SSR: brand and nav render as real links; exactly the active item is current", async () => {
  const { AppShellPage } = await loadRuntime();
  const html = await renderToHtml(
    <AppShellPage
      brand={{
        label: "Eciperay",
        href: "/",
      }}
      navItems={sentinelNav}
      navLabel="Eciperay sections"
      activeItemId="recipes"
      actions={[
        {
          id: "sign-in",
          label: "Sign in",
          href: "/sign-in",
        },
        {
          id: "sign-out",
          label: "Sign out",
          onPress: () => {},
        },
      ]}
    >
      <span>PAGE SURFACE</span>
    </AppShellPage>,
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
test("search data forwards from the page to the top bar; SSR renders the landmark field", async () => {
  const { AppShellPage } = await loadRuntime();
  const search = {
    label: "Search recipes",
    placeholder: "Search recipes",
    value: "soup",
    onValueChange: () => {},
    onSubmit: () => {},
  };
  const tree = AppShellPage({
    brand: {
      label: "Eciperay",
      href: "/",
    },
    navItems: sentinelNav,
    activeItemId: "recipes",
    search,
    children: <span>PAGE SURFACE</span>,
  });
  const [topBarEl] = tree.props.children.props.children;
  assert.deepEqual(topBarEl.props.search, search, "the page forwards search data to the bar");
  const bare = AppShellPage({
    brand: {
      label: "Eciperay",
      href: "/",
    },
    navItems: sentinelNav,
    activeItemId: "recipes",
    children: <span>PAGE SURFACE</span>,
  });
  assert.equal(
    bare.props.children.props.children[0].props.search,
    undefined,
    "no search data — no search in the bar",
  );
  const html = await renderToHtml(
    <AppShellPage
      brand={{
        label: "Eciperay",
        href: "/",
      }}
      navItems={sentinelNav}
      activeItemId="recipes"
      search={search}
    >
      <span>PAGE SURFACE</span>
    </AppShellPage>,
  );
  assert.match(html, /role="search"/, "the field renders inside a search landmark");
  assert.match(html, /aria-label="Search recipes"/, "the input's accessible name is the label");
  assert.match(html, /value="soup"/, "the controlled value renders");
  const bareHtml = await renderToHtml(
    <AppShellPage
      brand={{
        label: "Eciperay",
        href: "/",
      }}
      navItems={sentinelNav}
      activeItemId="recipes"
    >
      <span>PAGE SURFACE</span>
    </AppShellPage>,
  );
  assert.doesNotMatch(bareHtml, /role="search"/, "no search data — no landmark renders");
});
test("SSR: footer data renders the one BigFooter band", async () => {
  const { AppShellPage } = await loadRuntime();
  const html = await renderToHtml(
    <AppShellPage
      brand={{
        label: "Eciperay",
        href: "/",
      }}
      navItems={sentinelNav}
      activeItemId="home"
      footer={{
        brand: {
          label: "Eciperay",
          href: "/",
        },
        columns: [
          {
            title: "Product",
            links: [
              {
                label: "Recipes",
                href: "/recipes",
              },
            ],
          },
        ],
        storeLinks: [],
        socialLinks: [],
      }}
    >
      <span>PAGE SURFACE</span>
    </AppShellPage>,
  );
  assert.match(html, /contentinfo/, "the footer band renders");
  assert.match(html, /Product/, "the footer columns render");
});
test("SSR: a pending surface shows the loading state; a failed one stays in the slot", async () => {
  const { AppShellPage } = await loadRuntime();
  function PendingContent(): never {
    throw new Promise(() => {});
  }
  function FailingContent(): never {
    throw new Error("Failed to fetch dynamically imported module");
  }
  const pendingHtml = await renderToHtml(
    <AppShellPage
      brand={{
        label: "Eciperay",
        href: "/",
      }}
      navItems={sentinelNav}
      activeItemId="recipes"
    >
      <PendingContent />
    </AppShellPage>,
  );
  assert.match(
    pendingHtml,
    /name="SkeletonBone"/,
    "the slot's Suspense fallback is the skeleton composition (#278 tranche 3)",
  );
  assert.match(pendingHtml, /aria-busy/, "the skeleton fallback marks the slot busy");
  const failedHtml = await renderToHtml(
    <AppShellPage
      brand={{
        label: "Eciperay",
        href: "/",
      }}
      navItems={sentinelNav}
      activeItemId="recipes"
      onReload={() => {}}
    >
      <FailingContent />
    </AppShellPage>,
  );
  // As in TabbedShellPage.test.ts: SSR marks the errored segment
  // for client rendering; what it proves here is the failure
  // stays INSIDE the slot — the shell renders around it.
  assert.match(failedHtml, /Switched to client rendering because the server rendering errored/);
  assert.match(failedHtml, /Eciperay/, "the shell brand renders around the failure");
  assert.match(failedHtml, /href="\/recipes"/, "the nav renders around the failure");
});
test("notice (#765): absent by default; when present it forwards message + action and the callback fires", async () => {
  const { AppShellPage, distViews, distWidgets } = await loadRuntime();
  const bare = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    children: <span>PAGE SURFACE</span>,
  });
  assert.equal(
    bare.props.children.props.children[1],
    null,
    "no notice data — no notice renders between the top bar and the content",
  );
  let presses = 0;
  const onPress = () => {
    presses += 1;
  };
  const withNotice = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    notice: {
      message: "Your profile could not be loaded.",
      action: { label: "Try again", onPress },
    },
    children: <span>PAGE SURFACE</span>,
  });
  const noticeEl = withNotice.props.children.props.children[1];
  assert.equal(noticeEl.type, distWidgets.Row, "the notice renders through the banner Row (#746)");
  const [messageEl, actionEl] = noticeEl.props.children;
  assert.equal(
    messageEl.type,
    distViews.StatusMessage,
    "the message renders through StatusMessage",
  );
  assert.equal(messageEl.props.message, "Your profile could not be loaded.");
  assert.equal(actionEl.type, distWidgets.Button, "the notice action renders as a DS Button");
  assert.equal(actionEl.props.children, "Try again");
  assert.equal(actionEl.props.onPress, onPress, "the host callback is forwarded to the Button");
  actionEl.props.onPress();
  assert.equal(presses, 1, "the notice action callback fires");
  const messageOnly = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    notice: { message: "Your profile could not be loaded." },
    children: <span>PAGE SURFACE</span>,
  });
  assert.equal(
    messageOnly.props.children.props.children[1].props.children[1],
    null,
    "a notice without an action renders no Button",
  );
});
test("SSR: a notice renders its message and action above the content; content stays mounted", async () => {
  const { AppShellPage } = await loadRuntime();
  const html = await renderToHtml(
    <AppShellPage
      brand={{ label: "Eciperay", href: "/" }}
      navItems={sentinelNav}
      activeItemId="recipes"
      notice={{
        message: "Your profile could not be loaded.",
        action: { label: "Try again", onPress: () => {} },
      }}
    >
      <span>PAGE SURFACE</span>
    </AppShellPage>,
  );
  assert.match(html, /Your profile could not be loaded\./, "the notice message renders");
  assert.match(html, /Try again/, "the notice action label renders");
  assert.match(html, /role="status"/, "the notice keeps the polite live-region semantics");
  assert.match(html, /PAGE SURFACE/, "the page content stays mounted under the notice");
});
test("banners (#879): absent by default; when present the shell renders the banner views with the host data forwarded", async () => {
  const { AppShellPage, distViews } = await loadRuntime();
  const bare = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    children: <span>PAGE SURFACE</span>,
  });
  const bareChildren = bare.props.children.props.children;
  assert.equal(bareChildren[3], null, "no install banner data — no install banner renders");
  assert.equal(bareChildren[4], null, "no consent banner data — no consent banner renders");
  let accepts = 0;
  let declines = 0;
  let dismissals = 0;
  const consentBanner = {
    messageBeforeLink: "We use cookies as described in our",
    linkLabel: "privacy policy",
    linkHref: "/privacy",
    messageAfterLink: ".",
    onAccept: () => {
      accepts += 1;
    },
    onDecline: () => {
      declines += 1;
    },
  };
  const installBanner = {
    message: "Get the app for the best experience.",
    links: [{ label: "App Store", href: "https://apps.example.test/install" }],
    onDismiss: () => {
      dismissals += 1;
    },
  };
  const withBanners = AppShellPage({
    brand: { label: "Eciperay", href: "/" },
    navItems: sentinelNav,
    activeItemId: "recipes",
    consentBanner,
    installBanner,
    children: <span>PAGE SURFACE</span>,
  });
  const children = withBanners.props.children.props.children;
  const installEl = children[3];
  const consentEl = children[4];
  assert.equal(
    installEl.type,
    distViews.InstallBannerView,
    "the install banner renders through InstallBannerView",
  );
  assert.deepEqual(installEl.props, installBanner, "the install banner data crosses unchanged");
  assert.equal(
    consentEl.type,
    distViews.ConsentBannerView,
    "the consent banner renders through ConsentBannerView",
  );
  assert.deepEqual(consentEl.props, consentBanner, "the consent banner data crosses unchanged");
  consentEl.props.onAccept();
  consentEl.props.onDecline();
  installEl.props.onDismiss();
  assert.equal(accepts, 1, "the accept callback fires");
  assert.equal(declines, 1, "the decline callback fires");
  assert.equal(dismissals, 1, "the dismiss callback fires");
});
test("SSR: banners render their copy, the policy link, and the voice-default action labels", async () => {
  const { AppShellPage, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, VoiceProvider, fixtureVoice } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      <VoiceProvider voice={fixtureVoice}>
        <AppShellPage
          brand={{ label: "Eciperay", href: "/" }}
          navItems={sentinelNav}
          activeItemId="recipes"
          consentBanner={{
            messageBeforeLink: "We use cookies as described in our",
            linkLabel: "privacy policy",
            linkHref: "/privacy",
            messageAfterLink: ".",
            onAccept: () => {},
            onDecline: () => {},
          }}
          installBanner={{
            message: "Get the app for the best experience.",
            links: [{ label: "App Store", href: "https://apps.example.test/install" }],
            onDismiss: () => {},
          }}
        >
          <span>PAGE SURFACE</span>
        </AppShellPage>
      </VoiceProvider>
    </TamaguiProvider>,
  );
  assert.match(html, /We use cookies as described in our/, "the consent message renders");
  assert.match(html, /href="\/privacy"/, "the policy link is a real link with its href");
  assert.match(html, /privacy policy/, "the policy link label renders");
  assert.ok(
    html.includes(fixtureVoice.consentBannerView.acceptLabel),
    "the accept label defaults to the voice object",
  );
  assert.ok(
    html.includes(fixtureVoice.consentBannerView.declineLabel),
    "the decline label defaults to the voice object",
  );
  assert.match(html, /Get the app for the best experience\./, "the install message renders");
  assert.match(
    html,
    /href="https:\/\/apps\.example\.test\/install"/,
    "the store link is a real link with its href",
  );
  assert.match(html, /PAGE SURFACE/, "the page content stays mounted under the banners");
});
