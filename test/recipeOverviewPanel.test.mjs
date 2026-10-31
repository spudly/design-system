/**
 * Contract test for RecipeOverviewPanel
 * (spudly/design-system#119), a recipe's overview header block —
 * hero image, title, status badge, description, stat band, tag
 * row — shared by the two recipe surfaces, which each carried it
 * inline before it moved here. Its invariants: the hero renders
 * only with an image (through Thumbnail's hero frame), the
 * status badge is the shared StatusBadge fed a tone and label
 * the caller resolved from its own status vocabulary (the panel
 * owns no status map — status words are caller data, #119
 * dedupe), the stat band composes StatBand/StatCard with
 * conditional Prep and Cook stats, and tags render through
 * TagList (Badge's color form, #207). Since #364 the title
 * also carries Text's `heading` treatment — level-1 heading
 * semantics on web with its rendered appearance unchanged —
 * pinned below together with the check that neither recipe
 * surface gains a second level-1 heading.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.mjs before anything else.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "..", "src", "components");
const panelSource = readFileSync(join(componentsDir, "RecipeOverviewPanel.tsx"), "utf8");

const panelCode = panelSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeOverviewPanel is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.RecipeOverviewPanel,
    "function",
    "RecipeOverviewPanel must be exported from @spudly/ui",
  );
});

test("RecipeOverviewPanel's types are type-only exports from the built components barrel", () => {
  const types = readFileSync(join(here, "..", "dist", "components", "index.d.ts"), "utf8");
  assert.match(types, /RecipeOverviewPanelProps/);
  assert.match(types, /RecipeOverviewPanelTag/);
});

test("the panel composes the shared building blocks with its conditional content", () => {
  assert.match(panelCode, /\{imageUrl \? \(/, "the hero renders only with an imageUrl");
  assert.match(panelCode, /<Thumbnail src=\{imageUrl\} \/>/, "the hero is Thumbnail's hero frame");
  assert.match(panelCode, /\{description \? \(/, "the description renders only when present");
  assert.match(panelCode, /<StatBand>/, "the stat band is the shared StatBand");
  assert.match(panelCode, /<StatCard label="Servings" value=\{servingsLabel\} \/>/);
  assert.match(panelCode, /\{prepTimeLabel \? <StatCard label="Prep"/);
  assert.match(panelCode, /\{cookTimeLabel \? <StatCard label="Cook"/);
  assert.match(panelCode, /\{tags\.length > 0 \?/, "the tag row renders only with tags");
  assert.match(
    panelCode,
    /<TagList tags=\{tags\} \/>/,
    "tags render through TagList (Badge's color form)",
  );
  assert.ok(!panelCode.includes("{tag.color}22"), "no inline tag tint");
});

test("the title carries level-1 heading semantics with unchanged rendering (#364)", () => {
  // The title Text takes the `heading` variant — the level-1
  // treatment — while its explicit fontSize (2xl) / fontWeight
  // (bold) instance props keep pinning the appearance the plain
  // Text rendered with, so the move is semantics-only (the #263
  // pattern).
  assert.match(
    panelCode,
    /<Text\s+variant="heading"\s+fontSize=\{tokens\.typography\.fontSize\["2xl"\]\}\s+fontWeight=\{tokens\.typography\.fontWeight\.bold\}/,
    "the title is a heading-variant Text with its 2xl/bold appearance pinned",
  );
  assert.equal(
    panelCode.match(/variant="heading"/g)?.length,
    1,
    "the panel renders exactly one heading-variant Text (its title)",
  );
  // Pin the variant's semantics against Text itself: the
  // `heading` variant maps to heading level 1.
  const textSource = readFileSync(join(componentsDir, "Text.tsx"), "utf8");
  assert.match(
    textSource,
    /variant === "heading" \|\| variant === "title" \|\| variant === "formTitle"\s*\?\s*1/,
    "Text maps the heading variant to heading level 1",
  );
});

test("no recipe surface gains a second level-1 heading from the panel (#364)", () => {
  const pagesDir = join(here, "..", "src", "pages");
  const readCode = (name) =>
    readFileSync(join(pagesDir, name), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  // PublicRecipePage composes the panel and renders no
  // level-1 heading variant of its own — the panel's title is
  // its page's sole level-1 heading (its section headings are
  // SectionHeading, level 2).
  const publicCode = readCode("PublicRecipePage.tsx");
  assert.match(publicCode, /<RecipeOverviewPanel/);
  assert.ok(
    !/variant="(heading|title|formTitle)"/.test(publicCode),
    "PublicRecipePage renders no level-1 heading variant besides the panel's title",
  );
  // RecipeDetailPage does not compose the panel; its inline
  // overview title already carries level-1 semantics through
  // the `formTitle` variant, so it is untouched by this change.
  const detailCode = readCode("RecipeDetailPage.tsx");
  assert.ok(
    !detailCode.includes("RecipeOverviewPanel"),
    "RecipeDetailPage does not compose the panel",
  );
  assert.match(detailCode, /<Text variant="formTitle">\{title\}<\/Text>/);
});

test("the status badge is the shared StatusBadge fed caller-resolved tone and label", () => {
  assert.match(
    panelCode,
    /<StatusBadge tone=\{statusTone\} label=\{statusLabel\} \/>/,
    "the badge is the shared StatusBadge with the caller's tone and label",
  );
  assert.ok(
    !panelCode.includes("STATUS_BADGES"),
    "the panel owns no status vocabulary — the caller resolves its statuses to tone/label",
  );
  assert.ok(!panelCode.includes("lineHeight"), "the panel must not set lineHeight");
});
