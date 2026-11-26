/**
 * Contract tests for the graphic brand mark (#726): the DS-owned
 * mark the header brand path (BrandLink, as composed by AppTopBar
 * and AppShellPage) and BigFooter render for a brand that has
 * one, selected by NAME as data — never by a host-supplied
 * element (Stephen's 2026-11-19 logos ruling).
 *
 * The pins: (a) the mark renders for the Eciperay identity — the
 * DS's own artwork, the "Ecipe-ray" mark Stephen picked under
 * #861 (round 3, concept 2, 2026-11-25), traced from the
 * concept's measured geometry; (b) no mark (and
 * no empty slot) for a brand that names none — Memorize renders
 * its wordmark exactly as before; (c) the brand link's
 * accessible name is unchanged — the mark is decorative and the
 * anchor's name stays the brand label, on a real anchor carrying
 * the href (Stephen's link-naming rule).
 *
 * Source scans, like this repo's other contract tests, plus SSR
 * of the link form. The SSR runs through the react-native-svg
 * stub (see test/registerSvgStub.ts), which renders SVG elements
 * inert — so the mark's presence is pinned on its source and on
 * the surfaces' source, and the SSR pins the link contract
 * around it.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const brandMark = codeOf("src/icons/BrandMark.tsx");
const brandLink = codeOf("src/widgets/actions/BrandLink.tsx");
const topBar = codeOf("src/widgets/layout/AppTopBar.tsx");
const shellPage = codeOf("src/pages/eciperay/AppShellPage.tsx");
const footer = codeOf("src/widgets/content/BigFooter.tsx");

test("BrandMark carries the Eciperay Ecipe-ray geometry, traced from the approved concept (#861)", () => {
  assert.match(brandMark, /export type BrandMarkName = "eciperay";/);
  assert.match(brandMark, /export function BrandMark\(/);
  assert.match(brandMark, /viewBox="0 0 256 256"/, "the logo's own 256 grid");
  assert.match(brandMark, /fill=\{ECIPERAY_MARK_PAPER\}/, "the warm-paper field");
  assert.match(brandMark, /fill=\{ECIPERAY_MARK_SUN\}/, "the terracotta sun and rays");
  assert.match(brandMark, /fill=\{ECIPERAY_MARK_CARD\}/, "the sage recipe card");
  // Distinctive fragments of the traced geometry itself: the
  // centre ray of the eleven-ray fan and the card's block E.
  assert.ok(
    brandMark.includes("M125.1 57.0 L125.1 36.0 L131.1 36.0 L131.1 57.0 Z"),
    "BrandMark is missing the traced ray fan",
  );
  assert.ok(
    brandMark.includes("M110.1 131.6 L160.4 131.6 L160.4 144.6 L124.9 144.6"),
    "BrandMark is missing the recipe card's E",
  );
  assert.ok(
    brandMark.includes("ECIPERAY_CARD_HOLE_CYS = [127.1, 146.0, 165.0, 184.0, 202.9]"),
    "BrandMark is missing the card's five binder holes",
  );
  assert.ok(!brandMark.includes("ECIPERAY_SPOON_PATH"), "the retired blue spoon mark is gone");
  assert.match(brandMark, /aria-hidden=\{true\}/, "the mark is decorative");
  assert.ok(!brandMark.includes("<img"), "the mark is DS artwork, never a host image");
});

test("BrandLink renders the named mark and keeps the label as its accessible name (#726)", () => {
  assert.match(brandLink, /mark\?: BrandMarkName;/, "the mark crosses as optional data");
  assert.match(
    brandLink,
    /<BrandMark mark=\{mark\} size=\{28\} \/>/,
    "the DS renders its own mark",
  );
  assert.match(
    brandLink,
    /accessibilityLabel: label/,
    "the anchor's accessible name stays the brand label",
  );
  assert.match(brandLink, /accessibilityRole: "link"/);
  assert.match(brandLink, /href=\{href\}/, "the marked form is still a real link with an href");
  assert.match(
    brandLink,
    /<LinkOverlay href=\{href\} accessibilityRole="link" accessibilityLabel=\{label\} \/>/,
    "the native marked form carries the href and the label on its one accessibility stop",
  );
  assert.ok(
    !brandLink.includes("onPress"),
    "a component named *Link carrying the link role is a real link — no press callback (Stephen's ruling, PR #311)",
  );
});

test("the header brand path forwards the mark as data (#726)", () => {
  assert.match(topBar, /mark\?: BrandMarkName;/, "AppTopBar's brand identity names the mark");
  assert.match(topBar, /\{ mark: brand\.mark \}/, "AppTopBar forwards the mark to BrandLink");
  assert.match(
    shellPage,
    /brand: \{ label: string; href: string; mark\?: BrandMarkName \};/,
    "AppShellPage's brand identity names the mark",
  );
});

test("BigFooter's brand block takes the same mark treatment (#726)", () => {
  assert.match(footer, /mark\?: BrandMarkName;/, "the footer brand identity names the mark");
  assert.match(footer, /brand\.mark !== undefined/, "the footer renders the mark only when named");
  assert.match(footer, /<BrandMark mark=\{brand\.mark\} size=\{40\} \/>/);
  assert.match(
    footer,
    /accessibilityLabel: brand\.label/,
    "the footer's brand name stays its label",
  );
});

test("stories pin the marked Eciperay brand and the wordmark-only Memorize brand (#726)", () => {
  const brandLinkStories = readFileSync(join(root, "src/widgets/actions/BrandLink.stories.tsx"), "utf8");
  assert.match(brandLinkStories, /export const WithMark/);
  assert.match(brandLinkStories, /mark: "eciperay"/);
  const topBarStories = readFileSync(join(root, "src/widgets/layout/AppTopBar.stories.tsx"), "utf8");
  assert.match(topBarStories, /export const WordmarkOnlyBrand/);
  assert.match(topBarStories, /brand: \{ label: "Memorize", href: "\/" \}/);
});

let runtimePromise;
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

test("SSR: the marked BrandLink is still a real anchor home, named by its label (#726)", async () => {
  const { BrandLink } = await loadRuntime();
  const html = await renderToHtml(<BrandLink label="Eciperay" href="/" mark="eciperay" />);
  assert.ok(/<a [^>]*href="\//.test(html), "the marked wordmark is an anchor carrying the href");
  assert.ok(html.includes("Eciperay"), "the wordmark label renders beside the mark");
  assert.ok(!/<button/.test(html), "the marked wordmark must not render as a button");
});

test("SSR: a brand with no mark renders its wordmark alone (#726)", async () => {
  const { BrandLink } = await loadRuntime();
  const html = await renderToHtml(<BrandLink label="Memorize" href="/" />);
  assert.ok(/<a [^>]*href="\//.test(html), "the wordmark is an anchor carrying the href");
  assert.ok(html.includes("Memorize"), "the wordmark label renders");
});
