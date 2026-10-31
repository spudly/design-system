/**
 * Landmark test for the public frame and legal page
 * (spudly/design-system#366).
 *
 * The retired web layouts rendered real `<header>`, `<main>`,
 * and `<footer>` elements; their DS replacements rendered none,
 * so screen-reader users could not navigate the public surfaces
 * by landmark. The fix gives the frame components landmark
 * semantics on web through the shared accessibility translation
 * in src/components/accessibility.ts (the #256 pattern):
 *
 * - PublicFrameHeader / DocumentHeader — `banner`
 * - PublicFrameLayout's content column / LegalDocumentPage's
 *   document column — `main`
 * - PublicFrameFooter / DocumentFooter — `contentinfo`
 *
 * `banner`, `main`, and `contentinfo` are ARIA-only roles: they
 * are not members of React Native's `accessibilityRole` set, so
 * they go through the web `role` prop via the platform-split
 * constants (`bannerRoleProps` / `mainRoleProps` /
 * `contentInfoRoleProps`), which are empty on native — native
 * is unaffected.
 *
 * Duplicate-landmark care: each composed surface must render
 * exactly one banner, one main, and one contentinfo. The public
 * frame (PublicFrameLayout + its bands, composed by
 * PublicPageFrame) and LegalDocumentPage (ScreenContainer +
 * DocumentHeader / DocumentFooter + its document column) are
 * each the outermost chrome on their surface, so each owns its
 * landmarks; no inner page component adds landmarks of its own
 * (pinned by the source scan below).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const a11y = readCode("src/components/accessibility.ts");
const layout = readCode("src/components/PublicFrameLayout.tsx");
const publicHeader = readCode("src/components/PublicFrameHeader.tsx");
const publicFooter = readCode("src/components/PublicFrameFooter.tsx");
const docHeader = readCode("src/components/DocumentHeader.tsx");
const docFooter = readCode("src/components/DocumentFooter.tsx");
const legalPage = readCode("src/pages/LegalDocumentPage.tsx");

test("the shared translation exports web-only landmark props (#366)", () => {
  assert.match(
    a11y,
    /export const bannerRoleProps = isWeb \? \(\{ role: "banner" \} as const\) : \(\{\} as const\);/,
  );
  assert.match(
    a11y,
    /export const mainRoleProps = isWeb \? \(\{ role: "main" \} as const\) : \(\{\} as const\);/,
  );
  assert.match(
    a11y,
    /export const contentInfoRoleProps = isWeb \? \(\{ role: "contentinfo" \} as const\) : \(\{\} as const\);/,
  );
  // Landmarks must never go through accessibilityRole: banner /
  // main / contentinfo are not RN roles and would crash Android
  // (the accessibilityRoles scan pins that invariant globally).
  for (const code of [layout, publicHeader, publicFooter, docHeader, docFooter, legalPage]) {
    assert.ok(
      !code.includes("accessibilityRole"),
      "landmarks use the web role prop, not accessibilityRole",
    );
  }
});

test("the public frame components carry their landmarks (#366)", () => {
  assert.match(publicHeader, /\{\.\.\.bannerRoleProps\}/, "PublicFrameHeader is banner");
  assert.match(layout, /\{\.\.\.mainRoleProps\}/, "PublicFrameLayout's content column is main");
  assert.match(publicFooter, /\{\.\.\.contentInfoRoleProps\}/, "PublicFrameFooter is contentinfo");
});

test("the legal page's frame composition carries its landmarks (#366)", () => {
  assert.match(docHeader, /\{\.\.\.bannerRoleProps\}/, "DocumentHeader is banner");
  assert.match(legalPage, /\{\.\.\.mainRoleProps\}/, "the document column is main");
  assert.match(docFooter, /\{\.\.\.contentInfoRoleProps\}/, "DocumentFooter is contentinfo");
});

test("no other source file adds a landmark role — no duplicates inside the frames (#366)", () => {
  const srcDir = join(root, "src");
  const owners = new Set([
    join(srcDir, "components", "accessibility.ts"),
    join(srcDir, "components", "PublicFrameLayout.tsx"),
    join(srcDir, "components", "PublicFrameHeader.tsx"),
    join(srcDir, "components", "PublicFrameFooter.tsx"),
    join(srcDir, "components", "DocumentHeader.tsx"),
    join(srcDir, "components", "DocumentFooter.tsx"),
    join(srcDir, "pages", "LegalDocumentPage.tsx"),
  ]);
  function files(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return files(path);
      return /\.tsx?$/.test(entry.name) ? [path] : [];
    });
  }
  for (const file of files(srcDir)) {
    if (owners.has(file)) continue;
    const code = readCode(file.slice(root.length + 1));
    assert.ok(
      !/bannerRoleProps|mainRoleProps|contentInfoRoleProps|role:\s*"(banner|main|contentinfo)"|role="(banner|main|contentinfo)"/.test(
        code,
      ),
      `${file}: only the outermost frame components own landmarks — an inner component adding one would duplicate it inside the frame`,
    );
  }
});

// Runtime imports are lazy, like the other contract tests, so the
// source scans still run when the build output is missing.
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

function countRole(html, role) {
  return (html.match(new RegExp(`role="${role}"`, "g")) ?? []).length;
}

function assertLandmarks(html, insideMain) {
  assert.equal(countRole(html, "banner"), 1, "exactly one banner landmark");
  assert.equal(countRole(html, "main"), 1, "exactly one main landmark");
  assert.equal(countRole(html, "contentinfo"), 1, "exactly one contentinfo landmark");
  assert.ok(
    html.indexOf('role="banner"') < html.indexOf('role="main"') &&
      html.indexOf('role="main"') < html.indexOf('role="contentinfo"'),
    "landmarks render in banner / main / contentinfo order",
  );
  assert.ok(
    html.indexOf('role="main"') < html.indexOf(insideMain) &&
      html.indexOf(insideMain) < html.indexOf('role="contentinfo"'),
    "the content renders inside main, before the footer",
  );
}

function publicFrameElement(
  React,
  { PublicFrameLayout, PublicFrameHeader, PublicFrameFooter, Text },
) {
  return React.createElement(
    PublicFrameLayout,
    {
      header: React.createElement(PublicFrameHeader, {
        brandLabel: "Eciperay",
        brandHref: "/",
        signInLabel: "Sign in",
        signInHref: "/sign-in",
      }),
      footer: React.createElement(PublicFrameFooter, {
        note: "A note.",
        links: [{ label: "Privacy Policy", href: "/privacy" }],
      }),
    },
    React.createElement(Text, null, "Page content"),
  );
}

const legalFixture = {
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
      blocks: [{ type: "paragraph", spans: [{ type: "text", text: "Body text." }] }],
    },
  ],
};

test("SSR: the public frame renders exactly one banner, main, and contentinfo (#366)", async () => {
  const runtime = await loadRuntime();
  const html = await renderToHtml(publicFrameElement(runtime.React, runtime));
  assertLandmarks(html, "Page content");
});

test("SSR: LegalDocumentPage renders exactly one banner, main, and contentinfo (#366)", async () => {
  const { React, LegalDocumentPage } = await loadRuntime();
  const html = await renderToHtml(React.createElement(LegalDocumentPage, legalFixture));
  assertLandmarks(html, "Body text.");
});
