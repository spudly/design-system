/**
 * Voice core contract tests (#539 tranche 1; #733 tranche 4a).
 *
 * Converted from source scans to runtime checks: the voice system
 * is exercised against the built output — the provider and hook
 * ship in the built package, reading the voice with no provider
 * throws at render time, a provider supplies exactly the object it
 * was given (the DS ships no defaults), and the pseudo-locale
 * fixture transforms the fixture voice's slots.
 *
 * Deleted in the conversion (not runtime-observable here):
 * - The Storybook-preview source scan (both previews wrapping
 *   stories in the provider): preview wiring lives outside the
 *   built package; a dropped wrap surfaces as this file's own
 *   fail-fast throw in any story that reads the voice.
 * - The type-alias source scan: `Voice` / `VoiceProviderProps`
 *   being type aliases is a code-style rule enforced by the
 *   TypeScript build and lint, not a test (Stephen, 2026-11-20:
 *   types need no dedicated tests).
 *
 * Runtime assertions run against the built output: `npm run build`
 * first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const dist: Record<string, any> = await loadInternalDist();
    const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
    const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
    return { React, renderToString, ...dist, ...voiceModule, ...voiceFixtures };
  })();
  return runtimePromise;
}

test("Voice system is exported from the package root", async () => {
  const { VoiceProvider, useVoice } = await loadRuntime();
  assert.equal(typeof VoiceProvider, "function");
  assert.equal(typeof useVoice, "function");
});

test("useVoice fails fast with no provider (no silent defaults)", async () => {
  const { React, renderToString, useVoice } = await loadRuntime();
  function Probe() {
    const voice = useVoice();
    return React.createElement("span", null, voice.common.cancelLabel);
  }
  assert.throws(() => renderToString(React.createElement(Probe)), /no VoiceProvider found/);
});

test("VoiceProvider supplies exactly the voice object it is given", async () => {
  const { React, renderToString, VoiceProvider, useVoice, fixtureVoice } = await loadRuntime();
  function Probe() {
    const voice = useVoice();
    return React.createElement("span", null, voice.common.cancelLabel);
  }
  const html = renderToString(
    React.createElement(VoiceProvider, { voice: fixtureVoice }, React.createElement(Probe)),
  );
  assert.match(html, new RegExp(fixtureVoice.common.cancelLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("the pseudo-locale fixture transforms the fixture voice's slots", async () => {
  const { fixtureVoice, fixtureVoicePseudoLocale } = await loadRuntime();
  assert.ok(fixtureVoice);
  assert.ok(fixtureVoicePseudoLocale);
  assert.notEqual(fixtureVoicePseudoLocale.common.cancelLabel, fixtureVoice.common.cancelLabel);
  assert.match(fixtureVoicePseudoLocale.common.cancelLabel, /⟦/);
  assert.notEqual(fixtureVoicePseudoLocale.common.saveLabel, fixtureVoice.common.saveLabel);
  assert.match(fixtureVoicePseudoLocale.common.saveLabel, /⟦/);
});
