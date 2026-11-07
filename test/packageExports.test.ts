/**
 * Export-surface contract test for spudly/design-system#298 as
 * amended by spudly/design-system#411 and #438 Part 1 (Stephen's amendments,
 * 2026-11-03): the package exports page components, plus the
 * minimal theme/config surface the consumer apps build on.
 *
 * The contract:
 * 1. package.json has exactly one export, the root "." — no
 *    "./pages", "./icons", or any other subpath.
 * 2. The root entry (src/index.ts → dist/index.js) re-exports the
 *    pages barrel and exactly the #411 additions beside it:
 *    the brand themes (`baseTheme`, `eciperayTheme`,
 *    `memorizeTheme`) and their types (`Theme`, `SemanticColors`,
 *    `EciperayTheme`, `MemorizeTheme`) from src/themes/;
 *    `createTamaguiConfig` from src/tamagui.config.ts; and
 *    `ChunkErrorBoundary` with its prop/state types from
 *    src/views/ChunkErrorBoundary.tsx.
 * 3. Nothing else is on the public surface: no other widget
 *    components, no icons, no composite (form) components, and
 *    no Storybook config factories or other
 *    Tamagui config helpers — those modules stay in the repo as
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
  for (const match of code.matchAll(/export\s+(?:declare\s+)?(?:type\s+)?\{([^}]*)\}/g)) {
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

/** Every module specifier a file re-exports from (`export ... from "<specifier>"`). */
function exportSpecifiers(code: string): Set<string> {
  const specifiers = new Set<string>();
  for (const match of code.matchAll(/export\s+(?:type\s+)?(?:\{[^}]*\}|\*)\s+from\s+"([^"]+)"/g)) {
    specifiers.add(match[1]!);
  }
  return specifiers;
}

const pagesNames = exportNames(readCode("src/pages/index.ts"));

/** The exact #411 additions to the public surface, by source module. */
const restoredByModule: [string, string[]][] = [
  ["./tokens/index.js", ["tokens"]],
  [
    "./themes/index.js",
    [
      "baseTheme",
      "eciperayTheme",
      "memorizeTheme",
      "Theme",
      "SemanticColors",
      "EciperayTheme",
      "MemorizeTheme",
      "tagColorNames",
      "warmHarvestTagColors",
      "tagColorNameForHex",
      "TagColorName",
    ],
  ],
  ["./tamagui.config.js", ["createTamaguiConfig"]],
  [
    "./views/ChunkErrorBoundary.js",
    ["ChunkErrorBoundary", "ChunkErrorBoundaryProps", "ChunkErrorBoundaryState"],
  ],
];

const restoredNames = new Set(restoredByModule.flatMap(([, names]) => names));

const publicNames = new Set([...pagesNames, ...restoredNames]);

const internalBarrels: [string, string][] = [
  ["widgets", "src/widgets/index.ts"],
  ["views", "src/views/index.ts"],
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

test("the root entry re-exports the pages barrel and exactly the #411 additions", () => {
  for (const rel of ["src/index.ts", "dist/index.js", "dist/index.d.ts"]) {
    const code = readCode(rel);
    assert.ok(
      code.includes('export * from "./pages/index.js";'),
      `${rel} must re-export the pages barrel`,
    );
    assert.deepEqual(
      exportSpecifiers(code),
      new Set([
        "./pages/index.js",
        "./tokens/index.js",
        "./themes/index.js",
        "./tamagui.config.js",
        "./views/ChunkErrorBoundary.js",
      ]),
      `${rel} must re-export from exactly the pages barrel and the three #411 source modules`,
    );
    // The built JS drops the type-only names (they are erased at
    // compile time); the source and the built declarations carry
    // the full restored set.
    const expectedNames =
      rel === "dist/index.js"
        ? new Set([
            "tokens",
            "baseTheme",
            "eciperayTheme",
            "memorizeTheme",
            "tagColorNames",
            "warmHarvestTagColors",
            "tagColorNameForHex",
            "createTamaguiConfig",
            "ChunkErrorBoundary",
          ])
        : restoredNames;
    assert.deepEqual(
      exportNames(code),
      expectedNames,
      `${rel} must name exactly the #411 additions beside the pages wildcard`,
    );
  }
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

test("the public surface is exactly the pages barrel's names plus the #411 additions", () => {
  assert.ok(pagesNames.size > 0, "the pages barrel exports names");
  // Every pages-barrel name is a page component or one of its
  // view-model types: value exports all end in "Page"; type
  // exports belong to a page.
  const builtPagesTypes = readFileSync(join(root, "dist", "pages", "index.d.ts"), "utf8");
  for (const name of pagesNames) {
    assert.ok(
      builtPagesTypes.includes(name),
      `${name} is exported from src/pages/index.ts but missing from the built pages declarations`,
    );
  }
  // Every restored name really exists in the module the root
  // re-exports it from — the root cannot invent a surface the
  // internal modules do not have.
  for (const [specifier, names] of restoredByModule) {
    const sourceRel = `src/${specifier.replace(/^\.\//, "").replace(/\.js$/, "")}`;
    const sourceNames = exportNames(
      readCode(
        specifier.endsWith("ChunkErrorBoundary.js") ? `${sourceRel}.tsx` : `${sourceRel}.ts`,
      ),
    );
    for (const name of names) {
      assert.ok(sourceNames.has(name), `${name} must be exported by ${specifier}'s source module`);
    }
  }
});

test("no other widget, icon, token, theme, or config name is on the public surface (#298/#411)", () => {
  for (const [label, rel] of internalBarrels) {
    const internalNames = exportNames(readCode(rel));
    assert.ok(internalNames.size > 0, `${label} barrel exports names (scan sanity)`);
    for (const name of internalNames) {
      if (restoredNames.has(name)) continue;
      assert.ok(
        !publicNames.has(name),
        `${name} (${label}) must not be exported from the package — pages plus the #411 additions only`,
      );
    }
  }
  // Spot-pin the names downstream apps used to import from the
  // root, so a regression names the offender plainly. The #411
  // names (baseTheme, eciperayTheme, memorizeTheme,
  // createTamaguiConfig, ChunkErrorBoundary) are deliberately NOT
  // here — they are restored, and pinned as present above.
  for (const banned of [
    "Button",
    "Alert",
    "Dialog",
    "SignInForm",
    "Icon",
    "PrintIcon",
    "Tokens",
    "defaultTagColorName",
    "quietDawnTagColors",
    "isTagColorName",
    "resolveTagColorValue",
    "tagColorThemeKey",
    "TagColorValues",
    "createStorybookTamaguiConfig",
    "createOnDeviceStorybookTamaguiConfig",
    "resolveFontFamily",
    "FontPlatform",
    "ResolvedFont",
    "StorybookThemeName",
  ]) {
    assert.ok(!publicNames.has(banned), `${banned} must not be a package export (#298/#411)`);
  }
});
