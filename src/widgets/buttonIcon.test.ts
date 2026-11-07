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
 * 1. The caller passes an icon NAME (`icon` prop) — data, not a
 *    component and not styling (#438 Part 4: the slot took the DS
 *    icon component itself until Part 4 converted it to the
 *    registry's name set). Button resolves the name through the
 *    internal icon registry and renders the glyph itself, left of the
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
 * output. The real icon components pull in react-native-svg →
 * react-native, which does not load under plain Node SSR, so the
 * harness stub renders glyphs inert (the same reason the icons
 * contract test is source-scan only): what Button passes the glyph
 * (size + color, no label) is pinned by the source scans below and
 * the registry's own contract test, and the runtime checks pin the
 * button's own markup around the glyph slot.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const button = readCode("src/widgets/Button.tsx");
const stories = readCode("src/widgets/Button.stories.tsx");
const index = readCode("src/widgets/index.ts");
const pageWebAria = readCode("test/pageWebAria.test.ts");

test("the standalone IconButton is removed everywhere (#178 decision change)", () => {
  for (const rel of [
    "src/widgets/IconButton.tsx",
    "src/widgets/IconButton.stories.tsx",
    "test/iconButton.test.ts",
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

test("the icon slot takes an icon NAME, resolved through the internal registry (#178, #438 Part 4)", () => {
  assert.match(
    button,
    /import \{ iconsByName, type IconName \} from "\.\.\/icons\/iconRegistry\.js";/,
  );
  assert.match(button, /icon\?: IconName;/);
  assert.match(button, /iconsByName\[icon\]/);
  assert.ok(
    !/from "\.\.\/icons\/[A-Z][\w]*Icon\.js"/.test(button),
    "Button must not import per-icon components directly — glyphs resolve only through the registry",
  );
  assert.ok(
    !/ComponentType<IconComponentProps>/.test(button),
    "the slot no longer takes a caller-supplied icon component",
  );
});

test("icon-only requires accessibilityLabel at the type level; the labeled shapes do not (#178)", () => {
  // No-icon branch stays the permissive plain button.
  assert.match(
    button,
    /icon\?: undefined;\s*children\?: ReactNode;\s*accessibilityLabel\?: string;/,
  );
  // Icon + label branch. Boolean children are excluded: `false`
  // renders no label, so it must fall into the icon-only branch.
  assert.match(
    button,
    /icon: IconName;\s*children: Exclude<NonNullable<ReactNode>, boolean>;\s*accessibilityLabel\?: string;/,
  );
  // Icon-only branch: label is a required string, never optional.
  assert.match(
    button,
    /icon: IconName;\s*children\?: boolean \| null;\s*accessibilityLabel: string;/,
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
  // Icon-only detection is render-based: Children.toArray drops
  // the child forms that render nothing (null, undefined,
  // booleans) and the some() check drops the empty string, so a
  // `false` or "" child cannot leave an unnamed, un-pinned button.
  assert.match(button, /Children\.toArray\(children\)\.some\(\(child\) => child !== ""\)/);
  assert.match(button, /const iconOnly = IconGlyph != null && !hasLabel;/);
  assert.match(button, /width: iconOnlyBox/);
  assert.match(button, /height: iconOnlyBox/);
  assert.match(button, /flexShrink: 0/);
  assert.match(button, /paddingHorizontal: 0/);
  assert.match(button, /paddingVertical: 0/);
});

test("every form shares one height per size in the frame config (#469)", () => {
  // Regression for #469: the labeled form's height was content-derived
  // while icon-only was pinned to its box, so the two rendered at
  // different heights. The shared frame's size variants now carry the
  // same per-size heights as the icon-only boxes (44/48/56).
  assert.match(button, /sm: \{\s*fontSize: tokens\.typography\.fontSize\.sm,\s*height: 44,/);
  assert.match(button, /md: \{\s*fontSize: tokens\.typography\.fontSize\.md,\s*height: 48,/);
  assert.match(button, /lg: \{\s*fontSize: tokens\.typography\.fontSize\.lg,\s*height: 56,/);
});

test("the glyph-to-label gap is Button's own fixed spacing (#178)", () => {
  assert.match(button, /gap: tokens\.spacing\[2\]/);
});

test("stories cover icon+label and icon-only across variants, sizes, disabled, and a press interaction (#178)", () => {
  assert.match(stories, /title: "Widgets\/Button"/);
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
  // The stories exercise the real DS icon names, not stand-ins.
  for (const name of ["print", "add", "share", "warning"]) {
    assert.match(
      stories,
      new RegExp(String.raw`icon[:=]\s*(?:\{\s*)?"${name}"`),
      `stories must pass the "${name}" icon by name`,
    );
  }
});

// Runtime imports are lazy, like buttonWebAria.test.ts, so the
// source scans still report when the build output is missing.
let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    return { React, renderToString, TamaguiProvider, ...dist };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

/**
 * The glyph itself renders inert under the harness's
 * react-native-svg stub (see the header): the runtime checks
 * below pin the button's own markup — element, accessible name,
 * label presence — while the source scans above pin what Button
 * passes the glyph (the standard size and variant ink, the glyph
 * element before the label).
 */

const noop = () => null;

test("SSR: icon + label renders the label in a real button, with no leaked RN attributes (#178)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      Button,
      { icon: "print", variant: "secondary", onPress: noop },
      "Print recipe",
    ),
  );
  assert.ok(html.includes("<button"), "renders a real button element");
  assert.ok(html.includes("Print recipe"), "the label text renders");
  assert.ok(!/accessibilitylabel/i.test(html), "no leaked RN accessibility attributes");
  assert.ok(!html.includes("[object Object]"), "no stringified state object in the DOM");
});

test("SSR: icon-only renders no text and carries the required label as its name (#178)", async () => {
  const { React, Button } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(Button, {
      icon: "warning",
      variant: "danger",
      size: "lg",
      accessibilityLabel: "Delete recipe",
      onPress: noop,
    }),
  );
  assert.ok(html.includes('aria-label="Delete recipe"'), "the label names the button on web");
  assert.ok(!html.includes(">Delete recipe<"), "no visible label text is rendered");
  const sm = await renderToHtml(
    React.createElement(Button, {
      icon: "print",
      size: "sm",
      accessibilityLabel: "Print recipe",
      onPress: noop,
    }),
  );
  assert.ok(sm.includes('aria-label="Print recipe"'));
  assert.ok(!sm.includes(">Print recipe<"), "no visible label text is rendered");
});

test('SSR: children that render nothing (false, "") are treated as icon-only, never left unnamed (#178)', async () => {
  const { React, Button } = await loadRuntime();
  for (const emptyChild of [false, ""]) {
    const html = await renderToHtml(
      React.createElement(
        Button,
        { icon: "print", accessibilityLabel: "Print recipe", onPress: noop },
        emptyChild,
      ),
    );
    assert.ok(
      html.includes('aria-label="Print recipe"'),
      `child ${JSON.stringify(emptyChild)}: the required label names the button`,
    );
    assert.ok(!html.includes(">Print recipe<"), "no visible label text is rendered");
  }
});

test("SSR: a disabled icon-only Button reports aria-disabled; a plain Button renders no glyph (#178)", async () => {
  const { React, Button } = await loadRuntime();
  const disabled = await renderToHtml(
    React.createElement(Button, {
      icon: "print",
      accessibilityLabel: "Print recipe",
      disabled: true,
      onPress: noop,
    }),
  );
  assert.ok(disabled.includes('aria-disabled="true"'), "disabled is reported on web");
  const plain = await renderToHtml(React.createElement(Button, { onPress: noop }, "Save recipe"));
  assert.ok(plain.includes("Save recipe"), "the plain labeled button is unchanged");
  assert.ok(
    !plain.includes("aria-label"),
    "no accessible name beyond the label text without the icon prop",
  );
});
