/**
 * Contract test for PageContentColumn and FullBleed
 * (spudly/design-system#628): the centered 1200px desktop
 * content column and its full-bleed breakout companion.
 *
 * The pins hold the approved plan (Stephen, 2026-11-14, as
 * amended): the column caps at 1200px and centers on web, is
 * a pass-through on native, and owns no padding; the breakout
 * escapes via calc(50% - 50vw) negative margins on web and is
 * a no-op on native; BigFooterShell wraps its content child
 * in the column while the Big Footer stays a direct
 * full-width child of the shell (#547 two-children model);
 * AppTopBar constrains its content through the same column.
 *
 * Source-regex contract style, following ScrollShell.test.ts
 * and CenteredText.test.ts: comments are stripped before
 * matching, so every pin must hold in code, not prose.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

function readCode(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const column = readCode("src/widgets/PageContentColumn.tsx");
const bigFooter = readCode("src/widgets/BigFooter.tsx");
const appTopBar = readCode("src/widgets/AppTopBar.tsx");

test("the column width is the named 1200 constant (#628, Stephen's amendment)", () => {
  assert.match(column, /export const PAGE_CONTENT_MAX_WIDTH = 1200;/);
  assert.match(column, /maxWidth=\{PAGE_CONTENT_MAX_WIDTH\}/);
});

test("on web the column is full-width, capped, and centered", () => {
  assert.match(column, /width="100%"/);
  assert.match(column, /alignSelf="center"/);
});

test("the column owns no padding (#628: no new padding token)", () => {
  assert.ok(!/padding/.test(column), "PageContentColumn must not set any padding");
});

test("on native the column is a plain full-width pass-through stack", () => {
  const nativeBranch = column.indexOf("if (!isWeb)");
  assert.ok(nativeBranch >= 0, "PageContentColumn handles native explicitly");
  const nativeBlock = column.slice(nativeBranch, column.indexOf("return (", nativeBranch));
  assert.match(nativeBlock, /<YStack width="100%">\{children\}<\/YStack>/);
  assert.ok(!nativeBlock.includes("maxWidth"), "the native stack carries no maxWidth");
});

test("PageContentColumn is internal — not exported from any barrel (#298)", () => {
  const barrel = readCode("src/widgets/index.ts");
  assert.ok(
    !barrel.includes("PageContentColumn"),
    "PageContentColumn must not be exported from src/widgets/index.ts",
  );
  assert.ok(!barrel.includes("FullBleed"), "FullBleed must not be exported from the barrel");
});

test("FullBleed breaks out with calc(50% - 50vw) margins on web", () => {
  assert.match(column, /marginLeft: "calc\(50% - 50vw\)"/);
  assert.match(column, /marginRight: "calc\(50% - 50vw\)"/);
});

test("FullBleed is a pass-through on native", () => {
  const fullBleedAt = column.indexOf("export function FullBleed");
  assert.ok(fullBleedAt >= 0, "FullBleed is defined");
  const fullBleedBlock = column.slice(fullBleedAt);
  assert.match(fullBleedBlock, /if \(!isWeb\) \{\s*return <YStack>\{children\}<\/YStack>;/);
});

test("BigFooterShell wraps web content in the column; the footer is NOT inside it", () => {
  assert.match(bigFooter, /import \{ PageContentColumn \} from "\.\/PageContentColumn\.js";/);
  // With a footer: content wrapped, footer a direct sibling
  // after the column — the #547 two-children model preserved.
  assert.match(
    bigFooter,
    /<PageContentColumn>\{children\}<\/PageContentColumn>\s*<BigFooter footer=\{footer\} \/>/,
  );
  // Without footer data: the content is still wrapped, so
  // footerless pages get the column on desktop too.
  assert.match(
    bigFooter,
    /if \(!footer\) \{\s*return \(\s*<YStack flexGrow=\{1\} flexDirection="column" position="relative">\s*<PageContentColumn>\{children\}<\/PageContentColumn>/,
  );
  assert.equal(
    (bigFooter.match(/<BigFooter footer=\{footer\} \/>/g) ?? []).length,
    2,
    "the shell renders BigFooter once per web branch (default + #729 overlay), outside the column",
  );
});

test("AppTopBar constrains its content through the same column", () => {
  assert.match(appTopBar, /import \{ PageContentColumn \} from "\.\/PageContentColumn\.js";/);
  assert.match(appTopBar, /<PageContentColumn>\s*<XStack/);
  assert.match(appTopBar, /<\/XStack>\s*<\/PageContentColumn>/);
});
