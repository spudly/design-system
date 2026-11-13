/**
 * En-XA pseudo-locale pass (#539 tranche 4 — the final tranche).
 *
 * The plan's acceptance test: representative surfaces rendered
 * under the pseudo-locale fixture voice must show transformed
 * output for every shared string that arrives through the voice
 * object, and none of those strings may survive untransformed.
 * A string that renders in plain en-US under the en-XA voice is
 * a string that bypassed the voice system — exactly the rot the
 * pseudo-locale exists to catch.
 *
 * Surfaces: LegalDocumentPage (a page; its last-updated line is
 * a voice formatter slot) and RatingsCard (a widget; its section
 * labels and empty-state line are plain voice string slots).
 * Page-unique content arriving as props (the legal document's
 * own title/sections) is host data and is NOT expected to
 * transform — only voice-supplied strings are pinned.
 *
 * Rendering follows the repo's SSR pattern (LegalDocumentPage /
 * RatingsCard contract tests): lazy runtime imports from the
 * built dist so the file still loads when dist is missing.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
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
    const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
    const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
    const pagesFixtures: Record<string, any> = await import("../../dist/pages/fixtures.js");
    const { LegalDocumentPage }: Record<string, any> =
      await import("../../dist/pages/LegalDocumentPage.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      ...voiceFixtures,
      ...voiceModule,
      ...pagesFixtures,
      LegalDocumentPage,
    };
  })();
  return runtimePromise;
}

async function renderWithVoice(element: any, voice: any) {
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, VoiceProvider } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      <VoiceProvider voice={voice}>{element}</VoiceProvider>
    </TamaguiProvider>,
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

test("en-XA: RatingsCard renders its voice labels pseudo-localized, none in plain en-US", async () => {
  const { RatingsCard, fixtureVoice, fixtureVoicePseudoLocale } = await loadRuntime();
  // A viewer rating must be present: RatingsCard renders the
  // yourRatingLabel slot only when ratings.viewer is truthy.
  const card = (
    <RatingsCard
      ratings={{ community: null, viewer: { value: 4, isPending: false } }}
      onViewerRatingChange={undefined}
    />
  );
  const plain = await renderWithVoice(card, fixtureVoice);
  const pseudo = await renderWithVoice(card, fixtureVoicePseudoLocale);
  for (const slot of [
    fixtureVoice.ratingsCard.communityRatingLabel,
    fixtureVoice.ratingsCard.noCommunityRatingsLabel,
    fixtureVoice.ratingsCard.yourRatingLabel,
  ]) {
    assert.ok(plain.includes(slot), `plain render carries the voice slot "${slot}"`);
    assert.ok(!pseudo.includes(slot), `en-XA render must not leave "${slot}" untransformed`);
  }
  assert.match(pseudo, /⟦/, "en-XA render carries the pseudo-locale markers");
  assert.ok(
    pseudo.includes(fixtureVoicePseudoLocale.ratingsCard.noCommunityRatingsLabel),
    "en-XA render carries the transformed empty-state line",
  );
});

test("en-XA: LegalDocumentPage renders its voice formatter output pseudo-localized", async () => {
  const { LegalDocumentPage, legalPrivacyFixture, fixtureVoice, fixtureVoicePseudoLocale } =
    await loadRuntime();
  const page = <LegalDocumentPage {...legalPrivacyFixture} />;
  const plain = await renderWithVoice(page, fixtureVoice);
  const pseudo = await renderWithVoice(page, fixtureVoicePseudoLocale);
  const plainLine = fixtureVoice.legalDocumentPage.lastUpdatedLabel(legalPrivacyFixture.lastUpdated);
  const pseudoLine = fixtureVoicePseudoLocale.legalDocumentPage.lastUpdatedLabel(
    legalPrivacyFixture.lastUpdated,
  );
  assert.ok(plain.includes("Last updated:"), "plain render carries the last-updated line");
  assert.ok(plain.includes(plainLine), "plain render carries the formatter output");
  assert.ok(!pseudo.includes(plainLine), "en-XA render must not leave the formatter output plain");
  assert.ok(pseudo.includes(pseudoLine), "en-XA render carries the transformed formatter output");
  assert.match(pseudo, /⟦/, "en-XA render carries the pseudo-locale markers");
});
