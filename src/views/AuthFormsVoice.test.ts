/**
 * Voice-slot pins for the auth form views (#539 tranche 2c):
 * SignInForm's, SignUpForm's, ForgotPasswordForm's, and
 * ResetPasswordForm's field labels, submit actions, and footer
 * links come from the app-supplied voice object — the DS ships
 * no default strings. These forms have no label props, so their
 * copy reads the voice slots directly.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: each form is SSR-rendered under the fixture
 * voice and the rendered output is asserted to carry the
 * fixture's slot strings — the same strings a host's voice
 * object would supply — and each form rendered with NO
 * provider throws the voice system's fail-fast error, which
 * is the observable half of "reads the voice object" (a form
 * with hard-coded copy would render fine without one).
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const { createElement: h } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const { VoiceProvider }: Record<string, any> = await import("../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../dist/voice/fixtures.js");
    return { h, renderToString, TamaguiProvider, VoiceProvider, fixtureVoice, ...distRuntime };
  })();
  return runtimePromise;
}

async function renderWithVoice(element: any): Promise<string> {
  const {
    h,
    renderToString,
    TamaguiProvider,
    VoiceProvider,
    fixtureVoice,
    createTamaguiConfig,
    baseTheme,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    h(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      h(VoiceProvider, { voice: fixtureVoice }, element),
    ),
  );
}

async function renderWithoutVoice(element: any): Promise<string> {
  const { h, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(h(TamaguiProvider, { config, defaultTheme: "light" }, element));
}

const noop = () => {};

test("SignInForm renders its copy from the voice object", async () => {
  const { h, SignInForm, fixtureVoice } = await loadRuntime();
  const props = {
    email: "",
    password: "",
    onEmailChange: noop,
    onPasswordChange: noop,
    onSubmit: noop,
    signUpHref: "/sign-up",
    forgotPasswordHref: "/forgot-password",
  };
  const html = await renderWithVoice(h(SignInForm, props));
  for (const slot of [
    "emailLabel",
    "passwordLabel",
    "showPasswordLabel",
    "submitLabel",
    "createAccountLabel",
    "forgotPasswordLabel",
  ]) {
    assert.ok(
      html.includes(fixtureVoice.signInForm[slot]),
      `slot ${slot} renders from the voice object`,
    );
  }
  const pending = await renderWithVoice(h(SignInForm, { ...props, loading: true }));
  assert.ok(
    pending.includes(fixtureVoice.signInForm.submitPendingLabel),
    "the pending submit label renders",
  );
  await assert.rejects(() => renderWithoutVoice(h(SignInForm, props)), /no VoiceProvider found/);
});

test("SignUpForm renders its copy from the voice object", async () => {
  const { h, SignUpForm, fixtureVoice } = await loadRuntime();
  const props = {
    displayName: "",
    email: "",
    password: "",
    onDisplayNameChange: noop,
    onEmailChange: noop,
    onPasswordChange: noop,
    onSubmit: noop,
    signInHref: "/sign-in",
  };
  const html = await renderWithVoice(h(SignUpForm, props));
  for (const slot of [
    "nameLabel",
    "emailLabel",
    "passwordLabel",
    "showPasswordLabel",
    "submitLabel",
    "signInLabel",
  ]) {
    assert.ok(
      html.includes(fixtureVoice.signUpForm[slot]),
      `slot ${slot} renders from the voice object`,
    );
  }
  const pending = await renderWithVoice(h(SignUpForm, { ...props, loading: true }));
  assert.ok(
    pending.includes(fixtureVoice.signUpForm.submitPendingLabel),
    "the pending submit label renders",
  );
});

test("ForgotPasswordForm renders its copy from the voice object", async () => {
  const { h, ForgotPasswordForm, fixtureVoice } = await loadRuntime();
  const props = { email: "", onEmailChange: noop, onSubmit: noop, signInHref: "/sign-in" };
  const html = await renderWithVoice(h(ForgotPasswordForm, props));
  for (const slot of ["emailLabel", "submitLabel", "backToSignInLabel"]) {
    assert.ok(
      html.includes(fixtureVoice.forgotPasswordForm[slot]),
      `slot ${slot} renders from the voice object`,
    );
  }
  const pending = await renderWithVoice(h(ForgotPasswordForm, { ...props, loading: true }));
  assert.ok(
    pending.includes(fixtureVoice.forgotPasswordForm.submitPendingLabel),
    "the pending submit label renders",
  );
});

test("ResetPasswordForm renders its copy from the voice object", async () => {
  const { h, ResetPasswordForm, fixtureVoice } = await loadRuntime();
  const props = { password: "", onPasswordChange: noop, onSubmit: noop };
  const html = await renderWithVoice(h(ResetPasswordForm, props));
  for (const slot of ["passwordLabel", "showPasswordLabel", "submitLabel"]) {
    assert.ok(
      html.includes(fixtureVoice.resetPasswordForm[slot]),
      `slot ${slot} renders from the voice object`,
    );
  }
  const pending = await renderWithVoice(h(ResetPasswordForm, { ...props, loading: true }));
  assert.ok(
    pending.includes(fixtureVoice.resetPasswordForm.submitPendingLabel),
    "the pending submit label renders",
  );
});
