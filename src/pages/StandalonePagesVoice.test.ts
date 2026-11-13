/**
 * Voice-slot pins for the standalone pages (#539 tranche 3c):
 * PayPage's per-status titles and bodies, opening spinner
 * label and message, retry actions, and home-button default;
 * AddRecipeMenuPage's title; ManualEntryPage's heading; and
 * LegalDocumentPage's last-updated line all come from the
 * app-supplied voice object — the DS ships no default
 * strings. Caller-passed props still win over the voice
 * default on PayPage's home label.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const strip = (text: string) =>
  text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
const read = (name: string) => strip(readFileSync(join(here, `${name}.tsx`), "utf8"));

test("PayPage reads its copy from the voice object", () => {
  const page = read("PayPage");
  assert.match(page, /useVoice\(\)/);
  for (const slot of [
    "title",
    "needsTransactionTitle",
    "unconfiguredBody",
    "needsTransactionBody",
    "openingLabel",
    "openingMessage",
    "closedBody",
    "errorBody",
    "homeLabel",
    "reopenLabel",
    "retryLabel",
  ]) {
    assert.match(page, new RegExp(`voice\\.payPage\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    page,
    /"Complete your purchase"|"Checkout isn't configured|"Checkout"|"Opening the secure payment window"|"Reopen checkout"|"Try again"|"Go to home"/,
  );
});

test("AddRecipeMenuPage reads its title from the voice object", () => {
  const page = read("AddRecipeMenuPage");
  assert.match(page, /useVoice\(\)/);
  assert.match(page, /voice\.addRecipeMenuPage\.title/);
  assert.doesNotMatch(page, /Add Recipe/);
});

test("ManualEntryPage reads its heading from the voice object", () => {
  const page = read("ManualEntryPage");
  assert.match(page, /useVoice\(\)/);
  assert.match(page, /voice\.manualEntryPage\.heading/);
  assert.doesNotMatch(page, /Manual Entry/);
});

test("LegalDocumentPage reads its last-updated line from the voice object", () => {
  const page = read("LegalDocumentPage");
  assert.match(page, /useVoice\(\)/);
  assert.match(page, /voice\.legalDocumentPage\.lastUpdatedLabel\(lastUpdated\)/);
  assert.doesNotMatch(page, /Last updated:/);
});
