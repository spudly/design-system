/**
 * Contract test for BigFooter's official store badges
 * (spudly/design-system#466, Option A approved by Stephen
 * 2026-11-06).
 *
 * Pins: BigFooterStoreLink carries the required `store`
 * discriminator; each store value renders its matching official
 * badge (Apple's "Download on the App Store" badge / Google's
 * "Get it on Google Play" badge) bundled in the DS as SVG
 * components at the stores' required sizes; a store link is a
 * real anchor carrying its href whose accessible name is its
 * label — never a plain text Button; and an empty storeLinks
 * array renders no store section (the existing contract).
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
const appStoreBadge = readCode("src/icons/AppStoreBadge.tsx");
const googlePlayBadge = readCode("src/icons/GooglePlayBadge.tsx");

test("BigFooterStoreLink requires the store discriminator (#466)", () => {
  assert.match(footer, /export type BigFooterStore = "app-store" \| "google-play";/);
  assert.match(footer, /store: BigFooterStore;/);
  const fixtures = readCode("src/pages/fixtures.ts");
  assert.match(fixtures, /store: "app-store"/);
  assert.match(fixtures, /store: "google-play"/);
});

test("each store value maps to its matching badge component (#466)", () => {
  assert.match(footer, /"app-store": AppStoreBadge/);
  assert.match(footer, /"google-play": GooglePlayBadge/);
  assert.match(footer, /const Badge = STORE_BADGES\[link\.store\];/);
  assert.match(footer, /<Badge \/>/);
  // The badge renders INSIDE its anchor: the SSR harness's
  // react-native-svg stub renders no badge artwork, so the
  // nesting is pinned here at source level — the same pattern
  // icons.test.ts uses for glyph rendering (#246).
  assert.match(
    footer,
    /<StyledBigFooterStoreAnchor[\s\S]*?<Badge \/>\s*<\/StyledBigFooterStoreAnchor>/,
  );
});

test("the badges are bundled SVG artwork at the stores' required sizes (#466)", () => {
  // Apple's badge: 120x40 minimum, black field, white border,
  // Apple logo, and the two-line lockup.
  assert.match(appStoreBadge, /export function AppStoreBadge\(\)/);
  assert.match(appStoreBadge, /APP_STORE_BADGE_WIDTH = 120/);
  assert.match(appStoreBadge, /APP_STORE_BADGE_HEIGHT = 40/);
  assert.match(appStoreBadge, /viewBox="0 0 120 40"/);
  assert.match(appStoreBadge, /fill="#000000" stroke="#ffffff"/);
  assert.ok(appStoreBadge.includes("Download on the"), "Apple badge carries its lockup line");
  assert.ok(appStoreBadge.includes("App Store"), "Apple badge names the App Store");
  assert.match(appStoreBadge, /from "react-native-svg"/);
  // Google's badge: 155x46 generic badge, black field, white
  // border, the multicolor Play triangle, and its lockup.
  assert.match(googlePlayBadge, /export function GooglePlayBadge\(\)/);
  assert.match(googlePlayBadge, /GOOGLE_PLAY_BADGE_WIDTH = 155/);
  assert.match(googlePlayBadge, /GOOGLE_PLAY_BADGE_HEIGHT = 46/);
  assert.match(googlePlayBadge, /viewBox="0 0 155 46"/);
  assert.match(googlePlayBadge, /fill="#000000" stroke="#ffffff"/);
  for (const color of ["#00d2ff", "#00f076", "#ffce00", "#ff3a44"]) {
    assert.ok(googlePlayBadge.includes(color), `Play triangle carries its ${color} segment`);
  }
  assert.ok(googlePlayBadge.includes("GET IT ON"), "Google badge carries its lockup line");
  assert.ok(googlePlayBadge.includes("Google Play"), "Google badge names Google Play");
  assert.match(googlePlayBadge, /from "react-native-svg"/);
});

test("a store link is a real anchor with href and the label as its accessible name (#466)", () => {
  assert.match(footer, /<StyledBigFooterStoreAnchor/);
  assert.match(footer, /accessibilityRole: "link",\s*accessibilityLabel: link\.label/);
  assert.match(footer, /href=\{link\.href\}/);
  assert.ok(!/<Button/.test(footer), "no plain text Button renders a store link (#466)");
  assert.match(footer, /storeLinks\.length > 0 \? \(/);
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
  socialLinks: [],
};

test("SSR: each store link renders as an anchor with its href and accessible name (#466)", async () => {
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
          storeLinks: [
            { label: "Download on the App Store", href: "/app-store", store: "app-store" },
            { label: "Get it on Google Play", href: "/google-play", store: "google-play" },
          ],
        },
      }),
    ),
  );
  for (const [label, href] of [
    ["Download on the App Store", "/app-store"],
    ["Get it on Google Play", "/google-play"],
  ] as const) {
    const anchor = new RegExp(`<a [^>]*href="${href}"[^>]*>`).exec(html)?.[0];
    assert.ok(anchor, `the ${label} store link is an anchor to ${href}`);
    assert.ok(
      anchor.includes(`aria-label="${label}"`),
      `the ${label} anchor carries the label as its accessible name`,
    );
  }
});

test("SSR: an empty storeLinks array renders no store section (#466)", async () => {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, BigFooter } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(BigFooter, { footer: { ...baseFooter, storeLinks: [] } }),
    ),
  );
  assert.ok(!html.includes("/app-store"), "no App Store link renders");
  assert.ok(!html.includes("/google-play"), "no Google Play link renders");
  assert.ok(!html.includes("Download on the App Store"), "no App Store badge renders");
  assert.ok(!html.includes("Get it on Google Play"), "no Google Play badge renders");
});
