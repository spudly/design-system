/**
 * Contract test for spudly/design-system#262 (found on the Eciperay
 * web surface as spudly/eciperay#292): `TextField` forwarded the
 * React Native prop `secureTextEntry` to Tamagui's `Input`, whose
 * web build destructures the prop out and discards it — it never
 * sets `type="password"`, so password fields on the DS auth pages
 * (SignInPage, SignUpPage, ResetPasswordPage) rendered as plain
 * text inputs and showed the password as typed.
 *
 * The contract now:
 * 1. `TextField` destructures `secureTextEntry` and `type` OUT of
 *    its rest props, so neither can reach the Tamagui input
 *    untranslated.
 * 2. On web, `secureTextEntry` becomes `type="password"`; a
 *    caller-supplied `type` wins over the translation. On native,
 *    `secureTextEntry` passes through unchanged and a
 *    caller-supplied `type` is forwarded alongside it — Tamagui's
 *    native Input translates `type="password"` to `secureTextEntry`
 *    when the RN prop itself is unset.
 * 3. Runtime (SSR, against the built output): a secure TextField
 *    renders `<input type="password">` with no `securetextentry`
 *    attribute in the DOM; a plain TextField does not render
 *    `type="password"`; an explicit caller `type` is preserved.
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

const textField = readCode("src/components/TextField.tsx");

test("TextField destructures secureTextEntry and type out of rest (#262)", () => {
  assert.match(textField, /secureTextEntry,/);
  assert.match(textField, /\n {2}type,/);
  assert.match(textField, /from "tamagui"/);
  assert.match(textField, /isWeb/);
});

test("TextField translates secureTextEntry to type=password on web only (#262)", () => {
  assert.match(
    textField,
    /isWeb\s*\?\s*\{ type: type \?\? \(secureTextEntry \? "password" : undefined\) \}\s*:\s*\{ secureTextEntry, type \}/,
    "web must map secureTextEntry to type=password (caller type wins); native must pass secureTextEntry through and forward a caller-supplied type",
  );
  assert.match(textField, /\{\.\.\.secureProps\}/, "the translated props must reach the input");
});

// Runtime imports are lazy (inside the SSR tests) so the source-scan
// tests above still run and report when the build output is missing
// or broken, instead of the whole file failing at import time.
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
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

test("SSR: a secure TextField renders type=password and no leaked RN prop (#262)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, { label: "Password", secureTextEntry: true }),
  );
  assert.ok(html.includes('type="password"'), `expected type="password" in: ${html}`);
  assert.ok(!/securetextentry/i.test(html), "secureTextEntry must not leak to the DOM");
});

test("SSR: a plain TextField does not render type=password (#262)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(React.createElement(TextField, { label: "Email" }));
  assert.ok(!html.includes('type="password"'), `unexpected type="password" in: ${html}`);
  assert.ok(!/securetextentry/i.test(html), "secureTextEntry must not leak to the DOM");
});

test("SSR: a caller-supplied type wins over the secure translation (#262)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, { label: "Code", secureTextEntry: true, type: "text" }),
  );
  assert.ok(html.includes('type="text"'), `expected caller type="text" in: ${html}`);
  assert.ok(!html.includes('type="password"'), "caller type must win over the translation");
});
