/**
 * Contract test for the public frame components
 * (spudly/design-system#119): BrandLink, PublicFrameLayout,
 * PublicFrameHeader, and PublicFrameFooter — the pieces
 * PublicPageFrame composes, extracted in the public-pages
 * de-styling tranche so the frame page passes copy and intent
 * callbacks only.
 *
 * The pins hold the frame's design where it now lives: the
 * wordmark's brand treatment and keyboard activation, the wide
 * column (768px) shared by the layout and both bands, the
 * bands' surface fills and hairline borders, and the footer's
 * note + legal-link treatments — the exact treatments the frame
 * rendered before the extraction.
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

test("BrandLink carries the wordmark treatment and Enter activation", () => {
  assert.match(brandLink, /fontSize=\{tokens\.typography\.fontSize\.lg\}/);
  assert.match(brandLink, /fontWeight=\{tokens\.typography\.fontWeight\.semibold\}/);
  assert.match(brandLink, /color="\$primary"/);
  assert.match(brandLink, /accessibilityRole="link"/);
  assert.match(brandLink, /accessibilityLabel=\{label\}/);
  assert.match(brandLink, /tabIndex=\{0\}/);
  assert.match(brandLink, /event\.key === "Enter"/, "Enter activates the wordmark");
  assert.match(brandLink, /label: string;/, "the wordmark text is caller content");
  assert.match(brandLink, /onPress: \(\) => void;/, "the brand intent is a callback");
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
  assert.match(header, /<BrandLink label=\{brandLabel\} onPress=\{onBrandPress\} \/>/);
  assert.match(header, /<TextLink[^>]*onPress=\{onSignInPress\}/, "Sign in is a link intent");
});

test("PublicFrameFooter is the surface band with the note and legal links", () => {
  assert.match(footer, /backgroundColor="\$surface"/);
  assert.match(footer, /borderTopWidth=\{1\}/);
  assert.match(footer, /maxWidth=\{COLUMN_MAX_WIDTH\}/, "the band's row shares the column");
  assert.match(footer, /flexWrap="wrap"/, "the footer row wraps on narrow widths");
  assert.match(footer, /color=\{tokens\.colors\.gray\.gray6\}/, "the note is muted ink");
  assert.match(footer, /<TextLink[^>]*onPress=\{onPrivacyPress\}/, "Privacy is a link intent");
  assert.match(footer, /<TextLink[^>]*onPress=\{onTermsPress\}/, "Terms is a link intent");
});
