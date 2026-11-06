/**
 * Contract test for the icons module (spudly/eciperay#246).
 *
 * The module is the design system's one icon set: official Feather
 * SVG element data rendered with react-native-svg (the sole
 * exception is MealsIcon's custom divided plate — Feather has no
 * plate glyph — pinned below). Its shape is a
 * base `Icon` renderer plus one module per icon, each embedding only
 * its own glyph's data and exporting one component under a semantic
 * usage name (PrintIcon, not "printer") — so unused icons
 * tree-shake and call sites never name the icon set. No
 * Feather-set name API (featherIconNames / featherIconElements /
 * FeatherIcon) or app mapping (tabIcons) exists here; the one
 * name-based surface is the DS's own semantic name registry
 * (iconRegistry.ts, #438 Part 4), which maps the DS's semantic
 * usage names to these components for the DS's icon slots — it
 * names neither the Feather glyphs nor any app concept, and its
 * contract lives in iconRegistry.test.ts. This test
 * pins: every icon module exports its component and renders through
 * the base Icon, each carries its glyph's official Feather data
 * (printer / share-2 in full — the two icons RecipeDetailPage
 * needs, spudly/design-system#187), no module carries another
 * icon's glyph, the rendering goes through react-native-svg (never
 * an icon font or a text glyph), and — since #298 — the icons are
 * internal only: the package exports no ./icons subpath (and no
 * subpath at all); the module's own barrel still collects every
 * icon for the repo's internal consumers.
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
const root = join(here, "../..");

function codeOf(rel: string): string {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Semantic export name -> module file + a distinctive literal from
 * its glyph's data. Every glyph's data is the official Feather data
 * except MealsIcon's: Feather has no plate icon, so MealsIcon
 * carries an original divided-plate design drawn to Feather's
 * construction specifications; its literal below is the plate's
 * bottom half portion, and its full structure is pinned by a
 * dedicated test below.
 */
const ICONS: [string, string | null][] = [
  // AddIcon (two bare lines) and ShareIcon (circles and lines) have
  // no path literal; their data is pinned by dedicated tests below.
  ["AddIcon", null],
  ["CollapsedIcon", "6 9 12 15 18 9"],
  ["ExpandedIcon", "18 15 12 9 6 15"],
  ["FeedbackIcon", "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7"],
  ["HomeIcon", "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  ["MealsIcon", "M2.62 13.5 A9.5 9.5 0 0 0 21.38 13.5 Z"],
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
    const code = codeByIcon.get(name)!;
    assert.match(
      code,
      new RegExp(String.raw`export function ${name}\(`),
      `${name} is not exported`,
    );
    assert.match(code, /from "\.\/Icon\.js"/, `${name} does not render through Icon`);
    assert.match(code, /<Icon elements=\{/, `${name} does not pass its glyph data to Icon`);
  }
});

test("each icon module carries its glyph's data (official Feather, except the custom Meals plate) (#246)", () => {
  for (const [name, literal] of ICONS) {
    if (!literal) continue;
    assert.ok(
      codeByIcon.get(name)!.includes(literal),
      `${name} is missing its glyph data (${literal.slice(0, 40)}…)`,
    );
  }
  // plus is two bare lines with no path data: pin its line endpoints.
  const add = codeByIcon.get("AddIcon")!;
  assert.match(add, /x1: "12", y1: "5", x2: "12", y2: "19"/);
  assert.match(add, /x1: "5", y1: "12", x2: "19", y2: "12"/);
});

test("no icon module carries another icon's glyph (#246)", () => {
  const literals = ICONS.filter(([, literal]) => literal).map(
    ([name, literal]): [string, string] => [name, literal as string],
  );
  for (const [owner, code] of codeByIcon) {
    for (const [name, literal] of literals) {
      if (name === owner) continue;
      assert.ok(!code.includes(literal), `${owner} also carries ${name}'s glyph data`);
    }
  }
});

test("MealsIcon is the custom divided plate, not Feather's coffee glyph", () => {
  const meals = codeByIcon.get("MealsIcon")!;
  // No rim: the plate is its three portions alone, enlarged to
  // fill the frame, so there is no circle element at all.
  assert.ok(!meals.includes('kind: "circle"'), "MealsIcon still carries the plate rim");
  // Two quarter portions across the top, their arcs concentric
  // about the grid center (radius 9.5 about 12,12).
  assert.ok(
    meals.includes("M2.62 10.5 L10.5 10.5 L10.5 2.62 A9.5 9.5 0 0 0 2.62 10.5 Z"),
    "MealsIcon is missing its top-left quarter portion",
  );
  assert.ok(
    meals.includes("M21.38 10.5 L13.5 10.5 L13.5 2.62 A9.5 9.5 0 0 1 21.38 10.5 Z"),
    "MealsIcon is missing its top-right quarter portion",
  );
  // The half portion along the bottom is pinned via the ICONS literal.
  // The Feather coffee data it replaced is gone.
  assert.ok(!meals.includes("M2 8h16v9"), "MealsIcon still carries the coffee body");
  assert.ok(!meals.includes("M18 8h1a4"), "MealsIcon still carries the coffee handle");
});

test("printer and share-2 use the official Feather element data (#187)", () => {
  const printer = codeByIcon.get("PrintIcon")!;
  // printer: tray polyline, body path, output rect.
  assert.match(printer, /points: "6 9 6 2 18 2 18 9"/);
  assert.match(printer, /kind: "rect", x: "6", y: "14", width: "12", height: "8"/);
  const share = codeByIcon.get("ShareIcon")!;
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

test("the Feather-set name API and tabIcons are gone (#246)", () => {
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

test("the icons module is internal — no ./icons subpath export (#246, #298)", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.exports["./icons"], undefined, "package.json must not export ./icons (#298)");
  assert.deepEqual(
    Object.keys(pkg.exports),
    ["."],
    "the package root is the only export — pages only (#298)",
  );
  assert.ok(
    pkg.dependencies["react-native-svg"] || pkg.peerDependencies["react-native-svg"],
    "react-native-svg is not declared as a dependency or peer",
  );
  // The internal barrel still collects every icon for the repo's
  // own components, pages, and stories.
  const index = codeOf("src/icons/index.ts");
  assert.match(index, /Icon/);
  for (const [name] of ICONS) {
    assert.match(
      index,
      new RegExp(String.raw`export \{ ${name} \}`),
      `index.ts does not export ${name}`,
    );
  }
});

test("CollapsibleIcon is one chevron-right glyph that rotates 90deg when open (#455)", () => {
  const code = codeOf("src/icons/CollapsibleIcon.tsx");
  assert.match(code, /export function CollapsibleIcon\(/);
  assert.match(code, /from "\.\/Icon\.js"/);
  // One glyph in both states: the Feather chevron-right data. The old
  // two-icon switch (#250) is gone — no CollapsedIcon/ExpandedIcon
  // composition and neither state chevron's data is embedded.
  assert.ok(code.includes("9 18 15 12 9 6"), "CollapsibleIcon lost the chevron-right data");
  assert.ok(!code.includes("CollapsedIcon"), "CollapsibleIcon still composes CollapsedIcon");
  assert.ok(!code.includes("ExpandedIcon"), "CollapsibleIcon still composes ExpandedIcon");
  assert.ok(!code.includes("6 9 12 15 18 9"), "CollapsibleIcon embeds the chevron-down data");
  assert.ok(!code.includes("18 15 12 9 6 15"), "CollapsibleIcon embeds the chevron-up data");
  // Rotation is derived from isOpen: pointing right while closed,
  // rotated down while open, animated on the DS "fast" transition
  // (the `animation` prop never animates on web, #457).
  assert.match(code, /rotate=\{isOpen \? "90deg" : "0deg"\}/);
  assert.match(code, /transition="fast"/);
  for (const banned of ["FeatherIcon", "featherIconNames", "featherIconElements", "tabIcons"]) {
    assert.ok(!code.includes(banned), `CollapsibleIcon still references ${banned}`);
  }
  const index = codeOf("src/icons/index.ts");
  assert.match(index, /export \{ CollapsibleIcon, type CollapsibleIconProps \}/);
});
