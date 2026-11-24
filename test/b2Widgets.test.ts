/**
 * Contract tests for the B2 widget moves (design-system #123): the
 * seven components audited out of eciperay's
 * `packages/app/src/widgets` into @spudly/ui — BulkSelectToolbar,
 * CheckboxSelectList, CommentItem, FixedActionBanner, StatRow, TagPill,
 * TokenRow (see docs/b2-component-audit.md). TagPill was later merged
 * into Badge (#183): it is no longer exported, and Badge's `color`
 * form carries its tint contract.
 *
 * The contracts pinned here:
 * 1. The six remaining widgets are exported from the internal components barrel
 *    (dist), next to the widgets they compose.
 * 2. Badge's colored-tag form (the former TagPill) tints from the data
 *    color: surface = color + "22" alpha, label = the color itself,
 *    full radius.
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
import "./registerSvgStub.js";
import { loadInternalDist } from "./internalDist.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist: Record<string, any> = await loadInternalDist();

function source(name: string) {
  // Form-category widgets live in src/widgets/form since #710.
  const formPath = join(root, "src", "widgets", "form", `${name}.tsx`);
  if (existsSync(formPath)) return readFileSync(formPath, "utf8");
  // BulkSelectToolbar (#712) and CommentItem (#714) were reclassified as Views.
  const viewPath = join(root, "src", "views", `${name}.tsx`);
  return readFileSync(existsSync(viewPath) ? viewPath : join(root, "src", "widgets", `${name}.tsx`), "utf8");
}

const MOVED = [
  "CheckboxSelectList",
  "FixedActionBanner",
  "StatRow",
  "TokenRow",
];

test("BulkSelectToolbar is exported from the internal barrel as a view, not a widget (#712)", () => {
  assert.equal(typeof dist.BulkSelectToolbar, "function", "BulkSelectToolbar must remain exported from the internal barrel");
  const widgetsBarrel = readFileSync(join(root, "src", "widgets", "index.ts"), "utf8");
  assert.ok(!widgetsBarrel.includes("BulkSelectToolbar"), "BulkSelectToolbar must not be exported from the widgets barrel");
  const viewsBarrel = readFileSync(join(root, "src", "views", "index.ts"), "utf8");
  assert.ok(viewsBarrel.includes("BulkSelectToolbar"), "BulkSelectToolbar must be exported from the views barrel");
});

test("the remaining B2 widgets are exported from the internal components barrel", () => {
  for (const name of MOVED) {
    assert.equal(
      typeof dist[name],
      "function",
      `${name} must be exported from the internal components barrel`,
    );
  }
  assert.equal(dist.TagPill, undefined, "TagPill was merged into Badge (#183)");
});

test("CommentItem is exported from the internal barrel as a view, not a widget (#714)", () => {
  assert.equal(typeof dist.CommentItem, "function", "CommentItem must remain exported from the internal barrel");
  const widgetsBarrel = readFileSync(join(root, "src", "widgets", "index.ts"), "utf8");
  assert.ok(!widgetsBarrel.includes("CommentItem"), "CommentItem must not be exported from the widgets barrel");
  const viewsBarrel = readFileSync(join(root, "src", "views", "index.ts"), "utf8");
  assert.ok(viewsBarrel.includes("CommentItem"), "CommentItem must be exported from the views barrel");
});

test("Badge's colored-tag form inverts to the resolved dark shade surface with the light shade label (#799)", () => {
  const badge = source("Badge");
  // #799 (superseding the #207 tint): the tag color (a token name,
  // strictly typed) resolves through the shared tag-color shade
  // resolver; the surface takes the pair's dark shade and the label
  // its light shade.
  assert.ok(
    badge.includes('const backgroundColor = isSelected ? "$primary" : (tagDark ?? styles.background)'),
    "surface must be the resolved tag color's dark shade while unselected (the selectable form's selected state takes the primary fill)",
  );
  assert.ok(
    badge.includes('const textColor = isSelected ? "$onPrimary" : (tagLight ?? styles.text)'),
    "label must render in the resolved tag color's light shade while unselected (the selectable form's selected state takes the on-primary ink)",
  );
  assert.ok(badge.includes("radii.full"), "pill must use the full radius token");
});

test("CheckboxSelectList branches loading / empty / rows and toggles by id", () => {
  const list = source("CheckboxSelectList");
  assert.ok(list.includes("loading"), "loading branch missing");
  // #278 T1: the loading branch renders skeleton rows, not the
  // centered Spinner it used before the skeleton conversion.
  assert.ok(!list.includes("Spinner"), "loading branch must not render a Spinner (#278)");
  assert.ok(list.includes("TextSkeleton"), "loading branch must render skeleton rows");
  assert.ok(
    list.includes("LOADING_ROW_KEYS"),
    "loading rows must come from the frozen dummy constant",
  );
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
