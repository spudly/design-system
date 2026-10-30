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
 *    (source-pinned), under the button role — and on web it is
 *    keyboard-operable like the DS's other pressable blocks:
 *    focusable, Enter/Space activating the press callback, a
 *    held key never re-activating; a disabled selectable Badge
 *    is inert — out of the tab order, announced disabled, and
 *    it never activates.
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
    badgeSource.includes("accessibilityState: { selected: selected ?? false, disabled }"),
    "native must announce the toggle with the selected accessibility state",
  );
  assert.ok(
    badgeSource.includes('platformAccessibilityProps({ accessibilityRole: "button" })'),
    "the selectable form must take the button role through the platform helper",
  );
});

test("a selectable Badge is keyboard-operable on web: focusable, Enter/Space, no held-key repeats", () => {
  assert.ok(
    badgeSource.includes("tabIndex: disabled ? -1 : 0"),
    "an enabled selectable badge must be focusable on web; a disabled one leaves the tab order",
  );
  assert.ok(
    badgeSource.includes("onKeyDown: handleKeyDown"),
    "a selectable badge must wire the activation-keys handler",
  );
  assert.ok(
    badgeSource.includes('event.key === "Enter" || event.key === " "'),
    "Enter and Space must invoke the press callback",
  );
  assert.ok(
    badgeSource.includes("if (!event.repeat)"),
    "a held key must not re-activate (it would flip the selection back and forth)",
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
  assert.match(selectedHtml, /tabindex="0"/, "a selectable badge is keyboard-focusable");
  const unselectedHtml = await renderToHtml(
    React.createElement(Badge, { selected: false, onPress: () => null }, "Weeknight"),
  );
  assert.match(unselectedHtml, /aria-pressed="false"/, "an unselected badge announces not pressed");
});

test("a disabled selectable Badge never activates and announces its state", async () => {
  assert.ok(
    badgeSource.includes('if (!disabled && (event.key === "Enter"'),
    "the keyboard handler must not activate a disabled badge",
  );
  assert.ok(
    badgeSource.includes("onPress: disabled ? undefined : onPress"),
    "a disabled badge carries no press handler",
  );
  assert.ok(
    badgeSource.includes('"aria-disabled": disabled'),
    "web must announce a disabled selectable badge",
  );
  const { React, Badge } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      Badge,
      { selected: true, disabled: true, onPress: () => null },
      "Weeknight",
    ),
  );
  assert.match(html, /aria-pressed="true"/, "a disabled badge still announces its toggle state");
  assert.match(html, /aria-disabled="true"/, "a disabled badge announces disabled");
  assert.match(html, /tabindex="-1"/, "a disabled badge is out of the tab order");
});

test("SSR: a display-only Badge renders no button role and no pressed state", async () => {
  const { React, Badge } = await loadRuntime();
  const html = await renderToHtml(React.createElement(Badge, { tone: "info" }, "Syncing"));
  assert.ok(!html.includes("aria-pressed"), "a display-only badge carries no pressed state");
  assert.ok(!html.includes('role="button"'), "a display-only badge carries no button role");
});
