/**
 * Contract test for ProseDocument (spudly/design-system#170,
 * extracted for #119): the structured prose renderer
 * LegalDocumentPage composes — the content model (sections of
 * paragraph/list blocks of text/strong/code/link spans), the
 * prose column, and the list semantics, rendered and pinned at
 * runtime like the page-level SSR tests pin them through the
 * page.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "ProseDocument.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ProseDocument is exported from the built package root with its model types", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.ProseDocument, "function", "ProseDocument must be exported");
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  for (const name of ["ProseDocumentProps", "ProseSection", "ProseBlock", "ProseSpan"]) {
    assert.match(types, new RegExp(name), `${name} must be a type export`);
  }
});

test("the content model is structured data — spans, blocks, sections", () => {
  assert.match(code, /type ProseSpan =/);
  assert.match(code, /\{ type: "text"; text: string \}/);
  assert.match(code, /\{ type: "strong"; text: string \}/);
  assert.match(code, /\{ type: "code"; text: string \}/);
  assert.match(code, /\{ type: "link"; label: string; href: string \}/);
  assert.match(code, /\{ type: "paragraph"; spans: ProseSpan\[\] \}/);
  assert.match(code, /\{ type: "list"; items: ProseSpan\[\]\[\] \}/);
  assert.match(code, /title: string;\s+blocks: ProseBlock\[\];/);
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

const fixture = {
  title: "Terms of Service",
  lastUpdated: "July 22, 2026",
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

test("SSR: the document renders its title, sections, spans, and list semantics", async () => {
  const { React, ProseDocument } = await loadRuntime();
  const html = await renderToHtml(React.createElement(ProseDocument, fixture));
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
