/**
 * Contract + behavior tests for RecipeImageView (#130,
 * Workstream A): the recipe form's image field as a view,
 * landing the view-half contract approved on #124 — props in
 * (preview URI, busy flags, error, generate gate, header
 * action), bare intents out, and the design system never calls
 * a picker library.
 *
 * The contracts pinned here:
 * 1. The view is exported from the views barrel (internal
 *    surface only); RecipeFormPage renders it from the `image`
 *    data prop — its former render slot was removed in #683,
 *    so the data prop is the only path.
 * 2. The view is controlled and picker-free: no state of its
 *    own, no picker library, no file input — picking, capture,
 *    cropping, upload, and generation stay with the host.
 * 3. Behavior (SSR): the actions render per the props — remove
 *    only while a preview shows, take-photo / generate only
 *    when their intents are provided; while an upload or a
 *    generation is in flight the busy action reads its
 *    in-flight label and every action disables; a host error
 *    renders as an alert without hiding the preview.
 *
 * Converted in #733 tranche 5: the barrel / page-composition
 * source scan was replaced by a runtime check on the built
 * modules (the view ships in the built views barrel and not
 * on the built package root; page composition is not runtime-
 * observable here and RecipeFormPage's own tests pin it), and
 * the controlled / picker-free source scan was deleted — a
 * view owning state or a picker is not observable from the
 * built output, while every rendered action contract is
 * pinned by the SSR tests below.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadInternalDist } from "../../../test/internalDist.js";
test("the view ships in the built views barrel and stays off the built package root", async () => {
  const distRuntime = await loadInternalDist();
  assert.equal(typeof distRuntime.RecipeImageView, "function");
  const { readFileSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const rootTypes = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../..", "dist", "index.d.ts"),
    "utf8",
  );
  assert.doesNotMatch(rootTypes, /\bRecipeImageView\b/, "the view stays off the public surface");
});
async function renderView(props: Record<string, unknown>): Promise<string> {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const distRuntime = await loadInternalDist();
  const { createTamaguiConfig, baseTheme, RecipeImageView } = distRuntime;
  const voiceFixtures: Record<string, any> = await import("../../../dist/voice/fixtures.js");
  const voiceModule: Record<string, any> = await import("../../../dist/voice/index.js");
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    h(
      TamaguiProvider,
      {
        config,
        defaultTheme: "light",
      },
      h(
        voiceModule.VoiceProvider,
        { voice: voiceFixtures.fixtureVoice },
        h(RecipeImageView, props),
      ),
    ),
  );
}
function buttonAttrs(html: string, label: string): string {
  const idx = html.indexOf(label);
  assert.ok(idx >= 0, `the "${label}" button renders`);
  const start = html.lastIndexOf("<button", idx);
  const end = html.indexOf(">", start);
  return html.slice(start, end);
}
const baseProps = {
  onPickImageRequest: () => { /* noop */ },
  onTakePhotoRequest: () => { /* noop */ },
  onGenerateImageRequest: () => { /* noop */ },
  onRemoveImage: () => { /* noop */ },
};
test("empty state: pick / take-photo / generate render, remove does not", async () => {
  const html = await renderView({
    ...baseProps,
  });
  assert.ok(html.includes("Recipe image"), "the section label renders");
  assert.ok(html.includes("Choose an image from your library"), "the empty line renders");
  assert.ok(html.includes("Browse images"), "the pick action renders");
  assert.ok(html.includes("Take photo"), "the take-photo action renders");
  assert.ok(html.includes("Generate with AI"), "the generate action renders");
  assert.ok(!html.includes("Remove image"), "no remove action without a preview");
});
test("with a preview: the image and the remove action render", async () => {
  const html = await renderView({
    ...baseProps,
    imagePreviewUri: "https://example.com/r.jpg",
  });
  assert.ok(html.includes("Remove image"), "the remove action renders");
  assert.ok(html.includes("https://example.com/r.jpg"), "the preview renders");
  assert.ok(!html.includes("Choose an image from your library"), "the empty line is gone");
});
test("optional intents: no take-photo or generate handler, no such actions", async () => {
  const html = await renderView({
    onPickImageRequest: () => { /* noop */ },
    onRemoveImage: () => { /* noop */ },
  });
  assert.ok(!html.includes("Take photo"), "no take-photo action without its intent");
  assert.ok(!html.includes("Generate with AI"), "no generate action without its intent");
});
test("uploading: the pick action reads Uploading… and every action disables", async () => {
  const html = await renderView({
    ...baseProps,
    imagePreviewUri: "https://example.com/r.jpg",
    isUploading: true,
  });
  assert.ok(html.includes("Uploading…"), "the pick action reads its in-flight label");
  assert.match(buttonAttrs(html, "Uploading…"), /aria-disabled="true"/);
  assert.match(buttonAttrs(html, "Remove image"), /aria-disabled="true"/);
  assert.match(buttonAttrs(html, "Generate with AI"), /aria-disabled="true"/);
});
test("generating: the generate action reads Generating…; the generate gate disables it alone", async () => {
  const generating = await renderView({
    ...baseProps,
    isGenerating: true,
  });
  assert.ok(generating.includes("Generating…"), "the generate action reads its in-flight label");
  assert.match(buttonAttrs(generating, "Generating…"), /aria-disabled="true"/);
  const gated = await renderView({
    ...baseProps,
    canGenerateImage: false,
  });
  assert.match(buttonAttrs(gated, "Generate with AI"), /aria-disabled="true"/);
  assert.match(buttonAttrs(gated, "Browse images"), /aria-disabled="false"/);
});
test("error: the alert renders and the preview stays", async () => {
  const html = await renderView({
    ...baseProps,
    imagePreviewUri: "https://example.com/r.jpg",
    error: "That image could not be uploaded.",
  });
  assert.ok(html.includes("That image could not be uploaded."), "the error alert renders");
  assert.ok(html.includes("Remove image"), "the preview and its actions stay");
});
