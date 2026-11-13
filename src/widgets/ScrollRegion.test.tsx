/**
 * Contract test for ScrollRegion (spudly/design-system#119), the
 * shared inner scroll region extracted for the page de-styling
 * program's foundation: RecipeDetailPage, RecipeFormPage, and
 * PublicRecipePage (through ScrollShell) each composed the
 * identical ScrollView under their pinned chrome, and the region
 * owns that treatment so the pages compose it without rendering
 * a layout primitive (#119 bans ScrollView in pages outright).
 * SessionShell (AiSessionPage) composes it the same way.
 *
 * Platform split (#547, Stephen's page-scroll model): on native
 * the region is the page's single scroller — the ScrollView with
 * `flex: 1` and `keyboardShouldPersistTaps="handled"` inside the
 * shell's bounded frame (the composing pages' shells run in
 * BigFooterShell's "content" mode, so no second ScrollView ever
 * wraps it). On web the region renders NO scroller: the document
 * scrolls the whole page through BigFooterShell's whole-page
 * composition, so the region is a plain growing column and its
 * content flows at full height with the footer after it. A web
 * ScrollView here collapses to zero height inside the shell's
 * unbounded column and swallows the page's content into an
 * invisible bounded region — the survival the rendered-Storybook
 * audit on PR #556 caught on RecipeDetailPage, RecipeFormPage,
 * EditRecipePage, ManualEntryPage, and PublicRecipePage, whose
 * web stories rendered as chrome and footer with the page's
 * content inside a zero-height scroller (clientHeight 0,
 * scrollHeight in the thousands).
 *
 * The SSR tests below are rendered-output assertions, not source
 * shape: they render the real compositions and fail if any
 * element in the rendered web markup carries a vertical-scroll
 * overflow — the check whose absence let the survival pass every
 * gate while the rendered page was wrong.
 */
import "../../test/registerSvgStub.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { makeRenderToHtml, verticalScrollers } from "../../test/wholePageFlow.js";
const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "../..", "src", "widgets", "ScrollRegion.tsx"), "utf8");
const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
test("ScrollRegion is exported from the built internal components barrel", async () => {
  const dist: Record<string, any> = await import("../../dist/widgets/index.js");
  assert.equal(
    typeof dist.ScrollRegion,
    "function",
    "ScrollRegion must be exported from the internal components barrel",
  );
});
test("ScrollRegionProps is a type-only export from the built components barrel", () => {
  const types = readFileSync(join(here, "../..", "dist", "widgets", "index.d.ts"), "utf8");
  assert.match(types, /ScrollRegionProps/);
});
test("the contract is children only — no styling surface", () => {
  assert.match(code, /export type ScrollRegionProps = \{\s+children: ReactNode;\s+\};/);
});
test("native keeps the region's single ScrollView; the web path renders no ScrollView (#547)", () => {
  assert.match(
    code,
    /<ScrollView flex=\{1\} keyboardShouldPersistTaps="handled" tabIndex=\{0\}>/,
    "the native branch keeps the ScrollView treatment the pages were extracted from",
  );
  assert.equal(
    (code.match(/<ScrollView/g) ?? []).length,
    1,
    "exactly one ScrollView in the file — the native branch only",
  );
  assert.match(code, /if \(isWeb\) \{/, "the web path is an explicit platform branch");
  assert.match(
    code,
    /<YStack flexGrow=\{1\} flexDirection="column">/,
    "the web branch renders a plain growing column — no scroller, no bounded region",
  );
});

// Runtime imports are lazy, like the other contract tests, so the
// source scans still run when the build output is missing.
let runtimePromise: Promise<Record<string, any>> | undefined;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const { loadInternalDist } = await import("../../test/internalDist.js");
    const dist: Record<string, any> = await loadInternalDist();
    const { ScrollRegion }: Record<string, any> =
      await import("../../dist/widgets/ScrollRegion.js");
    const { BigFooterShell }: Record<string, any> = await import("../../dist/widgets/BigFooter.js");
    const { PublicRecipePage }: Record<string, any> =
      await import("../../dist/pages/PublicRecipePage.js");
    const { eciperayFooterFixture }: Record<string, any> =
      await import("../../dist/pages/fixtures.js");
    return {
      React,
      renderToString,
      TamaguiProvider,
      ...dist,
      ScrollRegion,
      BigFooterShell,
      PublicRecipePage,
      eciperayFooterFixture,
    };
  })();
  return runtimePromise;
}
const renderToHtml = makeRenderToHtml(loadRuntime);
test("SSR: ScrollRegion inside the page shell renders no web scroller and the footer follows the full content (#547)", async () => {
  const { ScrollRegion, BigFooterShell, Text, eciperayFooterFixture } = await loadRuntime();
  const markers = Array.from(
    {
      length: 30,
    },
    (_, index) => <Text key={index}>{`Scroll region section ${index + 1}`}</Text>,
  );
  const html = await renderToHtml(
    <BigFooterShell footer={eciperayFooterFixture} scrollMode="content">
      <ScrollRegion>{markers}</ScrollRegion>
    </BigFooterShell>,
  );
  assert.deepEqual(
    verticalScrollers(html),
    [],
    "no element in the rendered web composition may be a vertical scroller",
  );
  for (let index = 1; index <= 30; index += 1) {
    assert.ok(html.includes(`Scroll region section ${index}`), `section ${index} renders`);
  }
  const lastSectionAt = html.indexOf("Scroll region section 30");
  const footerAt = html.indexOf('role="contentinfo"');
  assert.ok(footerAt !== -1, "the footer renders");
  assert.ok(
    lastSectionAt !== -1 && lastSectionAt < footerAt,
    "the footer renders after the region's full content — whole-page flow, nothing swallowed",
  );
});
const publicRecipeReadyFixture = {
  state: "ready",
  overview: {
    title: "Landmark Soup",
    status: "idea",
    servingsLabel: "4",
    tags: [],
  },
  ctas: {
    variant: "signedOut",
  },
  onSignUpPress: () => undefined,
  onClonePress: () => undefined,
  onGetAppPress: () => undefined,
  ingredients: {
    servings: 4,
    onServingsChange: () => undefined,
    scaleValue: "1",
    onScaleChange: () => undefined,
    ingredients: [
      {
        id: "salt",
        label: "1 tsp salt",
        isOptional: false,
        isMissing: false,
      },
    ],
    onIngredientPress: () => undefined,
    substitutions: [],
  },
  instructions: {
    instructions: [
      {
        id: "step-1",
        stepNumber: 1,
        body: "Stir everything together.",
      },
    ],
  },
};
test("SSR: PublicRecipePage (ScrollShell → ScrollRegion) renders no web scroller (#547)", async () => {
  const { PublicRecipePage, eciperayFooterFixture } = await loadRuntime();
  const html = await renderToHtml(
    <PublicRecipePage {...publicRecipeReadyFixture} footer={eciperayFooterFixture} />,
  );
  assert.deepEqual(
    verticalScrollers(html),
    [],
    "the public recipe page's rendered web markup contains no vertical scroller",
  );
  assert.ok(html.includes("Landmark Soup"), "the page content renders");
  assert.ok(
    html.indexOf("Landmark Soup") < html.indexOf('role="contentinfo"'),
    "the footer renders after the page content",
  );
});
