/**
 * Contract test for BadgeCardRow (spudly/design-system#119, the
 * meals & planning tranche): the compact card row extracted
 * from TagsPage — a colored Badge with trailing text actions.
 *
 * The row exists because Badge's `color` is a style-named prop:
 * the no-page-styling rule bans it in pages with no exceptions,
 * so the badge renders inside this component and pages pass the
 * badge's label and color name plus the actions as data. The
 * pins hold that shape: the Badge renders in its colored-tag
 * form from the row's props (#207 token names), each action
 * renders through TextAction with its caller-composed
 * accessibility label (#248: actions are button-role text
 * controls), and the groups compose through
 * TrailingActionsRow inside a compact Card (Card's `compact`
 * variant — the former CompactCard, folded into Card under
 * Stephen's 2026-10-29 ruling).
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "..", "src", "components", "BadgeCardRow.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

test("BadgeCardRow is exported from the built package root", async () => {
  const dist = await import("../dist/index.js");
  assert.equal(
    typeof dist.BadgeCardRow,
    "function",
    "BadgeCardRow must be exported from @spudly/ui",
  );
});

test("the badge renders in its colored-tag form from the row's data (#207)", () => {
  assert.match(code, /<Badge color=\{badgeColor\}>\{badgeLabel\}<\/Badge>/);
  assert.match(code, /badgeColor: TagColorName;/);
});

test("each action renders through TextAction with its composed label (#248)", () => {
  assert.match(code, /<TextAction/);
  assert.match(code, /accessibilityLabel=\{action\.accessibilityLabel\}/);
  assert.match(code, /onPress=\{action\.onPress\}/);
  assert.match(code, /\{\.\.\.\(action\.variant \? \{ variant: action\.variant \} : \{\}\)\}/);
});

test("the row composes a compact Card and TrailingActionsRow", () => {
  assert.match(code, /<Card variant="compact">/);
  assert.match(code, /<TrailingActionsRow leading=\{/);
});
