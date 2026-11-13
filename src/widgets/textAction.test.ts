/**
 * Contract test for spudly/design-system#464: TextAction is
 * removed outright (no deprecation shim — Stephen's ruling).
 * The #229 contract it carried — small inline press actions
 * must be keyboard-operable on web, focusable, and suppress
 * activation while disabled — is now carried by the DS Button
 * in its ghost treatment, which renders a real <button> on
 * web (native keyboard activation and disabled semantics) and
 * a pressable on native.
 *
 * The contract now:
 * 1. TextAction no longer exists: no component file, no
 *    stories, no export from the widgets index, and no source
 *    file renders a <TextAction element.
 * 2. Every former call site renders a ghost Button instead:
 *    CommentItem's Edit / Save / Cancel / Delete, BadgeCardRow's
 *    row actions (TagsPage's Edit / Delete, composed as data),
 *    TextActionCardRow's trailing action, ChangedListBanner's
 *    and RevertAction's Revert, and AiSessionPage's Cancel —
 *    each keeping its accessible name, disabled behavior, and
 *    callback.
 *
 * Source scan, like the other contract tests in this repo
 * (src/widgets/BackLink.test.ts): the invariant is a per-literal
 * property of the sources, and no JS renderer here performs the
 * web keyboard path. Comments are stripped before scanning so
 * prose cannot satisfy — or accidentally trip — the patterns.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const commentItem = readCode("src/widgets/CommentItem.tsx");
const badgeCardRow = readCode("src/widgets/BadgeCardRow.tsx");
const textActionCardRow = readCode("src/widgets/TextActionCardRow.tsx");
const changedListBanner = readCode("src/views/ChangedListBanner.tsx");
const revertAction = readCode("src/views/RevertAction.tsx");
const aiSessionPage = readCode("src/pages/AiSessionPage.tsx");
const tagsPage = readCode("src/pages/TagsPage.tsx");
const index = readFileSync(join(root, "src", "widgets", "index.ts"), "utf8");

test("TextAction is deleted: no file, no stories, no export (#464)", () => {
  assert.ok(!existsSync(join(root, "src", "widgets", "TextAction.tsx")));
  assert.ok(!existsSync(join(root, "src", "widgets", "TextAction.stories.tsx")));
  assert.ok(!index.includes("TextAction.js"), "the widgets index must not export TextAction");
  assert.ok(!index.includes("TextActionProps"), "TextActionProps must not be exported");
});

test("no source file renders a TextAction element (#464)", () => {
  const dirs = ["src/widgets", "src/views", "src/pages"];
  for (const dir of dirs) {
    for (const name of readdirSync(join(root, dir))) {
      if (!name.endsWith(".tsx") || name.endsWith(".test.ts")) continue;
      const code = readCode(join(dir, name));
      assert.ok(!/<TextAction[\s>]/.test(code), `${dir}/${name} must not render <TextAction>`);
    }
  }
});

test("CommentItem's four actions render as ghost Buttons", () => {
  const uses = commentItem.match(/<Button\s+ghost/g) ?? [];
  assert.ok(uses.length >= 4, `expected at least 4 ghost Buttons, found ${uses.length}`);
  for (const slot of ["saveLabel", "cancelLabel", "editLabel", "deleteLabel"]) {
    assert.ok(
      new RegExp(String.raw`<Button[\s\S]*?>\s*\{voice\.commentItem\.${slot}\}\s*</Button>`).test(
        commentItem,
      ),
      `CommentItem's ${slot} action must render as a ghost Button reading the voice slot (#539)`,
    );
  }
  assert.match(commentItem, /disabled=\{saveDisabled\}/, "Save keeps its disabled state");
  assert.match(commentItem, /disabled=\{isDeletePending\}/, "Delete keeps its disabled state");
  assert.match(
    commentItem,
    /variant="danger"[\s\S]*?>\s*\{voice\.commentItem\.deleteLabel\}\s*<\/Button>/,
    "Delete keeps its destructive treatment as the danger variant",
  );
});

test("BadgeCardRow's actions render as ghost Buttons with their composed labels", () => {
  assert.match(badgeCardRow, /<Button/);
  assert.match(badgeCardRow, /ghost/);
  assert.match(badgeCardRow, /accessibilityLabel=\{action\.accessibilityLabel\}/);
  assert.match(badgeCardRow, /onPress=\{action\.onPress\}/);
  assert.match(
    badgeCardRow,
    /variant=\{action\.variant === "error" \? "danger" : "primary"\}/,
    "an error action maps to the danger variant; the default maps to primary",
  );
});

test("TagsPage's Edit and Delete row actions keep their labels as BadgeCardRow data", () => {
  assert.match(tagsPage, /<BadgeCardRow/);
  const dollar = "$";
  assert.ok(
    tagsPage.includes(`accessibilityLabel: \`Delete tag ${dollar}{tag.name}\``),
    "the Delete row action must keep its accessible label",
  );
  assert.ok(
    tagsPage.includes(`accessibilityLabel: \`Edit tag ${dollar}{tag.name}\``),
    "the Edit row action must keep its accessible label",
  );
  for (const label of ["Edit", "Delete"]) {
    assert.ok(
      tagsPage.includes(`label: "${label}"`),
      `TagsPage must compose its ${label} row action for BadgeCardRow`,
    );
  }
});

test("TextActionCardRow's trailing action renders as a ghost Button, never a link (#248)", () => {
  assert.match(
    textActionCardRow,
    /<Button\s+ghost\s+size="sm"\s+accessibilityLabel=\{`\$\{actionLabel\} \$\{title\}`\}\s+onPress=\{onActionPress\}/,
  );
  assert.ok(!textActionCardRow.includes("TextLink"), "the row must not render a TextLink");
});

test("the Revert affordances render as ghost Buttons", () => {
  assert.match(changedListBanner, /<Button ghost size="sm" onPress=\{onRevert\}>/);
  assert.match(revertAction, /<Button ghost size="sm" onPress=\{onPress\}>/);
  assert.match(revertAction, /Revert to: \$\{label\}/);
});

test("AiSessionPage's Cancel renders as a ghost Button with its name and disabled state", () => {
  assert.match(
    aiSessionPage,
    /<Button\s+ghost\s+size="sm"\s+onPress=\{onCancel\}\s+disabled=\{busy\}\s+accessibilityLabel="Cancel session"/,
  );
});
