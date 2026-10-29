/**
 * Contract test for the public frame components
 * (spudly/design-system#119): BrandLink, PublicFrameLayout,
 * PublicFrameHeader, and PublicFrameFooter — the pieces
 * PublicPageFrame composes, extracted in the public-pages
 * de-styling tranche so the frame page passes copy and intent
 * callbacks only.
 *
 * The pins hold the frame's design where it now lives: the
 * wordmark's brand treatment on a real anchor (BrandLink takes
 * an href, never a press callback — Stephen's ruling on PR
 * #311), the wide column (768px) shared by the layout and both
 * bands, the bands' surface fills and hairline borders, and the
 * footer's note + legal-link treatments — the exact treatments
 * the frame rendered before the extraction.
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

const brandLink = readCode("BrandLink.tsx");
const layout = readCode("PublicFrameLayout.tsx");
const header = readCode("PublicFrameHeader.tsx");
const footer = readCode("PublicFrameFooter.tsx");

test("the frame components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  for (const name of ["BrandLink", "PublicFrameLayout", "PublicFrameHeader", "PublicFrameFooter"]) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from @spudly/ui`);
  }
  assert.equal(dist.COLUMN_MAX_WIDTH, 768, "the shared column constant is exported");
});

test("BrandLink is a real anchor carrying the href, in the wordmark treatment", () => {
  assert.match(brandLink, /fontSize: tokens\.typography\.fontSize\.lg/);
  assert.match(brandLink, /fontWeight: tokens\.typography\.fontWeight\.semibold/);
  assert.match(brandLink, /color: "\$primary"/);
  assert.match(brandLink, /textDecorationLine: "none"/, "the wordmark carries no underline");
  assert.match(brandLink, /styled\(Anchor/, "the wordmark renders through an Anchor frame");
  assert.match(brandLink, /href=\{href\}/, "the anchor carries the given href");
  assert.match(brandLink, /accessibilityRole: "link"/);
  assert.match(brandLink, /accessibilityLabel: label/);
  assert.match(brandLink, /label: string;/, "the wordmark text is caller content");
  assert.match(brandLink, /href: string;/, "the brand destination crosses as an href");
  assert.ok(
    !brandLink.includes("onPress"),
    "a component named *Link carrying the link role is a real link — no press callback (Stephen's ruling, PR #311)",
  );
});

test("PublicFrameLayout owns the shell and the wide centered column", () => {
  assert.match(layout, /export const COLUMN_MAX_WIDTH = 768;/);
  assert.match(layout, /<YStack flex=\{1\} backgroundColor="\$background">/);
  assert.match(
    layout,
    /<View flex=\{1\} width="100%" maxWidth=\{COLUMN_MAX_WIDTH\} alignSelf="center">/,
    "the content column is the wide centered column",
  );
  assert.match(layout, /header: ReactNode;/);
  assert.match(layout, /footer: ReactNode;/);
  assert.ok(!layout.includes("<ScrollView"), "the frame does not scroll — the page inside does");
});

test("PublicFrameHeader is the surface band with wordmark and sign-in link", () => {
  assert.match(header, /backgroundColor="\$surface"/);
  assert.match(header, /borderBottomWidth=\{1\}/);
  assert.match(header, /borderColor=\{tokens\.colors\.gray\.gray2\}/);
  assert.match(header, /maxWidth=\{COLUMN_MAX_WIDTH\}/, "the band's row shares the column");
  assert.match(header, /<BrandLink label=\{brandLabel\} href=\{brandHref\} \/>/);
  assert.match(header, /<TextLink[^>]*href=\{signInHref\}/, "Sign in is a real link with an href");
  assert.match(header, /signInHref: string;/, "the sign-in destination crosses as an href");
  assert.ok(
    !header.includes("onSignInPress"),
    "no press callback survives on a link (Stephen's ruling)",
  );
});

test("PublicFrameFooter is the surface band with the note and legal links", () => {
  assert.match(footer, /backgroundColor="\$surface"/);
  assert.match(footer, /borderTopWidth=\{1\}/);
  assert.match(footer, /maxWidth=\{COLUMN_MAX_WIDTH\}/, "the band's row shares the column");
  assert.match(footer, /flexWrap="wrap"/, "the footer row wraps on narrow widths");
  assert.match(footer, /color=\{tokens\.colors\.gray\.gray6\}/, "the note is muted ink");
  assert.match(footer, /<TextLink[^>]*href=\{privacyHref\}/, "Privacy is a real link with an href");
  assert.match(footer, /<TextLink[^>]*href=\{termsHref\}/, "Terms is a real link with an href");
  assert.ok(
    !footer.includes("onPrivacyPress"),
    "no press callbacks survive on links (Stephen's ruling)",
  );
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

test("SSR: BrandLink renders as a real anchor carrying the given href", async () => {
  const { React, BrandLink } = await loadRuntime();
  const html = await renderToHtml(React.createElement(BrandLink, { label: "Eciperay", href: "/" }));
  assert.ok(/<a [^>]*href="\//.test(html), "the wordmark is an anchor carrying the href");
  assert.ok(html.includes("Eciperay"), "the wordmark label renders");
  assert.ok(!/<button/.test(html), "the wordmark must not render as a button");
});
