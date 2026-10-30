/**
 * Contract test for Thumbnail (spudly/design-system#119), the
 * shared content-image component extracted for the page
 * de-styling program's foundation: three page surfaces hand-styled
 * the raw Image element — the recipe detail/public pages' hero
 * (a 256px recessed frame, image contained), the import review's
 * banner preview (full-width, 192px, cover, large radius), and
 * RecipesPage's 64px row thumbnail (its in-page `Thumbnail`
 * helper, generalized here).
 *
 * The pins hold the shape: exported from the package root, the
 * contract is a URL plus a semantic `variant`, each variant owns
 * the exact geometry/fit its pages render today, and an accessible
 * name is opt-in (set only when the caller supplies one, the
 * import review's pattern).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "Thumbnail.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("Thumbnail is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.Thumbnail, "function", "Thumbnail must be exported from @spudly/ui");
});

test("ThumbnailProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /ThumbnailProps/);
});

test("the contract is a URL, a presentation variant, and an optional accessible name", () => {
  assert.match(code, /src: string;/);
  assert.match(code, /variant\?: "hero" \| "banner" \| "row";/);
  assert.match(code, /accessibilityLabel\?: string;/);
});

test("the hero is the 256px recessed frame with the image contained", () => {
  assert.match(code, /backgroundColor: tokens\.colors\.gray\.gray1,/);
  assert.match(code, /borderRadius: tokens\.radii\.lg,/);
  assert.match(code, /height: 256,/);
  assert.match(code, /overflow: "hidden",/);
  assert.match(
    code,
    /<Image src=\{src\} width="100%" height="100%" objectFit="contain" \{\.\.\.a11yProps\} \/>/,
  );
});

test("the banner is the full-width 192px cover image with large rounded corners", () => {
  assert.match(code, /height: 192,/);
  assert.match(code, /objectFit: "cover",\s+borderRadius: tokens\.radii\.lg,/);
});

test("the row thumbnail is the 64px cover square on its gray well", () => {
  assert.match(
    code,
    /width: "\$16",\s+height: "\$16",\s+objectFit: "cover",\s+borderRadius: tokens\.radii\.md,\s+backgroundColor: tokens\.colors\.gray\.gray1,/,
  );
});

test("a named image is exposed through the accessibility translator (Avatar's pattern)", () => {
  assert.match(
    code,
    /const a11yProps = accessibilityLabel\s+\? platformAccessibilityProps\(\{\s+accessible: true,\s+accessibilityRole: "image",\s+accessibilityLabel,\s+\}\)\s+: decorativeImageProps;/,
    "the label must route through platformAccessibilityProps so web gets role=img + aria-label, not a leaked accessibilityLabel attribute; an unnamed image takes the decorative props instead",
  );
});

test("a decorative image's alt is web-only (native exposure, #339)", () => {
  assert.match(
    code,
    /const decorativeImageProps = isWeb \? \(\{ alt: "" \} as const\) : \(\{\} as const\);/,
    'React Native Image maps any non-null alt to accessible:true plus that label, so alt="" on native exposes an unnamed image as an unlabeled accessibility element (#339, verified against the Android accessibility tree); the decorative props must be alt="" on web and empty on native',
  );
});

// Runtime imports are lazy (inside the SSR test) so the
// source-scan tests above still run and report when the build
// output is missing or broken.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const distRuntime = await import(join(here, "..", "dist", "index.js"));
    return { React, renderToString, TamaguiProvider, ...distRuntime };
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

test('SSR: an unnamed Thumbnail renders decorative on web — alt="" and no accessible name', async () => {
  const { React, Thumbnail } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Thumbnail, { src: "https://example.com/row.png", variant: "row" }),
  );
  assert.match(
    html,
    /<img[^>]*alt=""/,
    'an unnamed image must render alt="" on web so screen readers never announce it by filename',
  );
  assert.ok(
    !html.includes("aria-label"),
    "a decorative image must not gain an accessible name on web",
  );
  assert.ok(
    !html.includes("accessibilitylabel"),
    "no raw RN accessibility prop may leak into the web render",
  );
});
