/**
 * Contract test for the landing components
 * (spudly/design-system#171, extracted for #119): Hero, CtaRow,
 * FeatureCard, and CardGrid — the sections LandingPage composes,
 * extracted in the public-pages de-styling tranche so the page
 * passes content only. (There is no CtaLink component: it
 * duplicated Button's href form and was deleted on Stephen's
 * ruling on PR #311 — the landing's CTAs are <Button href>.)
 *
 * The pins hold the #171 treatments where they now live: the
 * row's stacked-narrow / row-on-web geometry (never wrapping),
 * the feature card's flex and 260px wrap basis, the grid's
 * wrap, and the hero's centered heading + muted subtitle.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");

function readCode(name) {
  return readFileSync(join(componentsDir, name), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const hero = readCode("Hero.tsx");
const ctaRow = readCode("CtaRow.tsx");
const featureCard = readCode("FeatureCard.tsx");
const cardGrid = readCode("CardGrid.tsx");
const componentsBarrel = readCode("index.ts");

test("the landing components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["Hero", "CtaRow", "FeatureCard", "CardGrid"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
  // CtaLink duplicated Button's href form and was deleted
  // (Stephen's ruling, PR #311): it must not come back.
  assert.equal(dist.CtaLink, undefined, "CtaLink must not be exported — use Button's href form");
  assert.ok(!componentsBarrel.includes("CtaLink"), "the barrel must not export CtaLink");
});

test("Hero centers the heading and the muted subtitle", () => {
  assert.match(hero, /<Text variant="heading" textAlign="center">/);
  assert.match(hero, /color="\$textMuted" textAlign="center"/);
  assert.match(hero, /paddingTop="\$6"/, "the hero owns its top breathing room");
  assert.match(hero, /title: string;/);
  assert.match(hero, /subtitle: string;/);
});

test("CtaRow stacks narrow and rows on web, never wrapping", () => {
  assert.match(ctaRow, /flexDirection="web:row"/);
  assert.match(ctaRow, /alignItems="center" justifyContent="center"/);
  assert.ok(!ctaRow.includes("flexWrap"), "a wrapping row could seat two CTAs side by side");
});

test("FeatureCard flexes on the 260px basis; CardGrid wraps the cards", () => {
  assert.match(featureCard, /<Card flex=\{1\} flexBasis=\{260\} gap="\$2">/);
  assert.match(featureCard, /<Text variant="subheading">\{feature\.title\}<\/Text>/);
  assert.match(featureCard, /color="\$textMuted"/, "the description is muted ink");
  assert.match(cardGrid, /<XStack flexWrap="wrap" gap="\$3">/);
});

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
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

test("SSR: the CTA row renders its Button href forms as real anchors", async () => {
  const { React, Button, CtaRow } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      CtaRow,
      null,
      React.createElement(Button, { href: "/discover", variant: "primary" }, "Browse public recipes"),
      React.createElement(Button, { href: "/signup", variant: "secondary" }, "Create account"),
    ),
  );
  assert.ok(/<a [^>]*href="\/discover"/.test(html), "the primary CTA is an anchor");
  assert.ok(/<a [^>]*href="\/signup"/.test(html), "the secondary CTA is an anchor");
  assert.ok(html.includes("Browse public recipes"), "the primary CTA label renders");
  assert.ok(html.includes("Create account"), "the secondary CTA label renders");
  assert.ok(!/<button/.test(html), "href CTAs must not render as buttons");
});
