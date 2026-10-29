/**
 * Contract test for LegalDocumentPage (spudly/design-system#170).
 *
 * LegalDocumentPage is the design-system legal document view: one
 * parameterized page serves both the privacy policy and the terms
 * of service. The contract Stephen resolved on the issue
 * (2026-10-28):
 * 1. Content model: the document crosses as ONE markdown string —
 *    Stephen superseded the structured section/block/span tree
 *    this page first shipped with the same day ("accept markdown
 *    instead of a complex json contract"). The supported subset is
 *    what the real documents use: `##` headings opening sections,
 *    blank-line-separated paragraphs, `-` bullet lists, and
 *    `**strong**` / `` `code` `` / `[label](href)` inline spans.
 *    The block/span view-model types are gone from the public API.
 * 2. Inline links: a markdown link renders as a real link (a web
 *    anchor with the href from the markdown, `mailto:` included),
 *    per the navigation rule. There is no press callback and no
 *    link-id indirection — the href in the markdown is where the
 *    link goes.
 * 3. Frame: the page renders the full DS public frame, unified
 *    across the public surfaces — a header with the brand wordmark
 *    and a sign-in link, the document, and a footer carrying the
 *    host's legal links. The frame's links navigate, so they cross
 *    as hrefs with their labels, like the content links.
 * 4. The page title is the level-1 heading (#261/#263 semantics)
 *    and section headings are level 2; the last-updated line
 *    renders the host's pre-formatted date as "Last updated: …".
 *
 * Source scans pin the contract's shape; the SSR tests render the
 * built page from markdown and pin what a reader (and a screen
 * reader) actually gets: every markdown construct rendered, link
 * spans as anchors with their hrefs, and the footer present.
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

const code = readCode("src/pages/LegalDocumentPage.tsx");

test("content crosses as one markdown string — the structured tree is gone (#170)", () => {
  const propsAt = code.indexOf("LegalDocumentPageProps = {");
  const propsBlock = code.slice(propsAt, code.indexOf("};", propsAt));
  assert.match(propsBlock, /markdown: string/, "the document crosses as a markdown string");
  assert.ok(!propsBlock.includes("sections"), "no sections prop — the markdown carries them");
  // No app JSX crosses the boundary: the props carry no ReactNode.
  assert.ok(!propsBlock.includes("ReactNode"), "page props must not carry ReactNode");
  // The block/span view-model types are no longer part of the page.
  for (const removed of ["LegalDocumentSection", "LegalDocumentBlock", "LegalDocumentSpan"]) {
    assert.ok(!code.includes(removed), `${removed} must be removed from the page module`);
  }
  // The page parses the markdown itself, with the subset's patterns.
  assert.ok(code.includes("parseMarkdown"), "the page parses its markdown prop");
  assert.ok(code.includes("parseInline"), "inline markdown spans are parsed");
  assert.match(code, /#\{1,2\}/, "heading pattern covers the `#`/`##` section headings");
});

test("markdown links render as real anchors with the markdown's href — no press callback (#170)", () => {
  assert.ok(!code.includes("onLinkPress"), "content links must not report through a callback");
  assert.ok(!code.includes("onPress"), "the page has no press intents at all — links carry hrefs");
  assert.match(code, /<Anchor\s+key=\{key\}\s+href=\{span\.href\}/, "link span renders an Anchor");
});

test("the full public frame renders: brand, sign-in, and footer links as hrefs (#170)", () => {
  assert.match(code, /href=\{brandHref\}/, "brand wordmark is a link with the brand href");
  assert.match(code, /href=\{signInHref\}/, "sign-in is a link with the sign-in href");
  assert.match(code, /footerLinks\.map/, "footer renders the host's footer links");
  assert.match(code, /href=\{link\.href\}/, "footer links render as anchors with their hrefs");
  assert.match(code, /<Divider \/>/, "the footer is set off by the frame divider");
});

test("LegalDocumentPage is exported from the pages subpath without the removed types (#170)", () => {
  const index = readCode("src/pages/index.ts");
  assert.match(index, /LegalDocumentPage,/, "page exported");
  for (const typeName of ["LegalDocumentPageProps", "LegalDocumentLink"]) {
    assert.ok(index.includes(`type ${typeName}`), `${typeName} must be exported`);
  }
  for (const removed of ["LegalDocumentSection", "LegalDocumentBlock", "LegalDocumentSpan"]) {
    assert.ok(!index.includes(removed), `${removed} must no longer be exported`);
  }
});

test("stories render the real page for both documents (#170)", () => {
  const stories = readCode("src/pages/LegalDocumentPage.stories.tsx");
  assert.ok(stories.includes('title: "Pages/Eciperay/LegalDocumentPage"'), "story title");
  assert.match(stories, /export const PrivacyPolicy/, "privacy story");
  assert.match(stories, /export const TermsOfService/, "terms story");
  assert.ok(stories.includes("legalPrivacyFixture"), "privacy story uses the privacy fixture");
  assert.ok(stories.includes("legalTermsFixture"), "terms story uses the terms fixture");
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
    const { LegalDocumentPage } = await import("../dist/pages/LegalDocumentPage.js");
    return { React, renderToString, TamaguiProvider, ...dist, LegalDocumentPage };
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

function anchorHrefs(html) {
  return [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map((match) => match[1]);
}

const fixtureMarkdown = `This page explains what Eciperay collects and why.

## Information we collect

Eciperay collects the information you give us when you **create an account** and save recipes, including:

- **Account details.** Your name and email address.
- **Your content.** Recipes, meal plans, and notes you save.

Private pages carry a \`noindex\` directive so search engines do not list them.

Questions? Email us at [legal@example.com](mailto:legal@example.com) and we will reply.
`;

const fixtureProps = {
  title: "Privacy Policy",
  lastUpdated: "July 22, 2026",
  brandLabel: "Eciperay",
  brandHref: "/",
  signInLabel: "Sign in",
  signInHref: "/login",
  footerLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  markdown: fixtureMarkdown,
};

test("SSR: the markdown renders every construct under a single level-1 title (#170)", async () => {
  const { React, LegalDocumentPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(LegalDocumentPage, fixtureProps));

  const headings = renderedHeadings(html);
  assert.deepEqual(
    headings.filter((h) => h.level === 1).map((h) => h.text),
    ["Privacy Policy"],
    "the document title is the only level-1 heading",
  );
  assert.deepEqual(
    headings.filter((h) => h.level === 2).map((h) => h.text),
    ["Information we collect"],
    "`##` headings render as level-2 section headings",
  );

  assert.ok(html.includes("Last updated: July 22, 2026"), "last-updated line renders");
  // Lead content before the first heading renders as a paragraph.
  assert.ok(html.includes("This page explains what Eciperay collects and why."), "lead paragraph");
  // Paragraph: plain + strong spans in one flow.
  assert.ok(
    html.includes("Eciperay collects the information you give us when you"),
    "paragraph text",
  );
  assert.ok(html.includes("create an account"), "**strong** renders");
  // Code span.
  assert.ok(html.includes("noindex"), "`code` renders");
  // List: every item renders, bulleted.
  assert.ok(html.includes("Account details."), "list item strong lead-in renders");
  assert.ok(html.includes("Recipes, meal plans, and notes you save."), "list item text renders");
  assert.ok((html.match(/•/g) ?? []).length >= 2, "list items render with bullet markers");
});

test("SSR: content and frame links render as anchors with their hrefs (#170)", async () => {
  const { React, LegalDocumentPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(LegalDocumentPage, fixtureProps));
  const hrefs = anchorHrefs(html);

  assert.ok(hrefs.includes("mailto:legal@example.com"), "content mailto link is an anchor");
  assert.ok(html.includes("legal@example.com"), "content link label renders");
  assert.ok(hrefs.includes("/"), "brand wordmark links home");
  assert.ok(html.includes("Eciperay"), "brand label renders");
  assert.ok(hrefs.includes("/login"), "sign-in link is an anchor");
  // Footer present: both legal links render as anchors after the document.
  assert.ok(hrefs.includes("/privacy"), "footer privacy link is an anchor");
  assert.ok(hrefs.includes("/terms"), "footer terms link is an anchor");
  assert.ok(
    html.indexOf('href="/privacy"') > html.indexOf("Information we collect"),
    "the footer renders after the document sections",
  );
});
