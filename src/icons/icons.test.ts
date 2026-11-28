/**
 * Contract test for the icons module (spudly/eciperay#246).
 *
 * The module is the design system's one icon set: official Feather
 * SVG element data rendered with react-native-svg (the sole
 * exception is MealsIcon's custom divided plate — Feather has no
 * plate glyph — pinned below). Its shape is a base `Icon` renderer
 * plus one module per icon, each embedding only its own glyph's
 * data and exporting one component under a semantic usage name
 * (PrintIcon, not "printer") — so unused icons tree-shake and call
 * sites never name the icon set. No Feather-set name API
 * (featherIconNames / featherIconElements / FeatherIcon) or app
 * mapping (tabIcons) exists here; the one name-based surface is
 * the DS's own semantic name registry (iconRegistry.ts, #438
 * Part 4), which maps the DS's semantic usage names to these
 * components for the DS's icon slots — it names neither the
 * Feather glyphs nor any app concept, and its contract lives in
 * iconRegistry.test.ts. This test pins: every icon component
 * passes its glyph data through the base Icon's `elements` prop,
 * each carries its glyph's official Feather data (printer /
 * share-2 in full — the two icons RecipeDetailPage needs,
 * spudly/design-system#187), no icon carries another icon's glyph,
 * the base Icon renders an SVG with Feather stroke treatment, and
 * — since #298 — the icons are internal only: the package exports
 * no ./icons subpath (and no subpath at all).
 *
 * Converted from source scans to prop-capture checks in #733
 * tranche 2: each icon component is called directly and the
 * element it returns is inspected — the `elements` prop it passes
 * to the base Icon IS the rendered glyph data, so every glyph
 * invariant is observable without reading source. The one
 * remaining file read is package.json, a data file (not JS/TS
 * source), whose exports map is the #298 contract.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");

/**
 * Semantic export name -> a distinctive literal from its glyph's
 * data. Every glyph's data is the official Feather data except
 * MealsIcon's: Feather has no plate icon, so MealsIcon carries an
 * original divided-plate design drawn to Feather's construction
 * specifications; its literal below is the plate's bottom half
 * portion, and its full structure is pinned by a dedicated test
 * below.
 */
const ICONS: [string, string | null][] = [
  // AddIcon (two bare lines) and ShareIcon (circles and lines) have
  // no path literal; their data is pinned by dedicated tests below.
  ["AddIcon", null],
  ["BackIcon", "12 19 5 12 12 5"],
  ["CollapsedIcon", "6 9 12 15 18 9"],
  ["ErrorIcon", null],
  ["ExpandedIcon", "18 15 12 9 6 15"],
  ["FeedbackIcon", "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7"],
  ["HelpIcon", "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"],
  ["HomeIcon", "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  ["InfoIcon", null],
  ["MealsIcon", "M2.62 13.5 A9.5 9.5 0 0 0 21.38 13.5 Z"],
  ["PrintIcon", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"],
  ["ProfileIcon", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"],
  ["RecipesIcon", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  ["ShareIcon", null],
  ["SharedIcon", "M23 21v-2a4 4 0 0 0-3-3.87"],
  ["SuccessIcon", "M22 11.08V12a10 10 0 1 1-5.93-9.14"],
  ["TagsIcon", "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"],
  ["WarningIcon", "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94"],
];

type IconElementData = Record<string, string>;

async function loadIcon(name: string): Promise<Record<string, any>> {
  return (await import(`../../dist/icons/${name}.js`)) as Record<string, any>;
}

/**
 * Call an icon component and capture the glyph data it passes to
 * the base Icon: the returned element must BE the base Icon with
 * an `elements` prop — that is the "renders through Icon" contract
 * in observable form.
 */
async function elementsOf(name: string): Promise<IconElementData[]> {
  const { Icon } = await loadIcon("Icon");
  const mod = await loadIcon(name);
  const component = mod[name];
  assert.equal(typeof component, "function", `${name} is not exported as a component`);
  const element = component({});
  assert.equal(element?.type, Icon, `${name} does not render through the base Icon`);
  const elements = element.props?.elements;
  assert.ok(Array.isArray(elements) && elements.length > 0, `${name} passes no glyph data to Icon`);
  return elements as IconElementData[];
}

async function dataOf(name: string): Promise<string> {
  return JSON.stringify(await elementsOf(name));
}

test("each icon component passes its glyph data via the base Icon's elements prop (#246)", async () => {
  for (const [name] of ICONS) {
    await elementsOf(name);
  }
});

test("each icon carries its glyph's data (official Feather, except the custom Meals plate) (#246)", async () => {
  for (const [name, literal] of ICONS) {
    if (!literal) continue;
    const data = await dataOf(name);
    assert.ok(
      data.includes(literal),
      `${name} is missing its glyph data (${literal.slice(0, 40)}…)`,
    );
  }
  // plus is two bare lines with no path data: pin its line endpoints.
  // alert-circle and info are circles with bare lines (#856): pin
  // their line endpoints the same way as plus.
  const errorData = await dataOf("ErrorIcon");
  assert.ok(errorData.includes('"cx":"12","cy":"12","r":"10"'), "ErrorIcon lost its circle");
  assert.ok(
    errorData.includes('"x1":"12","y1":"8","x2":"12","y2":"12"'),
    "ErrorIcon lost its stem",
  );
  const infoData = await dataOf("InfoIcon");
  assert.ok(infoData.includes('"cx":"12","cy":"12","r":"10"'), "InfoIcon lost its circle");
  assert.ok(infoData.includes('"x1":"12","y1":"16","x2":"12","y2":"12"'), "InfoIcon lost its stem");
  const successData = await dataOf("SuccessIcon");
  assert.ok(successData.includes("22 4 12 14.01 9 11.01"), "SuccessIcon lost its check polyline");
  const add = await dataOf("AddIcon");
  assert.ok(
    add.includes('"x1":"12","y1":"5","x2":"12","y2":"19"'),
    "AddIcon lost its vertical line",
  );
  assert.ok(
    add.includes('"x1":"5","y1":"12","x2":"19","y2":"12"'),
    "AddIcon lost its horizontal line",
  );
});

test("no icon carries another icon's glyph (#246)", async () => {
  const literals = ICONS.filter(([, literal]) => literal).map(
    ([name, literal]): [string, string] => [name, literal!],
  );
  for (const [name] of ICONS) {
    const data = await dataOf(name);
    for (const [owner, literal] of literals) {
      if (owner === name) continue;
      assert.ok(!data.includes(literal), `${name} also carries ${owner}'s glyph data`);
    }
  }
});

test("MealsIcon is the custom divided plate, not Feather's coffee glyph", async () => {
  const elements = await elementsOf("MealsIcon");
  const data = JSON.stringify(elements);
  // No rim: the plate is its three portions alone, enlarged to
  // fill the frame, so there is no circle element at all.
  assert.ok(!elements.some((el) => el.kind === "circle"), "MealsIcon still carries the plate rim");
  // Two quarter portions across the top, their arcs concentric
  // about the grid center (radius 9.5 about 12,12).
  assert.ok(
    data.includes("M2.62 10.5 L10.5 10.5 L10.5 2.62 A9.5 9.5 0 0 0 2.62 10.5 Z"),
    "MealsIcon is missing its top-left quarter portion",
  );
  assert.ok(
    data.includes("M21.38 10.5 L13.5 10.5 L13.5 2.62 A9.5 9.5 0 0 1 21.38 10.5 Z"),
    "MealsIcon is missing its top-right quarter portion",
  );
  // The half portion along the bottom is pinned via the ICONS literal.
  // The Feather coffee data it replaced is gone.
  assert.ok(!data.includes("M2 8h16v9"), "MealsIcon still carries the coffee body");
  assert.ok(!data.includes("M18 8h1a4"), "MealsIcon still carries the coffee handle");
});

test("printer and share-2 use the official Feather element data (#187)", async () => {
  const printer = await dataOf("PrintIcon");
  // printer: tray polyline, body path, output rect.
  assert.ok(printer.includes('"points":"6 9 6 2 18 2 18 9"'), "PrintIcon lost its tray polyline");
  assert.ok(
    printer.includes('"kind":"rect","x":"6","y":"14","width":"12","height":"8"'),
    "PrintIcon lost its output rect",
  );
  const share = await dataOf("ShareIcon");
  // share-2: three circles joined by two lines.
  assert.ok(
    share.includes('"kind":"circle","cx":"18","cy":"5","r":"3"'),
    "ShareIcon lost its top circle",
  );
  assert.ok(
    share.includes('"kind":"circle","cx":"6","cy":"12","r":"3"'),
    "ShareIcon lost its middle circle",
  );
  assert.ok(
    share.includes('"kind":"circle","cx":"18","cy":"19","r":"3"'),
    "ShareIcon lost its bottom circle",
  );
  assert.ok(
    share.includes('"x1":"8.59","y1":"13.51","x2":"15.42","y2":"17.49"'),
    "ShareIcon lost its lower connector line",
  );
  assert.ok(
    share.includes('"x1":"15.41","y1":"6.51","x2":"8.59","y2":"10.49"'),
    "ShareIcon lost its upper connector line",
  );
});

test("the base Icon renders an SVG with Feather stroke treatment (#246)", async () => {
  const { Icon } = await loadIcon("Icon");
  const element = Icon({ elements: [{ kind: "line", x1: "5", y1: "12", x2: "19", y2: "12" }] });
  assert.equal(element?.props?.viewBox, "0 0 24 24", "Icon lost its 24x24 viewBox");
  assert.equal(element?.props?.fill, "none", "Icon lost its no-fill treatment");
  assert.equal(element?.props?.strokeLinecap, "round", "Icon lost its round line caps");
  assert.equal(element?.props?.strokeLinejoin, "round", "Icon lost its round line joins");
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
});

test("CollapsibleIcon is one chevron-right glyph that rotates 90deg when open (#455)", async () => {
  const { CollapsibleIcon } = await loadIcon("CollapsibleIcon");
  const { Icon } = await loadIcon("Icon");
  for (const [isOpen, rotate] of [
    [false, "0deg"],
    [true, "90deg"],
  ] as const) {
    const element = CollapsibleIcon({ isOpen });
    // Rotation is derived from isOpen: pointing right while closed,
    // rotated down while open, animated on the DS "fast" transition
    // (the `animation` prop never animates on web, #457).
    assert.equal(
      element?.props?.rotate,
      rotate,
      `CollapsibleIcon rotate is wrong for isOpen=${isOpen}`,
    );
    assert.equal(element?.props?.transition, "fast", "CollapsibleIcon lost its fast transition");
    const child = element?.props?.children;
    assert.equal(child?.type, Icon, "CollapsibleIcon does not render through the base Icon");
    const data = JSON.stringify(child.props?.elements);
    // One glyph in both states: the Feather chevron-right data. The
    // old two-icon switch (#250) is gone — neither state chevron's
    // data is embedded.
    assert.ok(data.includes("9 18 15 12 9 6"), "CollapsibleIcon lost the chevron-right data");
    assert.ok(!data.includes("6 9 12 15 18 9"), "CollapsibleIcon embeds the chevron-down data");
    assert.ok(!data.includes("18 15 12 9 6 15"), "CollapsibleIcon embeds the chevron-up data");
  }
});
