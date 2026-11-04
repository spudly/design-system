/**
 * Export-surface contract test for spudly/design-system#298
 * (Stephen's decision, 2026-11-03): the package exports page
 * components only.
 *
 * The contract:
 * 1. package.json has exactly one export, the root "." — no
 *    "./pages", "./icons", or any other subpath.
 * 2. The root entry (src/index.ts → dist/index.js) re-exports the
 *    pages barrel and nothing else: no widget components, no
 *    icons, no composite (form) components, and no tokens,
 *    themes, tag colors, or Tamagui config factories.
 * 3. The public surface (the pages barrel's export names, which
 *    the root re-exports verbatim) contains none of the internal
 *    barrels' export names (components / icons / tokens / themes
 *    / tamagui.config) — those modules stay in the repo as
 *    internal building blocks, reachable by relative path from
 *    this repo's own pages, Storybook apps, and tests, but they
 *    are not exported from the package anywhere.
 *
 * The runtime root entry is not Node-importable (page components
 * may import react-native — the old root-Node-importability rule
 * is superseded by this contract), so the surface is pinned by
 * scanning the built declarations and the source barrels, like
 * this repo's other contract tests. Comments are stripped before
 * scanning so prose cannot satisfy or trip the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

function readJson(rel: string) {
  return JSON.parse(readFileSync(join(root, rel), "utf8"));
}

/** Every name a barrel module exports: `export { a, type B }` lists plus `export const/function/type` declarations. */
function exportNames(code: string): Set<string> {
  const names = new Set<string>();
  for (const match of code.matchAll(/export\s+(?:declare\s+)?\{([^}]*)\}/g)) {
    for (const part of match[1]!.split(",")) {
      const name = part
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .pop()!
        .trim();
      if (name) names.add(name);
    }
  }
  for (const match of code.matchAll(
    /export\s+(?:declare\s+)?(?:const|let|var|function|class|type|interface)\s+([A-Za-z0-9_$]+)/g,
  )) {
    names.add(match[1]!);
  }
  return names;
}

const pagesNames = exportNames(readCode("src/pages/index.ts"));

const internalBarrels: [string, string][] = [
  ["components", "src/components/index.ts"],
  ["icons", "src/icons/index.ts"],
  ["tokens", "src/tokens/index.ts"],
  ["themes", "src/themes/index.ts"],
  ["tamagui.config", "src/tamagui.config.ts"],
];

test("package.json exports the root only — no subpaths (#298)", () => {
  const pkg = readJson("package.json");
  assert.deepEqual(Object.keys(pkg.exports), ["."], "the root must be the only export entry");
  assert.equal(pkg.exports["."].types, "./dist/index.d.ts");
  assert.equal(pkg.exports["."].default, "./dist/index.js");
  assert.equal(pkg.main, "./dist/index.js");
  assert.equal(pkg.types, "./dist/index.d.ts");
});

test("the root entry re-exports the pages barrel and nothing else (#298)", () => {
  const srcIndex = readCode("src/index.ts").trim();
  assert.equal(
    srcIndex,
    'export * from "./pages/index.js";',
    "src/index.ts must be exactly the pages re-export",
  );
  const distIndex = readCode("dist/index.js").trim();
  assert.equal(
    distIndex,
    'export * from "./pages/index.js";',
    "dist/index.js must be exactly the pages re-export",
  );
  const distTypes = readCode("dist/index.d.ts").trim();
  assert.equal(
    distTypes,
    'export * from "./pages/index.js";',
    "dist/index.d.ts must be exactly the pages re-export",
  );
});

test("the pages barrel has no wildcard re-exports (#298)", () => {
  // exportNames collects named exports only: a wildcard re-export
  // added to the barrel would smuggle an internal barrel's names
  // onto the public surface without tripping the checks below, so
  // the barrel must name every export explicitly.
  assert.doesNotMatch(
    readCode("src/pages/index.ts"),
    /export(?:\s+type)?\s*\*/,
    "src/pages/index.ts must name each export; a wildcard re-export (value or type) can expose internal barrels",
  );
});

test("the public surface is exactly the pages barrel's names (#298)", () => {
  assert.ok(pagesNames.size > 0, "the pages barrel exports names");
  // Every pages-barrel name is a page component or one of its
  // view-model types: value exports all end in "Page" or are the
  // PublicPageFrame page frame; type exports belong to a page.
  const builtPagesTypes = readFileSync(join(root, "dist", "pages", "index.d.ts"), "utf8");
  for (const name of pagesNames) {
    assert.ok(
      builtPagesTypes.includes(name),
      `${name} is exported from src/pages/index.ts but missing from the built pages declarations`,
    );
  }
});

test("no widget, icon, token, theme, or config name is on the public surface (#298)", () => {
  for (const [label, rel] of internalBarrels) {
    const internalNames = exportNames(readCode(rel));
    assert.ok(internalNames.size > 0, `${label} barrel exports names (scan sanity)`);
    for (const name of internalNames) {
      assert.ok(
        !pagesNames.has(name),
        `${name} (${label}) must not be exported from the package — pages only (#298)`,
      );
    }
  }
  // Spot-pin the names downstream apps used to import from the
  // root, so a regression names the offender plainly.
  for (const banned of [
    "Button",
    "Dialog",
    "SignInForm",
    "Icon",
    "PrintIcon",
    "tokens",
    "baseTheme",
    "eciperayTheme",
    "memorizeTheme",
    "tagColorNames",
    "createTamaguiConfig",
  ]) {
    assert.ok(!pagesNames.has(banned), `${banned} must not be a package export (#298)`);
  }
});
