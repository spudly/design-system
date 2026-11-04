/**
 * Contract test for BigFooter (spudly/design-system#410): the fat
 * footer every page renders — big brand wordmark, multi-column
 * link lists, app-store links, and Feather social icon links —
 * all from ONE caller-supplied `footer` prop object per page.
 *
 * Pins: BigFooter renders every section from data and hardcodes
 * no app content; store/social entries are real links (href)
 * with accessible names; the mobile stack breakpoint is named;
 * the sticky shell is a full-viewport-height in-flow column; and
 * EVERY exported page component renders the footer through the
 * shell (no exceptions, no opt-outs).
 */
import "./registerSvgStub.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const bigFooter = readCode("src/components/BigFooter.tsx");

test("BigFooter renders all sections from the one footer data object", () => {
  assert.match(bigFooter, /export type BigFooterData = \{/);
  assert.match(bigFooter, /brand: BigFooterBrand;/);
  assert.match(bigFooter, /columns: BigFooterColumn\[\];/);
  assert.match(bigFooter, /storeLinks: BigFooterStoreLink\[\];/);
  assert.match(bigFooter, /socialLinks: BigFooterSocialLink\[\];/);
  assert.match(bigFooter, /columns\.map\(\(column\) =>/);
  assert.match(bigFooter, /column\.links\.map\(\(link\) =>/);
  assert.match(bigFooter, /storeLinks\.map\(\(link\) =>/);
  assert.match(bigFooter, /socialLinks\.map\(\(link\) =>/);
  // Nothing app-specific is hardcoded: no app names, no legal
  // labels, no routes — content is caller data only (#320).
  for (const baked of [
    "Eciperay",
    "Memorize",
    "Privacy",
    "Terms",
    "Do Not Sell",
    "/privacy",
    "/terms",
  ]) {
    assert.ok(!bigFooter.includes(baked), `BigFooter must not hardcode ${baked}`);
  }
  assert.ok(!/onPress/.test(bigFooter), "footer navigation is links, never press callbacks");
});

test("store and social entries are real links with accessible names", () => {
  // Store links render through Button's href form (a real anchor).
  assert.match(bigFooter, /<Button key=\{link\.href\} href=\{link\.href\} variant="secondary">/);
  // Social entries: an anchor carrying the href, named by the label.
  assert.match(bigFooter, /accessibilityRole: "link",\s*accessibilityLabel: link\.label/);
  assert.match(bigFooter, /href=\{link\.href\}/);
  // Social glyphs are the Feather social icons (Stephen's adjustment).
  for (const icon of [
    "FacebookIcon",
    "InstagramIcon",
    "TwitterIcon",
    "YoutubeIcon",
    "GithubIcon",
    "LinkedinIcon",
  ]) {
    assert.ok(bigFooter.includes(icon), `BigFooter maps a Feather social glyph: ${icon}`);
  }
  assert.match(bigFooter, /icon: BigFooterSocialIcon/);
});

test("the mobile stack breakpoint is named and the shell is sticky in flow", () => {
  assert.match(bigFooter, /export const BIG_FOOTER_STACK_BREAKPOINT = 640;/);
  assert.match(bigFooter, /flexBasis=\{BIG_FOOTER_COLUMN_BASIS\}/);
  assert.match(bigFooter, /flexWrap="wrap"/);
  // Sticky: full-viewport-height column, content grows, footer last.
  assert.match(bigFooter, /<YStack minHeight="100dvh" flexDirection="column">/);
  assert.match(bigFooter, /flexGrow=\{1\}/);
  assert.ok(!/position="(fixed|absolute)"/.test(bigFooter), "the footer is in flow, never pinned");
});

test("BigFooter is internal — not exported from the components barrel or the package (#298)", () => {
  const barrel = readCode("src/components/index.ts");
  assert.ok(
    !barrel.includes("BigFooter"),
    "BigFooter must not be exported from src/components/index.ts",
  );
  const pagesBarrel = readCode("src/pages/index.ts");
  assert.match(pagesBarrel, /type BigFooterData/, "the footer data types are the pages contract");
  assert.ok(
    !/export \{ BigFooter,/.test(pagesBarrel),
    "the component itself is not a package export",
  );
  assert.ok(
    !existsSync(join(root, "src/components/PublicFrameFooter.tsx")),
    "PublicFrameFooter is retired (#410)",
  );
  assert.ok(!barrel.includes("PublicFrameFooter"), "PublicFrameFooter is removed from the barrel");
});

test("every page component renders BigFooter through the shell from a footer prop", () => {
  const pagesDir = join(root, "src", "pages");
  const exceptions = new Set([
    "BoundedList.tsx",
    "fixtures.ts",
    "useCatalogPagination.ts",
    "index.ts",
  ]);
  const pages: string[] = [];
  for (const entry of readdirSync(pagesDir)) {
    if (entry.endsWith(".stories.tsx") || exceptions.has(entry)) continue;
    assert.ok(entry.endsWith(".tsx"), `unaccounted pages file ${entry}`);
    pages.push(entry);
  }
  assert.ok(pages.length >= 38, `expected at least 38 page modules, found ${pages.length}`);
  for (const entry of pages) {
    const code = readCode(join("src", "pages", entry));
    assert.ok(
      code.includes("BigFooterShell") || code.includes("<BigFooter"),
      `${entry} does not render BigFooter/BigFooterShell — every page renders the footer (#410)`,
    );
    assert.ok(
      /footer\?: BigFooterData/.test(code),
      `${entry} takes no footer?: BigFooterData prop`,
    );
    assert.ok(
      !code.includes("PublicFrameFooter"),
      `${entry} still renders the retired PublicFrameFooter`,
    );
  }
});

test("the eciperay story fixture carries the Legal column convention as data", () => {
  const fixtures = readCode("src/pages/fixtures.ts");
  assert.ok(fixtures.includes("eciperayFooterFixture"), "eciperay footer fixture exists");
  assert.ok(
    fixtures.includes('"Do Not Sell or Share My Personal Information"') ||
      fixtures.includes("Do Not Sell or Share My Personal Information"),
  );
  assert.ok(fixtures.includes("memorizeFooterFixture"), "memorize footer fixture exists");
});

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const { createTamaguiConfig, baseTheme }: Record<string, any> =
      await import("../dist/tamagui.config.js").then(async (configModule) => {
        const themes: Record<string, any> = await import("../dist/themes/index.js");
        return { ...configModule, ...themes };
      });
    const { BigFooter, BigFooterShell }: Record<string, any> =
      await import("../dist/components/BigFooter.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      createTamaguiConfig,
      baseTheme,
      BigFooter,
      BigFooterShell,
    };
  })();
  return runtimePromise;
}

const footerData = {
  brand: { label: "Eciperay", href: "/" },
  columns: [
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Do Not Sell or Share My Personal Information", href: "/do-not-sell-or-share" },
      ],
    },
  ],
  storeLinks: [{ label: "Download on the App Store", href: "/app-store" }],
  socialLinks: [{ label: "Eciperay on Facebook", href: "/social/facebook", icon: "facebook" }],
};

test("SSR: BigFooter renders brand, columns, store and social links as anchors", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(BigFooter, { footer: footerData }),
    ),
  );
  for (const [label, href] of [
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
    ["Do Not Sell or Share My Personal Information", "/do-not-sell-or-share"],
    ["Download on the App Store", "/app-store"],
  ] as const) {
    assert.ok(html.includes(label), `${label} renders`);
    assert.ok(new RegExp(`<a [^>]*href="${href}"`).test(html), `${label} is an anchor to ${href}`);
  }
  assert.ok(html.includes("Eciperay"), "the brand wordmark renders");
  assert.ok(
    html.includes('aria-label="Eciperay on Facebook"') || html.includes("Eciperay on Facebook"),
    "the social link carries its accessible name",
  );
});

test("SSR: an exported page renders its footer from the footer prop", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const { SignInPage }: Record<string, any> = await import("../dist/pages/SignInPage.js");
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(SignInPage, {
        email: "",
        password: "",
        onEmailChange: () => {},
        onPasswordChange: () => {},
        onSubmit: () => {},
        signUpHref: "/signup",
        forgotPasswordHref: "/forgot-password",
        footer: footerData,
      }),
    ),
  );
  assert.ok(
    html.includes("Do Not Sell or Share My Personal Information"),
    "the page renders its BigFooter legal column",
  );
  assert.ok(
    new RegExp(`<a [^>]*href="/do-not-sell-or-share"`).test(html),
    "the page footer's legal link is an anchor",
  );
});
