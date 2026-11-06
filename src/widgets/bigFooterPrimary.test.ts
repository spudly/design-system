/**
 * Contract test for the BigFooter primary band
 * (spudly/design-system#465, Stephen's 2026-11-05 Storybook review).
 *
 * The footer band renders on the $primary fill, so every ink that
 * sits directly on the band uses $onPrimary — the DS's settled
 * on-primary ink role: the brand wordmark, the social icon links,
 * the column titles, and the column links. The top divider is
 * gone (a solid primary band needs no divider, and the light
 * gray line would read as a stray stripe). Store links stay
 * secondary Buttons: their own light fill keeps them legible as
 * pills on the primary band, and switching them to the primary
 * variant would make them invisible on the identical fill.
 *
 * Source scan like this repo's other contract tests (comments
 * stripped first, so the assertions pin the styling code itself).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const footer = readCode("src/widgets/BigFooter.tsx");

test("the footer band fills with $primary and carries no top divider (#465)", () => {
  assert.match(footer, /backgroundColor="\$primary"/);
  assert.ok(!/backgroundColor="\$surface"/.test(footer), "the band must not keep the surface fill");
  assert.ok(!/borderTopWidth/.test(footer), "the solid primary band carries no divider line");
});

test("the brand wordmark and social links ink in $onPrimary (#465)", () => {
  const styledBlocks = footer.match(/color: "\$onPrimary"/g) ?? [];
  assert.equal(styledBlocks.length, 2, "brand anchor + social anchor styled frames use $onPrimary");
  assert.ok(!/color: "\$primary"/.test(footer), "no frame inks in $primary on the primary fill");
});

test("column titles and column links ink in $onPrimary (#465)", () => {
  assert.match(footer, /<Text variant="label" color="\$onPrimary">/);
  assert.match(footer, /<TextLink[\s\S]*?color="\$onPrimary"/);
});

test("social glyphs receive the resolved on-primary ink explicitly (#465)", () => {
  // react-native-svg cannot inherit the anchor's text color on
  // native, so the glyph color is the theme's onPrimary role
  // resolved through useTheme — never currentColor inheritance.
  assert.match(footer, /useTheme\(\)/);
  assert.match(
    footer,
    /const socialInk = typeof theme\.onPrimary\?\.val === "string" \? theme\.onPrimary\.val : "#ffffff";/,
  );
  assert.match(footer, /<IconGlyph size=\{24\} color=\{socialInk\} \/>/);
});

test("store links stay secondary Buttons (#465)", () => {
  assert.match(footer, /<Button key=\{link\.href\} href=\{link\.href\} variant="secondary">/);
});
