/**
 * Contract test for PreviewCard (spudly/design-system#119, the
 * AI & import tranche): the framed preview panel extracted from
 * AiSessionPage's and ImportReviewPage's preview stages — a
 * bordered surface card framing host-rendered content for
 * review before acting.
 *
 * The pins hold the frame's identity: the border is the fixed
 * gray3 hairline — deliberately NOT Card's theme border, which
 * is why the frame is its own component rather than a Card
 * fold-in — the fill is the surface token, and the title and
 * actions render only when the caller passes them, separated
 * from the content by the card's own spacing.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "PreviewCard.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("PreviewCard is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(typeof dist.PreviewCard, "function", "PreviewCard must be exported from @spudly/ui");
});

test("PreviewCardProps is a type-only export from the built components barrel", () => {
  const barrel = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(barrel, /export \{[^}]*type PreviewCardProps[^}]*\}/);
});

test("the frame is the fixed gray3 border on the surface fill, not Card's theme border", () => {
  assert.match(code, /borderColor=\{tokens\.colors\.gray\.gray3\}/);
  assert.match(code, /backgroundColor="\$surface"/);
  assert.match(code, /borderRadius=\{tokens\.radii\.lg\}/);
  assert.ok(!/interface\s/.test(code), "type aliases only");
});

test("the title and actions render only when passed, on the card's own separation", () => {
  assert.match(code, /\{title \? \(/, "no title, no title block");
  assert.match(code, /\{actions \? <YStack paddingTop="\$4">\{actions\}<\/YStack> : null\}/);
  assert.match(code, /\{children\}/, "the preview content renders between title and actions");
});
