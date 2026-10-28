/**
 * Contract test for spudly/design-system#256: DS page titles
 * rendered through the `Text` primitive's heading variants produced
 * a plain styled element on web — no heading role or level — so
 * screen-reader users could not navigate DS pages by heading. The
 * retired web views rendered real headings, so every page retiring
 * into the DS under B7 lost heading navigation (the auth pages were
 * the instance found, in the B7 C3 review of eciperay PR #290).
 *
 * The contract now:
 * 1. `Text` defaults the `heading` / `subheading` variants to the
 *    React Native `header` accessibility role (a valid RN role —
 *    see accessibilityRoles.test.mjs), which the shared
 *    `platformAccessibilityProps` translator renders on web as
 *    `role="heading"`. A caller-supplied role always wins.
 * 2. The translator carries a caller-supplied `aria-level` through
 *    on web (1 for `heading`, 2 for `subheading`) and drops it on
 *    native, where RN has no heading-level prop.
 * 3. Runtime (SSR, against the built output): heading Text renders
 *    `role="heading"` + `aria-level="1"`, subheading renders
 *    `aria-level="2"`, body Text renders no heading role, a caller
 *    role override renders that role with no aria-level, and no RN
 *    accessibility prop leaks to the DOM.
 */
import "./registerSvgStub.mjs";
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

test("Text defaults heading variants to the header role with a level (#256)", () => {
  const source = readCode("src/components/Text.tsx");
  assert.match(
    source,
    /accessibilityRole \?\? \(headingLevel !== undefined \? "header" : undefined\)/,
    "Text must default heading/subheading variants to the RN header role",
  );
  assert.match(
    source,
    /"aria-level":\s+callerAriaLevel \?\?\s+\(headingLevel !== undefined && roleIsHeading \? headingLevel : undefined\)/,
    "Text must prefer a caller-supplied aria-level, else attach the variant's level only when the effective role is a heading",
  );
  assert.match(
    source,
    /"aria-level": callerAriaLevel,/,
    "a caller-supplied aria-level must be destructured out of rest so it routes through the translator instead of spreading after a11yProps",
  );
  assert.match(
    source,
    /const callerRole = \(rest as \{ role\?: string \}\)\.role \?\? accessibilityRole;/,
    "the effective role must be the rendered one: rest's web role spreads last, so it is checked before accessibilityRole",
  );
});

test("the translator passes aria-level on web and drops it on native (#256)", () => {
  const source = readCode("src/components/accessibility.ts");
  assert.match(source, /"aria-level": ariaLevel/, "web path must forward aria-level");
  assert.match(
    source,
    /key !== "aria-level"/,
    "native path must drop the ARIA-only aria-level prop",
  );
});

// Runtime imports are lazy, like pageWebAria.test.mjs, so the
// source-scan tests above still run when the build output is missing.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
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
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

function assertNoLeak(html) {
  assert.ok(!/accessibilityrole/i.test(html), "accessibilityrole must not leak to the DOM");
  assert.ok(!html.includes("[object Object]"), "no stringified object in the DOM");
}

test("SSR: heading and subheading Text render heading semantics (#256)", async () => {
  const { React, Text } = await loadRuntime();
  const heading = await renderToHtml(
    React.createElement(Text, { variant: "heading" }, "Welcome back"),
  );
  assert.ok(
    heading.includes('role="heading"'),
    `expected role=heading in: ${heading.slice(0, 400)}`,
  );
  assert.ok(
    heading.includes('aria-level="1"'),
    `expected aria-level=1 in: ${heading.slice(0, 400)}`,
  );
  assertNoLeak(heading);
  const subheading = await renderToHtml(
    React.createElement(Text, { variant: "subheading" }, "Section title"),
  );
  assert.ok(subheading.includes('role="heading"'));
  assert.ok(subheading.includes('aria-level="2"'));
  assertNoLeak(subheading);
});

test("SSR: both role props — a rendered button keeps no aria-level (#256)", async () => {
  const { React, Text } = await loadRuntime();
  // rest's role spreads last at render, so this renders a button —
  // it must not keep the heading variant's aria-level.
  const html = await renderToHtml(
    React.createElement(
      Text,
      { variant: "heading", accessibilityRole: "header", role: "button", onPress: () => null },
      "Act",
    ),
  );
  assert.ok(html.includes('role="button"'), `web role must win: ${html.slice(0, 400)}`);
  assert.ok(!html.includes("aria-level"), "a rendered button must not carry aria-level");
  assertNoLeak(html);
});

test("SSR: both role props — a rendered heading keeps its level (#256)", async () => {
  const { React, Text } = await loadRuntime();
  // Reverse the roles: this renders a heading, so it keeps level 1.
  const html = await renderToHtml(
    React.createElement(
      Text,
      { variant: "heading", accessibilityRole: "button", role: "heading" },
      "Title",
    ),
  );
  assert.ok(html.includes('role="heading"'), `web role must win: ${html.slice(0, 400)}`);
  assert.ok(html.includes('aria-level="1"'), "a rendered heading keeps the variant's level");
  assertNoLeak(html);
});

test("SSR: a caller-supplied aria-level wins; an explicit undefined keeps the generated level (#256)", async () => {
  const { React, Text } = await loadRuntime();
  const explicit = await renderToHtml(
    React.createElement(Text, { variant: "heading", "aria-level": 3 }, "Deep title"),
  );
  assert.ok(
    explicit.includes('aria-level="3"'),
    `caller aria-level must win: ${explicit.slice(0, 400)}`,
  );
  assertNoLeak(explicit);
  // An explicit undefined must not clobber the generated level via
  // rest spreading after a11yProps — the prop is destructured out of
  // rest and routed through the translator instead.
  const undef = await renderToHtml(
    React.createElement(Text, { variant: "heading", "aria-level": undefined }, "Welcome back"),
  );
  assert.ok(
    undef.includes('aria-level="1"'),
    `generated level must survive an explicit undefined: ${undef.slice(0, 400)}`,
  );
  assertNoLeak(undef);
});

test("SSR: body Text has no heading role; a caller role wins (#256)", async () => {
  const { React, Text } = await loadRuntime();
  const body = await renderToHtml(React.createElement(Text, null, "Plain text"));
  assert.ok(!body.includes('role="heading"'), `body must not be a heading: ${body.slice(0, 400)}`);
  assert.ok(!body.includes("aria-level"), "body must not carry aria-level");
  const override = await renderToHtml(
    React.createElement(
      Text,
      { variant: "heading", accessibilityRole: "button", onPress: () => null },
      "Act",
    ),
  );
  assert.ok(override.includes('role="button"'), `caller role must win: ${override.slice(0, 400)}`);
  assert.ok(!override.includes("aria-level"), "no aria-level when the role is not a heading");
  assertNoLeak(override);
});
