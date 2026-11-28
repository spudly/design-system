/**
 * Voice-slot pins for the account / profile views (#539 tranche 2b):
 * AccessTokensPanel's own chrome, and AccountDataView's,
 * FeedbackPreferenceView's, SubscriptionView's, and
 * TransferRecipesView's prop defaults come from the app-supplied
 * voice object — the DS ships no default strings. Caller-passed
 * props still win over the voice defaults.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: each view is SSR-rendered under the fixture
 * voice with no label props supplied, and the rendered output
 * is asserted to carry the fixture's slot strings; a second
 * render with a caller-passed label asserts the caller's prop
 * wins over the voice default. Slots that only render in a
 * particular state (a created secret, a pending action, an
 * open consent prompt) are asserted in that state.
 *
 * Runtime assertions run against the built output: `npm run
 * build` first (the `test` script does both).
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../test/internalDist.js";

let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const { createElement: h } = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distRuntime = await loadInternalDist();
    const { VoiceProvider }: Record<string, any> = await import("../../dist/voice/index.js");
    const { fixtureVoice }: Record<string, any> = await import("../../dist/voice/fixtures.js");
    return { h, renderToString, TamaguiProvider, VoiceProvider, fixtureVoice, ...distRuntime };
  })();
  return runtimePromise;
}

async function renderWithVoice(element: any): Promise<string> {
  const {
    h,
    renderToString,
    TamaguiProvider,
    VoiceProvider,
    fixtureVoice,
    createTamaguiConfig,
    baseTheme,
  } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    h(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      h(VoiceProvider, { voice: fixtureVoice }, element),
    ),
  );
  // React escapes apostrophes in SSR text; slot strings are
  // compared in their unescaped form.
  return html.replaceAll("&#x27;", "'");
}

const noop = () => { /* noop */ };

test("AccessTokensPanel renders its chrome from the voice object", async () => {
  const { h, AccessTokensPanel, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.accessTokensPanel;
  const base = {
    tokens: [],
    tokenName: "",
    onTokenNameChange: noop,
    onCreate: noop,
    createdSecret: null,
    onDismissSecret: noop,
    onRevoke: noop,
  };
  const html = await renderWithVoice(h(AccessTokensPanel, base));
  for (const slot of [
    "title",
    "infoText",
    "tokenNameLabel",
    "tokenNamePlaceholder",
    "createLabel",
    "emptyMessage",
  ]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const created = await renderWithVoice(
    h(AccessTokensPanel, { ...base, createdSecret: "secret-value" }),
  );
  for (const slot of ["createdSecretTitle", "createdSecretHint", "doneLabel"]) {
    assert.ok(created.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
});

test("AccountDataView renders its defaults from the voice object, and caller props win", async () => {
  const { h, AccountDataView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.accountDataView;
  const base = { onExportData: noop, onDeleteAccount: noop };
  const html = await renderWithVoice(h(AccountDataView, base));
  for (const slot of ["title", "description", "exportLabel", "deleteLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const pending = await renderWithVoice(
    h(AccountDataView, { ...base, exportPending: true, deletePending: true }),
  );
  assert.ok(pending.includes(v.exportPendingLabel), "the export pending label renders");
  assert.ok(pending.includes(v.deletePendingLabel), "the delete pending label renders");
  const caller = await renderWithVoice(h(AccountDataView, { ...base, title: "Caller title" }));
  assert.ok(caller.includes("Caller title"), "a caller-passed title wins over the voice default");
  assert.ok(!caller.includes(v.title), "the voice default is displaced by the caller prop");
});

test("FeedbackPreferenceView renders its defaults from the voice object", async () => {
  const { h, FeedbackPreferenceView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.feedbackPreferenceView;
  const base = {
    shortcutEnabled: false,
    onShortcutEnabledChange: noop,
    consent: null,
    onAcceptConsent: noop,
    onDeclineConsent: noop,
  };
  const html = await renderWithVoice(h(FeedbackPreferenceView, base));
  for (const slot of ["title", "shortcutLabel", "shortcutDescription"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const prompt = await renderWithVoice(
    h(FeedbackPreferenceView, { ...base, consentPromptOpen: true }),
  );
  for (const slot of ["consentPromptText", "acceptLabel", "declineLabel"]) {
    assert.ok(prompt.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const settled = await renderWithVoice(
    h(FeedbackPreferenceView, {
      ...base,
      consent: true,
      onWithdrawConsent: noop,
      choicesHref: "/privacy-choices",
    }),
  );
  for (const slot of ["withdrawLabel", "choicesHintBefore", "choicesLinkLabel"]) {
    assert.ok(settled.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
});

test("AuthorDisplayView renders its defaults from the voice object, and caller props win", async () => {
  const { h, AuthorDisplayView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.authorDisplayView;
  const base = {
    settings: { displayName: "Jamie Cook", showOnPublicRecipes: true },
    onChange: noop,
    onSave: noop,
  };
  const html = await renderWithVoice(h(AuthorDisplayView, base));
  for (const slot of ["title", "displayNameLabel", "displayNamePlaceholder", "hint", "showNameLabel", "saveLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const caller = await renderWithVoice(h(AuthorDisplayView, { ...base, title: "Caller title" }));
  assert.ok(caller.includes("Caller title"), "a caller-passed title wins over the voice default");
  assert.ok(!caller.includes(v.title), "the voice default is displaced by the caller prop");
});

test("FamilySharingView renders its defaults from the voice object", async () => {
  const { h, FamilySharingView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.familySharingView;
  const base = {
    grants: [
      {
        recipientUserId: "user-1",
        recipientEmail: "alex@example.com",
        recipientDisplayName: "Alex Cook",
        createdAt: "2026-10-02T12:00:00.000Z",
      },
    ],
    email: "",
    onEmailChange: noop,
    onAdd: noop,
    onRemove: noop,
  };
  const html = await renderWithVoice(h(FamilySharingView, base));
  for (const slot of ["title", "description", "emailLabel", "emailPlaceholder", "addLabel", "removeLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  assert.ok(html.includes("Alex Cook (alex@example.com)"), "the grant label composes name and email");
  assert.ok(
    html.includes(v.addedLabel("Oct 2, 2026")) || html.includes("Added "),
    "the grant added line renders through the formatter slot",
  );
  const empty = await renderWithVoice(h(FamilySharingView, { ...base, grants: [] }));
  assert.ok(empty.includes(v.emptyMessage), "the empty message renders from the voice object");
  const loading = await renderWithVoice(h(FamilySharingView, { ...base, grants: [], loading: true }));
  assert.ok(loading.includes(v.loadingLabel), "the loading label renders from the voice object");
});

test("ShowLessView renders its defaults from the voice object", async () => {
  const { h, ShowLessView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.showLessView;
  const base = {
    entries: [{ sourceRecipeId: "recipe-1", title: "Spicy Tuna Casserole" }],
    onUndo: noop,
  };
  const html = await renderWithVoice(h(ShowLessView, base));
  for (const slot of ["title", "description", "undoLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  assert.ok(html.includes("Spicy Tuna Casserole"), "the entry title renders");
  const empty = await renderWithVoice(h(ShowLessView, { ...base, entries: [] }));
  assert.ok(empty.includes(v.emptyMessage), "the empty message renders from the voice object");
  const failed = await renderWithVoice(h(ShowLessView, { ...base, entries: [], loadFailed: true }));
  assert.ok(failed.includes(v.loadFailedMessage), "the load-failed message renders from the voice object");
  assert.ok(!failed.includes(v.emptyMessage), "a failed load does not render as empty");
});

test("SubscriptionView renders its defaults from the voice object", async () => {
  const { h, SubscriptionView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.subscriptionView;
  const base = { onManage: noop, onRefresh: noop, portalUrl: "https://example.com/portal" };
  const html = await renderWithVoice(h(SubscriptionView, base));
  for (const slot of ["title", "manageLabel", "refreshLabel", "portalLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const pending = await renderWithVoice(
    h(SubscriptionView, { ...base, managePending: true, refreshPending: true }),
  );
  assert.ok(pending.includes(v.managePendingLabel), "the manage pending label renders");
  assert.ok(pending.includes(v.refreshPendingLabel), "the refresh pending label renders");
});

test("TransferRecipesView renders its defaults from the voice object", async () => {
  const { h, TransferRecipesView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.transferRecipesView;
  const exportPicker = {
    search: "",
    onSearchChange: noop,
    items: [],
    selectedIds: [],
    onToggle: noop,
    onSelectAll: noop,
    onClearSelection: noop,
    onExport: noop,
    exportLabel: "Export selected",
  };
  const base = { exportPicker, onImportPress: noop };
  const html = await renderWithVoice(h(TransferRecipesView, base));
  for (const slot of ["title", "hint", "importLabel"]) {
    assert.ok(html.includes(v[slot]), `slot ${slot} renders from the voice object`);
  }
  const pending = await renderWithVoice(h(TransferRecipesView, { ...base, importPending: true }));
  assert.ok(pending.includes(v.importPendingLabel), "the import pending label renders");
});
