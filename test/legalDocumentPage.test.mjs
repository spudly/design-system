/**
 * Contract test for LegalDocumentPage (spudly/design-system#170).
 *
 * LegalDocumentPage is the design-system legal document view: one
 * parameterized page serves both the privacy policy and the terms
 * of service, driven by structured content props. The contract
 * Stephen resolved on the issue (2026-10-28):
 * 1. Content model: structured blocks, not markdown or JSX — the
 *    document crosses as section/block/span type aliases: sections
 *    with titles, paragraph and bullet-list blocks, and text /
 *    strong / code / link spans.
 * 2. Inline links: a link span carries its href in the data and
 *    renders as a real link (a web anchor with that href), per the
 *    navigation rule. There is no press callback and no link-id
 *    indirection — the href in the data is where the link goes.
 * 3. Frame: the page renders the full DS public frame, unified
 *    across the public surfaces — a header with the brand wordmark
 *    and a sign-in link, the document, and a footer carrying the
 *    host's legal links. The frame's links navigate, so they cross
 *    as hrefs with their labels, like the content links.
 * 4. The page title is the level-1 heading (#261/#263 semantics)
 *    and section titles are level 2; the last-updated line renders
 *    the host's pre-formatted date as "Last updated: …".
 *
 * Source scans pin the contract's shape; the SSR tests render the
 * built page and pin what a reader (and a screen reader) actually
 * gets: every block type rendered, link spans as anchors with
 * their hrefs, and the footer present.
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
// The document's renderer and frame moved into shared components
// in the #119 de-styling tranche: the content model and rendering
// live in ProseDocument, the frame in DocumentHeader /
// DocumentFooter. The scans below follow the code — the model and
// rendering pins scan ProseDocument, the frame pins scan the
// frame components — while the page keeps the public contract:
// its Legal* type names alias the renderer's model, and its
// props carry the frame's data.
const prose = readCode("src/components/ProseDocument.tsx");
const docHeader = readCode("src/components/DocumentHeader.tsx");
const docFooter = readCode("src/components/DocumentFooter.tsx");

test("content crosses as structured section/block/span data (#170)", () => {
  for (const spanType of ['"text"', '"strong"', '"code"', '"link"']) {
    assert.ok(
      prose.includes(`type: ${spanType}`),
      `the span model must include the ${spanType} span`,
    );
  }
  assert.match(prose, /type: "link"; label: string; href: string/, "link spans carry label + href");
  assert.match(prose, /type: "paragraph"; spans: ProseSpan\[\]/, "paragraph block shape");
  assert.match(prose, /type: "list"; items: ProseSpan\[\]\[\]/, "list block shape");
  assert.match(
    prose,
    /ProseSection = \{\s*title: string;\s*blocks: ProseBlock\[\];/,
    "section shape",
  );
  // The page's public names are the #170 contract: they alias the
  // renderer's model, so the shapes above ARE the page's shapes.
  assert.match(code, /LegalDocumentSpan = ProseSpan/, "the page's span type is the renderer's");
  assert.match(code, /LegalDocumentBlock = ProseBlock/, "the page's block type is the renderer's");
  assert.match(
    code,
    /LegalDocumentSection = ProseSection/,
    "the page's section type is the renderer's",
  );
  // No app JSX crosses the boundary: the props carry no ReactNode.
  const propsAt = code.indexOf("LegalDocumentPageProps = {");
  const propsBlock = code.slice(propsAt, code.indexOf("};", propsAt));
  assert.ok(!propsBlock.includes("ReactNode"), "page props must not carry ReactNode");
});

test("link spans render as real anchors with the data's href — no press callback (#170)", () => {
  assert.ok(!code.includes("onLinkPress"), "content links must not report through a callback");
  assert.ok(!code.includes("onPress"), "the page has no press intents at all — links carry hrefs");
  assert.ok(
    !prose.includes("onPress"),
    "the renderer has no press intents either — links carry hrefs",
  );
  assert.match(prose, /<Anchor\s+key=\{key\}\s+href=\{span\.href\}/, "link span renders an Anchor");
});

test("the full public frame renders: brand, sign-in, and footer links as hrefs (#170)", () => {
  assert.match(docHeader, /href=\{brandHref\}/, "brand wordmark is a link with the brand href");
  assert.match(docHeader, /href=\{signInHref\}/, "sign-in is a link with the sign-in href");
  assert.match(code, /brandHref=\{brandHref\}/, "the page passes its brand href to the header");
  assert.match(code, /signInHref=\{signInHref\}/, "the page passes its sign-in href to the header");
  assert.match(
    code,
    /links=\{footerLinks\}/,
    "the page passes the host's footer links to the footer",
  );
  assert.match(docFooter, /links\.map/, "footer renders the host's footer links");
  assert.match(docFooter, /href=\{link\.href\}/, "footer links render as anchors with their hrefs");
  assert.match(docFooter, /<Divider \/>/, "the footer is set off by the frame divider");
});

test("the document renders in a prose column; list blocks carry list semantics (#170)", () => {
  // Prose column: title + sections sit in the centered 768px
  // column (the public surfaces' max-w-3xl), not stretched across
  // a wide viewport; ScreenContainer itself has no cap.
  assert.match(prose, /const PROSE_MAX_WIDTH = 768;/, "prose column width is the public 768px");
  assert.match(
    prose,
    /<YStack width="100%" maxWidth=\{PROSE_MAX_WIDTH\} alignSelf="center" gap="\$4">/,
    "title and sections render inside the centered prose column",
  );
  // List semantics: the block's stack carries the web list role and
  // each item row the listitem role (platform-split props from
  // components/accessibility — native has no listitem role).
  assert.match(
    prose,
    /<YStack gap="\$2" \{\.\.\.listRoleProps\}>/,
    "list block carries the list role",
  );
  assert.match(
    prose,
    /<XStack key=\{index\} gap="\$2" \{\.\.\.listItemRoleProps\}>/,
    "list items carry the listitem role",
  );
});

test("LegalDocumentPage is exported from the pages subpath with its view-model types (#170)", () => {
  const index = readCode("src/pages/index.ts");
  assert.match(index, /LegalDocumentPage,/, "page exported");
  for (const typeName of [
    "LegalDocumentPageProps",
    "LegalDocumentSection",
    "LegalDocumentBlock",
    "LegalDocumentSpan",
    "LegalDocumentLink",
  ]) {
    assert.ok(index.includes(`type ${typeName}`), `${typeName} must be exported`);
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
  sections: [
    {
      title: "Information we collect",
      blocks: [
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Eciperay collects the information you give us when you " },
            { type: "strong", text: "create an account" },
            { type: "text", text: " and save recipes, including:" },
          ],
        },
        {
          type: "list",
          items: [
            [
              { type: "strong", text: "Account details." },
              { type: "text", text: " Your name and email address." },
            ],
            [
              { type: "strong", text: "Your content." },
              { type: "text", text: " Recipes, meal plans, and notes you save." },
            ],
          ],
        },
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Private pages carry a " },
            { type: "code", text: "noindex" },
            { type: "text", text: " directive so search engines do not list them." },
          ],
        },
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "Questions? Email us at " },
            { type: "link", label: "legal@example.com", href: "mailto:legal@example.com" },
            { type: "text", text: " and we will reply." },
          ],
        },
      ],
    },
  ],
};

test("SSR: the document renders every block type under a single level-1 title (#170)", async () => {
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
    "section titles render as level-2 headings",
  );

  assert.ok(html.includes("Last updated: July 22, 2026"), "last-updated line renders");
  // Paragraph block: plain + strong spans in one flow.
  assert.ok(
    html.includes("Eciperay collects the information you give us when you"),
    "paragraph text",
  );
  assert.ok(html.includes("create an account"), "strong span renders");
  // Code span.
  assert.ok(html.includes("noindex"), "code span renders");
  // List block: every item renders, bulleted.
  assert.ok(html.includes("Account details."), "list item strong lead-in renders");
  assert.ok(html.includes("Recipes, meal plans, and notes you save."), "list item text renders");
  assert.ok((html.match(/•/g) ?? []).length >= 2, "list items render with bullet markers");
  // List semantics reach the rendered web tree: the block is a
  // list and each bulleted row a list item.
  assert.ok(html.includes('role="list"'), "list block renders with the list role");
  assert.ok(
    (html.match(/role="listitem"/g) ?? []).length >= 2,
    "list items render with the listitem role",
  );
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
