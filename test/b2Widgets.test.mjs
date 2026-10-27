/**
 * Contract tests for the B2 widget moves (design-system #123): the
 * seven components audited out of eciperay's
 * `packages/app/src/components` into @spudly/ui — BulkSelectToolbar,
 * CheckboxSelectList, CommentItem, FixedActionBanner, StatRow, TagPill,
 * TokenRow (see docs/b2-component-audit.md).
 *
 * The contracts pinned here:
 * 1. All seven are exported from the package root (dist), next to the
 *    widgets they compose.
 * 2. TagPill tints from the data color: surface = color + "22" alpha,
 *    label = the color itself, full radius.
 * 3. CheckboxSelectList has the three branches (loading Spinner, empty
 *    EmptyState, CheckboxField rows) and reports toggles by id.
 * 4. BulkSelectToolbar disables its selection buttons at
 *    filteredCount === 0 and renders the count only when
 *    selectedCount > 0.
 * 5. FixedActionBanner's dismiss is optional (rendered only with
 *    onDismiss) and its message is a ReactNode — the two gaps in
 *    the pre-consolidation DismissibleBanner contract that made the
 *    component necessary (its message was a plain string and its
 *    dismiss was required; both gaps are closed in Alert, #208).
 * 6. CommentItem gates Save on a non-blank draft and carries the stale
 *    marker's meaning in `staleHintLabel`.
 * 7. TokenRow renders no action for a revoked token and switches the
 *    action label on `revoking`.
 * 8. StatRow is the recessed band: gray step-1 fill, large radius,
 *    space-around distribution.
 *
 * Run against the built output: `npm run build` first (the `test`
 * script does both).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = await import("../dist/index.js");

function source(name) {
  return readFileSync(join(root, "src", "components", `${name}.tsx`), "utf8");
}

const MOVED = [
  "BulkSelectToolbar",
  "CheckboxSelectList",
  "CommentItem",
  "FixedActionBanner",
  "StatRow",
  "TagPill",
  "TokenRow",
];

test("all seven B2 widgets are exported from the package root", () => {
  for (const name of MOVED) {
    assert.equal(typeof dist[name], "function", `${name} must be exported from dist/index.js`);
  }
});

test("TagPill tints its surface and label from the data color", () => {
  const tagPill = source("TagPill");
  assert.ok(tagPill.includes("{color}22`"), "surface must be the color at 22 hex alpha");
  assert.ok(tagPill.includes("color={color}"), "label must render in the color itself");
  assert.ok(tagPill.includes("radii.full"), "pill must use the full radius token");
});

test("CheckboxSelectList branches loading / empty / rows and toggles by id", () => {
  const list = source("CheckboxSelectList");
  assert.ok(list.includes("isLoading"), "loading branch missing");
  assert.ok(list.includes("<Spinner"), "loading branch must render the DS Spinner");
  assert.ok(list.includes("items.length === 0"), "empty branch missing");
  assert.ok(list.includes("<EmptyState"), "empty branch must render the DS EmptyState");
  assert.ok(list.includes("<CheckboxField"), "rows must render the DS CheckboxField");
  assert.ok(list.includes("onToggle(item.id)"), "toggles must report the item id");
});

test("BulkSelectToolbar disables selection at zero filtered and counts only when selected", () => {
  const toolbar = source("BulkSelectToolbar");
  assert.ok(
    toolbar.includes("filteredCount === 0"),
    "selection buttons must disable when the filter shows nothing",
  );
  assert.ok(
    toolbar.includes("selectedCount > 0"),
    "the selected count must render only when something is selected",
  );
  assert.ok(toolbar.includes("disabled || busy"), "busy must disable the controls like disabled");
  assert.ok(
    toolbar.includes('alignItems="center"'),
    "the actions row must center its children so the selected count aligns with the buttons (#175)",
  );
});

test("Alert renders its dismiss glyph at 2xl, not a button label size", () => {
  // The #179 treatment lived on DismissibleBanner until #208 consolidated
  // it into Alert; the contract follows the component that owns the ×.
  const banner = source("Alert");
  assert.ok(
    banner.includes('fontSize={tokens.typography.fontSize["2xl"]}'),
    "the dismiss × must render at the 2xl font size (#179)",
  );
  assert.ok(
    !banner.includes('size="sm"'),
    "the dismiss button must not use the sm size, whose 14px label made the × a speck (#179)",
  );
});

test("FixedActionBanner keeps dismiss optional and the message a ReactNode", () => {
  const banner = source("FixedActionBanner");
  assert.ok(banner.includes("onDismiss?: () => void"), "onDismiss must be optional");
  assert.ok(banner.includes("message: ReactNode"), "message must accept a ReactNode");
  assert.ok(banner.includes("<ActionBar"), "the bar must be the DS ActionBar");
  assert.ok(banner.includes("<Alert"), "the message must render as a DS Alert");
});

test("CommentItem gates Save on a non-blank draft and labels the stale marker", () => {
  const item = source("CommentItem");
  assert.ok(item.includes("!editDraft.trim()"), "Save must disable on a blank draft");
  assert.ok(
    item.includes("accessibilityLabel={staleHintLabel}"),
    "the stale marker's meaning must ride in staleHintLabel",
  );
  assert.ok(item.includes("canEdit") && item.includes("canDelete"), "moderation props missing");
});

test("TokenRow hides the action when revoked and relabels it while revoking", () => {
  const row = source("TokenRow");
  assert.ok(row.includes("revoked || !onRevoke"), "revoked tokens must render no action");
  assert.ok(row.includes('"Revoking…"'), "the pending label missing");
  assert.ok(row.includes("(Revoked)"), "the revoked marker missing");
  assert.ok(row.includes("fontFamily.mono"), "the prefix line must be mono");
});

test("StatRow is the recessed space-around band", () => {
  const row = source("StatRow");
  assert.ok(row.includes("gray.gray1"), "band fill must be gray step 1");
  assert.ok(row.includes("radii.lg"), "band must use the large radius token");
  assert.ok(row.includes('justifyContent: "space-around"'), "stats must spread space-around");
});
