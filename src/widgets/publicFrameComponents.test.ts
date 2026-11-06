/**
 * Contract test for the public frame components
 * (spudly/design-system#119): BrandLink, PublicFrameLayout,
 * PublicFrameHeader, and PublicFrameFooter — the pieces
 * PublicPageFrame composes, extracted in the public-pages
 * de-styling tranche so the frame page passes copy and intent
 * callbacks only.
 *
 * The pins hold the frame's design where it now lives: the
 * wordmark's brand treatment on a real anchor (BrandLink takes
 * an href, never a press callback — Stephen's ruling on PR
 * #311), the wide column (768px) shared by the layout and both
 * bands, the bands' surface fills and hairline borders, and the
 * footer's note + legal-link treatments — the exact treatments
 * the frame rendered before the extraction.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../..", "src", "widgets");

function readCode(name: string) {
  return readFileSync(join(componentsDir, name), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const brandLink = readCode("BrandLink.tsx");
const layout = readCode("PublicFrameLayout.tsx");
const header = readCode("PublicFrameHeader.tsx");
const footer = readCode("BigFooter.tsx");

test("the frame components are exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  for (const name of ["BrandLink", "PublicFrameLayout", "PublicFrameHeader"]) {
    assert.equal(
      typeof dist[name],
      "function",
      `${name} must be exported from the internal components barrel`,
    );
  }
  assert.equal(dist.COLUMN_MAX_WIDTH, 768, "the shared column constant is exported");
});

test("BrandLink is a real anchor carrying the href, in the wordmark treatment", () => {
  assert.match(brandLink, /fontSize: tokens\.typography\.fontSize\.lg/);
  assert.match(brandLink, /fontWeight: tokens\.typography\.fontWeight\.semibold/);
  assert.match(brandLink, /color: "\$primary"/);
  assert.match(brandLink, /textDecorationLine: "none"/, "the wordmark carries no underline");
  assert.match(brandLink, /styled\(Anchor/, "the wordmark renders through an Anchor frame");
  assert.match(brandLink, /href=\{href\}/, "the anchor carries the given href");
  assert.match(brandLink, /accessibilityRole: "link"/);
  assert.match(brandLink, /accessibilityLabel: label/);
  assert.match(brandLink, /label: string;/, "the wordmark text is caller content");
  assert.match(brandLink, /href: string;/, "the brand destination crosses as an href");
  assert.ok(
    !brandLink.includes("onPress"),
    "a component named *Link carrying the link role is a real link — no press callback (Stephen's ruling, PR #311)",
  );
});

test("PublicFrameLayout owns the shell and the wide centered column", () => {
  assert.match(layout, /export const COLUMN_MAX_WIDTH = 768;/);
  assert.match(layout, /<YStack flex=\{1\} backgroundColor="\$background">/);
  // Bounded content region (PR #413 review): the content column
  // carries an intrinsic flex basis (grow 1 / shrink 1 / basis
  // "auto", the BigFooterShell pattern), not a plain flex={1} —
  // with a zero basis a native footer taller than the remaining
  // space could leave the page content with no usable viewport.
  // This is a shape pin, as in test/bigFooter.test.ts: no JS
  // renderer in this repo performs native (Yoga) layout, so a
  // rendered native-viewport check is not available here.
  assert.match(
    layout,
    /<View\s+flexGrow=\{1\}\s+flexShrink=\{1\}\s+flexBasis="auto"\s+width="100%"\s+maxWidth=\{COLUMN_MAX_WIDTH\}\s+alignSelf="center"\s+\{\.\.\.mainRoleProps\}\s*>/,
    "the content column is the wide centered column and the page's main landmark (#366)",
  );
  assert.ok(
    !/<View flex=\{1\}/.test(layout),
    "the content column must not use a plain flex={1} (zero basis)",
  );
  assert.match(layout, /header: ReactNode;/);
  assert.match(layout, /footer: ReactNode;/);
  // Native footer scroll path (PR #413 review): the frame itself
  // does not scroll — the page inside owns the content scroll —
  // but on native the footer gets its OWN bounded scroll region
  // (the BigFooterShell pattern), because BigFooter has no
  // internal scroll region and a tall footer was clipped with no
  // scroll path. Web renders the footer bare (the document
  // scrolls the whole frame).
  assert.match(
    layout,
    /isWeb \? \(\s*footer\s*\) : \(\s*<ScrollView flexGrow=\{0\} flexShrink=\{1\} keyboardShouldPersistTaps="handled">\s*\{footer\}\s*<\/ScrollView>\s*\)/,
    "on native the footer renders inside its own bounded scroll region; on web it renders bare",
  );
  assert.equal(
    (layout.match(/<ScrollView/g) ?? []).length,
    1,
    "PublicFrameLayout's only ScrollView is the native footer region",
  );
  assert.ok(
    !/<ScrollView[^>]*>\s*\{children\}/.test(layout),
    "the frame's children are not wrapped in a ScrollView — the page inside owns its scroll",
  );
  assert.ok(
    !/<ScrollView[^>]*>\s*\{header\}/.test(layout),
    "the frame's header is not wrapped in a ScrollView",
  );
});

test("PublicFrameHeader is the surface band with wordmark and sign-in link", () => {
  assert.match(header, /backgroundColor="\$surface"/);
  assert.match(header, /borderBottomWidth=\{1\}/);
  assert.match(header, /borderColor=\{tokens\.colors\.gray\.gray2\}/);
  assert.match(header, /maxWidth=\{COLUMN_MAX_WIDTH\}/, "the band's row shares the column");
  assert.match(header, /<BrandLink label=\{brandLabel\} href=\{brandHref\} \/>/);
  assert.match(header, /<TextLink[^>]*href=\{signInHref\}/, "Sign in is a real link with an href");
  assert.match(header, /signInHref: string;/, "the sign-in destination crosses as an href");
  assert.ok(
    !header.includes("onSignInPress"),
    "no press callback survives on a link (Stephen's ruling)",
  );
});

test("BigFooter replaced PublicFrameFooter as the frame footer (#410)", () => {
  // PublicFrameFooter is retired: BigFooter covers every page-frame
  // use (PublicPageFrame renders it), and it stays unexported.
  assert.match(footer, /backgroundColor="\$primary"/, "the primary band (#465)");
  assert.match(footer, /flexWrap="wrap"/, "the columns wrap — the mobile collapse");
  assert.match(footer, /export type BigFooterData = \{/);
  assert.match(footer, /columns: BigFooterColumn\[\];/);
  assert.match(footer, /storeLinks: BigFooterStoreLink\[\];/);
  assert.match(footer, /socialLinks: BigFooterSocialLink\[\];/);
  assert.match(footer, /column\.links\.map\(\(link\) =>/, "column links render from caller data");
  assert.ok(
    !footer.includes("onPrivacyPress"),
    "no press callbacks survive on links (Stephen's ruling)",
  );
});

let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    return { React, renderToString, TamaguiProvider, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

test("SSR: BrandLink renders as a real anchor carrying the given href", async () => {
  const { React, BrandLink } = await loadRuntime();
  const html = await renderToHtml(React.createElement(BrandLink, { label: "Eciperay", href: "/" }));
  assert.ok(/<a [^>]*href="\//.test(html), "the wordmark is an anchor carrying the href");
  assert.ok(html.includes("Eciperay"), "the wordmark label renders");
  assert.ok(!/<button/.test(html), "the wordmark must not render as a button");
});

test("SSR: BigFooter renders exactly the caller's links, in order", async () => {
  const { React } = await loadRuntime();
  const { BigFooter }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
  const html = await renderToHtml(
    React.createElement(BigFooter, {
      footer: {
        brand: { label: "Eciperay", href: "/" },
        columns: [
          {
            title: "Legal",
            links: [
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ],
          },
        ],
        storeLinks: [],
        socialLinks: [],
      },
    }),
  );
  for (const [label, href] of [
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
    ["Cookies", "/cookies"],
  ]) {
    assert.ok(html.includes(label), `the caller's ${label} link renders`);
    assert.ok(new RegExp(`<a [^>]*href="${href}"`).test(html), `${label} is an anchor to ${href}`);
  }
  assert.ok(
    html.indexOf("Privacy Policy") < html.indexOf("Terms of Service") &&
      html.indexOf("Terms of Service") < html.indexOf("Cookies"),
    "the links render in the caller's order",
  );
});
