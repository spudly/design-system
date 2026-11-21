/**
 * Behavioral tests for PasswordField (#758): the password field
 * with an in-field show/hide eye toggle, composing TextField.
 *
 * Behavioral / rendered-output style (per the #733 direction —
 * no source scans): the tests render the built widget through
 * SSR and pin what a user and assistive technology actually get:
 * 1. Concealed (the default): the input renders masked
 *    (`type="password"` on web, via TextField's #262 translation),
 *    the toggle is a button named by `showPasswordLabel`, reports
 *    `aria-pressed="false"`, and the typed value is in the input.
 * 2. Revealed (seeded via `defaultRevealed`, the state the toggle
 *    flips to): the input renders unmasked, the toggle is named
 *    by `hidePasswordLabel`, and reports `aria-pressed="true"`.
 * 3. The label and error props forward to the composed TextField
 *    (the visible label renders; the error renders and wires
 *    `aria-invalid`).
 * 4. PasswordField is exported from the internal widgets barrel.
 *
 * Runtime imports are lazy (inside the tests) so the export
 * check still reports when the build output is missing.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

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
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
}

const fieldProps = {
  label: "Password",
  value: "correct horse",
  onChangeText: () => null,
  showPasswordLabel: "Show password",
  hidePasswordLabel: "Hide password",
};

test("PasswordField is exported from the internal widgets barrel (#758)", async () => {
  const { PasswordField } = await loadRuntime();
  assert.equal(typeof PasswordField, "function", "PasswordField must be exported");
});

test("SSR: concealed by default — masked input, toggle named for showing (#758)", async () => {
  const { PasswordField } = await loadRuntime();
  const html = await renderToHtml(<PasswordField {...fieldProps} />);
  assert.ok(html.includes('type="password"'), `expected a masked input in: ${html}`);
  assert.ok(!/securetextentry/i.test(html), "secureTextEntry must not leak to the DOM");
  assert.ok(html.includes('value="correct horse"'), "the typed value renders in the input");
  assert.ok(html.includes('role="button"'), "the toggle carries the button role");
  assert.ok(
    html.includes('aria-label="Show password"'),
    "while concealed the toggle is named by showPasswordLabel",
  );
  assert.ok(
    !html.includes('aria-label="Hide password"'),
    "while concealed the hide name is not rendered",
  );
  assert.ok(html.includes('aria-pressed="false"'), "the toggle announces its unpressed state");
});

test("SSR: revealed — unmasked input, toggle named for hiding (#758)", async () => {
  const { PasswordField } = await loadRuntime();
  const html = await renderToHtml(<PasswordField {...fieldProps} defaultRevealed={true} />);
  assert.ok(!html.includes('type="password"'), `expected an unmasked input in: ${html}`);
  assert.ok(html.includes('value="correct horse"'), "revealing keeps the typed value");
  assert.ok(
    html.includes('aria-label="Hide password"'),
    "while revealed the toggle is named by hidePasswordLabel",
  );
  assert.ok(
    !html.includes('aria-label="Show password"'),
    "while revealed the show name is not rendered",
  );
  assert.ok(html.includes('aria-pressed="true"'), "the toggle announces its pressed state");
});

test("SSR: label and error forward to the composed field (#758)", async () => {
  const { PasswordField } = await loadRuntime();
  const html = await renderToHtml(
    <PasswordField {...fieldProps} error="Password is required." />,
  );
  assert.ok(html.includes("Password"), "the visible label renders");
  assert.ok(html.includes("Password is required."), "the error text renders");
  assert.ok(html.includes('aria-invalid="true"'), "the input reports the error state");
});
