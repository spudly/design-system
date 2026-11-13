/**
 * Contract test for the surviving public chrome components
 * (spudly/design-system#119, trimmed by #473): BrandLink and
 * BigFooter — the pieces the public pages still compose after
 * #473 retired PublicFrameLayout, PublicFrameHeader, and the
 * PublicPageFrame page (LegalDocumentPage now renders its
 * header row directly from BrandLink + TextLink, and every
 * public page renders BigFooter through BigFooterShell).
 *
 * The pins hold the chrome's design where it now lives: the
 * wordmark's brand treatment on a real anchor (BrandLink takes
 * an href, never a press callback — Stephen's ruling on PR
 * #311), and the footer's caller-data treatments.
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
const footer = readCode("BigFooter.tsx");
test("BrandLink is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.BrandLink,
    "function",
    "BrandLink must be exported from the internal components barrel",
  );
  // #473: the retired frame components are gone from the barrel.
  for (const name of [
    "DocumentHeader",
    "DocumentFooter",
    "PublicFrameLayout",
    "PublicFrameHeader",
    "COLUMN_MAX_WIDTH",
  ]) {
    assert.equal(dist[name], undefined, `${name} must no longer be exported (#473)`);
  }
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
test("BigFooter is the public pages' footer (#410)", () => {
  // BigFooter covers every page-frame use (every page renders it
  // through BigFooterShell), and it stays unexported from the
  // package root.
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
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
    };
  })();
  return runtimePromise;
}
async function renderToHtml(element: any) {
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}
test("SSR: BrandLink renders as a real anchor carrying the given href", async () => {
  const { BrandLink } = await loadRuntime();
  const html = await renderToHtml(<BrandLink label="Eciperay" href="/" />);
  assert.ok(/<a [^>]*href="\//.test(html), "the wordmark is an anchor carrying the href");
  assert.ok(html.includes("Eciperay"), "the wordmark label renders");
  assert.ok(!/<button/.test(html), "the wordmark must not render as a button");
});
test("SSR: BigFooter renders exactly the caller's links, in order", async () => {
  const {} = await loadRuntime();
  const { BigFooter }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
  const html = await renderToHtml(
    <BigFooter
      footer={{
        brand: {
          label: "Eciperay",
          href: "/",
        },
        columns: [
          {
            title: "Legal",
            links: [
              {
                label: "Privacy Policy",
                href: "/privacy",
              },
              {
                label: "Terms of Service",
                href: "/terms",
              },
              {
                label: "Cookies",
                href: "/cookies",
              },
            ],
          },
        ],
        storeLinks: [],
        socialLinks: [],
      }}
    />,
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
