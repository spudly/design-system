/**
 * Contract test for spudly/design-system#229: text-style press
 * actions rendered as a Text/XStack with accessibilityRole="button"
 * and onPress are not keyboard-operable on web (no focus, no
 * Enter/Space activation).
 *
 * The contract now:
 * 1. A shared TextAction component is the DS-wide pattern for
 *    text actions: it renders through the DS Text primitive (so
 *    appearance is unchanged), exposes button semantics, is
 *    focusable on web (tabIndex 0), activates on Enter and Space,
 *    and suppresses activation — and leaves the tab order — while
 *    disabled.
 * 2. CommentItem's Edit / Save / Cancel / Delete actions and
 *    TagsPage's row actions render through TextAction; no
 *    bare accessibilityRole="button" text action remains in
 *    either file. Since the #119 meals & planning tranche,
 *    TagsPage's rows render through BadgeCardRow: the page
 *    composes the Edit / Delete actions (with their accessible
 *    labels) as data, and the row renders them through
 *    TextAction.
 * 3. TextAction is exported from the components index and has
 *    stories, so Chromatic and the Android VR capture it.
 *
 * Source scan, like the other contract tests in this repo
 * (test/backLink.test.mjs): the invariant is a per-literal
 * property of the sources, and no JS renderer here performs the
 * web keyboard path. Comments are stripped before scanning so
 * prose cannot satisfy — or accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readCode(rel) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const textAction = readCode("src/components/TextAction.tsx");
const commentItem = readCode("src/components/CommentItem.tsx");
const tagsPage = readCode("src/pages/TagsPage.tsx");
const badgeCardRow = readCode("src/components/BadgeCardRow.tsx");
const index = readFileSync(join(root, "src", "components", "index.ts"), "utf8");
const stories = readFileSync(join(root, "src", "components", "TextAction.stories.tsx"), "utf8");

test("TextAction renders through the DS Text primitive with button semantics", () => {
  assert.match(textAction, /export function TextAction/);
  assert.match(textAction, /from "\.\/Text\.js"/, "TextAction must build on the DS Text primitive");
  assert.match(textAction, /accessibilityRole="button"/);
  assert.match(
    textAction,
    /accessibilityState=\{\{ disabled \}\}/,
    "disabled must mirror into accessibilityState",
  );
});

test("TextAction is keyboard-operable on web: focusable, Enter and Space activate (#229)", () => {
  assert.match(
    textAction,
    /tabIndex=\{disabled \? -1 : 0\}/,
    "enabled actions are in the tab order; disabled actions leave it",
  );
  assert.match(textAction, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(textAction, /onKeyDown=\{handleKeyDown\}/);
  assert.match(textAction, /cursor="web:pointer"/);
});

test("TextAction suppresses activation while disabled", () => {
  assert.ok(textAction.includes("if (!disabled)"), "the press handler must guard on disabled");
  assert.match(
    textAction,
    /if \(!disabled && \(event\.key === "Enter"/,
    "the key handler must guard on disabled",
  );
  assert.match(
    textAction,
    /if \(!event\.repeat\)/,
    "held-key keydown repeats must not re-activate the action",
  );
});

test("TextAction uses a type alias for its props, not an interface (Stephen's style rule)", () => {
  assert.match(textAction, /export type TextActionProps =/);
  assert.ok(!/interface TextActionProps/.test(textAction), "props must be a type alias");
});

test("CommentItem's four text actions render through TextAction", () => {
  const uses = commentItem.match(/<TextAction/g) ?? [];
  assert.ok(uses.length >= 4, `expected at least 4 TextAction uses, found ${uses.length}`);
  for (const label of ["Save", "Cancel", "Edit", "Delete"]) {
    assert.ok(
      new RegExp(String.raw`<TextAction[\s\S]*?>\s*${label}\s*</TextAction>`).test(commentItem),
      `CommentItem's ${label} action must render through TextAction`,
    );
  }
  assert.ok(
    !commentItem.includes('accessibilityRole="button"'),
    "CommentItem must not keep a bare button-role text action (#229)",
  );
  assert.match(commentItem, /disabled=\{saveDisabled\}/, "Save keeps its disabled state");
  assert.match(commentItem, /disabled=\{isDeletePending\}/, "Delete keeps its disabled state");
});

test("TagsPage's Edit and Delete row actions render through TextAction", () => {
  // The page composes the row's actions as data for BadgeCardRow,
  // keeping their accessible labels (#119); the row renders each
  // action through TextAction (pinned in full in
  // test/badgeCardRow.test.mjs).
  assert.match(tagsPage, /<BadgeCardRow/);
  assert.ok(
    tagsPage.includes("accessibilityLabel: `Delete tag ${tag.name}`"),
    "the Delete row action must keep its accessible label",
  );
  assert.ok(
    tagsPage.includes("accessibilityLabel: `Edit tag ${tag.name}`"),
    "the Edit row action (added by #228, merged before this fix landed) must keep its accessible label",
  );
  for (const label of ["Edit", "Delete"]) {
    assert.ok(
      tagsPage.includes(`label: "${label}"`),
      `TagsPage must compose its ${label} row action for BadgeCardRow`,
    );
  }
  assert.match(badgeCardRow, /<TextAction/);
  assert.ok(
    !tagsPage.includes('accessibilityRole="button"'),
    "TagsPage must not keep a bare button-role text action (#229)",
  );
});

test("TextAction is exported from the components index and has stories", () => {
  assert.match(index, /export \{ TextAction, type TextActionProps \} from "\.\/TextAction\.js";/);
  assert.match(stories, /title: "Components\/TextAction"/);
  assert.match(stories, /export const Default/);
});
