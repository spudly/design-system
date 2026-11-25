/**
 * Contract tests for the graphic brand mark (#726): the DS-owned
 * mark the header brand path (BrandLink, as composed by AppTopBar
 * and AppShellPage) and BigFooter render for a brand that has
 * one, selected by NAME as data — never by a host-supplied
 * element (Stephen's 2026-11-19 logos ruling).
 *
 * The pins: (a) the mark renders for the Eciperay identity — the
 * DS's own artwork, ported from the eciperay logo geometry
 * (option A, approved by Stephen 2026-11-20); (b) no mark (and
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

test("BrandMark carries the Eciperay mark geometry, ported from the logo (#726)", () => {
  assert.match(brandMark, /export type BrandMarkName = "eciperay" \| "memorize";/);
  assert.match(brandMark, /export function BrandMark\(/);
  assert.match(brandMark, /viewBox="0 0 256 256"/, "the logo's own 256 grid");
  assert.match(brandMark, /fill=\{ECIPERAY_MARK_FIELD\}/, "the blue app-icon field");
  // A distinctive fragment of the spoon glyph from the eciperay
  // logo's minimal variant — the ported geometry itself.
  assert.ok(
    brandMark.includes("M126.228 207.647c-2.746-.355-5.646-1.646-7.695-3.434"),
    "BrandMark is missing the ported spoon geometry",
  );
  assert.match(brandMark, /aria-hidden=\{true\}/, "the mark is decorative");
  assert.ok(!brandMark.includes("<img"), "the mark is DS artwork, never a host image");
});

test("BrandMark carries the Memorize mark, ported from Stephen's concept-1 pick in Quiet Dawn (#861)", () => {
  assert.match(brandMark, /case "memorize":/, "the Memorize case renders");
  assert.match(brandMark, /MEMORIZE_MARK_FIELD = "#faf8f2"/, "the warm-paper field");
  assert.match(brandMark, /MEMORIZE_MARK_BOOK = "#0f766e"/, "the deep teal book");
  assert.match(brandMark, /MEMORIZE_MARK_ACCENT = "#b45309"/, "the gold rays, flame, and bookmark");
  assert.match(brandMark, /fill=\{MEMORIZE_MARK_FIELD\}/, "the field renders in Quiet Dawn paper");
  assert.match(brandMark, /fill=\{MEMORIZE_MARK_BOOK\}/, "the open book renders in deep teal");
  assert.match(brandMark, /fill=\{MEMORIZE_MARK_ACCENT\}/, "the rays and flame render in gold");
  assert.match(brandMark, /MEMORIZE_FLAME_PATH/, "the central flame is part of the port");
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
  assert.match(brandLinkStories, /export const WithMemorizeMark/, "the Memorize story exists (#861)");
  assert.match(brandLinkStories, /mark: "memorize"/);
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
