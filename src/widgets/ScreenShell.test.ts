/**
 * Contract test for ScreenShell (spudly/design-system#119), the
 * fixed-shell screen frame: a surface-filled column for pages
 * that pin their own chrome above a ScrollRegion —
 * RecipeDetailPage composes it directly and ScrollShell builds
 * on it for PublicRecipePage.
 *
 * Platform split (#547, Stephen's page-scroll model): on native
 * the styled frame's `flex: 1` fills the bounded frame the page
 * shell's "content" mode provides. On web there is no bounded
 * frame — the document scrolls the whole page — so the shell
 * renders as a plain growing surface column: `flex: 1`'s zero
 * basis collapsed the shell inside BigFooterShell's unbounded
 * space-between column, leaving the footer at the viewport's
 * bottom edge while the page content overflowed past it (the
 * rendered-Storybook audit on PR #556 measured RecipeDetailPage
 * and PublicRecipePage footers at the top of documents two to
 * three viewports tall). The SSR tests below render the two
 * composition shapes and assert the rendered web markup carries
 * no vertical scroller and orders the footer after the full
 * content.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "ScreenShell.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("ScreenShell is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  assert.equal(
    typeof dist.ScreenShell,
    "function",
    "ScreenShell must be exported from the internal components barrel",
  );
});

test("native keeps the flex:1 surface frame; the web path renders a growing surface column (#547)", () => {
  assert.match(
    code,
    /flex: 1,\s+backgroundColor: "\$surface",/,
    "the native styled frame is unchanged",
  );
  assert.match(code, /if \(isWeb\) \{/, "the web path is an explicit platform branch");
  assert.match(
    code,
    /<YStack flexGrow=\{1\} flexDirection="column" backgroundColor="\$surface" \{\.\.\.rest\} \/>/,
    "the web branch renders a growing surface column — no zero-basis flex, no bounded frame",
  );
});

// Runtime imports are lazy, like the other contract tests, so the
// source scans still run when the build output is missing.
let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const { loadInternalDist } = await import("../../test/internalDist.js");
    const dist: Record<string, any> = await loadInternalDist();
    const { ScreenShell }: Record<string, any> = await import("../../dist/widgets/ScreenShell.js");
    const { ScrollShell }: Record<string, any> = await import("../../dist/widgets/ScrollShell.js");
    const { ScrollRegion }: Record<string, any> =
      await import("../../dist/widgets/ScrollRegion.js");
    const { BigFooterShell }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
    const { eciperayFooterFixture }: Record<string, any> =
      await import("../../dist/pages/fixtures.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      ScreenShell,
      ScrollShell,
      ScrollRegion,
      BigFooterShell,
      eciperayFooterFixture,
    };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

function verticalScrollers(html: string): string[] {
  const found: string[] = [];
  for (const match of html.matchAll(/<[^>]+style="([^"]*)"[^>]*>/g)) {
    const style = match[1];
    if (
      /overflow-y\s*:\s*(auto|scroll)/.test(style) ||
      /(?:^|;)\s*overflow\s*:\s*(auto|scroll)/.test(style)
    ) {
      found.push(match[0].slice(0, 160));
    }
  }
  return found;
}

function assertWholePageFlow(html: string, markerPrefix: string, count: number) {
  assert.deepEqual(
    verticalScrollers(html),
    [],
    "no element in the rendered web composition may be a vertical scroller",
  );
  const lastAt = html.indexOf(`${markerPrefix} ${count}`);
  assert.ok(lastAt !== -1, "the full content renders");
  const footerAt = html.indexOf('role="contentinfo"');
  assert.ok(footerAt !== -1, "the footer renders");
  assert.ok(lastAt < footerAt, "the footer renders after the full content");
}

test("SSR: the RecipeDetailPage shape (shell + ScreenShell + ScrollRegion) flows as one page (#547)", async () => {
  const { React, ScreenShell, ScrollRegion, BigFooterShell, Text, eciperayFooterFixture } =
    await loadRuntime();
  const markers = Array.from({ length: 20 }, (_, index) =>
    React.createElement(Text, { key: index }, `Detail section ${index + 1}`),
  );
  const html = await renderToHtml(
    React.createElement(
      BigFooterShell,
      { footer: eciperayFooterFixture, scrollMode: "content" },
      React.createElement(
        ScreenShell,
        null,
        React.createElement(Text, null, "Pinned toolbar"),
        React.createElement(ScrollRegion, null, markers),
      ),
    ),
  );
  assertWholePageFlow(html, "Detail section", 20);
});

test("SSR: the PublicRecipePage shape (shell + ScrollShell) flows as one page (#547)", async () => {
  const { React, ScrollShell, BigFooterShell, Text, eciperayFooterFixture } = await loadRuntime();
  const markers = Array.from({ length: 20 }, (_, index) =>
    React.createElement(Text, { key: index }, `Public section ${index + 1}`),
  );
  const html = await renderToHtml(
    React.createElement(
      BigFooterShell,
      { footer: eciperayFooterFixture, scrollMode: "content" },
      React.createElement(ScrollShell, null, markers),
    ),
  );
  assertWholePageFlow(html, "Public section", 20);
});
