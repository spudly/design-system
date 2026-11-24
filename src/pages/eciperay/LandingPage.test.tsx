/**
 * Contract test for LandingPage (spudly/design-system#171), the
 * design-system view for Eciperay's signed-out marketing landing
 * (the web `/` surface). Stephen resolved the contract on the
 * issue on 2026-10-28; this test pins those decisions:
 *
 * 1. CTAs are real links, not callbacks: the three CTAs cross as
 *    `{label, href}` data props (LandingPageCta) and render as
 *    anchors carrying those hrefs — the navigation rule (a
 *    control that navigates is a link with an href), applied as
 *    the deliberate exception for public web surfaces. There are
 *    no CTA press callbacks in the contract.
 * 2. The features are three FIXED slots (featureOne /
 *    featureTwo / featureThree), not a list: the page's
 *    structure is fixed, and the slots render in slot order.
 * 3. Frame structure: the view renders inside the standard page
 *    shell (ScreenContainer) with its sections in order — hero,
 *    CTA row, feature grid — the hero title is the page's single
 *    level-1 heading and the feature titles are level 2.
 * 4. Content is the app's: all copy and hrefs arrive as props
 *    (the HomePage precedent) — the page source bakes in no app
 *    copy and imports nothing from an app or react-native.
 *    (The public chrome — header/footer — is a separate DS
 *    frame building block the host composes around this view,
 *    per the ownership model confirmed on #171; it is not part
 *    of this page's contract.)
 * 5. CTA layout: stacked narrow / row on wide (the contract's
 *    layout line). The DS config defines no width breakpoints —
 *    narrow is the native rendering (RN storybook / Android VR)
 *    and wide is web — so the row is a flat `web:` clause on a
 *    column stack, never a wrapping row.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6b: the page is called directly, its element tree is
 * inspected, and it is SSR-rendered with sentinel props; the
 * built pages barrel (dist/pages/index.d.ts — a built-artifact
 * read, not a source read) pins the export. The former
 * type-shape pins (CTA/feature type blocks, alias forms), the
 * CTA-row geometry pins (the StackedButtonRow / CardGrid
 * widgets' own contract, pinned by their widget tests), the
 * fixture/story pins, and the import scans were deleted: prop
 * shape is enforced by the TypeScript build, and story
 * coverage is pinned by the story-parity tests (Stephen,
 * 2026-11-20). The SSR tests import the page from its own dist
 * module (the pages barrel is not Node-importable — some pages
 * import react-native).
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

// Collect, in document order, every element in a tree whose
// type is the given component.
function findAllByType(node: any, type: any, out: any[] = []): any[] {
  if (node === null || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    for (const child of node) findAllByType(child, type, out);
    return out;
  }
  if (node.type === type) out.push(node);
  findAllByType(node.props?.children, type, out);
  return out;
}

test("LandingPage is exported from the built pages barrel", async () => {
  const { LandingPage } = await loadRuntime();
  assert.equal(typeof LandingPage, "function");
  const types = readFileSync(join(root, "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /LandingPage/);
  assert.match(types, /type LandingPageProps/);
  assert.match(types, /type LandingPageCta/);
  assert.match(types, /type LandingPageFeature/);
});

test("the shell is BigFooterShell around the plain ScreenContainer; sections in order", async () => {
  const { LandingPage, BigFooterShell, ScreenContainer } = await loadRuntime();
  const tree = LandingPage({ ...sentinelProps });
  assert.equal(tree.type, BigFooterShell, "the page renders through the footer shell");
  assert.equal(
    tree.props.children.type,
    ScreenContainer,
    "the view renders inside the ScreenContainer page shell",
  );
});

test("the CTAs cross as {label, href} data into Button's href form, in contract order", async () => {
  const { LandingPage, Button } = await loadRuntime();
  const stackModule: Record<string, any> =
    await import("../../../dist/widgets/actions/StackedButtonRow.js");
  const tree = LandingPage({ ...sentinelProps });
  const row = findAllByType(tree, stackModule.StackedButtonRow)[0];
  assert.ok(row, "the CTAs render in the StackedButtonRow widget");
  const buttons = findAllByType(row, Button);
  assert.deepEqual(
    buttons.map((b: any) => ({
      href: b.props.href,
      variant: b.props.variant,
      label: b.props.children,
    })),
    [
      { href: "/discover", variant: "primary", label: "Discover Sentinel" },
      { href: "/signup", variant: "secondary", label: "Sign Up Sentinel" },
      {
        href: "https://apps.example.test/install",
        variant: "secondary",
        label: "Get App Sentinel",
      },
    ],
    "each CTA renders through Button's href form with its emphasis, in Discover / Sign up / Get-the-app order — no CTA press callbacks exist in the rendered tree",
  );
});

test("SSR: no app copy is baked in — only the props' copy renders", async () => {
  const html = await renderLanding();
  for (const copy of [
    "Your recipes, organized and ready to cook",
    "Discover public recipes",
    "Sign up free",
    "Get the mobile app",
    "Import from anywhere",
  ]) {
    assert.ok(!html.includes(copy), `the rendered page must not bake in the app copy "${copy}"`);
  }
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
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const shellModule: Record<string, any> = await import("../../../dist/widgets/content/BigFooter.js");
    // The pages barrel is not Node-importable (some pages import
    // react-native), so the page under test is loaded from its
    // own module — it is a plain component composition.
    const { LandingPage }: Record<string, any> =
      await import("../../../dist/pages/eciperay/LandingPage.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      BigFooterShell: shellModule.BigFooterShell,
      LandingPage,
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

// Sentinel copy, deliberately unlike the fixture/app copy, so the
// SSR assertions prove the props — not baked-in strings — render.
const sentinelProps = {
  heroTitle: "Hero Title Sentinel",
  heroSubtitle: "Hero subtitle sentinel.",
  discoverCta: {
    label: "Discover Sentinel",
    href: "/discover",
  },
  signUpCta: {
    label: "Sign Up Sentinel",
    href: "/signup",
  },
  getAppCta: {
    label: "Get App Sentinel",
    href: "https://apps.example.test/install",
  },
  featureOne: {
    title: "Feature One Sentinel",
    description: "First feature sentinel.",
  },
  featureTwo: {
    title: "Feature Two Sentinel",
    description: "Second feature sentinel.",
  },
  featureThree: {
    title: "Feature Three Sentinel",
    description: "Third feature sentinel.",
  },
};
async function renderLanding() {
  const { LandingPage } = await loadRuntime();
  return renderToHtml(<LandingPage {...sentinelProps} />);
}
function renderedAnchors(html: string) {
  const anchors = [];
  // The label may be nested (Button's href form wraps it in a
  // Text, which renders a <span> on web): read the anchor's text
  // content, not just direct text children.
  const pattern = /<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    anchors.push({
      href: match[1],
      label: match[2].replaceAll(/<[^>]*>/g, "").trim(),
      tag: match[0],
    });
  }
  return anchors;
}

// [{ level, text }] for every rendered heading, in document order.
function renderedHeadings(html: string) {
  const headings = [];
  const pattern = /<[a-zA-Z][^>]*role="heading"[^>]*>([^<]*)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const tag = match[0].slice(0, match[0].indexOf(">") + 1);
    const level = /aria-level="(\d)"/.exec(tag);
    headings.push({
      level: level ? Number(level[1]) : null,
      text: match[1].trim(),
    });
  }
  return headings;
}
test("SSR: the three CTAs render as real anchor links with the props' hrefs and labels", async () => {
  const html = await renderLanding();
  const anchors = renderedAnchors(html);
  assert.deepEqual(
    anchors.map(({ href, label }) => ({
      href,
      label,
    })),
    [
      {
        href: "/discover",
        label: "Discover Sentinel",
      },
      {
        href: "/signup",
        label: "Sign Up Sentinel",
      },
      {
        href: "https://apps.example.test/install",
        label: "Get App Sentinel",
      },
    ],
    "the CTAs must render as anchors with the passed hrefs, in contract order",
  );
  for (const anchor of anchors) {
    assert.match(anchor.tag, /role="link"/, "each CTA anchor must carry the link role");
  }
  assert.ok(
    !/<button/.test(html),
    "no CTA may render as a <button> — the CTAs navigate, so they are links",
  );
});
test("SSR: the hero is the single level-1 heading and the feature titles are level 2", async () => {
  const html = await renderLanding();
  const headings = renderedHeadings(html);
  assert.deepEqual(
    headings.filter((h) => h.level === 1).map((h) => h.text),
    ["Hero Title Sentinel"],
    "the hero title must be the page's only level-1 heading",
  );
  assert.deepEqual(
    headings.filter((h) => h.level === 2).map((h) => h.text),
    ["Feature One Sentinel", "Feature Two Sentinel", "Feature Three Sentinel"],
    "the three feature titles must render as level-2 headings, in slot order",
  );
});
test("SSR: sections render in frame order — hero, CTAs, then the feature slots in order", async () => {
  const html = await renderLanding();
  const markers = [
    "Hero Title Sentinel",
    "Hero subtitle sentinel.",
    'href="/discover"',
    "Feature One Sentinel",
    "Feature Two Sentinel",
    "Feature Three Sentinel",
  ];
  const positions = markers.map((marker) => html.indexOf(marker));
  assert.ok(
    positions.every((at) => at !== -1),
    "the hero, the CTAs, and all three feature slots must render",
  );
  assert.deepEqual(
    positions,
    [...positions].sort((a, b) => a - b),
    "sections must render in frame order: hero, CTAs, then features in slot order",
  );
  for (const description of [
    "First feature sentinel.",
    "Second feature sentinel.",
    "Third feature sentinel.",
  ]) {
    assert.ok(html.includes(description), `feature description "${description}" must render`);
  }
});
