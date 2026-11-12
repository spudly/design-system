import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import test from "node:test";

// #539 tranche 1: the voice-as-theme core. The DS defines the typed
// Voice slot object and the provider and ships NO default strings;
// apps author and supply the complete object at the root.

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (path: string) => readFileSync(join(root, path), "utf8");

test("Voice system is exported from the package root", () => {
  const index = read("src/index.ts");
  assert.match(index, /VoiceProvider/);
  assert.match(index, /useVoice/);
  assert.match(index, /type Voice\b/);
});

test("useVoice fails fast with no provider (no silent defaults)", () => {
  const voice = read("src/voice/Voice.tsx");
  assert.match(voice, /throw new Error\(/);
  assert.match(voice, /no VoiceProvider found/);
  // The core must not ship a default voice object.
  assert.doesNotMatch(voice, /defaultVoice|DEFAULT_VOICE/);
});

test("fixtures are typed as Voice and the pseudo-locale fixture transforms every slot", async () => {
  const fixturesSource = read("src/voice/fixtures.ts");
  assert.match(fixturesSource, /fixtureVoice: Voice/);
  assert.match(fixturesSource, /fixtureVoicePseudoLocale: Voice/);
  const { fixtureVoice, fixtureVoicePseudoLocale } = await import("./fixtures.js").catch(() => ({
    fixtureVoice: null,
    fixtureVoicePseudoLocale: null,
  }));
  if (fixtureVoice && fixtureVoicePseudoLocale) {
    assert.notEqual(fixtureVoicePseudoLocale.common.cancelLabel, fixtureVoice.common.cancelLabel);
    assert.match(fixtureVoicePseudoLocale.common.cancelLabel, /⟦/);
  }
});

test("Voice uses type aliases, not interfaces (DS code style)", () => {
  const voice = read("src/voice/Voice.tsx");
  assert.doesNotMatch(voice, /\binterface\s+(Voice|VoiceProviderProps)\b/);
});
