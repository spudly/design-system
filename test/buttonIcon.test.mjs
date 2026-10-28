/**
 * Contract test for Button's icon slot (spudly/design-system#178,
 * Stephen's 2026-10-28 decision change, recorded on #178).
 *
 * The original #178 adoption shipped a standalone IconButton in
 * PR #252; Stephen rejected it on review: IconButton passed styling
 * props (width/height/padding/flexShrink) into the DS `Button`, and
 * DS components fully own their styles — they must not accept
 * styling props. The replacement shape: NO separate component.
 * `Button` itself gains an icon slot:
 *
 * 1. The caller passes a DS icon COMPONENT (`icon` prop) — content,
 *    not styling. Button renders the glyph itself, left of the
 *    label, at the size's standard glyph size (18/20/24px for
 *    sm/md/lg), inked in the variant's label color resolved from
 *    the active theme (react-native-svg cannot resolve Tamagui
 *    theme variables). There is no icon color/size/style prop.
 * 2. No label → icon-only: Button pins the size's square touch
 *    target (44/48/56px — never under the 44px floor) with the text
 *    padding zeroed, and `accessibilityLabel` is REQUIRED at the
 *    type level (the props union's icon-only branch) — there is no
 *    visible text to name the button.
 * 3. The standalone IconButton is gone: no component, stories,
 *    tests, changeset, index export, or sanctioned-tags entry.
 *
 * Source scan like this repo's other contract tests (comments
 * stripped first), plus SSR runtime checks against the built
 * output. The runtime glyph is a stub component: the real icon
 * components pull in react-native-svg → react-native, which does
 * not load under plain Node SSR (the same reason the icons contract
 * test is source-scan only); the stub pins exactly what Button
 * passes the glyph (size + color, no label), and a source scan pins
 * that the stories use the real DS icons.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const button = readCode("src/components/Button.tsx");
const stories = readCode("src/components/Button.stories.tsx");
const index = readCode("src/components/index.ts");
const pageWebAria = readCode("test/pageWebAria.test.mjs");

test("the standalone IconButton is removed everywhere (#178 decision change)", () => {
  for (const rel of [
    "src/components/IconButton.tsx",
    "src/components/IconButton.stories.tsx",
    "test/iconButton.test.mjs",
    ".changeset/icon-button-widget.md",
  ]) {
    assert.ok(!existsSync(join(root, rel)), `${rel} must not exist`);
  }
  assert.ok(!index.includes("IconButton"), "components index must not export IconButton");
  assert.ok(
    !pageWebAria.includes('"IconButton"'),
    "the #237 scan's sanctioned-tags set must not list IconButton",
  );
});

test("the icon slot takes a DS icon component, imported type-only from the icons module (#178)", () => {
  assert.match(button, /import type \{ IconComponentProps \} from "\.\.\/icons\/Icon\.js";/);
  assert.match(button, /icon\?: ComponentType<IconComponentProps>;/);
  assert.ok(
    !/^import \{[^}]*\} from "\.\.\/icons\//m.test(button),
    "no runtime icons import: the root entry must stay importable in plain Node",
  );
});

test("icon-only requires accessibilityLabel at the type level; the labeled shapes do not (#178)", () => {
  // No-icon branch stays the permissive plain button.
  assert.match(
    button,
    /icon\?: undefined;\s*children\?: ReactNode;\s*accessibilityLabel\?: string;/,
  );
  // Icon + label branch.
  assert.match(
    button,
    /icon: ComponentType<IconComponentProps>;\s*children: NonNullable<ReactNode>;\s*accessibilityLabel\?: string;/,
  );
  // Icon-only branch: label is a required string, never optional.
  assert.match(
    button,
    /icon: ComponentType<IconComponentProps>;\s*children\?: null \| undefined;\s*accessibilityLabel: string;/,
  );
});

test("the slot exposes no styling props — Button owns the glyph's size and ink (#178)", () => {
  assert.ok(
    !/icon(Color|Size|Style|StrokeWidth)/.test(button),
    "no icon color/size/style props may exist on Button",
  );
  // The glyph receives exactly Button's standard size and resolved ink.
  assert.match(button, /<IconGlyph size=\{glyphSize\} color=\{glyphInk\} \/>/);
});

test("the glyph renders LEFT of the label (#178)", () => {
  const glyphAt = button.indexOf("<IconGlyph size={glyphSize} color={glyphInk} />");
  const labelAt = button.indexOf("{children}", glyphAt);
  assert.ok(glyphAt !== -1, "glyph element must be rendered");
  assert.ok(labelAt > glyphAt, "the label must render after (right of) the glyph");
});

test("glyph size is standardized per Button size: 18/20/24 (#178)", () => {
  assert.match(button, /sm: 18,\s*md: 20,\s*lg: 24/);
  assert.match(button, /glyphSizes\[size as keyof typeof glyphSizes\] \?\? glyphSizes\.md/);
});

test("glyph ink mirrors Button's variant label colors (#178)", () => {
  assert.match(button, /roleValue\("onPrimary"\)/);
  assert.match(button, /roleValue\("link"\)/);
  assert.match(button, /case "danger":\s*return "#ffffff";/);
  assert.match(button, /case "secondary":\s*return tokens\.colors\.gray\.gray10;/);
});

test("icon-only pins the square standard box (44/48/56) with text padding zeroed (#178)", () => {
  assert.match(button, /sm: 44,\s*md: 48,\s*lg: 56/);
  assert.match(button, /const iconOnly = IconGlyph != null/);
  assert.match(button, /width: iconOnlyBox/);
  assert.match(button, /height: iconOnlyBox/);
  assert.match(button, /flexShrink: 0/);
  assert.match(button, /paddingHorizontal: 0/);
  assert.match(button, /paddingVertical: 0/);
});

test("the glyph-to-label gap is Button's own fixed spacing (#178)", () => {
  assert.match(button, /gap: tokens\.spacing\[2\]/);
});

test("stories cover icon+label and icon-only across variants, sizes, disabled, and a press interaction (#178)", () => {
  assert.match(stories, /title: "Components\/Button"/);
  for (const story of [
    "WithIcon",
    "WithIconVariants",
    "IconOnly",
    "IconOnlyVariants",
    "IconSizes",
    "IconDisabled",
    "IconPressCounter",
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
 * Button passes it as data attributes on a plain <svg>.
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

test("SSR: icon + label renders the glyph left of the text, at md size in the variant ink (#178)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      Button,
      { icon: stubGlyph, variant: "secondary", onPress: noop },
      "Print recipe",
    ),
  );
  assert.ok(html.includes("<button"), "renders a real button element");
  const glyphAt = html.indexOf('data-glyph-size="20"');
  assert.ok(glyphAt !== -1, "md glyph size is 20");
  assert.ok(
    html.includes('data-glyph-color="#171717"'),
    "secondary ink is the gray ramp step 10 (#171717), like Button's secondary label",
  );
  const labelAt = html.indexOf("Print recipe", glyphAt);
  assert.ok(labelAt > glyphAt, "the label text renders after (right of) the glyph");
  assert.ok(!/accessibilitylabel/i.test(html), "no leaked RN accessibility attributes");
  assert.ok(!html.includes("[object Object]"), "no stringified state object in the DOM");
});

test("SSR: icon-only renders no text, carries the required label as its name, and scales with size (#178)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Button, {
      icon: stubGlyph,
      variant: "danger",
      size: "lg",
      accessibilityLabel: "Delete recipe",
      onPress: noop,
    }),
  );
  assert.ok(html.includes('aria-label="Delete recipe"'), "the label names the button on web");
  assert.ok(!html.includes(">Delete recipe<"), "no visible label text is rendered");
  assert.ok(html.includes('data-glyph-size="24"'), "lg glyph size is 24");
  assert.ok(html.includes('data-glyph-color="#ffffff"'), "danger ink is white");
  const sm = await renderToHtml(
    React.createElement(Button, {
      icon: stubGlyph,
      size: "sm",
      accessibilityLabel: "Print recipe",
      onPress: noop,
    }),
  );
  assert.ok(sm.includes('data-glyph-size="18"'), "sm glyph size is 18");
  assert.ok(sm.includes('aria-label="Print recipe"'));
});

test("SSR: a disabled icon-only Button reports aria-disabled; a plain Button renders no glyph (#178)", async () => {
  const { React, Button } = await loadRuntime();
  const disabled = await renderToHtml(
    React.createElement(Button, {
      icon: stubGlyph,
      accessibilityLabel: "Print recipe",
      disabled: true,
      onPress: noop,
    }),
  );
  assert.ok(disabled.includes('aria-disabled="true"'), "disabled is reported on web");
  const plain = await renderToHtml(React.createElement(Button, { onPress: noop }, "Save recipe"));
  assert.ok(plain.includes("Save recipe"), "the plain labeled button is unchanged");
  assert.ok(!plain.includes("data-glyph"), "no glyph renders without the icon prop");
});
