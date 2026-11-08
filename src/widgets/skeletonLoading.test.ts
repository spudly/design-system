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
    const loadingScope: Record<string, any> = await import("../../dist/widgets/LoadingScope.js");
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
    !read("src/widgets/index.ts").includes("LoadingScope"),
    "the components barrel must not export LoadingScope",
  );
});

test("every bone pulses on the one shared clock — primitives own no loop", () => {
  for (const name of ["BoxSkeleton", "CircleSkeleton", "TextSkeleton"]) {
    const code = readCode(`src/widgets/${name}.tsx`);
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
  const clock = readCode("src/widgets/SkeletonClock.tsx");
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
  const clock = readCode("src/widgets/SkeletonClock.tsx");
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
  const box = read("src/widgets/BoxSkeleton.tsx");
  assert.match(box, /export type BoxSkeletonProps = \{/);
  assert.match(box, /width\?: number \| `\$\{number\}%`/);
  assert.match(box, /height\?: number/);
  assert.doesNotMatch(box, /color|background|style|className|borderRadius\?/);
  const circle = read("src/widgets/CircleSkeleton.tsx");
  assert.match(circle, /export type CircleSkeletonProps = \{/);
  assert.match(circle, /size\?: number/);
  assert.doesNotMatch(circle, /color|background|style|className/);
  const text = read("src/widgets/TextSkeleton.tsx");
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
  assert.match(read("src/widgets/CheckboxSelectList.tsx"), /\bloading\?: boolean/);
  assert.match(read("src/views/AccessTokensPanel.tsx"), /\bloading\?: boolean/);
  // RecipesPage's loading props are the qualified forms since
  // #415 (one per section of the unified page): loading +
  // qualifier, never isLoading.
  assert.match(read("src/pages/RecipesPage.tsx"), /\bloadingOwn: boolean/);
  assert.match(read("src/pages/RecipesPage.tsx"), /\bloadingDiscovery\?: boolean/);
  assert.match(read("src/pages/RecipeFormPage.tsx"), /\bloadingTags\?: boolean/);
  assert.match(read("src/widgets/RecipeIngredientsPanel.tsx"), /\bloadingSubstitutions\?: boolean/);
  assert.match(read("src/pages/RecipeDetailPage.tsx"), /\bloadingSubstitutions\?: boolean/);
  assert.match(read("src/pages/RecipeDetailPage.tsx"), /\bloading\?: boolean/);
});

// ---------------------------------------------------------------------------
// #278 Tranche 1 — list & card widgets: every converted composite
// takes the explicit `loading` prop, reads the internal
// LoadingScope (so a composite parent can skeletonize it without
// prop-drilling), renders skeletons with no real content or
// actions while loading, and renders unchanged while not loading.
// The collection widgets (CheckboxSelectList, MasonryGrid,
// StatBand) render exactly 3 dummy items while loading, and
// CheckboxSelectList's centered spinner is gone.

const T1_SCOPE_WIDGETS = [
  "CardRow",
  "ListRow",
  "DiscoveryCard",
  "PreviewCard",
  "CommentItem",
  "StatCard",
  "StatBand",
  "LogEntryCard",
  "TokenRow",
  "MasonryGrid",
  "CheckboxSelectList",
] as const;

test("T1: every converted list/card widget declares `loading` and reads the LoadingScope", () => {
  for (const name of T1_SCOPE_WIDGETS) {
    const code = readCode(`src/widgets/${name}.tsx`);
    assert.match(code, /\bloading\?: boolean/, `${name} must declare the explicit loading prop`);
    assert.match(code, /useLoadingScope/, `${name} must read the internal LoadingScope`);
    assert.match(
      code,
      /TextSkeleton|BoxSkeleton|StatCard/,
      `${name} must render skeletons (directly, or via a skeletonized child like StatBand's StatCards)`,
    );
  }
  // The shells: Card provides the scope (it has no scope to read);
  // SectionCard carries the flag through CardProps.
  const card = readCode("src/widgets/Card.tsx");
  assert.match(card, /\bloading\?: boolean/, "Card must declare the loading prop");
  assert.match(card, /LoadingScope/, "Card must provide the LoadingScope while loading");
  const sectionCard = readCode("src/widgets/SectionCard.tsx");
  assert.match(sectionCard, /loading/, "SectionCard must handle the loading flag");
  assert.match(sectionCard, /TextSkeleton/, "SectionCard must skeletonize its title");
});

test("T1: CheckboxSelectList's centered spinner is gone", () => {
  const code = readCode("src/widgets/CheckboxSelectList.tsx");
  assert.doesNotMatch(code, /Spinner/, "the loading list renders skeleton rows, not a spinner");
  assert.match(code, /LOADING_ROW_KEYS/, "the dummy rows come from a frozen constant");
});

test("T1 SSR: loading rows and cards render skeletons and no real content or actions", async () => {
  const { React, CardRow, ListRow, DiscoveryCard, CommentItem, LogEntryCard, TokenRow } =
    await loadRuntime();
  const noop = () => {};

  const cardRow = await renderToHtml(
    React.createElement(CardRow, {
      title: "Secret Plan",
      subtitle: "4 entries",
      onPress: noop,
      actionLabel: "Delete",
      onActionPress: noop,
      loading: true,
    }),
  );
  assert.equal(hiddenBones(cardRow), 2, "a loading CardRow renders title+subtitle bones");
  assert.ok(!cardRow.includes("Secret Plan"), "a loading CardRow shows no real title");
  assert.ok(!cardRow.includes("Delete"), "a loading CardRow renders no action");
  assert.match(cardRow, /aria-busy/, "a loading CardRow marks its region busy");

  const listRow = await renderToHtml(
    React.createElement(ListRow, {
      title: "Secret Stew",
      subtitle: "Serves 6",
      onPress: noop,
      loading: true,
    }),
  );
  assert.equal(hiddenBones(listRow), 2, "a loading ListRow renders title+subtitle bones");
  assert.ok(!listRow.includes("Secret Stew"), "a loading ListRow shows no real title");

  const discovery = await renderToHtml(
    React.createElement(DiscoveryCard, {
      title: "Secret Soup",
      subtitle: "By Maria",
      href: "/recipe/secret",
      loading: true,
    }),
  );
  assert.equal(
    hiddenBones(discovery),
    3,
    "a loading DiscoveryCard renders thumbnail + 2 text bones",
  );
  assert.ok(!discovery.includes("Secret Soup"), "a loading DiscoveryCard shows no real title");
  assert.ok(!discovery.includes("/recipe/secret"), "a loading DiscoveryCard renders no link");

  const comment = await renderToHtml(
    React.createElement(CommentItem, {
      authorName: "Secret Author",
      body: "Secret body text",
      canEdit: true,
      canDelete: true,
      onDelete: noop,
      loading: true,
    }),
  );
  assert.equal(hiddenBones(comment), 3, "a loading CommentItem renders 3 text bones");
  assert.ok(!comment.includes("Secret Author"), "a loading CommentItem shows no author");
  assert.ok(!comment.includes("Secret body text"), "a loading CommentItem shows no body");
  assert.ok(!comment.includes("Delete"), "a loading CommentItem renders no actions");

  const logEntry = await renderToHtml(
    React.createElement(LogEntryCard, {
      dateLabel: "Oct 12, 2026",
      starRating: 4,
      notes: "Secret notes",
      onDeletePress: noop,
      deleteAccessibilityLabel: "Delete entry",
      loading: true,
    }),
  );
  assert.equal(hiddenBones(logEntry), 2, "a loading LogEntryCard renders header+notes bones");
  assert.ok(!logEntry.includes("Secret notes"), "a loading LogEntryCard shows no notes");
  assert.ok(!logEntry.includes("Delete"), "a loading LogEntryCard renders no delete action");

  const tokenRow = await renderToHtml(
    React.createElement(TokenRow, {
      name: "Secret Token",
      prefix: "eci_pat_secret",
      metaLabel: "Created Oct 2, 2026",
      onRevoke: noop,
      loading: true,
    }),
  );
  assert.equal(hiddenBones(tokenRow), 3, "a loading TokenRow renders 3 text bones");
  assert.ok(!tokenRow.includes("Secret Token"), "a loading TokenRow shows no token name");
  assert.ok(!tokenRow.includes("Revoke"), "a loading TokenRow renders no revoke action");
});

test("T1 SSR: loading StatCard, PreviewCard, and the collections render exactly 3 dummies", async () => {
  const { React, StatCard, StatBand, PreviewCard, CheckboxSelectList, MasonryGrid } =
    await loadRuntime();
  const noop = () => {};

  const statCard = await renderToHtml(
    React.createElement(StatCard, {
      value: "42",
      label: "secret label",
      sublabel: "secret sub",
      loading: true,
    }),
  );
  assert.equal(hiddenBones(statCard), 3, "a loading StatCard renders value+label+sublabel bones");
  assert.ok(!statCard.includes("secret label"), "a loading StatCard shows no real label");

  const statBand = await renderToHtml(
    React.createElement(
      StatBand,
      { loading: true },
      React.createElement(StatCard, { value: "4", label: "Servings" }),
    ),
  );
  assert.equal(hiddenBones(statBand), 6, "a loading StatBand renders 3 dummy stats (2 bones each)");
  assert.ok(!statBand.includes("Servings"), "a loading StatBand shows none of its children");

  const preview = await renderToHtml(
    React.createElement(
      PreviewCard,
      {
        title: "Your recipe",
        loading: true,
        actions: React.createElement("span", null, "ConfirmAction"),
      },
      React.createElement("span", null, "SecretPreviewBody"),
    ),
  );
  assert.equal(hiddenBones(preview), 4, "a loading PreviewCard renders title + 3 body bones");
  assert.ok(!preview.includes("SecretPreviewBody"), "a loading PreviewCard shows no content");
  assert.ok(!preview.includes("ConfirmAction"), "a loading PreviewCard renders no actions");

  const selectList = await renderToHtml(
    React.createElement(CheckboxSelectList, {
      items: [
        { id: "a", label: "AlphaItem" },
        { id: "b", label: "BetaItem" },
      ],
      selectedIds: [],
      onToggle: noop,
      loading: true,
    }),
  );
  assert.equal(hiddenBones(selectList), 6, "a loading CheckboxSelectList renders 3 rows x 2 bones");
  assert.ok(!selectList.includes("AlphaItem"), "a loading CheckboxSelectList shows no real items");

  let renderCalls = 0;
  const grid = await renderToHtml(
    React.createElement(MasonryGrid, {
      items: [{ id: "x" }, { id: "y" }],
      renderItem: () => {
        renderCalls += 1;
        return React.createElement("span", null, "GridItemBody");
      },
      loading: true,
    }),
  );
  assert.equal(hiddenBones(grid), 3, "a loading MasonryGrid renders exactly 3 dummy items");
  assert.equal(renderCalls, 0, "a loading MasonryGrid never calls renderItem with dummy data");
  assert.ok(!grid.includes("GridItemBody"), "a loading MasonryGrid shows no real items");
});

test("T1 SSR: shells propagate loading through LoadingScope; non-loading is unchanged", async () => {
  const { React, Card, SectionCard, CardRow, CheckboxSelectList } = await loadRuntime();
  const noop = () => {};

  // The Card shell's scope skeletonizes a nested row that was
  // never handed a loading prop — no prop-drilling past the shell.
  const card = await renderToHtml(
    React.createElement(
      Card,
      { loading: true },
      React.createElement(CardRow, { title: "Scoped Row Title", onPress: noop }),
    ),
  );
  assert.equal(hiddenBones(card), 1, "a Card in loading scopes its nested row into skeletons");
  assert.ok(!card.includes("Scoped Row Title"), "the scoped row shows no real title");

  const section = await renderToHtml(
    React.createElement(
      SectionCard,
      { title: "Scoped Section Title", loading: true },
      React.createElement(CardRow, { title: "Section Row Title", onPress: noop }),
    ),
  );
  assert.equal(hiddenBones(section), 2, "a loading SectionCard renders title + scoped row bones");
  assert.ok(!section.includes("Scoped Section Title"), "the section title is skeletonized");
  assert.ok(!section.includes("Section Row Title"), "the section's row is skeletonized by scope");

  // Nested shells (CodeRabbit on #551): a plain Card or
  // SectionCard nested inside a loading Card must not reset the
  // scope — the section's title skeletonizes, its action hides,
  // and a row two shells deep still skeletonizes.
  const nested = await renderToHtml(
    React.createElement(
      Card,
      { loading: true },
      React.createElement(
        SectionCard,
        {
          title: "Nested Section Title",
          action: React.createElement("span", null, "NestedAction"),
        },
        React.createElement(CardRow, { title: "Nested Row Title", onPress: noop }),
      ),
    ),
  );
  assert.equal(hiddenBones(nested), 2, "nested shells keep the scope: title + row bones");
  assert.ok(!nested.includes("Nested Section Title"), "the nested section title is skeletonized");
  assert.ok(!nested.includes("Nested Row Title"), "the doubly nested row is skeletonized");
  assert.ok(!nested.includes("NestedAction"), "the nested section action is hidden while loading");

  // The busy marking survives a caller's own accessibility
  // state (CodeRabbit on #551): a loading Card handed a disabled
  // state renders BOTH aria-disabled and aria-busy.
  const busyCard = await renderToHtml(
    React.createElement(
      Card,
      { loading: true, accessibilityState: { disabled: true } },
      React.createElement(CardRow, { title: "Busy Row Title", onPress: noop }),
    ),
  );
  assert.match(busyCard, /aria-busy="true"/, "a loading Card stays busy beside caller state");
  assert.match(busyCard, /aria-disabled="true"/, "the caller's disabled state is preserved");

  const idleRow = await renderToHtml(
    React.createElement(CardRow, { title: "Visible Plan", subtitle: "4 entries", onPress: noop }),
  );
  assert.equal(hiddenBones(idleRow), 0, "a non-loading CardRow renders no bones");
  assert.ok(idleRow.includes("Visible Plan"), "a non-loading CardRow renders its title");

  const idleList = await renderToHtml(
    React.createElement(CheckboxSelectList, {
      items: [{ id: "a", label: "AlphaItem" }],
      selectedIds: [],
      onToggle: noop,
    }),
  );
  assert.equal(hiddenBones(idleList), 0, "a non-loading CheckboxSelectList renders no bones");
  assert.ok(idleList.includes("AlphaItem"), "a non-loading CheckboxSelectList renders its items");
});
