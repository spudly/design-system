/**
 * Voice-slot contract for the auth pages (#539 tranche 3a;
 * #733 tranche 4b).
 *
 * Converted from source scans to runtime checks: each page is
 * SSR-rendered against the built output under a voice whose
 * tested slots carry sentinel strings, and the rendered output
 * is asserted to carry the sentinels — so the headings and
 * intro lines provably come from the app-supplied voice object,
 * not from strings baked into the page (the DS ships no default
 * strings). Nothing was deleted in this conversion: every
 * source pin (the `useVoice()` call, each slot read, and the
 * absence of the old English literals) is covered by the
 * sentinel renders — a hard-coded literal would render instead
 * of the sentinel and fail the test.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both). Page modules are
 * imported individually from dist/pages — the pages barrel also
 * exports pages that import react-native directly, which plain
 * Node cannot load.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const { createElement: h } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const pages: Record<string, any> = {};
    for (const name of [
      "eciperay/SignInPage",
      "eciperay/SignUpPage",
      "eciperay/ForgotPasswordPage",
      "eciperay/ResetPasswordPage",
    ]) {
      Object.assign(pages, await import(`../../../dist/pages/${name}.js`));
    }
    const { VoiceProvider }: Record<string, any> = await import("../../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../../dist/voice/fixtures.js");
    return {
      h,
      renderToString,
      TamaguiProvider,
      VoiceProvider,
      fixtureVoice,
      ...distRuntime,
      ...pages,
    };
  })();
  return runtimePromise;
}

/** The fixture voice with one section's slots replaced by sentinels. */
function sentinelVoice(fixtureVoice: any, section: string, overrides: Record<string, any>) {
  return { ...fixtureVoice, [section]: { ...fixtureVoice[section], ...overrides } };
}

async function renderWithVoice(element: any, voice: any): Promise<string> {
  const { h, renderToString, TamaguiProvider, VoiceProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    h(TamaguiProvider, { config, defaultTheme: "light" }, h(VoiceProvider, { voice }, element)),
  );
  return html.replaceAll("&#x27;", "'");
}

const noop = () => { /* noop */ };

test("SignInPage renders its heading from the voice object", async () => {
  const { h, SignInPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "signInPage", { heading: "SENT sign-in heading" });
  const html = await renderWithVoice(
    h(SignInPage, {
      email: "",
      password: "",
      onEmailChange: noop,
      onPasswordChange: noop,
      onSubmit: noop,
    }),
    voice,
  );
  assert.ok(html.includes("SENT sign-in heading"), "the heading renders from the voice object");
  assert.ok(!html.includes(fixtureVoice.signInPage.heading), "no hard-coded heading renders");
});

test("SignUpPage renders its heading from the voice object", async () => {
  const { h, SignUpPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "signUpPage", { heading: "SENT sign-up heading" });
  const html = await renderWithVoice(
    h(SignUpPage, {
      displayName: "",
      email: "",
      password: "",
      onDisplayNameChange: noop,
      onEmailChange: noop,
      onPasswordChange: noop,
      onSubmit: noop,
    }),
    voice,
  );
  assert.ok(html.includes("SENT sign-up heading"), "the heading renders from the voice object");
  assert.ok(!html.includes(fixtureVoice.signUpPage.heading), "no hard-coded heading renders");
});

test("ForgotPasswordPage renders its heading and description from the voice object", async () => {
  const { h, ForgotPasswordPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "forgotPasswordPage", {
    heading: "SENT forgot heading",
    description: "SENT forgot description",
  });
  const html = await renderWithVoice(
    h(ForgotPasswordPage, { email: "", onEmailChange: noop, onSubmit: noop }),
    voice,
  );
  assert.ok(html.includes("SENT forgot heading"), "the heading renders from the voice object");
  assert.ok(
    html.includes("SENT forgot description"),
    "the description renders from the voice object",
  );
});

test("ResetPasswordPage renders its heading and description from the voice object", async () => {
  const { h, ResetPasswordPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "resetPasswordPage", {
    heading: "SENT reset heading",
    description: "SENT reset description",
  });
  const html = await renderWithVoice(
    h(ResetPasswordPage, { password: "", onPasswordChange: noop, onSubmit: noop }),
    voice,
  );
  assert.ok(html.includes("SENT reset heading"), "the heading renders from the voice object");
  assert.ok(
    html.includes("SENT reset description"),
    "the description renders from the voice object",
  );
});
