/**
 * Contract test for MemorizeSettingsPage
 * (spudly/design-system#127, B4).
 *
 * Converted from source scans to runtime checks in #733
 * tranche 6a: the page is called directly and the element
 * tree it returns is inspected — the shell it renders in,
 * the "Settings" heading it carries, and the ABSENCE of any
 * other content (no Drive-sync section, #424; no API-key
 * section, #439; no spinner, no extra controls) ARE the
 * rendered contract, observable without reading source.
 * The former import-specifier scan, type-shape pins, and
 * story pins were deleted: prop/import shape is enforced by
 * the TypeScript build, and story coverage is pinned by the
 * story-parity tests (Stephen, 2026-11-20). The dist `.d.ts`
 * read below is a built-artifact read, not a source read,
 * and stays.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

async function loadPage() {
  const dist: Record<string, any> = await loadInternalDist();
  const shell: Record<string, any> = await import("../../../dist/widgets/content/BigFooter.js");
  const page: Record<string, any> =
    await import("../../../dist/pages/memorize/MemorizeSettingsPage.js");
  return { ...dist, BigFooterShell: shell.BigFooterShell, ...page };
}

test("MemorizeSettingsPage is exported from the built pages barrel", async () => {
  const { MemorizeSettingsPage } = await loadPage();
  assert.equal(typeof MemorizeSettingsPage, "function");
  const types = readFileSync(join(here, "../../..", "dist", "pages", "index.d.ts"), "utf8");
  assert.match(types, /MemorizeSettingsPage/);
  assert.match(types, /type MemorizeSettingsPageProps/);
});

test("the page renders its Settings heading in the plain ScreenContainer shell", async () => {
  const { MemorizeSettingsPage, BigFooterShell, ScreenContainer, Text } = await loadPage();
  const footer = { note: "host footer" } as any;
  const tree = MemorizeSettingsPage({ footer });
  assert.equal(tree.type, BigFooterShell, "the page renders through the footer shell");
  assert.equal(tree.props.footer, footer, "the host footer crosses unchanged");
  const screen = tree.props.children;
  assert.equal(screen.type, ScreenContainer, "the shell is the plain ScreenContainer (#547)");
  const heading = screen.props.children;
  assert.equal(heading.type, Text);
  assert.equal(heading.props.variant, "heading");
  assert.equal(heading.props.children, "Settings", "the heading is the app screen's own");
});

test("the page renders nothing else — no Drive, API-key, or loading content survives", async () => {
  const { MemorizeSettingsPage, ScreenContainer } = await loadPage();
  const tree = MemorizeSettingsPage({});
  const screen = tree.props.children;
  assert.equal(screen.type, ScreenContainer);
  // The whole rendered content is the single heading element:
  // no cards, fields, buttons, or spinner elements exist in
  // the tree for the removed sections to hide behind.
  assert.ok(!Array.isArray(screen.props.children), "the screen renders exactly one element");
  const rendered = JSON.stringify(screen.props, (_key, value) =>
    typeof value === "function" ? undefined : value,
  );
  for (const banned of [
    "Google Drive sync",
    "Connect Google Drive",
    "Sync with Drive",
    "Scripture source",
    "API key",
    "Save key",
    "Clear key",
    "Spinner",
    "loading",
  ]) {
    assert.ok(!rendered.includes(banned), `the rendered page must not contain "${banned}"`);
  }
});
