/**
 * Contract test for spudly/design-system#321: the auth forms pass
 * React Native's Android-vocabulary autocomplete hints to `TextField`
 * (`autoComplete="password"` in SignInForm, `autoComplete=
 * "password-new"` in SignUpForm / ResetPasswordForm). Those values
 * are not valid HTML `autocomplete` tokens, so on web password
 * managers ignore them — the valid web tokens are
 * `current-password` / `new-password`.
 *
 * The contract now (translation lives in TextField, the single
 * forwarding point to the underlying input; the auth forms keep
 * passing the native values):
 * 1. `TextField` destructures `autoComplete` OUT of its rest props,
 *    so it cannot reach the Tamagui input untranslated.
 * 2. On web, `password` becomes `current-password` and
 *    `password-new` becomes `new-password`; every other value
 *    (`email`, `username`, `off`, …) passes through unchanged.
 * 3. On native, the caller's value passes through unchanged —
 *    React Native 0.88's TextInput accepts the native vocabulary
 *    (and maps `new-password` to `password-new` for Android
 *    internally), so native is not a gap. The native half is
 *    pinned by the source scan below; the SSR runtime tests run
 *    against the web build, like secureTextEntryWeb.test.mjs.
 * 4. Runtime (SSR, against the built output): a TextField with
 *    `autoComplete="password"` renders `autoComplete="current-password"` (never the bare RN
 *    token — React SSR spells the DOM `autocomplete` attribute
 *    with the prop's camelCase), likewise `password-new` →
 *    `new-password`, and `email` / `username` render unchanged.
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

test("TextField destructures autoComplete out of rest (#321)", () => {
  assert.match(textField, /\n {2}autoComplete,/);
  assert.match(textField, /from "tamagui"/);
  assert.match(textField, /isWeb/);
});

test("TextField maps both RN password tokens to the HTML tokens (#321)", () => {
  assert.match(textField, /password: "current-password"/);
  assert.match(textField, /"password-new": "new-password"/);
});

test("TextField translates autoComplete on web only; native passes through (#321)", () => {
  assert.match(
    textField,
    /autoComplete: isWeb\s*\?\s*\(webAutoCompleteByNativeAutoComplete\[autoComplete \?\? ""\] \?\? autoComplete\)\s*:\s*autoComplete/,
    "web must translate via the map with passthrough for unmapped values; native must forward the caller's autoComplete unchanged",
  );
  assert.match(
    textField,
    /\{\.\.\.autoCompleteProps\}/,
    "the translated props must reach the input",
  );
});

test("auth forms keep passing the native password tokens (#321)", () => {
  assert.match(readCode("src/components/SignInForm.tsx"), /autoComplete="password"/);
  assert.match(readCode("src/components/SignUpForm.tsx"), /autoComplete="password-new"/);
  assert.match(readCode("src/components/ResetPasswordForm.tsx"), /autoComplete="password-new"/);
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

test("SSR: autoComplete=password renders current-password on web (#321)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "Password",
      secureTextEntry: true,
      autoComplete: "password",
    }),
  );
  assert.ok(
    html.includes('autoComplete="current-password"'),
    `expected autoComplete="current-password" in: ${html}`,
  );
  assert.ok(
    !html.includes('autoComplete="password"'),
    "the bare RN token must not reach the web input",
  );
});

test("SSR: autoComplete=password-new renders new-password on web (#321)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(TextField, {
      label: "New password",
      secureTextEntry: true,
      autoComplete: "password-new",
    }),
  );
  assert.ok(
    html.includes('autoComplete="new-password"'),
    `expected autoComplete="new-password" in: ${html}`,
  );
  assert.ok(
    !html.includes('autoComplete="password-new"'),
    "the RN token must not reach the web input",
  );
});

test("SSR: other autoComplete values pass through unchanged on web (#321)", async () => {
  const { React, TextField } = await loadRuntime();
  for (const value of ["email", "username"]) {
    const html = await renderToHtml(
      React.createElement(TextField, { label: value, autoComplete: value }),
    );
    assert.ok(
      html.includes(`autoComplete="${value}"`),
      `expected autoComplete="${value}" to pass through in: ${html}`,
    );
  }
});

test("SSR: a TextField without autoComplete renders no autocomplete attribute (#321)", async () => {
  const { React, TextField } = await loadRuntime();
  const html = await renderToHtml(React.createElement(TextField, { label: "Name" }));
  assert.ok(!/autoComplete=/i.test(html), `unexpected autoComplete attribute in: ${html}`);
});
