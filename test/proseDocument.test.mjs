/**
 * Contract test for the prose document renderer
 * (spudly/design-system#170, extracted for #119, folded back
 * 2026-10-29): the structured prose renderer was extracted
 * from LegalDocumentPage as a ProseDocument library component
 * in the public-pages tranche, but Stephen's
 * no-new-components rule for tranche PRs (2026-10-29) requires
 * a tranche PR to add nothing under src/components/ — the
 * page was the only consumer, so the renderer and its content
 * model (sections of paragraph/list blocks of
 * text/strong/code/link spans) were folded back into
 * LegalDocumentPage, under the page's public Legal* type
 * names. This test guards the end state (no ProseDocument
 * component exists or is exported) and pins the model and the
 * rendering where they now live: the page source, and the
 * built page rendered at runtime.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const source = readFileSync(join(root, "src", "pages", "LegalDocumentPage.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const componentsBarrel = readFileSync(join(root, "src", "components", "index.ts"), "utf8");

test("ProseDocument is not a library component — the page carries the model types", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    dist.ProseDocument,
    undefined,
    "ProseDocument must not be exported — it is composed inside LegalDocumentPage",
  );
  assert.ok(
    !existsSync(join(root, "src", "components", "ProseDocument.tsx")),
    "src/components/ProseDocument.tsx must not exist",
  );
  assert.ok(
    !existsSync(join(root, "src", "components", "ProseDocument.stories.tsx")),
    "src/components/ProseDocument.stories.tsx must not exist",
  );
  assert.ok(!componentsBarrel.includes("ProseDocument"), "the barrel must not export it");
  const types = readFileSync(join(root, "dist", "pages", "LegalDocumentPage.d.ts"), "utf8");
  for (const name of ["LegalDocumentSection", "LegalDocumentBlock", "LegalDocumentSpan"]) {
    assert.match(types, new RegExp(name), `${name} must be a type export of the page`);
  }
});

test("the content model is structured data — spans, blocks, sections", () => {
  assert.match(code, /type LegalDocumentSpan =/);
  assert.match(code, /\{ type: "text"; text: string \}/);
  assert.match(code, /\{ type: "strong"; text: string \}/);
  assert.match(code, /\{ type: "code"; text: string \}/);
  assert.match(code, /\{ type: "link"; label: string; href: string \}/);
  assert.match(code, /\{ type: "paragraph"; spans: LegalDocumentSpan\[\] \}/);
  assert.match(code, /\{ type: "list"; items: LegalDocumentSpan\[\]\[\] \}/);
  assert.match(code, /title: string;\s+blocks: LegalDocumentBlock\[\];/);
  assert.ok(!/\binterface\b/.test(code), "the model types are aliases, never interfaces");
  assert.ok(!code.includes("onPress"), "the renderer has no press callbacks — links carry hrefs");
});

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

const fixture = {
  title: "Terms of Service",
  lastUpdated: "July 22, 2026",
  brandLabel: "Eciperay",
  brandHref: "/",
  signInLabel: "Sign in",
  signInHref: "/sign-in",
  footerLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  sections: [
    {
      title: "Using the service",
      blocks: [
        {
          type: "paragraph",
          spans: [
            { type: "text", text: "You agree to the " },
            { type: "strong", text: "fair use" },
            { type: "text", text: " rules and the " },
            { type: "code", text: "noindex" },
            { type: "text", text: " directive." },
          ],
        },
        {
          type: "list",
          items: [
            [
              { type: "strong", text: "Accounts. " },
              { type: "text", text: "One per person." },
            ],
            [
              { type: "text", text: "Contact " },
              { type: "link", label: "legal@example.com", href: "mailto:legal@example.com" },
              { type: "text", text: " with questions." },
            ],
          ],
        },
      ],
    },
  ],
};

test("SSR: the page renders the document's title, sections, spans, and list semantics", async () => {
  const { React, LegalDocumentPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(LegalDocumentPage, fixture));
  assert.ok(html.includes("Terms of Service"), "title renders");
  assert.ok(html.includes("Last updated: July 22, 2026"), "last-updated line renders");
  assert.ok(html.includes("Using the service"), "section title renders");
  assert.ok(html.includes("fair use"), "strong span renders");
  assert.ok(html.includes("noindex"), "code span renders");
  assert.ok((html.match(/•/g) ?? []).length >= 2, "list items render bulleted");
  assert.ok(html.includes('role="list"'), "list block carries the list role");
  assert.ok((html.match(/role="listitem"/g) ?? []).length >= 2, "items carry the listitem role");
  assert.ok(
    /<a [^>]*href="mailto:legal@example\.com"/.test(html),
    "link spans render as anchors with their hrefs",
  );
});
