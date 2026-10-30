/**
 * Contract test for Badge's selectable form (PR #320 review:
 * RecipeFormPage's tag picker renders Badges, not buttons — a
 * tag is a Badge, including when it selects).
 *
 * The contracts pinned here:
 * 1. Badge declares the selectable form: an optional `selected`
 *    prop beside the press handler; the form is gated on a press
 *    handler being passed, so `selected` alone changes nothing.
 * 2. A selectable Badge announces itself as a toggle the way a
 *    toggle Button does — `aria-pressed` on web (SSR-pinned
 *    below), the selected accessibility state on native
 *    (source-pinned), under the button role.
 * 3. The selected treatment is the primary fill with the
 *    on-primary label ink — the treatment a selected toggle
 *    Button takes (source-pinned).
 * 4. A display-only Badge renders no button role and no pressed
 *    state (SSR-pinned below) — the selectable form is opt-in.
 */
import "./registerSvgStub.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const badgeSource = readFileSync(join(root, "src", "components", "Badge.tsx"), "utf8");

test("Badge declares the selectable form, gated on a press handler", () => {
  assert.ok(badgeSource.includes("selected?: boolean"), "Badge must declare the selected prop");
  assert.ok(
    badgeSource.includes("const selectable = onPress !== undefined"),
    "the selectable form must be gated on a press handler being passed",
  );
  assert.ok(
    badgeSource.includes("selectable && selected === true"),
    "selected must only take effect on the selectable form",
  );
});

test("a selectable Badge announces a toggle: aria-pressed on web, selected state on native", () => {
  assert.ok(
    badgeSource.includes('"aria-pressed": selected ?? false'),
    "web must announce the toggle with aria-pressed",
  );
  assert.ok(
    badgeSource.includes("accessibilityState: { selected: selected ?? false }"),
    "native must announce the toggle with the selected accessibility state",
  );
  assert.ok(
    badgeSource.includes('platformAccessibilityProps({ accessibilityRole: "button" })'),
    "the selectable form must take the button role through the platform helper",
  );
});

test("the selected treatment is the primary fill with the on-primary label ink", () => {
  assert.ok(
    badgeSource.includes('isSelected ? "$primary"'),
    "a selected badge must take the primary fill",
  );
  assert.ok(
    badgeSource.includes('isSelected ? "$onPrimary"'),
    "a selected badge's label must take the on-primary ink",
  );
});

// Runtime imports are lazy (inside the SSR tests) so the
// source-scan tests above still run and report when the build
// output is missing or broken.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider } = await import("tamagui");
    const distRuntime = await import(join(here, "..", "dist", "index.js"));
    return { React, renderToString, TamaguiProvider, ...distRuntime };
  })();
  return runtimePromise;
}

async function renderToHtml(element) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  const html = renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
  const styleEnd = html.lastIndexOf("</style>");
  return styleEnd === -1 ? html : html.slice(styleEnd + "</style>".length);
}

test("SSR: a selectable Badge renders the button role with aria-pressed tracking selected", async () => {
  const { React, Badge } = await loadRuntime();
  const selectedHtml = await renderToHtml(
    React.createElement(Badge, { selected: true, onPress: () => null }, "Weeknight"),
  );
  assert.match(selectedHtml, /role="button"/, "a selectable badge takes the button role");
  assert.match(selectedHtml, /aria-pressed="true"/, "a selected badge announces pressed");
  const unselectedHtml = await renderToHtml(
    React.createElement(Badge, { selected: false, onPress: () => null }, "Weeknight"),
  );
  assert.match(unselectedHtml, /aria-pressed="false"/, "an unselected badge announces not pressed");
});

test("SSR: a display-only Badge renders no button role and no pressed state", async () => {
  const { React, Badge } = await loadRuntime();
  const html = await renderToHtml(React.createElement(Badge, { tone: "info" }, "Syncing"));
  assert.ok(!html.includes("aria-pressed"), "a display-only badge carries no pressed state");
  assert.ok(!html.includes('role="button"'), "a display-only badge carries no button role");
});
