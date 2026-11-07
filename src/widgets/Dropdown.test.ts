/**
 * Contract tests for the Dropdown family (spudly/design-system#178,
 * adopting shuoink/ui's Dropdown / DropdownButton as spec, with the
 * contract redirected by Stephen to a children-slot shell).
 *
 * The contracts pinned here:
 * 1. Dropdown, DropdownButton, and useDropdownClose are exported
 *    from the internal components barrel (dist).
 * 2. Dropdown is a shell with ONE children slot: the panel content
 *    arrives as `children`, the trigger as a `trigger` element, and
 *    there is NO items view-model (no `items`, no `onSelect`) — the
 *    caller composes the content (Stephen's directive on #178,
 *    superseding the earlier items-model proposal).
 * 3. Open state follows the DS controlled/uncontrolled pair
 *    (`open` / `defaultOpen` / `onOpenChange`, the AccordionSection
 *    shape), and anchoring is the semantic subset (side top/bottom,
 *    align start/end) composed into the Popover placement — the
 *    spec's raw Popper placement strings do not leak through.
 * 4. Close-on-select is the context affordance: Dropdown provides
 *    { open, toggle, close } through context (the spec's ExitContext
 *    descendant) and the exported useDropdownClose hands `close` to
 *    composed content rows.
 * 5. DropdownButton is props-described and DS-rendered (decisions
 *    1–2 on #178): it composes the DS Button, reads the open state
 *    from the Dropdown context for its CollapsibleIcon chevron and
 *    its expanded accessibility state, and carries
 *    `aria-haspopup`. An icon-only trigger requires an accessibility
 *    label at the type level (the Button icon-only rule).
 * 6. DS hard rules across the family: type aliases only (no
 *    `interface`), no margins for spacing (#209), no direct import
 *    of react-native / react-native-svg, no "Spudly"-prefixed
 *    styled names, and no styling props (`style` / `className`) in
 *    either props type — DS components own their styles completely.
 * 8. The connected surface (#474): while open, the trigger and
 *    the panel square the corners where they touch — the aligned
 *    edge's corner always, each element's far corner only when
 *    that corner actually touches (its far edge within the other
 *    element's span, judged per element by the shared
 *    farCornerTouches / touchingCornerRadii helpers over the
 *    context's side/align/measured widths). Closed, the trigger
 *    passes no radius override.
 * 7. Runtime (SSR, against the built output): a closed dropdown
 *    renders its trigger as a button with `aria-haspopup` and
 *    `aria-expanded="false"` and does NOT render the panel content;
 *    an open dropdown's trigger reports `aria-expanded="true"`.
 *    (The panel itself renders through the Popover portal, which
 *    does not SSR — panel rendering is covered by the Storybook
 *    manual QA pass, not here.)
 *
 * Source scan for the per-literal invariants (like this repo's other
 * component contract tests; comments are stripped first so prose
 * cannot satisfy the patterns), plus a dist import for the export
 * contract — `npm test` builds before running. The icons module's
 * CollapsibleIcon reaches the root graph through DropdownButton, so
 * this file registers the harness's react-native-svg stub before
 * importing dist (see registerSvgStub.ts).
 */
import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const dist: Record<string, any> = await loadInternalDist();

function codeOf(rel: string) {
  const source = readFileSync(join(root, rel), "utf8");
  return source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}

const dropdown = codeOf("src/widgets/Dropdown.tsx");
const dropdownButton = codeOf("src/widgets/DropdownButton.tsx");
const button = codeOf("src/widgets/Button.tsx");
const family = { Dropdown: dropdown, DropdownButton: dropdownButton };

test("Dropdown, DropdownButton, and useDropdownClose are exported from the internal components barrel", () => {
  assert.equal(
    typeof dist.Dropdown,
    "function",
    "Dropdown must be exported from the internal components barrel",
  );
  assert.equal(
    typeof dist.useDropdownClose,
    "function",
    "useDropdownClose must be exported from the internal components barrel",
  );
  // DropdownButton is a forwardRef component: an exotic component
  // object, not a plain function.
  assert.ok(
    ["function", "object"].includes(typeof dist.DropdownButton) && dist.DropdownButton !== null,
    "DropdownButton must be exported from the internal components barrel",
  );
});

test("Dropdown is a shell with one children slot and no items view-model", () => {
  assert.match(dropdown, /trigger: ReactNode/);
  assert.match(dropdown, /children\?: ReactNode/);
  assert.doesNotMatch(
    dropdown,
    /\bitems\?:/,
    "the items model was superseded by the children slot",
  );
  assert.doesNotMatch(
    dropdown,
    /\bonSelect\b/,
    "selection reporting belongs to the composed content",
  );
  assert.doesNotMatch(dropdown, /\bMenuItem\b/, "no item types survive the redirect");
});

test("Dropdown resolves controlled vs uncontrolled open state and reports changes", () => {
  assert.match(dropdown, /open\?: boolean/);
  assert.match(dropdown, /defaultOpen\?: boolean/);
  assert.match(dropdown, /onOpenChange\?: \(open: boolean\) => void/);
  assert.match(dropdown, /const open = openProp \?\? internalOpen/);
  assert.match(dropdown, /onOpenChange\?\.\(next\)/);
});

test("anchoring is the semantic side/align subset composed into the Popover placement", () => {
  assert.match(dropdown, /export type DropdownSide = "top" \| "bottom"/);
  assert.match(dropdown, /export type DropdownAlign = "start" \| "end"/);
  assert.match(dropdown, /placement=\{`\$\{side\}-\$\{align\}`\}/);
  assert.match(dropdown, /allowFlip/);
  assert.doesNotMatch(
    dropdown,
    /bottom-start|top-end/,
    "raw Popper placement strings must not leak",
  );
});

test("the trigger is composed through Popover.Trigger so the primitive registers it (focus return), with its own press toggle disabled", () => {
  // An Anchor-only shell never registers a trigger with the Popover,
  // so the primitive's close-focus-restoration has no element to
  // return focus to. The Trigger composition registers it; the
  // primitive's press toggle is disabled because toggling belongs to
  // the trigger itself (DropdownButton, through the Dropdown
  // context) — both firing would double-toggle.
  assert.match(dropdown, /<Popover\.Trigger asChild disablePressTrigger>/);
  assert.doesNotMatch(dropdown, /<Popover\.Anchor>/);
  // DropdownButton forwards the injected activation props + ref to
  // the Button it renders, so registration reaches the real button.
  assert.match(dropdownButton, /type DropdownButtonTriggerProps = \{/);
  assert.match(dropdownButton, /ref=\{ref\}/);
  assert.match(dropdownButton, /onPressIn=\{onPressIn\}/);
  assert.match(dropdownButton, /onFocus=\{onFocus\}/);
});

test("refs reach the rendered button on the React 18 peer (forwardRef, not ref-as-prop), and close-focus keeps the previous-focus fallback for programmatic opens", () => {
  // The peer range starts at React 18, where a plain function
  // component never receives `ref` through its props — a
  // props-carried ref is dropped silently, and with it the
  // Popover's trigger registration. Both components in the chain
  // must be forwardRef components.
  assert.match(button, /export const Button = forwardRef<TamaguiElement, ButtonProps>/);
  assert.match(dropdownButton, /export const DropdownButton = forwardRef</);
  // The Popover's close-focus composition cancels FocusScope's
  // previous-focus restoration and focuses only the target
  // registered on trigger activation; a programmatically opened
  // panel (defaultOpen, controlled open) has none and would strand
  // focus. The content opts out so the fallback survives.
  assert.match(dropdown, /onCloseAutoFocus=\{false\}/);
  // The fallback restores whatever was focused before opening, so a
  // trigger-activated open only returns focus to the trigger if the
  // trigger actually held focus — Safari never focuses a button on
  // click. DropdownButton therefore focuses its press target as
  // part of activation (onPress, immediately before the toggle) —
  // not on press-in, which also fires for touch-start/mouse-down
  // and would blur the user's active input on a scroll that never
  // opens the menu.
  assert.match(dropdownButton, /onPress=\{handlePress\}/);
  assert.match(dropdownButton, /target\?\.focus\?\.\(\);\s*context\?\.toggle\(\)/);
});

test("close-on-select is the context affordance (the spec's ExitContext descendant)", () => {
  assert.match(
    dropdown,
    /const DropdownContext = createContext<DropdownContextValue \| null>\(null\)/,
  );
  assert.match(dropdown, /export function useDropdownClose\(\): \(\) => void/);
  assert.match(dropdown, /return context\?\.close \?\? \(\(\) => undefined\)/);
  assert.match(dropdown, /<DropdownContext\.Provider value=\{contextValue\}>/);
});

test("the context carries the connected-surface geometry: side, align, and both measured widths (#474)", () => {
  assert.match(dropdown, /side: DropdownSide/);
  assert.match(dropdown, /align: DropdownAlign/);
  assert.match(dropdown, /triggerWidth: number \| null/);
  assert.match(dropdown, /panelWidth: number \| null/);
  // The shell measures both widths itself: the trigger's on the
  // trigger wrapper's onLayout, the panel's on the panel.
  assert.match(dropdown, /setTriggerWidth\(event\.nativeEvent\.layout\.width\)/);
  assert.match(dropdown, /setPanelWidth\(event\.nativeEvent\.layout\.width\)/);
  // The panel unmounts while closed, so its measured width goes
  // stale across a close: the shell resets it, and until the
  // reopened panel lays out, its far corner counts as not touching.
  assert.match(dropdown, /setPanelWidth\(null\)/);
});

test("only the corners that touch are squared: the aligned corner always, the far corner only when it actually touches (#474)", () => {
  assert.match(dropdown, /export function touchingCornerRadii\(/);
  assert.match(dropdown, /if \(farTouches\)/);
  assert.match(dropdown, /tokens\.radii\.zero/);
  // The far-corner rule lives in the shell's shared helper: an
  // element's far corner touches iff its own laid-out width is no
  // greater than the other's (within the 1px layout tolerance).
  // Both elements judge it from the same measured pair through
  // the context, so they can never apply different rules.
  assert.match(dropdown, /export function farCornerTouches\(/);
  assert.match(dropdown, /ownWidth <= otherWidth \+ 1/);
  assert.match(dropdownButton, /farCornerTouches\(context\.triggerWidth, context\.panelWidth\)/);
  assert.doesNotMatch(
    dropdownButton,
    /otherWidth/,
    "the far-corner comparison lives in the shell's helper, not the trigger",
  );
  // The panel squares the edge facing the trigger; the trigger
  // mirrors it on its own touching edge.
  assert.match(
    dropdown,
    /touchingCornerRadii\(\s*side === "bottom" \? "top" : "bottom",\s*align,\s*farCornerTouches\(panelWidth, triggerWidth\),?\s*\)/,
  );
  assert.match(
    dropdownButton,
    /touchingCornerRadii\(\s*context\.side === "bottom" \? "bottom" : "top",\s*context\.align,\s*farCornerTouches\(context\.triggerWidth, context\.panelWidth\),?\s*\)/,
  );
  // Closed, the trigger computes no override at all.
  assert.match(dropdownButton, /open && context !== null/);
});

test("touchingCornerRadii squares only the corners that touch, for every edge/alignment combination (#474)", async () => {
  // Behavioral, against the built module (the source scans above
  // cannot catch the helper returning the wrong corners).
  const { touchingCornerRadii } = await import("../../dist/widgets/Dropdown.js");
  // Far corner does not touch: only the aligned corner on the
  // touching edge.
  assert.deepEqual(touchingCornerRadii("top", "start", false), { borderTopLeftRadius: 0 });
  assert.deepEqual(touchingCornerRadii("top", "end", false), { borderTopRightRadius: 0 });
  assert.deepEqual(touchingCornerRadii("bottom", "start", false), {
    borderBottomLeftRadius: 0,
  });
  assert.deepEqual(touchingCornerRadii("bottom", "end", false), {
    borderBottomRightRadius: 0,
  });
  // Far corner touches: both corners on the touching edge, either
  // align.
  for (const align of ["start", "end"] as const) {
    assert.deepEqual(touchingCornerRadii("top", align, true), {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    });
    assert.deepEqual(touchingCornerRadii("bottom", align, true), {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    });
  }
});

test("farCornerTouches judges each element's far corner against the other's span, across the three width geometries (#474)", async () => {
  // Behavioral, against the built module. The panel and the
  // trigger each compose the two helpers with their own width
  // first: the panel farCornerTouches(panelWidth, triggerWidth),
  // the trigger farCornerTouches(triggerWidth, panelWidth).
  const { touchingCornerRadii, farCornerTouches } = await import("../../dist/widgets/Dropdown.js");
  // The predicate itself: an element's far corner touches iff its
  // own width is no greater than the other's (1px tolerance), and
  // never before both widths are measured.
  assert.equal(farCornerTouches(200, 300), true, "own far edge lands inside the other's span");
  assert.equal(farCornerTouches(300, 200), false, "own far corner overhangs and touches nothing");
  assert.equal(farCornerTouches(240, 240), true, "equal widths: the far corners coincide");
  assert.equal(farCornerTouches(241, 240), true, "within the 1px layout tolerance");
  assert.equal(farCornerTouches(242, 240), false, "past the tolerance the corner overhangs");
  assert.equal(farCornerTouches(null, 240), false, "own width unmeasured");
  assert.equal(farCornerTouches(240, null), false, "other width unmeasured");

  // Geometry 1 — button wider than the panel (trigger 300, panel
  // at its 200px minimum), align start, panel below the trigger:
  // the panel squares BOTH top corners (its right edge lands under
  // the button); the trigger squares only its bottom-left — its
  // bottom-right overhangs the panel and keeps its radius. (This
  // is the case an equality-only rule got wrong: the panel's
  // top-right stayed rounded under the button.)
  assert.deepEqual(touchingCornerRadii("top", "start", farCornerTouches(200, 300)), {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  });
  assert.deepEqual(touchingCornerRadii("bottom", "start", farCornerTouches(300, 200)), {
    borderBottomLeftRadius: 0,
  });

  // Geometry 2 — panel wider than the button (panel 250 over a
  // short-label trigger at 150), align start: the mirror image.
  // The trigger squares BOTH bottom corners (its right edge lands
  // on the panel's top edge); the panel squares only its top-left —
  // its top-right overhangs the trigger and keeps its radius.
  assert.deepEqual(touchingCornerRadii("top", "start", farCornerTouches(250, 150)), {
    borderTopLeftRadius: 0,
  });
  assert.deepEqual(touchingCornerRadii("bottom", "start", farCornerTouches(150, 250)), {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  });

  // Geometry 3 — equal widths (240/240): all four touching corners
  // square, on either alignment.
  for (const align of ["start", "end"] as const) {
    assert.deepEqual(touchingCornerRadii("top", align, farCornerTouches(240, 240)), {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    });
    assert.deepEqual(touchingCornerRadii("bottom", align, farCornerTouches(240, 240)), {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    });
  }

  // The same button-wider geometry under align end: the coincident
  // edge is the right one, so the panel squares both top corners
  // (its left edge now lands on the button) and the trigger only
  // its bottom-right.
  assert.deepEqual(touchingCornerRadii("top", "end", farCornerTouches(200, 300)), {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  });
  assert.deepEqual(touchingCornerRadii("bottom", "end", farCornerTouches(300, 200)), {
    borderBottomRightRadius: 0,
  });
});

test("the panel is a styled Popover.Content frame with the a11y label routed through the translator", () => {
  assert.match(dropdown, /styled\(Popover\.Content, \{/);
  assert.match(dropdown, /name: "DropdownContent"/);
  assert.match(dropdown, /platformAccessibilityProps\(\{ accessibilityLabel \}\)/);
});

test("DropdownButton is props-described: label/icon in, DS Button + CollapsibleIcon rendered", () => {
  assert.match(dropdownButton, /from "\.\/Button\.js"/);
  assert.match(
    dropdownButton,
    /import \{ CollapsibleIcon \} from "\.\.\/icons\/CollapsibleIcon\.js"/,
  );
  assert.match(dropdownButton, /<CollapsibleIcon key="chevron" isOpen=\{open\}/);
  assert.match(dropdownButton, /label: string/);
  assert.match(dropdownButton, /icon: IconName/);
});

test("an icon-only DropdownButton requires its accessibility label at the type level", () => {
  assert.match(dropdownButton, /label\?: undefined/);
  assert.match(dropdownButton, /accessibilityLabel: string/);
});

test("DropdownButton wires haspopup + expanded state and toggles through the Dropdown context", () => {
  assert.match(dropdownButton, /useDropdownContext\(\)/);
  assert.match(dropdownButton, /const open = context\?\.open \?\? false/);
  assert.match(dropdownButton, /accessibilityState=\{\{ expanded: open \}\}/);
  // "dialog", not "true" (which ARIA reads as "menu"): the value
  // names the popup's role, and the Popover panel's role is dialog —
  // the same value Tamagui's floating layer computes for a trigger.
  assert.match(dropdownButton, /aria-haspopup="dialog"/);
  assert.match(dropdownButton, /context\?\.toggle\(\)/);
  // The raw accessibility props above land ONLY on the DS Button —
  // the sanctioned caller API, since Button translates them (#235).
  // DropdownButton renders no Tamagui stack of its own that a raw
  // prop could leak through.
  assert.doesNotMatch(dropdownButton, /styled\(|<XStack|<YStack|<View/);
});

test("the family follows the DS hard rules: aliases only, no margins, no direct native imports, no styling props", () => {
  for (const [name, code] of Object.entries(family)) {
    assert.doesNotMatch(code, /\binterface\s/, `${name} must use type aliases, not interfaces`);
    assert.doesNotMatch(
      code,
      /\bmargin(Top|Bottom|Left|Right|Vertical|Horizontal)?=/,
      `${name} must space with gap/padding, not margins (#209)`,
    );
    assert.doesNotMatch(
      code,
      /from "(react-native|react-native-svg)/,
      `${name} must not import react-native/react-native-svg directly`,
    );
    assert.doesNotMatch(code, /name: "Spudly/, `${name} must not prefix styled names with Spudly`);
    assert.doesNotMatch(code, /\bstyle\?:/, `${name} must not accept a style prop`);
    assert.doesNotMatch(code, /className/, `${name} must not accept a className prop`);
  }
  assert.match(dropdown, /export type DropdownProps = \{/);
  assert.match(dropdownButton, /export type DropdownButtonProps = /);
});

// Runtime imports are lazy (inside the SSR tests) so the source-scan
// tests above still run and report when the build output is missing
// or broken, instead of the whole file failing at import time.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const distModule: Record<string, any> = await loadInternalDist();
    return { React, renderToString, TamaguiProvider, ...distModule };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(TamaguiProvider, { config, defaultTheme: "light" }, element),
  );
}

test("SSR: a closed dropdown renders its trigger collapsed and no panel content", async () => {
  const { React, Dropdown, DropdownButton } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      Dropdown,
      {
        trigger: React.createElement(DropdownButton, { label: "Recipe actions" }),
        accessibilityLabel: "Recipe actions",
      },
      React.createElement("span", null, "PANEL CONTENT"),
    ),
  );
  assert.ok(html.includes("Recipe actions"), "the trigger label must render");
  assert.ok(html.includes('aria-haspopup="dialog"'), "the trigger must carry aria-haspopup");
  assert.ok(html.includes('aria-expanded="false"'), "the trigger must report its collapsed state");
  assert.ok(!html.includes("PANEL CONTENT"), "a closed dropdown must not render its panel content");
  assert.ok(!html.includes("accessibilitylabel"), "no raw RN accessibility attributes may leak");
});

test("SSR: an open dropdown's trigger reports aria-expanded=true", async () => {
  const { React, Dropdown, DropdownButton } = await loadRuntime();
  const html = await renderToHtml(
    React.createElement(
      Dropdown,
      {
        open: true,
        trigger: React.createElement(DropdownButton, { label: "Recipe actions" }),
        accessibilityLabel: "Recipe actions",
      },
      React.createElement("span", null, "PANEL CONTENT"),
    ),
  );
  assert.ok(html.includes('aria-expanded="true"'), "the trigger must report its expanded state");
});
