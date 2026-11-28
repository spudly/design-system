/**
 * Voice-slot contract for the standalone pages (#539 tranche
 * 3c; #733 tranche 4b).
 *
 * Converted from source scans to runtime checks: each page is
 * SSR-rendered against the built output under a voice whose
 * tested slots carry sentinel strings, in the state that
 * renders each slot, and the rendered output is asserted to
 * carry the sentinels — so PayPage's per-status titles and
 * bodies, opening label and message, retry actions, and
 * home-button default; AddRecipeMenuPage's title;
 * ManualEntryPage's heading; and LegalDocumentPage's
 * last-updated line provably come from the app-supplied voice
 * object, not from strings baked into the page (the DS ships
 * no default strings). Caller-passed props still win over the
 * voice default on PayPage's home label. Nothing was deleted
 * in this conversion: a hard-coded literal would render
 * instead of the sentinel and fail the test.
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
      "eciperay/PayPage",
      "eciperay/AddRecipeMenuPage",
      "eciperay/ManualEntryPage",
      "eciperay/LegalDocumentPage",
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

const paySentinels = {
  title: "SENT pay title",
  needsTransactionTitle: "SENT needs-transaction title",
  unconfiguredBody: "SENT unconfigured body",
  needsTransactionBody: "SENT needs-transaction body",
  openingLabel: "SENT opening label",
  openingMessage: "SENT opening message",
  closedBody: "SENT closed body",
  errorBody: "SENT error body",
  homeLabel: "SENT home label",
  reopenLabel: "SENT reopen label",
  retryLabel: "SENT retry label",
};

test("PayPage renders its unconfigured copy from the voice object", async () => {
  const { h, PayPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "payPage", paySentinels);
  const html = await renderWithVoice(h(PayPage, { status: "unconfigured" }), voice);
  assert.ok(html.includes(paySentinels.title), "the title renders from the voice object");
  assert.ok(
    html.includes(paySentinels.unconfiguredBody),
    "the unconfigured body renders from the voice object",
  );
});

test("PayPage renders its needs-transaction copy and home default from the voice object", async () => {
  const { h, PayPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "payPage", paySentinels);
  const html = await renderWithVoice(
    h(PayPage, { status: "needs-transaction", homeHref: "/home" }),
    voice,
  );
  assert.ok(
    html.includes(paySentinels.needsTransactionTitle),
    "the needs-transaction title renders from the voice object",
  );
  assert.ok(
    html.includes(paySentinels.needsTransactionBody),
    "the needs-transaction body renders from the voice object",
  );
  assert.ok(
    html.includes(paySentinels.homeLabel),
    "the home-button default renders from the voice object",
  );
  const caller = await renderWithVoice(
    h(PayPage, { status: "needs-transaction", homeHref: "/home", homeLabel: "Caller home" }),
    voice,
  );
  assert.ok(caller.includes("Caller home"), "a caller-passed home label wins over the voice");
  assert.ok(!caller.includes(paySentinels.homeLabel), "the voice home default is not used");
});

test("PayPage renders its opening label and message from the voice object", async () => {
  const { h, PayPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "payPage", paySentinels);
  const html = await renderWithVoice(h(PayPage, { status: "opening" }), voice);
  assert.ok(
    html.includes(paySentinels.openingLabel),
    "the opening spinner label renders from the voice object",
  );
  assert.ok(
    html.includes(paySentinels.openingMessage),
    "the opening message renders from the voice object",
  );
});

test("PayPage renders its closed and error copy and retry actions from the voice object", async () => {
  const { h, PayPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "payPage", paySentinels);
  const closed = await renderWithVoice(h(PayPage, { status: "closed", onRetryPress: noop }), voice);
  assert.ok(closed.includes(paySentinels.closedBody), "the closed body renders from the voice");
  assert.ok(
    closed.includes(paySentinels.reopenLabel),
    "the reopen action renders from the voice object",
  );
  const error = await renderWithVoice(h(PayPage, { status: "error", onRetryPress: noop }), voice);
  assert.ok(error.includes(paySentinels.errorBody), "the error body renders from the voice");
  assert.ok(error.includes(paySentinels.retryLabel), "the retry action renders from the voice");
});

test("AddRecipeMenuPage renders its title from the voice object", async () => {
  const { h, AddRecipeMenuPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "addRecipeMenuPage", { title: "SENT menu title" });
  const html = await renderWithVoice(h(AddRecipeMenuPage, { options: [] }), voice);
  assert.ok(html.includes("SENT menu title"), "the title renders from the voice object");
});

test("ManualEntryPage renders its heading from the voice object", async () => {
  const { h, ManualEntryPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "manualEntryPage", { heading: "SENT manual heading" });
  const html = await renderWithVoice(h(ManualEntryPage, null, "Caller child content"), voice);
  assert.ok(html.includes("SENT manual heading"), "the heading renders from the voice object");
  assert.ok(html.includes("Caller child content"), "the caller-supplied children still render");
});

test("LegalDocumentPage renders its last-updated line from the voice object", async () => {
  const { h, LegalDocumentPage, fixtureVoice } = await loadRuntime();
  const voice = sentinelVoice(fixtureVoice, "legalDocumentPage", {
    lastUpdatedLabel: (date: string) => `SENT updated ${date}`,
  });
  const html = await renderWithVoice(
    h(LegalDocumentPage, {
      title: "Terms",
      lastUpdated: "Jan 1, 2027",
      sections: [],
      brandLabel: "Brand",
      brandHref: "/",
      signInLabel: "Sign in",
      signInHref: "/sign-in",
    }),
    voice,
  );
  assert.ok(
    html.includes("SENT updated Jan 1, 2027"),
    "the last-updated line renders through the voice formatter",
  );
});
