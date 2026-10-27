/**
 * Contract test for the Feather icons module (spudly/eciperay#246).
 *
 * The module is the design system's one icon set: official Feather
 * SVG element data rendered with react-native-svg, typed by Feather
 * name, carrying the featherIconNames / tabIcons mapping that used to
 * live in eciperay's packages/icons. This test pins: every name has
 * element data, the tab mapping only names real icons, the data for
 * printer / share-2 matches the official Feather sources (the two
 * icons RecipeDetailPage needs, spudly/design-system#187), the module
 * renders through react-native-svg (never an icon font or a text
 * glyph), and the package exposes it behind the ./icons subpath so
 * the Node-importable root entry stays clean.
 *
 * Source scan, like this repo's other contract tests: the invariants
 * are per-literal properties of the source. Comments are stripped
 * before scanning so explanatory comments cannot satisfy the patterns.
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

const code = codeOf("src/icons/FeatherIcon.tsx");

const EXPECTED_NAMES = [
  "home",
  "book-open",
  "users",
  "plus",
  "tag",
  "user",
  "coffee",
  "alert-triangle",
  "message-circle",
  "printer",
  "share-2",
];

test("featherIconNames carries the eciperay mapping plus printer/share-2 (#246, #187)", () => {
  for (const name of EXPECTED_NAMES) {
    assert.match(code, new RegExp(`"${name.replace("-", "\\-")}"`), `missing icon name ${name}`);
    assert.match(
      code,
      new RegExp(`(^|\\n)  "?${name.replace("-", "\\-")}"?: \\[`),
      `missing element data for ${name}`,
    );
  }
});

test("tabIcons maps the six eciperay tabs to Feather names (#246)", () => {
  assert.match(code, /Home: "home"/);
  assert.match(code, /Recipes: "book-open"/);
  assert.match(code, /Meals: "coffee"/);
  assert.match(code, /Add: "plus"/);
  assert.match(code, /Profile: "user"/);
  assert.match(code, /Feedback: "message-circle"/);
  assert.match(code, /satisfies Record<string, FeatherIconName>/);
});

test("printer and share-2 use the official Feather element data (#187)", () => {
  // printer: tray polyline, body path, output rect.
  assert.match(code, /points: "6 9 6 2 18 2 18 9"/);
  assert.match(
    code,
    /d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/,
  );
  assert.match(code, /kind: "rect", x: "6", y: "14", width: "12", height: "8"/);
  // share-2: three circles joined by two lines.
  assert.match(code, /kind: "circle", cx: "18", cy: "5", r: "3"/);
  assert.match(code, /kind: "circle", cx: "6", cy: "12", r: "3"/);
  assert.match(code, /kind: "circle", cx: "18", cy: "19", r: "3"/);
  assert.match(code, /x1: "8\.59", y1: "13\.51", x2: "15\.42", y2: "17\.49"/);
});

test("FeatherIcon renders through react-native-svg with Feather stroke treatment (#246)", () => {
  assert.match(code, /from "react-native-svg"/);
  assert.match(code, /<Svg/);
  assert.match(code, /viewBox="0 0 24 24"/);
  assert.match(code, /strokeLinecap="round"/);
  assert.match(code, /strokeLinejoin="round"/);
  assert.ok(!code.includes("react-icons"), "icons must not come from react-icons");
  assert.ok(!code.includes("react-native-vector-icons"), "icons must not come from an icon font");
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
  assert.match(index, /FeatherIcon/);
  assert.match(index, /tabIcons/);
});
