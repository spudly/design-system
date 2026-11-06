/**
 * Contract test for the icon-name registry (spudly/design-system#438
 * Part 4, Stephen's approved plan: icons by NAME as data, no icon
 * exports).
 *
 * The registry is the one place a DS icon name resolves to its
 * glyph component. Icon slots on DS components (Button's icon slot,
 * DropdownButton's trigger icon) take a name from this set and
 * resolve it here, so callers pass data only and no icon component
 * crosses a prop boundary. This test pins:
 *
 * 1. The name set is EXACTLY the dispositioned set: the nine names
 *    the #438 Part 0 audit found hosts importing as components from
 *    the retired `@spudly/ui/icons` subpath (add, feedback, home,
 *    meals, profile, recipes, shared, tags, warning), plus "print"
 *    and "share" for RecipeDetailPage's Print / Share actions
 *    (#187) — no more, no fewer.
 * 2. Every name resolves, at runtime, to the per-icon component of
 *    the same semantic name (add -> AddIcon, …): resolution is
 *    identity, not a look-alike.
 * 3. The name type is a type ALIAS derived from the names array
 *    (the repo's type-alias rule), and the registry carries none of
 *    the identifiers #246 banned (the Feather-set name API, app
 *    mappings like tabIcons) — the names here are the DS's own
 *    semantic usage names, not the icon set's glyph names and not
 *    app concepts.
 *
 * Runtime checks load the built registry and per-icon modules with
 * the react-native-svg stub registered (the icons module's glyphs
 * render inert under it; identity and shape are what is pinned).
 */
import "../../test/registerSvgStub.js";
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

/** Icon name -> the per-icon component module it must resolve to. */
const NAMES: [string, string][] = [
  ["add", "AddIcon"],
  ["feedback", "FeedbackIcon"],
  ["home", "HomeIcon"],
  ["meals", "MealsIcon"],
  ["print", "PrintIcon"],
  ["profile", "ProfileIcon"],
  ["recipes", "RecipesIcon"],
  ["share", "ShareIcon"],
  ["shared", "SharedIcon"],
  ["tags", "TagsIcon"],
  ["warning", "WarningIcon"],
];

/** The nine names from the #438 Part 0 audit's ICON-NAME disposition. */
const AUDITED = [
  "add",
  "feedback",
  "home",
  "meals",
  "profile",
  "recipes",
  "shared",
  "tags",
  "warning",
];

const registry = codeOf("src/icons/iconRegistry.ts");

test("the registry's name set is exactly the audited names plus print/share (#438 Part 4)", () => {
  for (const name of AUDITED) {
    assert.ok(
      new RegExp(String.raw`"${name}"`).test(registry),
      `audited icon name "${name}" is missing from the registry`,
    );
  }
  const namesBlock = registry.match(/export const iconNames = \[([\s\S]*?)\] as const;/);
  assert.ok(namesBlock, "iconNames must be a const array literal");
  const listed = [...namesBlock[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(
    listed,
    NAMES.map(([name]) => name),
    "the name set is exactly the dispositioned eleven, in order",
  );
});

test("every name maps to its per-icon component, imported from its own module", () => {
  for (const [name, component] of NAMES) {
    assert.match(
      registry,
      new RegExp(String.raw`import \{ ${component} \} from "\./${component}\.js";`),
      `${component} must be imported from its per-icon module`,
    );
    assert.match(
      registry,
      new RegExp(String.raw`${name}: ${component},`),
      `"${name}" must resolve to ${component}`,
    );
  }
});

test("the name type is a type alias derived from the names array", () => {
  assert.match(registry, /export type IconName = \(typeof iconNames\)\[number\];/);
  assert.match(
    registry,
    /export const iconsByName: Record<IconName, ComponentType<IconComponentProps>> = \{/,
  );
});

test("the registry carries none of the #246 banned identifiers", () => {
  for (const banned of ["FeatherIcon", "featherIconNames", "featherIconElements", "tabIcons"]) {
    assert.ok(!registry.includes(banned), `the registry still references ${banned}`);
  }
});

test("the internal barrel collects the registry for the repo's own consumers", () => {
  const index = codeOf("src/icons/index.ts");
  assert.match(
    index,
    /export \{ iconNames, iconsByName, type IconName \} from "\.\/iconRegistry\.js";/,
  );
});

test("runtime: every name resolves to its per-icon component (identity)", async () => {
  const loaded: Record<string, any> = await import("../../dist/icons/iconRegistry.js");
  assert.deepEqual(
    [...loaded.iconNames],
    NAMES.map(([name]) => name),
  );
  assert.deepEqual(
    Object.keys(loaded.iconsByName).sort(),
    NAMES.map(([name]) => name).sort(),
    "the runtime record carries exactly the dispositioned names",
  );
  for (const [name, component] of NAMES) {
    const mod: Record<string, any> = await import(`../../dist/icons/${component}.js`);
    assert.equal(
      typeof loaded.iconsByName[name],
      "function",
      `"${name}" must resolve to a component`,
    );
    assert.equal(
      loaded.iconsByName[name],
      mod[component],
      `"${name}" must resolve to the ${component} component itself`,
    );
  }
});
