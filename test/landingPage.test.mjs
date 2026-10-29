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
 * Source scans strip comments first, like the other contract
 * tests here, so prose cannot satisfy or trip the patterns. The
 * SSR tests import the page from its own dist module (the pages
 * barrel is not Node-importable — some pages import
 * react-native).
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

const page = readCode("src/pages/LandingPage.tsx");
const stories = readCode("src/pages/LandingPage.stories.tsx");
const pagesIndex = readCode("src/pages/index.ts");
const fixtures = readCode("src/pages/fixtures.ts");
// The page's sections moved into shared components in the #119
// de-styling tranche: the hero is Hero, the CTAs are Button href
// links in a CtaRow, and the feature slots are FeatureCards in a
// CardGrid. The scans below follow the code — the anchor, the
// web: row, the heading variants pin against the components that
// render them — while the contract pins (types, slots, section
// order, exports) stay on the page.
const hero = readCode("src/components/Hero.tsx");
const ctaRow = readCode("src/components/CtaRow.tsx");
const featureCard = readCode("src/components/FeatureCard.tsx");
const cardGrid = readCode("src/components/CardGrid.tsx");
const landingUnit = [page, hero, ctaRow, featureCard, cardGrid].join("\n");

test("LandingPage source is readable and exports the page and its view-model types", () => {
  assert.ok(page.length > 1000, "expected the full LandingPage source");
  assert.match(page, /export function LandingPage/);
  for (const name of ["LandingPageProps", "LandingPageCta", "LandingPageFeature"]) {
    assert.match(
      page,
      new RegExp(String.raw`export type ${name} = \{`),
      `${name} must be an exported type alias`,
    );
  }
  assert.ok(!/\binterface\b/.test(page), "view-model types are type aliases, never interfaces");
});

test("the features are three fixed slots, not a list (Stephen's decision on #171)", () => {
  for (const slot of ["featureOne", "featureTwo", "featureThree"]) {
    assert.match(
      page,
      new RegExp(`${slot}: LandingPageFeature;`),
      `${slot} must be a fixed LandingPageFeature slot prop`,
    );
  }
  assert.ok(
    !/LandingPageFeature\[\]/.test(page),
    "the features must not cross as a LandingPageFeature[] array",
  );
  assert.ok(!/^\s+features:/m.test(page), "there must be no `features` list prop");
});

test("the CTAs cross as {label, href} data — no CTA press callbacks", () => {
  assert.match(page, /export type LandingPageCta = \{\s+label: string;\s+href: string;\s+\};/);
  for (const prop of ["discoverCta", "signUpCta", "getAppCta"]) {
    assert.match(
      page,
      new RegExp(`${prop}: LandingPageCta;`),
      `${prop} must be a LandingPageCta prop`,
    );
  }
  for (const callback of ["onDiscoverPress", "onSignUpPress", "onGetAppPress", "onCtaPress"]) {
    assert.ok(
      !page.includes(callback),
      `the contract must not define ${callback} — CTAs navigate via href`,
    );
  }
});

test("the CTAs render through Button's href form fed by the CTA data", () => {
  // Button's href form (ButtonLink) renders the real anchor —
  // its anchor rendering is pinned by
  // test/navigationLinks.test.mjs; here the page's wiring pins:
  // each CTA crosses into a <Button href> with its emphasis.
  // (A dedicated CtaLink duplicated this form and was deleted —
  // Stephen's ruling on PR #311.)
  const order = ["discoverCta", "signUpCta", "getAppCta"].map((prop) =>
    page.indexOf(`${prop}.href`),
  );
  assert.ok(
    order.every((index) => index !== -1),
    "all three CTAs must render through Button's href form",
  );
  assert.ok(
    order[0] < order[1] && order[1] < order[2],
    "the CTAs must render in Discover / Sign up / Get-the-app order",
  );
  assert.match(page, /<Button href=\{discoverCta\.href\} variant="primary">/);
  assert.match(page, /<Button href=\{signUpCta\.href\} variant="secondary">/);
  assert.match(page, /<Button href=\{getAppCta\.href\} variant="secondary">/);
  assert.ok(!page.includes("CtaLink"), "the page must not render the deleted CtaLink");
});

test("the CTA container stacks narrow and rows on web — no wrapping CTA row", () => {
  assert.match(
    ctaRow,
    /flexDirection="web:row"/,
    "the CTA row must become a row only on web — the #171 contract is stacked narrow / row on wide, and its narrow rendering is the native one while wide is web (the DS config defines no width breakpoints)",
  );
  assert.ok(!ctaRow.includes("flexWrap"), "the CTA row must not wrap");
  assert.equal(
    landingUnit.split("flexWrap").length - 1,
    1,
    "only the feature grid may flexWrap — a wrapping CTA row could seat two CTAs side by side at the 430px story viewport instead of the contracted stack",
  );
  assert.match(cardGrid, /flexWrap="wrap"/, "the one flexWrap is the feature grid's");
});

test("frame structure: ScreenContainer shell, sections in hero → CTAs → features order", () => {
  assert.match(
    page,
    /return \(\s+<ScreenContainer>/,
    "the view must render inside the ScreenContainer page shell",
  );
  const heroAt = page.indexOf("{heroTitle}");
  const ctasAt = page.indexOf("cta={discoverCta}");
  const featuresAt = page.indexOf("feature={featureOne}");
  assert.ok(heroAt !== -1 && ctasAt !== -1 && featuresAt !== -1, "all three sections must render");
  assert.ok(
    heroAt < ctasAt && ctasAt < featuresAt,
    "sections must render hero, then CTAs, then features",
  );
  assert.equal(
    landingUnit.split('variant="heading"').length - 1,
    1,
    "the hero title must be the page's only heading-variant (level-1) Text",
  );
  assert.match(
    hero,
    /<Text variant="heading" textAlign="center">/,
    "the hero renders the heading-variant (level-1) title",
  );
  assert.match(
    featureCard,
    /<Text variant="subheading">\{feature\.title\}<\/Text>/,
    "feature titles render with the subheading (level-2) variant",
  );
});

test("no app copy is baked in and nothing app- or react-native-side is imported", () => {
  for (const copy of [
    "Your recipes, organized and ready to cook",
    "Discover public recipes",
    "Sign up free",
    "Get the mobile app",
    "Import from anywhere",
  ]) {
    assert.ok(
      !page.includes(copy),
      `LandingPage must not bake in the app copy "${copy}" — it crosses as props`,
    );
  }
  assert.ok(
    !/from\s+"[^"]*react-native"/.test(page),
    "the page must not import react-native directly",
  );
  assert.ok(!/from\s+"[^"]*eciperay/i.test(page), "the page must not import app code");
});

test("the page is exported from @spudly/ui/pages and storied under Pages/Eciperay", () => {
  const normalizedIndex = pagesIndex.replaceAll(/\s+/g, " ");
  assert.ok(
    normalizedIndex.includes(
      'export { LandingPage, type LandingPageProps, type LandingPageCta, type LandingPageFeature, } from "./LandingPage.js";',
    ),
    "src/pages/index.ts must export LandingPage and its view-model types",
  );
  assert.match(stories, /title: "Pages\/Eciperay\/LandingPage"/);
  assert.match(
    stories,
    /landingFixture/,
    "the story must render the real page with the landing fixture",
  );
  assert.match(fixtures, /export const landingFixture = \{/);
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
    // The pages barrel is not Node-importable (some pages import
    // react-native), so the page under test is loaded from its
    // own module — it is a plain component composition.
    const { LandingPage } = await import("../dist/pages/LandingPage.js");
    return { React, renderToString, TamaguiProvider, ...dist, LandingPage };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

// Sentinel copy, deliberately unlike the fixture/app copy, so the
// SSR assertions prove the props — not baked-in strings — render.
const sentinelProps = {
  heroTitle: "Hero Title Sentinel",
  heroSubtitle: "Hero subtitle sentinel.",
  discoverCta: { label: "Discover Sentinel", href: "/discover" },
  signUpCta: { label: "Sign Up Sentinel", href: "/signup" },
  getAppCta: { label: "Get App Sentinel", href: "https://apps.example.test/install" },
  featureOne: { title: "Feature One Sentinel", description: "First feature sentinel." },
  featureTwo: { title: "Feature Two Sentinel", description: "Second feature sentinel." },
  featureThree: { title: "Feature Three Sentinel", description: "Third feature sentinel." },
};

async function renderLanding() {
  const { React, LandingPage } = await loadRuntime();
  return renderToHtml(React.createElement(LandingPage, sentinelProps));
}

function renderedAnchors(html) {
  const anchors = [];
  const pattern = /<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    anchors.push({ href: match[1], label: match[2].trim(), tag: match[0] });
  }
  return anchors;
}

// [{ level, text }] for every rendered heading, in document order.
function renderedHeadings(html) {
  const headings = [];
  const pattern = /<[a-zA-Z][^>]*role="heading"[^>]*>([^<]*)/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const tag = match[0].slice(0, match[0].indexOf(">") + 1);
    const level = /aria-level="(\d)"/.exec(tag);
    headings.push({ level: level ? Number(level[1]) : null, text: match[1].trim() });
  }
  return headings;
}

test("SSR: the three CTAs render as real anchor links with the props' hrefs and labels", async () => {
  const html = await renderLanding();
  const anchors = renderedAnchors(html);
  assert.deepEqual(
    anchors.map(({ href, label }) => ({ href, label })),
    [
      { href: "/discover", label: "Discover Sentinel" },
      { href: "/signup", label: "Sign Up Sentinel" },
      { href: "https://apps.example.test/install", label: "Get App Sentinel" },
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
