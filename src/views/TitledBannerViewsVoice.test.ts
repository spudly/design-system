/**
 * Voice-slot pins for the remaining titled and banner views
 * (#539 tranche 2e): ChangedListBanner's Revert action,
 * ConsentBannerView's accept / decline defaults,
 * InstallBannerView's dismiss default, and
 * RecipeExportPickerView's search-placeholder, empty-message,
 * and export-pending defaults come from the app-supplied voice
 * object — the DS ships no default strings. Caller-passed props
 * still win over the voice defaults. ConfirmActionView,
 * LegalSection, CatalogHeader, and AppTopBar are pinned as the
 * exceptions: their titles, labels, and messages are all
 * caller-supplied data with no hard-coded defaults, so they read
 * no voice slots.
 *
 * Converted from source scans to runtime checks in #733
 * tranche 5: the voice views are SSR-rendered under the
 * fixture voice with no label props supplied and the rendered
 * output is asserted to carry the fixture's slot strings.
 * The exception views are rendered with NO provider: a view
 * that read voice slots would throw the fail-fast error, so
 * a successful render carrying only caller copy is the
 * runtime form of the exception.
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

async function render(element: any, withVoice = true): Promise<string> {
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
  const tree = withVoice ? h(VoiceProvider, { voice: fixtureVoice }, element) : element;
  const html = renderToString(h(TamaguiProvider, { config, defaultTheme: "light" }, tree));
  return html.replaceAll("&#x27;", "'");
}

const noop = () => {};

test("ChangedListBanner renders its Revert action from the voice object", async () => {
  const { h, ChangedListBanner, fixtureVoice } = await loadRuntime();
  const html = await render(h(ChangedListBanner, { label: "3 changes", onRevert: noop }));
  assert.ok(
    html.includes(fixtureVoice.changedListBanner.revertLabel),
    "the revert label renders from the voice object",
  );
});

test("ConsentBannerView renders its defaults from the voice object", async () => {
  const { h, ConsentBannerView, fixtureVoice } = await loadRuntime();
  const html = await render(
    h(ConsentBannerView, {
      messageBeforeLink: "We use cookies as described in our ",
      linkLabel: "privacy policy",
      linkHref: "/privacy",
      messageAfterLink: ".",
      onAccept: noop,
      onDecline: noop,
    }),
  );
  assert.ok(html.includes(fixtureVoice.consentBannerView.acceptLabel), "the accept label renders");
  assert.ok(
    html.includes(fixtureVoice.consentBannerView.declineLabel),
    "the decline label renders",
  );
});

test("InstallBannerView renders its dismiss default from the voice object", async () => {
  const { h, InstallBannerView, fixtureVoice } = await loadRuntime();
  const html = await render(
    h(InstallBannerView, {
      message: "Install the app for the best experience.",
      links: [],
      onDismiss: noop,
    }),
  );
  assert.ok(
    html.includes(fixtureVoice.installBannerView.dismissLabel),
    "the dismiss accessible name renders from the voice object",
  );
});

test("RecipeExportPickerView renders its defaults from the voice object", async () => {
  const { h, RecipeExportPickerView, fixtureVoice } = await loadRuntime();
  const v = fixtureVoice.recipeExportPickerView;
  const base = {
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
  const html = await render(h(RecipeExportPickerView, base));
  assert.ok(html.includes(v.searchPlaceholder), "the search placeholder renders");
  assert.ok(html.includes(v.emptyMessage), "the empty message renders");
  const exporting = await render(h(RecipeExportPickerView, { ...base, exporting: true }));
  assert.ok(exporting.includes(v.exportPendingLabel), "the export pending label renders");
});

test("ConfirmActionView reads no voice slots — its title and labels are caller-supplied", async () => {
  const { h, ConfirmActionView } = await loadRuntime();
  // The dialog's content does not SSR-render (it portals in
  // when open), so the runtime form of the exception here is
  // that rendering the view with NO provider does not throw
  // the voice fail-fast error — a view reading voice slots
  // would throw it during render.
  await render(
    h(ConfirmActionView, {
      open: true,
      onOpenChange: noop,
      title: "Delete this recipe?",
      confirmLabel: "Delete it",
      onConfirm: noop,
    }),
    false,
  );
});

test("LegalSection reads no voice slots — its title is caller-supplied", async () => {
  const { h, LegalSection } = await loadRuntime();
  const html = await render(h(LegalSection, { title: "Legal" }, h("span", null, "Privacy")), false);
  assert.ok(html.includes("Legal"), "the caller title renders with no provider");
  assert.ok(html.includes("Privacy"), "the caller children render with no provider");
});

test("CatalogHeader reads no voice slots — its title is caller-supplied", async () => {
  const { h, CatalogHeader } = await loadRuntime();
  const html = await render(
    h(CatalogHeader, { title: "Recipes" }, h("span", null, "CONTROLS")),
    false,
  );
  assert.ok(html.includes("Recipes"), "the caller title renders with no provider");
});

test("AppTopBar reads no voice slots — its brand, nav, and actions are caller-supplied", async () => {
  const { h, AppTopBar } = await loadRuntime();
  const html = await render(h(AppTopBar, { brand: { label: "Eciperay" } }), false);
  assert.ok(html.includes("Eciperay"), "the caller brand renders with no provider");
});
