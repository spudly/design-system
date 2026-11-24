/**
 * No-new-hard-coded-copy guardrail (#539 tranche 4; #733
 * tranche 4b).
 *
 * Converted in part from a source scan to runtime checks: the
 * original test inventoried JSX text and copy-attribute
 * literals across src/pages, src/views and src/widgets by
 * reading every .tsx source file, and failed on any literal
 * not in hardCodedCopyBaseline.json. That inventory has no
 * runtime equivalent — whether a string exists in source that
 * never reaches a render is not observable from the built
 * output — so the runtime contract that CAN be checked is
 * asserted here instead: representative voice-driven surfaces
 * are SSR-rendered under a voice whose slots carry sentinel
 * strings, and the rendered output must carry the sentinels
 * and must NOT carry the fixture voice's strings for those
 * slots (a hard-coded copy string would render in place of
 * the sentinel). The per-surface sentinel coverage lives in
 * the converted *Voice.test.ts files; this file keeps a
 * cross-surface smoke of the same contract.
 *
 * Deleted in the conversion:
 * - The source inventory scan itself (and its walk of
 *   src/pages, src/views, src/widgets): not runtime-observable,
 *   per above. The standing guard against NEW hard-coded copy
 *   is the eslint-config jsx-no-literals rule tracked in the
 *   original tranche (#42), not a test that reads source.
 * - The scanner regression tests (copy beside/between
 *   expressions, copy carrying parens or a semicolon, attribute
 *   forms): they pinned the deleted scanner's internal
 *   extraction helpers — implementation detail with no
 *   behavior left to protect once the scanner is gone.
 *
 * Kept as-is (legitimate data read, #733 audit LEGIT class):
 * the baseline file's own hygiene check — hardCodedCopyBaseline.json
 * is a JSON data file, not JS/TS source, and its sorted,
 * duplicate-free shape keeps any deliberate baseline update
 * reviewable while the file remains in the repo.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const baselinePath = join(here, "hardCodedCopyBaseline.json");

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const { createElement: h } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const pages: Record<string, any> = {};
    for (const name of ["SignInPage", "FeedbackPage"]) {
      Object.assign(pages, await import(`../../dist/pages/${name}.js`));
    }
    const { VoiceProvider }: Record<string, any> = await import("../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../dist/voice/fixtures.js");
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

test("rendered surfaces carry the supplied voice's copy, not hard-coded copy", async () => {
  const { h, SignInPage, FeedbackPage, Alert, fixtureVoice } = await loadRuntime();
  const voice = {
    ...fixtureVoice,
    signInPage: { heading: "SENT sign-in heading" },
    feedbackPage: { ...fixtureVoice.feedbackPage, title: "SENT feedback title" },
    alert: { dismissLabel: "SENT alert dismiss" },
  };
  const signIn = await renderWithVoice(
    h(SignInPage, {
      email: "",
      password: "",
      onEmailChange: noop,
      onPasswordChange: noop,
      onSubmit: noop,
    }),
    voice,
  );
  assert.ok(signIn.includes("SENT sign-in heading"), "the sign-in heading is the supplied copy");
  assert.ok(
    !signIn.includes(fixtureVoice.signInPage.heading),
    "no hard-coded sign-in heading renders",
  );
  const feedback = await renderWithVoice(
    h(FeedbackPage, {
      message: "",
      onMessageChange: noop,
      replyEmail: "",
      onReplyEmailChange: noop,
      isBug: false,
      onIsBugChange: noop,
      onSubmit: noop,
    }),
    voice,
  );
  assert.ok(feedback.includes("SENT feedback title"), "the feedback title is the supplied copy");
  assert.ok(!feedback.includes(`>${fixtureVoice.feedbackPage.title}<`), "no hard-coded title");
  const alert = await renderWithVoice(
    h(Alert, { severity: "info", message: "Caller message", dismissible: true, onDismiss: noop }),
    voice,
  );
  assert.ok(alert.includes("SENT alert dismiss"), "the alert dismiss name is the supplied copy");
  assert.ok(!alert.includes(fixtureVoice.alert.dismissLabel), "no hard-coded dismiss name renders");
});

test("the baseline inventory is sorted and duplicate-free (keeps diffs reviewable)", () => {
  const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as string[];
  assert.deepEqual(baseline, [...new Set(baseline)].sort());
});
