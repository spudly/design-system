/**
 * Contract test for spudly/design-system#299: ScreenContainer's
 * content column carries the shell's static 16px
 * section gap, and pages rely on it as
 * their only section separation (e.g. MealPlansPage's loading
 * spinner sits "16px below the create button" per
 * the shells' colocated .test.steps.md files). On web the gap never
 * reached the children:
 * every scrollable-shell page stacked its blocks flush (measured
 * 0px at every joint in the react Storybook), while native rendered
 * the 16dp separation correctly.
 *
 * Root cause (reproduced in SSR against the built output): the
 * #265 fix destructured `gap` out of ScreenContainer's props and
 * passed it back unconditionally as `gap={gap}`. When the caller
 * passes no gap — the normal case — that is an explicit
 * `gap={undefined}` prop, and in Tamagui's web style merge an
 * explicitly-present prop overrides the styled component's static
 * value: the `gap:16px` CSS rule is generated but its class is
 * never applied to the element, so the column's computed rowGap is
 * `normal`. Native's merge ignores the undefined and keeps the
 * static gap, which is why only web lost the separation. A styled
 * component with a static gap renders the gap class when no gap
 * prop is passed, and loses it the moment `gap={undefined}` is
 * passed — both halves are pinned by the runtime tests below via
 * ScreenContainer itself.
 *
 * The contract now (#746, Option B: the column is a Col the
 * container renders directly — there is no styled static gap):
 * 1. Source: ScreenContainer resolves the caller's gap over its
 *    own 16px ("l") default in code and spreads the resolved
 *    size into Col only when one resolved; it never passes
 *    `gap={gap}` unconditionally.
 * 2. Runtime (SSR, against the built output): the ScreenContainer
 *    element carries a class whose generated CSS rule is
 *    `gap:16px`, in both the scrollable (default) and
 *    non-scrollable shells, when the caller passes no gap.
 * 3. A caller's explicit gap still wins (the #265 contract):
 *    `gap={24}` renders `gap:24px` on the shell column, and the
 *    auth variant's capped inner column carries the 16px gap when
 *    no caller gap is passed.
 */
import "../../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { loadInternalDist } from "../../../test/internalDist.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
function readCode(rel: string) {
  return readFileSync(join(root, rel), "utf8")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
}
test("the list variant flexes on native so it bounds its list within the shell frame (eciperay #526)", () => {
  const code = readCode("src/widgets/layout/ScreenContainer.tsx");
  assert.match(
    code,
    /const boundedFlexProps = \{ grow: true, shrink: true \} as const;/,
    "the bounded-region flex must bound the container — without it the container sizes to content and a flex: 1 FlatList inside it computes to height 0 in Yoga, rendering the native page body empty (the @spudly/ui 9.2.0 regression). #746: flex: 1's translation is Col's grow shrink — in the frame's definite height the child lands at the frame height from either basis",
  );
  assert.match(
    code,
    /\{\.\.\.\(variant === "list" && !isWeb \? boundedFlexProps : null\)\}/,
    "the list variant must receive the bounded-region flex only on native: on web flex: 1's zero basis collapses a column inside BigFooterShell's space-between shell (the ScreenShell / PR #556 geometry)",
  );
});

test("the default variant flexes on native so form shell pages bound their scroll region (#676)", () => {
  const code = readCode("src/widgets/layout/ScreenContainer.tsx");
  assert.match(
    code,
    /const defaultFlexProps = \{ grow: true \} as const;/,
    "the default variant's native flex must be flexGrow: 1 with an automatic basis — flex: 1's zero basis would contribute no content height inside BigFooterShell's shell-mode ScrollView column, clipping pages taller than the viewport (#676 review). #746: the translation is Col's grow alone",
  );
  assert.match(
    code,
    /\{\.\.\.\(variant === "default" && !isWeb \? defaultFlexProps : null\)\}/,
    'the default variant (the destructured variant defaults to "default" when no variant is passed) must receive the native bounded-region flex, native-only — without it a default-variant container sizes to content and a flex: 1 scroll region inside it computes to height 0 in Yoga, so Edit Recipe / Edit Version / Manual Entry rendered only their heading on Android (#676); on web the document scrolls and no flex prop is applied',
  );
  // The composition that needs the bounded height: the three form
  // shell pages render a default-variant ScreenContainer, and their
  // content's shell hosts a flex: 1 scroll region. Pinning the
  // composition (not just the flex prop's presence) is the
  // layout-aware half of this regression coverage — if a page stops
  // composing this way, or the scroll region stops flexing, this
  // test forces a re-check of the #676 mechanism.
  for (const page of ["EditRecipePage", "EditVersionPage", "ManualEntryPage"]) {
    const pageCode = readCode(`src/pages/eciperay/${page}.tsx`);
    assert.match(
      pageCode,
      /<ScreenContainer>/,
      `${page} must render the default-variant ScreenContainer whose native flex bounds its form body (#676)`,
    );
  }
  const recipeFormCode = readCode("src/pages/eciperay/RecipeFormPage.tsx");
  assert.match(
    recipeFormCode,
    /scrollMode="content"/,
    "RecipeFormPage must keep rendering its content-mode shell, whose native ScrollRegion flexes inside the default-variant ScreenContainer's bounded height (#676)",
  );
});

test("the container resolves the caller's gap over its own 16px default (#299)", () => {
  const code = readCode("src/widgets/layout/ScreenContainer.tsx");
  // Scoped to the outer Col: the raw caller gap is forwarded to
  // AuthContent (which resolves it the same way before touching
  // its own Col), but the outer stack must never receive it
  // unconditionally.
  const outerCol = code.slice(
    code.indexOf('name="ScreenContainer"'),
    code.indexOf("style={composedStyle}"),
  );
  assert.ok(
    !outerCol.includes('gap={gap}'),
    "an unconditional gap={gap} passes gap={undefined} when no caller gap exists, clobbering the static 16px gap on web",
  );
  // #746 (Option B): there is no styled static gap to protect —
  // the container resolves the caller's gap over its own "l"
  // (16px) default in code and spreads the resolved size into
  // Col only when it resolved to a t-shirt size, so an absent
  // caller gap can never reach the stack as an explicit
  // undefined (the #299 hazard in its new shape).
  assert.match(
    code,
    /const outerGap = resolveGap\(gap \?\? "l"\);/,
    "the container must resolve the caller's gap over its own 16px default in code",
  );
  assert.match(
    code,
    /\{\.\.\.\(outerGap\.size !== undefined \? \{ gap: outerGap\.size \} : null\)\}/,
    "the resolved gap reaches Col via a conditional spread so a non-scale numeric gap (which rides the style channel) leaves Col's gap unset",
  );
});

// Runtime imports are lazy (inside the SSR tests) so the source scan
// above still runs and reports when the build output is missing or
// broken, instead of the whole file failing at import time.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
    };
  })();
  return runtimePromise;
}
async function renderToHtml(element: any) {
  const { renderToString, TamaguiProvider, createTamaguiConfig, baseTheme } = await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    <TamaguiProvider config={config} defaultTheme="light">
      {element}
    </TamaguiProvider>,
  );
}

/** The generated CSS declarations for one class in the SSR style block. */
function declarationsFor(html: string, className: any) {
  const match = new RegExp(String.raw`\.${className}\{([^}]*)\}`).exec(html);
  return match ? match[1] : "";
}

/** The gap value (e.g. "16px") the named element's classes generate, or null. */
function renderedGap(html: string, elementName: any) {
  const element = new RegExp(`<div name="${elementName}" class="([^"]*)"`).exec(html);
  assert.ok(element, `expected a rendered element named ${elementName} in: ${html.slice(-600)}`);
  for (const className of element[1].split(/\s+/)) {
    const declarations = declarationsFor(html, className);
    const gap = declarations.match(/(?:^|;)gap:([\d.]+px)/);
    if (gap) return gap[1];
  }
  return null;
}
async function renderShell(props: any) {
  const { ScreenContainer } = await loadRuntime();
  const child = (label: string) => <div key={label}>{label}</div>;
  return renderToHtml(
    <ScreenContainer {...props}>
      {child("a")}
      {child("b")}
    </ScreenContainer>,
  );
}
/** The flex declaration (e.g. "1 0px") the named element's classes generate, or null. */
function renderedFlex(html: string, elementName: any) {
  const element = new RegExp(`<div name="${elementName}" class="([^"]*)"`).exec(html);
  assert.ok(element, `expected a rendered element named ${elementName} in: ${html.slice(-600)}`);
  for (const className of element[1].split(/\s+/)) {
    // Tamagui emits one rule block per declaration group under the
    // same class, so scan every block for this class, not just the
    // first (declarationsFor returns the first block only).
    const blocks = html.match(new RegExp(String.raw`\.${className}\{[^}]*\}`, "g")) ?? [];
    for (const block of blocks) {
      const flex = /\{flex:([^;}]+)/.exec(block);
      if (flex) return flex[1];
    }
  }
  return null;
}
test("SSR: the list variant's column carries NO flex on web (eciperay #526)", async () => {
  const html = await renderShell({
    variant: "list",
  });
  assert.equal(
    renderedFlex(html, "ScreenContainer"),
    null,
    "on web the list variant must not generate a flex rule — flex: 1's zero basis collapses the column inside BigFooterShell's space-between shell (the ScreenShell / PR #556 geometry); the bounding flex is native-only",
  );
});
test("SSR: the default variant's column carries NO flex on web (#676)", async () => {
  const html = await renderShell({});
  assert.equal(
    renderedFlex(html, "ScreenContainer"),
    null,
    "on web the default variant must not generate a flex rule — flex: 1's zero basis collapses the column inside BigFooterShell's space-between shell (the ScreenShell / PR #556 geometry); the bounding flex is native-only (#676)",
  );
});
test("SSR: the shell's column carries the 16px gap with no caller gap (#299, #547)", async () => {
  const html = await renderShell(null);
  assert.equal(renderedGap(html, "ScreenContainer"), "16px");
});
test("SSR: the shell renders no scroller — the same column carries the 16px gap (#547)", async () => {
  const html = await renderShell({});
  assert.equal(renderedGap(html, "ScreenContainer"), "16px");
});
test("SSR: a caller's explicit gap still overrides the shell column's gap (#265/#299)", async () => {
  const html = await renderShell({
    gap: 24,
  });
  assert.equal(renderedGap(html, "ScreenContainer"), "24px");
});
test("SSR: the auth shell's capped column carries the 16px gap with no caller gap (#299)", async () => {
  const html = await renderShell({
    variant: "auth",
  });
  assert.equal(renderedGap(html, "ScreenContainerAuthContent"), "16px");
});
