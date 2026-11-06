import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";
import test from "node:test";

// #278 Phase 2: the skeleton loading system — BoxSkeleton /
// CircleSkeleton / TextSkeleton primitives on the shared
// SkeletonClock, the internal LoadingScope, and Stephen's
// normalization amendment (the loading prop is `loading`
// everywhere; `isLoading` no longer exists in the package).

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (path: string) => readFileSync(join(root, path), "utf8");
const readCode = (path: string) =>
  read(path)
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".test.ts")
    )
      yield path;
  }
}

// Runtime imports are lazy (inside the SSR tests) so the
// source-scan tests still run and report when the build output is
// missing or broken.
let runtimePromise;
function loadRuntime() {
  runtimePromise ??= (async () => {
    const reactModule = await import("react");
    const React = reactModule.default;
    const { renderToString } = await import("react-dom/server");
    const { TamaguiProvider }: Record<string, any> = await import("tamagui");
    const dist: Record<string, any> = await loadInternalDist();
    const loadingScope: Record<string, any> = await import("../../dist/components/LoadingScope.js");
    return { React, renderToString, TamaguiProvider, ...dist, ...loadingScope };
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

// Bones are the elements carrying the styled component's name;
// count those (the TamaguiProvider adds its own aria-hidden
// config span to every SSR render).
const hiddenBones = (html: string) =>
  (html.match(/name="SkeletonBone" aria-hidden="true"/g) ?? []).length;

test("the skeleton primitives and the clock are exported from the internal components barrel", async () => {
  const { BoxSkeleton, CircleSkeleton, TextSkeleton, SkeletonClock } = await loadRuntime();
  for (const [name, value] of Object.entries({
    BoxSkeleton,
    CircleSkeleton,
    TextSkeleton,
    SkeletonClock,
  })) {
    assert.equal(typeof value, "function", `${name} must be exported from the components barrel`);
  }
});

test("LoadingScope and the clock internals stay off every export surface", async () => {
  // Not on the internal surface the other tests load…
  const internalDist: Record<string, any> = await loadInternalDist();
  assert.equal(internalDist.LoadingScope, undefined, "LoadingScope is internal — composites only");
  assert.equal(internalDist.useLoadingScope, undefined, "useLoadingScope is internal");
  assert.equal(internalDist.useSkeletonOpacity, undefined, "the clock's reader hook is internal");
  assert.equal(internalDist.SkeletonBone, undefined, "SkeletonBone is an internal building block");
  // …and not on the public surface either: the package root's
  // type entry (dist/index.d.ts, the pages barrel) names none of
  // them — the runtime root is not Node-importable (#298), so the
  // public check scans its declarations.
  const publicTypes = read("dist/index.d.ts");
  for (const name of ["LoadingScope", "useLoadingScope", "useSkeletonOpacity", "SkeletonBone"]) {
    assert.ok(!publicTypes.includes(name), `${name} must not appear in the public type surface`);
  }
  assert.ok(
    !read("src/components/index.ts").includes("LoadingScope"),
    "the components barrel must not export LoadingScope",
  );
});

test("every bone pulses on the one shared clock — primitives own no loop", () => {
  for (const name of ["BoxSkeleton", "CircleSkeleton", "TextSkeleton"]) {
    const code = readCode(`src/components/${name}.tsx`);
    assert.match(
      code,
      /from "\.\/SkeletonClock\.js"/,
      `${name} must build on the shared clock's bone`,
    );
    assert.doesNotMatch(
      code,
      /requestAnimationFrame|Animated|setInterval/,
      `${name} must not run its own animation loop`,
    );
  }
  const clock = readCode("src/components/SkeletonClock.tsx");
  assert.match(clock, /requestAnimationFrame/, "the clock is the one place a frame loop lives");
  assert.match(
    clock,
    /Date\.now\(\) % CYCLE_MS|now % CYCLE_MS/,
    "the phase derives from absolute time, so staggered mounts stay in sync",
  );
  assert.match(
    clock,
    /addEventListener\("change", \(event\) => store\.setFrozen\(event\.matches\)\)/,
    "the provider-less default store live-tracks the reduced-motion preference",
  );
});

test("bones are hidden from assistive tech and filled with the theme border role", async () => {
  const clock = readCode("src/components/SkeletonClock.tsx");
  assert.match(
    clock,
    /platformAccessibilityProps\(\{ accessibilityElementsHidden: true \}\)/,
    "bones hide via the shared accessibility translator",
  );
  assert.match(clock, /theme\.borderColor/, "the fill is the active theme's border role");

  const { React, TextSkeleton, BoxSkeleton, CircleSkeleton } = await loadRuntime();
  const textHtml = await renderToHtml(React.createElement(TextSkeleton, { lines: 3 }));
  assert.equal(hiddenBones(textHtml), 3, "a 3-line TextSkeleton renders exactly 3 hidden bones");
  const boxHtml = await renderToHtml(React.createElement(BoxSkeleton, { width: 120, height: 80 }));
  assert.equal(hiddenBones(boxHtml), 1, "a BoxSkeleton renders exactly 1 hidden bone");
  const circleHtml = await renderToHtml(React.createElement(CircleSkeleton, { size: 48 }));
  assert.equal(hiddenBones(circleHtml), 1, "a CircleSkeleton renders exactly 1 hidden bone");
});

test("TextSkeleton tolerates non-finite line counts", async () => {
  const { React, TextSkeleton } = await loadRuntime();
  const nanHtml = await renderToHtml(React.createElement(TextSkeleton, { lines: Number.NaN }));
  assert.equal(hiddenBones(nanHtml), 1, "a NaN line count falls back to exactly 1 bone");
  const infHtml = await renderToHtml(
    React.createElement(TextSkeleton, { lines: Number.POSITIVE_INFINITY }),
  );
  assert.equal(hiddenBones(infHtml), 1, "an infinite line count falls back to exactly 1 bone");
});

test("a frozen clock renders static, deterministic output", async () => {
  const { React, SkeletonClock, TextSkeleton, CircleSkeleton } = await loadRuntime();
  const composition = () =>
    React.createElement(
      SkeletonClock,
      { frozen: true },
      React.createElement(CircleSkeleton, { size: 40 }),
      React.createElement(TextSkeleton, { lines: 2 }),
    );
  const first = await renderToHtml(composition());
  const second = await renderToHtml(composition());
  assert.equal(first, second, "frozen renders must be byte-identical across renders");
  assert.match(first, /opacity:\s*0\.72/, "the frozen pulse sits at the static mid-opacity");
});

test("LoadingScope carries the loading flag to internal consumers only", async () => {
  const { React, LoadingScope, useLoadingScope } = await loadRuntime();
  const Probe = () => React.createElement("span", null, useLoadingScope() ? "loading" : "idle");
  const active = await renderToHtml(
    React.createElement(LoadingScope, { active: true }, React.createElement(Probe)),
  );
  assert.match(active, />loading</, "inside an active scope the consumer sees the loading state");
  const idle = await renderToHtml(React.createElement(Probe));
  assert.match(idle, />idle</, "outside any scope the consumer sees the idle state");
});

test("primitive props are semantic geometry only — no styling props", () => {
  const box = read("src/components/BoxSkeleton.tsx");
  assert.match(box, /export type BoxSkeletonProps = \{/);
  assert.match(box, /width\?: number \| `\$\{number\}%`/);
  assert.match(box, /height\?: number/);
  assert.doesNotMatch(box, /color|background|style|className|borderRadius\?/);
  const circle = read("src/components/CircleSkeleton.tsx");
  assert.match(circle, /export type CircleSkeletonProps = \{/);
  assert.match(circle, /size\?: number/);
  assert.doesNotMatch(circle, /color|background|style|className/);
  const text = read("src/components/TextSkeleton.tsx");
  assert.match(text, /export type TextSkeletonProps = \{/);
  assert.match(text, /lines\?: number/);
  assert.doesNotMatch(text, /color|background|style|className|width\?|fontSize/);
});

test("the loading prop is `loading` everywhere — `isLoading` is gone from src", () => {
  for (const path of sourceFiles(join(root, "src"))) {
    const code = readFileSync(path, "utf8")
      .replaceAll(/\/\*[\s\S]*?\*\//g, "")
      .replaceAll(/(^|[^:])\/\/.*$/gm, "$1");
    assert.ok(
      !code.includes("isLoading"),
      `${path} still names a prop isLoading — the normalization renames it to loading`,
    );
  }
  // Spot-pin the renamed surfaces, plain and qualified.
  assert.match(read("src/components/CheckboxSelectList.tsx"), /\bloading\?: boolean/);
  assert.match(read("src/views/AccessTokensPanel.tsx"), /\bloading\?: boolean/);
  // RecipesPage's loading props are the qualified forms since
  // #415 (one per section of the unified page): loading +
  // qualifier, never isLoading.
  assert.match(read("src/pages/RecipesPage.tsx"), /\bloadingOwn: boolean/);
  assert.match(read("src/pages/RecipesPage.tsx"), /\bloadingDiscovery: boolean/);
  assert.match(read("src/pages/RecipeFormPage.tsx"), /\bloadingTags\?: boolean/);
  assert.match(
    read("src/components/RecipeIngredientsPanel.tsx"),
    /\bloadingSubstitutions\?: boolean/,
  );
  assert.match(read("src/pages/RecipeDetailPage.tsx"), /\bloadingSubstitutions\?: boolean/);
  assert.match(read("src/pages/RecipeDetailPage.tsx"), /\bloading\?: boolean/);
});
