/**
 * Contract test for the icons module (spudly/eciperay#246).
 *
 * The module is the design system's one icon set: official Feather
 * SVG element data rendered with react-native-svg. Its shape is a
 * base `Icon` renderer plus one module per icon, each embedding only
 * its own glyph's data and exporting one component under a semantic
 * usage name (PrintIcon, not "printer") — so unused icons
 * tree-shake, call sites never name the icon set, and no
 * name-based API (featherIconNames / featherIconElements /
 * FeatherIcon) or app mapping (tabIcons) exists here. This test
 * pins: every icon module exports its component and renders through
 * the base Icon, each carries its glyph's official Feather data
 * (printer / share-2 in full — the two icons RecipeDetailPage
 * needs, spudly/design-system#187), no module carries another
 * icon's glyph, the rendering goes through react-native-svg (never
 * an icon font or a text glyph), and the package exposes the module
 * behind the ./icons subpath so the Node-importable root entry
 * stays clean.
 *
 * Source scan, like this repo's other contract tests: the
 * invariants are per-literal properties of the source. Comments are
 * stripped before scanning so explanatory comments cannot satisfy
 * the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function codeOf(rel) {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Semantic export name -> module file + a distinctive literal from its glyph's official data. */
const ICONS = [
  // AddIcon (two bare lines) and ShareIcon (circles and lines) have
  // no path literal; their data is pinned by dedicated tests below.
  ["AddIcon", null],
  ["FeedbackIcon", "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7"],
  ["HomeIcon", "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  ["MealsIcon", "M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"],
  ["PrintIcon", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"],
  ["ProfileIcon", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"],
  ["RecipesIcon", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  ["ShareIcon", null],
  ["SharedIcon", "M23 21v-2a4 4 0 0 0-3-3.87"],
  ["TagsIcon", "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"],
  ["WarningIcon", "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94"],
];

const codeByIcon = new Map(ICONS.map(([name]) => [name, codeOf(`src/icons/${name}.tsx`)]));

test("each icon module exports its semantic component through the base Icon (#246)", () => {
  for (const [name] of ICONS) {
    const code = codeByIcon.get(name);
    assert.match(code, new RegExp(`export function ${name}\\(`), `${name} is not exported`);
    assert.match(code, /from "\.\/Icon\.js"/, `${name} does not render through Icon`);
    assert.match(code, /<Icon elements=\{/, `${name} does not pass its glyph data to Icon`);
  }
});

test("each icon module carries its glyph's official Feather data (#246)", () => {
  for (const [name, literal] of ICONS) {
    if (!literal) continue;
    assert.ok(
      codeByIcon.get(name).includes(literal),
      `${name} is missing its glyph data (${literal.slice(0, 40)}…)`,
    );
  }
  // plus is two bare lines with no path data: pin its line endpoints.
  const add = codeByIcon.get("AddIcon");
  assert.match(add, /x1: "12", y1: "5", x2: "12", y2: "19"/);
  assert.match(add, /x1: "5", y1: "12", x2: "19", y2: "12"/);
});

test("no icon module carries another icon's glyph (#246)", () => {
  const literals = ICONS.filter(([, literal]) => literal).map(([name, literal]) => [name, literal]);
  for (const [owner, code] of codeByIcon) {
    for (const [name, literal] of literals) {
      if (name === owner) continue;
      assert.ok(!code.includes(literal), `${owner} also carries ${name}'s glyph data`);
    }
  }
});

test("printer and share-2 use the official Feather element data (#187)", () => {
  const printer = codeByIcon.get("PrintIcon");
  // printer: tray polyline, body path, output rect.
  assert.match(printer, /points: "6 9 6 2 18 2 18 9"/);
  assert.match(printer, /kind: "rect", x: "6", y: "14", width: "12", height: "8"/);
  const share = codeByIcon.get("ShareIcon");
  // share-2: three circles joined by two lines.
  assert.match(share, /kind: "circle", cx: "18", cy: "5", r: "3"/);
  assert.match(share, /kind: "circle", cx: "6", cy: "12", r: "3"/);
  assert.match(share, /kind: "circle", cx: "18", cy: "19", r: "3"/);
  assert.match(share, /x1: "8\.59", y1: "13\.51", x2: "15\.42", y2: "17\.49"/);
  assert.match(share, /x1: "15\.41", y1: "6\.51", x2: "8\.59", y2: "10\.49"/);
});

test("Icon renders through react-native-svg with Feather stroke treatment (#246)", () => {
  const code = codeOf("src/icons/Icon.tsx");
  assert.match(code, /from "react-native-svg"/);
  assert.match(code, /<Svg/);
  assert.match(code, /viewBox="0 0 24 24"/);
  assert.match(code, /fill="none"/);
  assert.match(code, /strokeLinecap="round"/);
  assert.match(code, /strokeLinejoin="round"/);
  assert.match(code, /export function Icon\(/);
  for (const [name, code] of codeByIcon) {
    assert.ok(!code.includes("react-icons"), `${name} must not come from react-icons`);
    assert.ok(
      !code.includes("react-native-vector-icons"),
      `${name} must not come from an icon font`,
    );
  }
});

test("the name-based API and tabIcons are gone (#246)", () => {
  const files = [
    "src/icons/index.ts",
    "src/icons/Icon.tsx",
    ...ICONS.map(([n]) => `src/icons/${n}.tsx`),
  ];
  for (const rel of files) {
    const code = codeOf(rel);
    for (const banned of ["FeatherIcon", "featherIconNames", "featherIconElements", "tabIcons"]) {
      assert.ok(!code.includes(banned), `${rel} still references ${banned}`);
    }
  }
});

test("the package exposes the module behind the ./icons subpath (#246)", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.ok(pkg.exports["./icons"], "package.json has no ./icons export");
  assert.equal(pkg.exports["./icons"].default, "./dist/icons/index.js");
  assert.ok(
    pkg.dependencies["react-native-svg"] || pkg.peerDependencies["react-native-svg"],
    "react-native-svg is not declared as a dependency or peer",
  );
  const index = codeOf("src/icons/index.ts");
  assert.match(index, /Icon/);
  for (const [name] of ICONS) {
    assert.match(index, new RegExp(`export \\{ ${name} \\}`), `index.ts does not export ${name}`);
  }
});
