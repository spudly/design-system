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
 *    data prop, ahead of the `renderImageSection` slot, which
 *    remains the fallback and still receives the revert
 *    affordance.
 * 2. The view is controlled and picker-free: no state of its
 *    own, no picker library, no file input — picking, capture,
 *    cropping, upload, and generation stay with the host.
 * 3. Behavior (SSR): the actions render per the props — remove
 *    only while a preview shows, take-photo / generate only
 *    when their intents are provided; while an upload or a
 *    generation is in flight the busy action reads its
 *    in-flight label and every action disables; a host error
 *    renders as an alert without hiding the preview.
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

test("the view is barrel-exported and RecipeFormPage renders it from the image data prop", () => {
  const barrel = read("src/views/index.ts");
  assert.match(
    barrel,
    /export \{ RecipeImageView, type RecipeImageViewProps \} from "\.\/RecipeImageView\.js"/,
    "RecipeImageView is exported from src/views/index.ts",
  );
  const rootIndex = read("src/index.ts");
  assert.doesNotMatch(rootIndex, /\bRecipeImageView\b/, "the view stays off the public surface");

  const form = read("src/pages/RecipeFormPage.tsx");
  assert.ok(
    form.includes(
      'import { RecipeImageView, type RecipeImageViewProps } from "../views/RecipeImageView.js"',
    ),
    "RecipeFormPage imports the view",
  );
  assert.ok(
    form.includes("image?: RecipeFormPageImage | null"),
    "the image data prop is on the form's contract",
  );
  assert.match(
    form,
    /<RecipeImageView \{\.\.\.image\} headerAction=\{revertAction\("image"\)\} \/>/,
    "the page renders the view from the data prop with its revert affordance as the header action",
  );
  assert.ok(
    form.includes('renderImageSection(revertAction("image"))'),
    "the slot fallback still receives the revert affordance",
  );
});

test("the view is controlled and picker-free", () => {
  const view = read("src/views/RecipeImageView.tsx");
  assert.ok(!view.includes("useState"), "the view must not own state");
  assert.ok(!view.includes("expo-image-picker"), "the view must not call a picker library");
  assert.ok(!view.includes("react-native-image-picker"), "the view must not call a picker library");
  assert.ok(!view.includes('type="file"'), "the view must not render a file input");
  assert.ok(!view.includes("@eciperay"), "the view must not import an app package");
});

async function renderView(props: Record<string, unknown>): Promise<string> {
  const { createElement: h } = await import("react");
  const { renderToString } = await import("react-dom/server");
  const { TamaguiProvider }: Record<string, any> = await import("tamagui");
  const distRuntime = await loadInternalDist();
  const { createTamaguiConfig, baseTheme, RecipeImageView } = distRuntime;
  const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
  const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    h(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      h(voiceModule.VoiceProvider, { voice: voiceFixtures.fixtureVoice }, h(RecipeImageView, props)),
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
  onPickImageRequest: () => {},
  onTakePhotoRequest: () => {},
  onGenerateImageRequest: () => {},
  onRemoveImage: () => {},
};

test("empty state: pick / take-photo / generate render, remove does not", async () => {
  const html = await renderView({ ...baseProps });
  assert.ok(html.includes("Recipe image"), "the section label renders");
  assert.ok(html.includes("Choose an image from your library"), "the empty line renders");
  assert.ok(html.includes("Browse images"), "the pick action renders");
  assert.ok(html.includes("Take photo"), "the take-photo action renders");
  assert.ok(html.includes("Generate with AI"), "the generate action renders");
  assert.ok(!html.includes("Remove image"), "no remove action without a preview");
});

test("with a preview: the image and the remove action render", async () => {
  const html = await renderView({ ...baseProps, imagePreviewUri: "https://example.com/r.jpg" });
  assert.ok(html.includes("Remove image"), "the remove action renders");
  assert.ok(html.includes("https://example.com/r.jpg"), "the preview renders");
  assert.ok(!html.includes("Choose an image from your library"), "the empty line is gone");
});

test("optional intents: no take-photo or generate handler, no such actions", async () => {
  const html = await renderView({
    onPickImageRequest: () => {},
    onRemoveImage: () => {},
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
  const generating = await renderView({ ...baseProps, isGenerating: true });
  assert.ok(generating.includes("Generating…"), "the generate action reads its in-flight label");
  assert.match(buttonAttrs(generating, "Generating…"), /aria-disabled="true"/);

  const gated = await renderView({ ...baseProps, canGenerateImage: false });
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
