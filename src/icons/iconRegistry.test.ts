/**
 * Contract test for the icon-name registry (spudly/design-system#438
 * Part 4, Stephen's approved plan: icons by NAME as data, no icon
 * exports).
 *
 * The registry is the one place a DS icon name resolves to its
 * glyph component. Icon slots on DS components (Button's icon slot,
 * DropdownButton's trigger icon) take a name from this set and
 * resolve it here, so callers pass data only and no icon component
 * crosses a prop boundary. This test pins, at runtime:
 *
 * 1. The name set is EXACTLY the dispositioned set: the nine names
 *    the #438 Part 0 audit found hosts importing as components from
 *    the retired `@spudly/ui/icons` subpath (add, feedback, home,
 *    meals, profile, recipes, shared, tags, warning), plus "print"
 *    and "share" for RecipeDetailPage's Print / Share actions
 *    (#187), plus "help" for SearchHelpPopover's trigger (#699)
 *    — no more, no fewer.
 * 2. Every name resolves to the per-icon component of the same
 *    semantic name (add -> AddIcon, …): resolution is identity,
 *    not a look-alike.
 * 3. The loaded module exposes none of the identifiers #246 banned
 *    (the Feather-set name API, app mappings like tabIcons) — the
 *    names here are the DS's own semantic usage names, not the
 *    icon set's glyph names and not app concepts.
 *
 * Converted from source scans to runtime checks in #733 tranche 2:
 * name resolution and the exported surface are runtime-observable;
 * type-alias and import-statement shape are TypeScript's concern,
 * not a test's.
 *
 * Runtime checks load the built registry and per-icon modules with
 * the react-native-svg stub registered (the icons module's glyphs
 * render inert under it; identity and shape are what is pinned).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

/** Icon name -> the per-icon component module it must resolve to. */
const NAMES: [string, string][] = [
  ["add", "AddIcon"],
  ["feedback", "FeedbackIcon"],
  ["help", "HelpIcon"],
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

test("runtime: the registry's name set is exactly the dispositioned twelve, in order", async () => {
  const loaded: Record<string, any> = await import("../../dist/icons/iconRegistry.js");
  assert.deepEqual(
    [...loaded.iconNames],
    NAMES.map(([name]) => name),
    "the name set is exactly the dispositioned twelve, in order",
  );
  assert.deepEqual(
    Object.keys(loaded.iconsByName).sort(),
    NAMES.map(([name]) => name).sort(),
    "the runtime record carries exactly the dispositioned names",
  );
});

test("runtime: every name resolves to its per-icon component (identity)", async () => {
  const loaded: Record<string, any> = await import("../../dist/icons/iconRegistry.js");
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

test("runtime: the registry module exposes none of the #246 banned identifiers", async () => {
  const loaded: Record<string, any> = await import("../../dist/icons/iconRegistry.js");
  for (const banned of ["FeatherIcon", "featherIconNames", "featherIconElements", "tabIcons"]) {
    assert.equal(loaded[banned], undefined, `the registry still exposes ${banned}`);
  }
});
