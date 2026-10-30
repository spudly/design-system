/**
 * Contract test for the document frame components
 * (spudly/design-system#170, extracted for #119): DocumentHeader
 * and DocumentFooter — the frame LegalDocumentPage composes.
 *
 * The pins hold the #170 frame contract where it now lives: the
 * frame's links navigate, so they are real anchors carrying
 * hrefs (never press callbacks); the wordmark and sign-in
 * treatments sit in the header; the footer is a divider above a
 * wrapping row of the host's legal links.
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

const header = readCode("DocumentHeader.tsx");
const footer = readCode("DocumentFooter.tsx");

test("the document frame components are exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.DocumentHeader, "function", "DocumentHeader must be exported");
  assert.equal(typeof dist.DocumentFooter, "function", "DocumentFooter must be exported");
});

test("DocumentHeader renders brand and sign-in as anchors with hrefs", () => {
  // The dedupe unified the document chrome on the frame's link
  // contract: the wordmark composes BrandLink and sign-in is a
  // TextLink href form — real anchors, no press intents.
  assert.match(
    header,
    /<BrandLink label=\{brandLabel\} href=\{brandHref\} \/>/,
    "the wordmark is BrandLink",
  );
  assert.match(header, /<TextLink[^>]*href=\{signInHref\}/, "sign-in is a link with an href");
  assert.match(header, /fontWeight=\{tokens\.typography\.fontWeight\.medium\}/, "sign-in weight");
  assert.ok(!header.includes("onPress"), "the document frame has no press intents — hrefs only");
  assert.match(header, /brandHref: string;/);
  assert.match(header, /signInHref: string;/);
});

test("DocumentFooter renders the host's links under a divider", () => {
  assert.match(footer, /<Divider \/>/, "the footer is set off by the divider");
  assert.match(footer, /links\.map/, "the footer renders the links it is given");
  assert.match(
    footer,
    /href=\{link\.href\}/,
    "each link renders through a link form with its href",
  );
  assert.match(footer, /flexWrap="wrap"/, "the link row wraps on narrow widths");
  assert.ok(!footer.includes("onPress"), "the document frame has no press intents — hrefs only");
});
