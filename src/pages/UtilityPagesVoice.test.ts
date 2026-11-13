/**
 * Voice-slot pins for the utility pages (#539 tranche 3b):
 * FeedbackPage's title, hint, submitted thanks, field labels
 * and placeholders, bug checkbox, and submit action;
 * ConsentPreferencesPage's card title, description / hint
 * defaults, current-choice line, and action labels; and
 * RouteErrorPage's per-variant title / message defaults and
 * home-link label come from the app-supplied voice object —
 * the DS ships no default strings. Caller-passed props still
 * win over the voice defaults on ConsentPreferencesPage and
 * RouteErrorPage. AuthConfirmationPage is pinned as the
 * exception: its title, body, and back label are all
 * caller-supplied data with no hard-coded copy, so it reads
 * no voice slots.
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

test("FeedbackPage reads its copy from the voice object", () => {
  const page = read("FeedbackPage");
  assert.match(page, /useVoice\(\)/);
  for (const slot of [
    "title",
    "description",
    "submittedMessage",
    "messageLabel",
    "messagePlaceholder",
    "replyEmailLabel",
    "replyEmailPlaceholder",
    "bugLabel",
    "submitLabel",
    "submitPendingLabel",
  ]) {
    assert.match(page, new RegExp(`voice\\.feedbackPage\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    page,
    /"Feedback"|Share ideas, confusion|"What's on your mind\?"|"Tell us what happened|"Email me back \(optional\)"|"you@example\.com"|"This is a bug"|"Submit feedback"|"Submitting…"|"Thanks — we got your feedback\."/,
  );
});

test("ConsentPreferencesPage reads its copy and defaults from the voice object", () => {
  const page = read("ConsentPreferencesPage");
  assert.match(page, /useVoice\(\)/);
  for (const slot of [
    "title",
    "description",
    "hint",
    "currentChoiceLabel",
    "acceptedLabel",
    "declinedLabel",
    "notSetLabel",
    "acceptLabel",
    "declineLabel",
    "withdrawLabel",
  ]) {
    assert.match(
      page,
      new RegExp(`voice\\.consentPreferencesPage\\.${slot}`),
      `slot ${slot} is read`,
    );
  }
  assert.doesNotMatch(
    page,
    /"Privacy choices"|"Accepted"|"Declined"|"Not set"|"Accept"|"Decline"|"Withdraw"|Your current choice|privacy-respecting analytics|Withdrawing consent removes/,
  );
});

test("RouteErrorPage reads its defaults from the voice object", () => {
  const page = read("RouteErrorPage");
  assert.match(page, /useVoice\(\)/);
  for (const slot of [
    "notFoundTitle",
    "notFoundMessage",
    "errorTitle",
    "errorMessage",
    "homeLabel",
  ]) {
    assert.match(page, new RegExp(`voice\\.routeErrorPage\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    page,
    /"Page not found"|"Something went wrong"|"Go to the home page"|couldn't find that page|unexpected error occurred/,
  );
});

test("AuthConfirmationPage reads no voice slots — its title, body, and back label are caller-supplied", () => {
  const page = read("AuthConfirmationPage");
  assert.doesNotMatch(page, /useVoice/);
  assert.match(page, /title: string/);
  assert.match(page, /body: string/);
  assert.match(page, /backLabel\?: string/);
});
