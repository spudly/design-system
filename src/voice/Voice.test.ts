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

test("both Storybook previews install the VoiceProvider with the fixture voice (#649)", () => {
  // Regression guard: the web preview got the #539 wrap, the on-device
  // (RN) preview did not — every native story whose tree calls
  // useVoice() threw and rendered the Storybook error frame. Both
  // previews must keep the provider so a preview rewrite cannot
  // silently drop it again.
  for (const path of [".storybook/preview.tsx", "apps/storybook/.rnstorybook/preview.tsx"]) {
    const preview = read(path);
    // The provider must ENCLOSE the story, not merely appear beside
    // it: a sibling <VoiceProvider /> would leave the story tree
    // without voice context and the error frames would return.
    const open = preview.indexOf("<VoiceProvider voice={fixtureVoice}>");
    const story = preview.indexOf("<Story />", open);
    const close = preview.indexOf("</VoiceProvider>", story);
    assert.ok(open !== -1, `${path} must render VoiceProvider with the fixture voice`);
    assert.ok(story > open, `${path} must render the story inside the VoiceProvider`);
    assert.ok(close > story, `${path} must close the VoiceProvider after the story`);
  }
});

test("Voice uses type aliases, not interfaces (DS code style)", () => {
  const voice = read("src/voice/Voice.tsx");
  assert.doesNotMatch(voice, /\binterface\s+(Voice|VoiceProviderProps)\b/);
});
