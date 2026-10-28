/**
 * Contract test for IconButton (spudly/design-system#178, Stephen's
 * decision to ADD a dedicated icon-only button rather than keep
 * composing Button + icon ad hoc).
 *
 * The widget standardizes the three things that varied between
 * hand-rolled compositions (RecipeDetailPage's print/share chips
 * were the proving case):
 * 1. Geometry: one square box and one glyph size per size — sm
 *    44/18, md 48/20, lg 56/24 — every box at or above the 44px
 *    touch-target floor (SearchField's clear button).
 * 2. Ink: the glyph renders in the variant's label color, the same
 *    colors Button gives its text, with the theme roles (onPrimary
 *    for primary, link for ghost) resolved from the active theme —
 *    react-native-svg cannot resolve Tamagui theme variables.
 * 3. Naming: `accessibilityLabel` is a REQUIRED prop (an icon
 *    button has no visible text), forwarded to the DS Button so the
 *    web ARIA translation of #235 names the rendered <button>; the
 *    glyph itself stays decorative (no label of its own).
 *
 * Rendering goes through the DS Button (variants, disabled dim,
 * role, a11y translation inherited) with the text padding zeroed
 * and the square box pinned.
 *
 * Source scan like this repo's other contract tests (comments
 * stripped first), plus SSR runtime checks against the built
 * output. The runtime glyph is a stub component: the real icon
 * components pull in react-native-svg → react-native, which does
 * not load under plain Node SSR (the same reason the icons contract
 * test is source-scan only); the stub pins exactly what IconButton
 * passes the glyph (size + color, no label), and a source scan pins
 * that the stories use the real DS icons.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const component = readCode("src/components/IconButton.tsx");
const stories = readCode("src/components/IconButton.stories.tsx");
const index = readCode("src/components/index.ts");

test("IconButton is exported from the component and the components index (#178)", () => {
  assert.match(component, /export function IconButton\(/);
  assert.match(component, /export type IconButtonProps = \{/);
  assert.match(component, /export type IconButtonVariant = /);
  assert.match(component, /export type IconButtonSize = /);
  assert.match(index, /export \{\s*IconButton,/);
  assert.match(index, /type IconButtonProps/);
  assert.match(index, /from "\.\/IconButton\.js"/);
});

test("the accessibility label is REQUIRED, not optional (#178)", () => {
  assert.match(component, /accessibilityLabel: string;/);
  assert.ok(
    !/accessibilityLabel\?:/.test(component),
    "accessibilityLabel must not be optional — an unlabeled icon button has no name",
  );
});

test("the icon is a DS icon component type, imported type-only from the icons module (#178)", () => {
  assert.match(component, /import type \{ IconComponentProps \} from "\.\.\/icons\/Icon\.js";/);
  assert.match(component, /icon: ComponentType<IconComponentProps>;/);
  assert.ok(
    !/^import \{[^}]*\} from "\.\.\/icons\//m.test(component),
    "no runtime icons import: the root entry must stay importable in plain Node",
  );
});

test("rendering goes through the DS Button with its text padding zeroed (#178)", () => {
  assert.match(component, /import \{ Button \} from "\.\/Button\.js";/);
  assert.match(component, /<Button/);
  assert.match(component, /variant=\{variant\}/);
  assert.match(component, /disabled=\{disabled\}/);
  assert.match(component, /onPress=\{onPress\}/);
  assert.match(component, /accessibilityLabel=\{accessibilityLabel\}/);
  assert.match(component, /paddingHorizontal=\{0\}/);
  assert.match(component, /paddingVertical=\{0\}/);
  assert.match(component, /flexShrink=\{0\}/);
});

test("geometry is standardized: 44/48/56 boxes with 18/20/24 glyphs (#178)", () => {
  assert.match(component, /sm: \{ box: 44, glyph: 18 \}/);
  assert.match(component, /md: \{ box: 48, glyph: 20 \}/);
  assert.match(component, /lg: \{ box: 56, glyph: 24 \}/);
  assert.match(component, /width=\{box\}/);
  assert.match(component, /height=\{box\}/);
});

test("the glyph is rendered at the standard size in the variant ink, with no label of its own (#178)", () => {
  assert.match(component, /<Glyph size=\{glyph\} color=\{ink\} \/>/);
  assert.ok(
    !/<Glyph[^>]*accessibilityLabel/.test(component),
    "the glyph stays decorative; the button carries the accessible name",
  );
});

test("glyph ink mirrors Button's variant label colors (#178)", () => {
  // primary reads the theme's onPrimary role; ghost the link role;
  // danger is white; secondary is the gray ramp's step 10 — the same
  // values Button's variantLabelColors assigns to text labels.
  assert.match(component, /roleValue\("onPrimary"\)/);
  assert.match(component, /roleValue\("link"\)/);
  assert.match(component, /case "danger":\s*return "#ffffff";/);
  assert.match(component, /case "secondary":\s*return tokens\.colors\.gray\.gray10;/);
  // A caller color override wins over the variant ink.
  assert.match(component, /if \(override !== undefined\) \{\s*return override;/);
});

test("defaults: secondary variant, md size, enabled (#178)", () => {
  assert.match(component, /variant = "secondary"/);
  assert.match(component, /size = "md"/);
  assert.match(component, /disabled = false/);
});

test("stories cover the variants, sizes, disabled state, and a press interaction (#178)", () => {
  assert.match(stories, /title: "Components\/IconButton"/);
  for (const story of [
    "Print",
    "Primary",
    "Ghost",
    "Danger",
    "Sizes",
    "Disabled",
    "AllVariants",
    "PressCounter",
  ]) {
    assert.match(stories, new RegExp(`export const ${story}: Story`), `missing story ${story}`);
  }
  // The stories exercise the real DS icons, not stand-ins.
  for (const icon of ["PrintIcon", "AddIcon", "ShareIcon", "WarningIcon"]) {
    assert.match(
      stories,
      new RegExp(String.raw`from "\.\./icons/${icon}\.js"`),
      `stories must import ${icon} from the icons module`,
    );
  }
});

// Runtime imports are lazy, like buttonWebAria.test.mjs, so the
// source scans still report when the build output is missing.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    stubGlyphRuntime.React = React;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const dist = await import("../dist/index.js");
    return { React, renderToString, TamaguiProvider, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

/**
 * Stub glyph: stands in for a DS icon component and records what
 * IconButton passes it as data attributes on a plain <svg>.
 */
function stubGlyph({ size, color }) {
  const { React } = stubGlyphRuntime;
  return React.createElement("svg", {
    "data-glyph-size": size,
    "data-glyph-color": color,
    "aria-hidden": true,
  });
}
const stubGlyphRuntime = { React: null };

const noop = () => null;

test("SSR: the button carries the required label as its accessible name, the glyph at md size in secondary ink (#178)", async () => {
  const { React, IconButton } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(IconButton, {
      icon: stubGlyph,
      accessibilityLabel: "Print recipe",
      onPress: noop,
    }),
  );
  assert.ok(html.includes("<button"), "renders a real button element");
  assert.ok(html.includes('aria-label="Print recipe"'), "the label names the button on web");
  assert.ok(!/accessibilitylabel/i.test(html), "no leaked RN accessibility attributes");
  assert.ok(!html.includes("[object Object]"), "no stringified state object in the DOM");
  assert.ok(html.includes('data-glyph-size="20"'), "md glyph size is 20");
  assert.ok(
    html.includes('data-glyph-color="#171717"'),
    "secondary ink is the gray ramp step 10 (#171717), like Button's secondary label",
  );
});

test("SSR: size scales the glyph, danger inks it white, disabled reports aria-disabled (#178)", async () => {
  const { React, IconButton } = await loadRuntime();
  const lg = await renderToHtml(
    React.createElement(IconButton, {
      icon: stubGlyph,
      accessibilityLabel: "Delete recipe",
      variant: "danger",
      size: "lg",
      onPress: noop,
    }),
  );
  assert.ok(lg.includes('data-glyph-size="24"'), "lg glyph size is 24");
  assert.ok(lg.includes('data-glyph-color="#ffffff"'), "danger ink is white");
  const sm = await renderToHtml(
    React.createElement(IconButton, {
      icon: stubGlyph,
      accessibilityLabel: "Print recipe",
      size: "sm",
      disabled: true,
      onPress: noop,
    }),
  );
  assert.ok(sm.includes('data-glyph-size="18"'), "sm glyph size is 18");
  assert.ok(sm.includes('aria-disabled="true"'), "disabled is reported on web");
});
