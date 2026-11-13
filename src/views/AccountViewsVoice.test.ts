/**
 * Voice-slot pins for the account / profile views (#539 tranche 2b):
 * AccessTokensPanel's own chrome, and AccountDataView's,
 * FeedbackPreferenceView's, SubscriptionView's, and
 * TransferRecipesView's prop defaults come from the app-supplied
 * voice object — the DS ships no default strings. Caller-passed
 * props still win over the voice defaults. AccessTokensPanel's
 * loading dummy rows are the exception: their values never render
 * (a loading TokenRow renders bones only), so they stay inert
 * placeholders, as in earlier tranches.
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

test("AccessTokensPanel reads its chrome from the voice object", () => {
  const view = read("AccessTokensPanel");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "title",
    "infoText",
    "createdSecretTitle",
    "createdSecretHint",
    "doneLabel",
    "tokenNameLabel",
    "tokenNamePlaceholder",
    "createLabel",
    "emptyMessage",
  ]) {
    assert.match(view, new RegExp(`voice\\.accessTokensPanel\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"API access tokens"|"Personal access tokens let apps and scripts use the Eciperay API"|"Copy your new token now|"Long-press the token to copy it\."|"Token name"|"e\.g\. Claude Desktop"|"Create token"|"No tokens yet\."|>\s*Done\s*</,
  );
});

test("AccountDataView reads its defaults from the voice object", () => {
  const view = read("AccountDataView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "title",
    "description",
    "exportLabel",
    "exportPendingLabel",
    "deleteLabel",
    "deletePendingLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.accountDataView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Your data"|"Download a copy of your recipes and account data, or delete your account\."|"Download my data"|"Preparing…"|"Delete account"|"Deleting…"/,
  );
});

test("FeedbackPreferenceView reads its defaults from the voice object", () => {
  const view = read("FeedbackPreferenceView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "title",
    "shortcutLabel",
    "shortcutDescription",
    "consentPromptText",
    "acceptLabel",
    "declineLabel",
    "withdrawLabel",
    "choicesHintBefore",
    "choicesLinkLabel",
  ]) {
    assert.match(
      view,
      new RegExp(`voice\\.feedbackPreferenceView\\.${slot}`),
      `slot ${slot} is read`,
    );
  }
  assert.doesNotMatch(
    view,
    /"Preferences"|"Show feedback shortcut"|"Adds a floating shortcut for sending feedback from anywhere in the app\."|"Share anonymous usage analytics to help improve the app\? You can change this any time\."|"Accept"|"Decline"|"Withdraw consent"|"Manage your choice at any time on the "|"privacy choices page"/,
  );
});

test("SubscriptionView reads its defaults from the voice object", () => {
  const view = read("SubscriptionView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of [
    "title",
    "manageLabel",
    "managePendingLabel",
    "refreshLabel",
    "refreshPendingLabel",
    "portalLabel",
  ]) {
    assert.match(view, new RegExp(`voice\\.subscriptionView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Subscription"|"Manage subscription"|"Opening…"|"Check again"|"Checking…"|"Open subscription portal"/,
  );
});

test("TransferRecipesView reads its defaults from the voice object", () => {
  const view = read("TransferRecipesView");
  assert.match(view, /useVoice\(\)/);
  for (const slot of ["title", "hint", "importLabel", "importPendingLabel"]) {
    assert.match(view, new RegExp(`voice\\.transferRecipesView\\.${slot}`), `slot ${slot} is read`);
  }
  assert.doesNotMatch(
    view,
    /"Transfer recipes"|"Export recipes to a file you can keep, or import recipes from a file\."|"Import recipes"|"Importing…"/,
  );
});
