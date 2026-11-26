/**
 * Voice-slot contract for the utility pages (#539 tranche 3b;
 * #733 tranche 4b).
 *
 * Converted from source scans to runtime checks: each page is
 * SSR-rendered against the built output under a voice whose
 * tested slots carry sentinel strings, in the state that
 * renders each slot, and the rendered output is asserted to
 * carry the sentinels — so FeedbackPage's title, hint,
 * submitted thanks, field labels and placeholders, bug
 * checkbox, and submit actions; ConsentPreferencesPage's card
 * title, description / hint defaults, current-choice line, and
 * action labels; and RouteErrorPage's per-variant title /
 * message defaults and home-link label provably come from the
 * app-supplied voice object, not from strings baked into the
 * page (the DS ships no default strings). Caller-passed props
 * still win over the voice defaults on ConsentPreferencesPage
 * and RouteErrorPage.
 *
 * Deleted in the conversion (not runtime-observable):
 * AuthConfirmationPage's prop-type source pins (`title: string`,
 * `body: string`, `backLabel?: string`) — type forms are
 * enforced by the TypeScript build, not a test (Stephen,
 * 2026-11-20: types need no dedicated tests). The page's
 * runtime contract — it renders exactly the caller-supplied
 * title, body, and back label — is asserted by rendering it.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both). Page modules are
 * imported individually from dist/pages — the pages barrel also
 * exports pages that import react-native directly, which plain
 * Node cannot load.
 */
import "../../../test/registerSvgStub.js";
import { loadInternalDist } from "../../../test/internalDist.js";
import assert from "node:assert/strict";
import { test } from "node:test";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const { createElement: h } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const pages: Record<string, any> = {};
    for (const name of [
      "eciperay/FeedbackPage",
      "eciperay/ConsentPreferencesPage",
      "eciperay/RouteErrorPage",
      "eciperay/AuthConfirmationPage",
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

const noop = () => {};

const feedbackSentinels = {
  title: "SENT feedback title",
  description: "SENT feedback description",
  submittedMessage: "SENT submitted message",
  messageLabel: "SENT message label",
  messagePlaceholder: "SENT message placeholder",
  replyEmailLabel: "SENT reply email label",
  replyEmailPlaceholder: "SENT reply email placeholder",
  bugLabel: "SENT bug label",
  submitLabel: "SENT submit label",
  submitPendingLabel: "SENT submit pending label",
};

const feedbackBase = {
  message: "",
  onMessageChange: noop,
  replyEmail: "",
  onReplyEmailChange: noop,
  isBug: false,
  onIsBugChange: noop,
  onSubmit: noop,
};

test("FeedbackPage renders its copy from the voice object", async () => {
  const { h, FeedbackPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "feedbackPage", feedbackSentinels);
  const html = await renderWithVoice(h(FeedbackPage, feedbackBase), voice);
  for (const slot of [
    "title",
    "description",
    "messageLabel",
    "messagePlaceholder",
    "replyEmailLabel",
    "replyEmailPlaceholder",
    "bugLabel",
    "submitLabel",
  ] as const) {
    assert.ok(html.includes(feedbackSentinels[slot]), `slot ${slot} renders from the voice object`);
  }
});

test("FeedbackPage renders its submitted thanks and pending submit label from the voice object", async () => {
  const { h, FeedbackPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "feedbackPage", feedbackSentinels);
  const submitted = await renderWithVoice(
    h(FeedbackPage, { ...feedbackBase, submitted: true }),
    voice,
  );
  assert.ok(
    submitted.includes(feedbackSentinels.submittedMessage),
    "the submitted thanks renders from the voice object",
  );
  const pending = await renderWithVoice(
    h(FeedbackPage, { ...feedbackBase, submitting: true }),
    voice,
  );
  assert.ok(
    pending.includes(feedbackSentinels.submitPendingLabel),
    "the pending submit label renders from the voice object",
  );
});

test("FeedbackPage renders its cancel label from the shared voice slot, with the prop winning", async () => {
  const { h, FeedbackPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "common", { cancelLabel: "SENT cancel label" });
  const withCancel = await renderWithVoice(
    h(FeedbackPage, { ...feedbackBase, onCancel: noop }),
    voice,
  );
  assert.ok(
    withCancel.includes("SENT cancel label"),
    "the cancel label renders from voice.common.cancelLabel when onCancel is supplied",
  );
  const caller = await renderWithVoice(
    h(FeedbackPage, { ...feedbackBase, onCancel: noop, cancelLabel: "Caller cancel" }),
    voice,
  );
  assert.ok(caller.includes("Caller cancel"), "a caller cancelLabel wins over the voice default");
  assert.ok(!caller.includes("SENT cancel label"), "the voice cancel label is not used");
  const withoutCancel = await renderWithVoice(h(FeedbackPage, feedbackBase), voice);
  assert.ok(
    !withoutCancel.includes("SENT cancel label"),
    "no cancel control renders when no onCancel handler is supplied",
  );
});

const consentSentinels = {
  title: "SENT consent title",
  description: "SENT consent description",
  hint: "SENT consent hint",
  currentChoiceLabel: "SENT current choice:",
  acceptedLabel: "SENT accepted",
  declinedLabel: "SENT declined",
  notSetLabel: "SENT not set",
  acceptLabel: "SENT accept",
  declineLabel: "SENT decline",
  withdrawLabel: "SENT withdraw",
};

const consentBase = { onAccept: noop, onDecline: noop, onWithdraw: noop };

test("ConsentPreferencesPage renders its copy and defaults from the voice object", async () => {
  const { h, ConsentPreferencesPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "consentPreferencesPage", consentSentinels);
  const notSet = await renderWithVoice(
    h(ConsentPreferencesPage, { ...consentBase, currentChoice: null }),
    voice,
  );
  for (const slot of [
    "title",
    "description",
    "hint",
    "currentChoiceLabel",
    "notSetLabel",
    "acceptLabel",
    "declineLabel",
    "withdrawLabel",
  ] as const) {
    assert.ok(
      notSet.includes(consentSentinels[slot]),
      `slot ${slot} renders from the voice object`,
    );
  }
  const accepted = await renderWithVoice(
    h(ConsentPreferencesPage, { ...consentBase, currentChoice: "accepted" }),
    voice,
  );
  assert.ok(
    accepted.includes(consentSentinels.acceptedLabel),
    "the accepted choice label renders from the voice object",
  );
  const declined = await renderWithVoice(
    h(ConsentPreferencesPage, { ...consentBase, currentChoice: "declined" }),
    voice,
  );
  assert.ok(
    declined.includes(consentSentinels.declinedLabel),
    "the declined choice label renders from the voice object",
  );
  const caller = await renderWithVoice(
    h(ConsentPreferencesPage, {
      ...consentBase,
      currentChoice: null,
      description: "Caller description",
      hint: "Caller hint",
    }),
    voice,
  );
  assert.ok(caller.includes("Caller description"), "a caller description wins over the voice");
  assert.ok(caller.includes("Caller hint"), "a caller hint wins over the voice");
  assert.ok(!caller.includes(consentSentinels.description), "the voice description is not used");
});

const routeErrorSentinels = {
  notFoundTitle: "SENT not-found title",
  notFoundMessage: "SENT not-found message",
  errorTitle: "SENT error title",
  errorMessage: "SENT error message",
  homeLabel: "SENT home label",
};

test("RouteErrorPage renders its defaults from the voice object", async () => {
  const { h, RouteErrorPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "routeErrorPage", routeErrorSentinels);
  const notFound = await renderWithVoice(h(RouteErrorPage, { variant: "notFound" }), voice);
  assert.ok(
    notFound.includes(routeErrorSentinels.notFoundTitle),
    "the not-found title renders from the voice object",
  );
  assert.ok(
    notFound.includes(routeErrorSentinels.notFoundMessage),
    "the not-found message renders from the voice object",
  );
  assert.ok(
    notFound.includes(routeErrorSentinels.homeLabel),
    "the home-link label renders from the voice object",
  );
  const error = await renderWithVoice(h(RouteErrorPage, { variant: "error" }), voice);
  assert.ok(
    error.includes(routeErrorSentinels.errorTitle),
    "the error title renders from the voice object",
  );
  assert.ok(
    error.includes(routeErrorSentinels.errorMessage),
    "the error message renders from the voice object",
  );
  const caller = await renderWithVoice(
    h(RouteErrorPage, {
      variant: "error",
      title: "Caller title",
      message: "Caller message",
      homeLabel: "Caller home",
    }),
    voice,
  );
  assert.ok(caller.includes("Caller title"), "a caller title wins over the voice default");
  assert.ok(caller.includes("Caller message"), "a caller message wins over the voice default");
  assert.ok(caller.includes("Caller home"), "a caller home label wins over the voice default");
  assert.ok(!caller.includes(routeErrorSentinels.errorTitle), "the voice title is not used");
});

test("AuthConfirmationPage renders only caller-supplied copy — no voice slots", async () => {
  const { h, AuthConfirmationPage, fixtureVoice } = await loadRuntime();
  const html = await renderWithVoice(
    h(AuthConfirmationPage, {
      title: "Caller confirmation title",
      body: "Caller confirmation body",
      backLabel: "Caller back label",
      backHref: "/back",
    }),
    fixtureVoice,
  );
  assert.ok(html.includes("Caller confirmation title"), "the caller title renders");
  assert.ok(html.includes("Caller confirmation body"), "the caller body renders");
  assert.ok(html.includes("Caller back label"), "the caller back label renders");
});
