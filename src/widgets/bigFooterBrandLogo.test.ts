/**
 * Contract test for BigFooter's brand logo slot
 * (spudly/design-system#468, Option A approved by Stephen
 * 2026-11-06: a slot for now; the DS owns the logos eventually).
 *
 * Pins: BigFooterBrand carries the optional `logo` slot; when a
 * logo is supplied the brand anchor renders it inside the
 * DS-owned logo box (height BIG_FOOTER_BRAND_LOGO_HEIGHT)
 * INSTEAD of the text wordmark, and the anchor's accessible
 * name stays the brand label; when no logo is supplied the text
 * wordmark renders exactly as before.
 *
 * Source scan plus SSR, like this repo's other contract tests.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const footer = readCode("src/widgets/BigFooter.tsx");

test("BigFooterBrand carries the optional logo slot (#468)", () => {
  assert.match(footer, /export type BigFooterBrand = \{/);
  assert.match(footer, /logo\?: ReactNode;/);
  assert.match(footer, /export const BIG_FOOTER_BRAND_LOGO_HEIGHT = 40;/);
});

test("a supplied logo renders in the DS-owned box instead of the wordmark (#468)", () => {
  assert.match(
    footer,
    /brand\.logo \? \(\s*<XStack height=\{BIG_FOOTER_BRAND_LOGO_HEIGHT\} alignItems="center">\s*\{brand\.logo\}\s*<\/XStack>\s*\) : \(\s*brand\.label\s*\)/,
  );
  // The brand anchor keeps the label as its accessible name in
  // both forms and stays a real link to the brand href.
  assert.match(footer, /accessibilityLabel: brand\.label/);
  assert.match(footer, /href=\{brand\.href\}/);
});

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const { createTamaguiConfig, baseTheme }: Record<string, any> =
      await import("../../dist/tamagui.config.js").then(async (configModule) => {
        const themes: Record<string, any> = await import("../../dist/themes/index.js");
        return { ...configModule, ...themes };
      });
    const { BigFooter }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
    return { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter };
  })();
  return runtimePromise;
}

const baseFooter = {
  brand: { label: "Eciperay", href: "/" },
  columns: [],
  storeLinks: [],
  socialLinks: [],
};

test("SSR: a supplied logo renders inside the brand link, named by the brand label (#468)", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(BigFooter, {
        footer: {
          ...baseFooter,
          brand: {
            ...baseFooter.brand,
            logo: React.createElement("span", { "data-logo-marker": "fixture-logo" }, "LOGO"),
          },
        },
      }),
    ),
  );
  const anchor = /<a [^>]*href="\/"[^>]*>/.exec(html)?.[0];
  assert.ok(anchor, "the brand renders as an anchor to the brand href");
  assert.ok(
    anchor.includes('aria-label="Eciperay"'),
    "the brand anchor carries the brand label as its accessible name",
  );
  assert.ok(html.includes('data-logo-marker="fixture-logo"'), "the supplied logo node renders");
  assert.ok(!html.includes(">Eciperay<"), "the text wordmark does not render alongside the logo");
});

test("SSR: without a logo the text wordmark renders as before (#468)", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(BigFooter, { footer: baseFooter }),
    ),
  );
  const anchor = /<a [^>]*href="\/"[^>]*>/.exec(html)?.[0];
  assert.ok(anchor, "the brand renders as an anchor to the brand href");
  assert.ok(
    anchor.includes('aria-label="Eciperay"'),
    "the brand anchor carries the brand label as its accessible name",
  );
  assert.ok(html.includes(">Eciperay<"), "the text wordmark renders");
});
