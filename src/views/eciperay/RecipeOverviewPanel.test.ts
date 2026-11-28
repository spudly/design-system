/**
 * Contract test for RecipeOverviewPanel
 * (spudly/design-system#119), a recipe's overview header block —
 * hero image, title, status badge, description, metadata badge, tag
 * row — shared by the two recipe surfaces, which each carried it
 * inline before it moved here. Its invariants: the hero renders
 * only with an image (through Thumbnail's hero frame), the
 * status badge is the shared Badge fed a tone and label
 * the caller resolved from its own status vocabulary (the panel
 * owns no status map — status words are caller data, #119
 * dedupe), the stats compose the MetadataBadge with
 * conditional Prep and Cook parts, and tags render through
 * TagList (Badge's color form, #207). Since #364 the title
 * also carries Text's `heading` treatment — level-1 heading
 * semantics on web with its rendered appearance unchanged —
 * pinned below together with the check that neither recipe
 * surface gains a second level-1 heading.
 *
 * Source scan plus a dist export check, like the other component
 * contract tests. The dist import needs the harness's
 * react-native-svg stub registered first, so this file imports
 * registerSvgStub.ts before anything else.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(here, "../../..", "src", "views", "eciperay");
const panelSource = readFileSync(join(componentsDir, "RecipeOverviewPanel.tsx"), "utf8");

const panelCode = panelSource
  .replaceAll(/\/\*[\s\S]*?\*\//g, "")
  .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("RecipeOverviewPanel is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await loadInternalDist();
  assert.equal(
    typeof dist.RecipeOverviewPanel,
    "function",
    "RecipeOverviewPanel must be exported from the internal components barrel",
  );
});

test("RecipeOverviewPanel's types are type-only exports from the built components barrel", () => {
  const types = readFileSync(join(here, "../../..", "dist", "views", "index.d.ts"), "utf8");
  assert.match(types, /RecipeOverviewPanelProps/);
});

test("the panel composes the shared building blocks with its conditional content", () => {
  assert.match(panelCode, /\{imageUrl \? \(/, "the hero renders only with an imageUrl");
  assert.match(panelCode, /<Thumbnail src=\{imageUrl\} \/>/, "the hero is Thumbnail's hero frame");
  assert.match(panelCode, /\{description \? \(/, "the description renders only when present");
  assert.match(
    panelCode,
    /<MetadataBadge parts=\{metadataParts\} \/>/,
    "the stats render through the shared MetadataBadge (#743)",
  );
  assert.match(
    panelCode,
    /`(?:\$\{voice\.recipeOverviewPanel\.servingsLabel\} \$\{servingsLabel\})`/,
    "the servings part composes the voice label with the value",
  );
  assert.match(
    panelCode,
    /prepTimeLabel \? `\$\{voice\.recipeOverviewPanel\.prepLabel\} \$\{prepTimeLabel\}` : undefined/,
    "the Prep part exists only with a prep time",
  );
  assert.match(
    panelCode,
    /cookTimeLabel \? `\$\{voice\.recipeOverviewPanel\.cookLabel\} \$\{cookTimeLabel\}` : undefined/,
    "the Cook part exists only with a cook time",
  );
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
  const textSource = readFileSync(
    join(componentsDir, "..", "..", "widgets", "data", "Text.tsx"),
    "utf8",
  );
  assert.match(
    textSource,
    /variant === "heading" \|\| variant === "title" \|\| variant === "formTitle" \|\| variant === "display"\s*\?\s*1/,
    "Text maps the heading variant to heading level 1",
  );
});

test("no recipe surface gains a second level-1 heading from the panel (#364)", () => {
  const pagesDir = join(here, "../../..", "src", "pages");
  const readCode = (name: string) =>
    readFileSync(join(pagesDir, name), "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
  // Since #757 the merged RecipeDetailPage composes the panel
  // in its guest branch and renders no level-1 heading variant
  // of its own there — the panel's title is the guest form's
  // sole level-1 heading (its section headings are
  // SectionHeading, level 2).
  const detailCode = readCode("eciperay/RecipeDetailPage.tsx");
  assert.match(detailCode, /<RecipeOverviewPanel/);
  assert.ok(
    !/variant="(heading|title|formTitle)"/.test(detailCode),
    "RecipeDetailPage renders no level-1 heading variant besides the panel's title",
  );
  // The owner form does not compose the panel; its inline
  // overview title already carries level-1 semantics through
  // the `display` variant, so it is untouched by this change.
  assert.match(detailCode, /<Text variant="display">\{title\}<\/Text>/);
});

test("the status badge is the shared Badge fed caller-resolved tone and label", () => {
  assert.match(
    panelCode,
    /<Badge tone=\{statusTone \?\? "neutral"\}>\{statusLabel\}<\/Badge>/,
    "the badge is the shared Badge with the caller's tone and label",
  );
  assert.ok(
    panelCode.includes("statusLabel ? ("),
    "the badge renders only when the caller supplies a status label (#735)",
  );
  assert.ok(
    !panelCode.includes("STATUS_BADGES"),
    "the panel owns no status vocabulary — the caller resolves its statuses to tone/label",
  );
  assert.ok(!panelCode.includes("lineHeight"), "the panel must not set lineHeight");
});
