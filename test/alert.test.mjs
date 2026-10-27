import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * Contract tests for Alert (#208): the single inline message component
 * consolidating InlineAlert and DismissibleBanner (Stephen's direction
 * on PR #193). The contracts pinned here:
 * 1. Alert is exported from the barrel; the two old components and
 *    their types are gone.
 * 2. The severity set is the union (info / success / warning / error)
 *    with InlineAlert's exact semantic ramps.
 * 3. Live-region semantics follow severity: error/warning announce via
 *    accessibilityRole="alert", info/success politely.
 * 4. The dismiss button renders only when `dismissible` is set AND an
 *    `onDismiss` handler exists, and carries DismissibleBanner's
 *    treatment: 2xl glyph in the alert's text color, pulled toward the
 *    top-right corner, 44px target, "Dismiss" label.
 * 5. Content accepts both shapes: `children` (rich) wins over the
 *    `message` string; actions render as secondary buttons.
 */

const source = readFileSync("src/components/Alert.tsx", "utf8");
const stories = readFileSync("src/components/Alert.stories.tsx", "utf8");

test("Alert is exported from the components barrel and the old components are removed", () => {
  const barrel = readFileSync("src/components/index.ts", "utf8");
  assert.match(barrel, /export \{ Alert, type AlertAction, type AlertProps, type AlertSeverity \}/);
  assert.doesNotMatch(barrel, /\bInlineAlert\b|\bDismissibleBanner\b|\bBannerAction\b/);
  assert.equal(existsSync("src/components/InlineAlert.tsx"), false);
  assert.equal(existsSync("src/components/DismissibleBanner.tsx"), false);
});

test("severity set is the union with InlineAlert's semantic ramps", () => {
  for (const sev of ["info", "success", "warning", "error"]) {
    assert.ok(source.includes(`${sev}: {`), `${sev} severity missing`);
  }
  assert.match(source, /background: "\$primarySubtle"/);
  assert.match(source, /tokens\.colors\.success\.success1/);
  assert.match(source, /tokens\.colors\.warning\.warning1/);
  assert.match(source, /tokens\.colors\.danger\.danger1/);
  assert.match(source, /severity = "info"/);
});

test("live region follows severity: alert role for error/warning, polite otherwise", () => {
  assert.match(source, /severity === "error" \|\| severity === "warning"/);
  assert.match(source, /accessibilityRole: "alert"/);
  assert.match(source, /politeLiveRegionProps/);
});

test("dismiss renders only when dismissible with a handler, with the banner treatment", () => {
  assert.match(source, /dismissible = false/);
  assert.match(source, /const showDismiss = dismissible && onDismiss !== undefined/);
  assert.match(source, /fontSize=\{tokens\.typography\.fontSize\["2xl"\]\}/);
  assert.match(source, /position="relative"/);
  assert.match(source, /top=\{-tokens\.spacing\[6\]\}/);
  assert.match(source, /right=\{-tokens\.spacing\[5\]\}/);
  assert.match(source, /accessibilityLabel="Dismiss"/);
  assert.match(source, /minWidth=\{44\}/);
  assert.match(source, /minHeight=\{44\}/);
});

test("content takes children over message, and actions render as secondary buttons", () => {
  assert.match(source, /const content = children \?\? message/);
  assert.match(source, /message\?: string/);
  assert.match(source, /actions\?: AlertAction\[\]/);
  assert.match(source, /variant="secondary" onPress=\{action\.onPress\}/);
});

test("stories cover the severities, the dismissible forms, and actions", () => {
  for (const name of [
    "Info",
    "Success",
    "Warning",
    "Error",
    "Dismissible",
    "DismissibleWarning",
    "WithActions",
  ]) {
    assert.match(stories, new RegExp(`export const ${name}: Story`), `${name} story missing`);
  }
  assert.match(stories, /title: "Components\/Alert"/);
});

test("in-repo consumers render Alert, not the removed components", () => {
  for (const file of [
    "src/components/AccessTokensPanel.tsx",
    "src/components/FixedActionBanner.tsx",
    "src/pages/EditVersionPage.tsx",
    "src/pages/MemorizationSessionPage.tsx",
    "src/pages/MemorizeSettingsPage.tsx",
    "src/pages/RecipeFormPage.tsx",
    "src/pages/VerseSearchPage.tsx",
  ]) {
    const code = readFileSync(file, "utf8");
    assert.doesNotMatch(
      code,
      /\bInlineAlert\b|\bDismissibleBanner\b/,
      `${file} still uses a removed component`,
    );
  }
});
