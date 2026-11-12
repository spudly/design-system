import "../../test/registerSvgStub.js";
import { loadInternalDist } from "../../test/internalDist.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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
    const voiceFixtures: Record<string, any> = await import("../../dist/voice/fixtures.js");
    const voiceModule: Record<string, any> = await import("../../dist/voice/index.js");
    const loadingScope: Record<string, any> = await import("../../dist/contexts/LoadingScope.js");
    return { React, renderToString, TamaguiProvider, ...dist, ...loadingScope, ...voiceFixtures, ...voiceModule };
  })();
  return runtimePromise;
}

async function renderToHtml(element: any) {
  const { React, renderToString, TamaguiProvider, createTamaguiConfig, baseTheme, VoiceProvider, fixtureVoice } =
    await loadRuntime();
  const config = createTamaguiConfig(baseTheme);
  return renderToString(
    React.createElement(
      TamaguiProvider,
      { config, defaultTheme: "light" },
      React.createElement(VoiceProvider, { voice: fixtureVoice }, element),
    ),
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
  // The override form (Stephen on #551): a caller's own loading
  // prop passed to the hook wins even outside any scope, so call
  // sites never repeat `loading || scopedLoading` themselves.
  const OverrideProbe = () =>
    React.createElement("span", null, useLoadingScope(true) ? "loading" : "idle");
  const overridden = await renderToHtml(React.createElement(OverrideProbe));
  assert.match(
    overridden,
    />loading</,
    "the override prop alone puts the consumer in loading state",
  );
});

test("LoadingScope lives in src/contexts — widgets import it from there", () => {
  assert.ok(
    existsSync(join(root, "src/contexts/LoadingScope.tsx")),
    "the loading-state context's home is src/contexts/LoadingScope.tsx (Stephen on #551)",
  );
  assert.ok(
    !existsSync(join(root, "src/widgets/LoadingScope.tsx")),
    "the context no longer lives in src/widgets",
  );
  for (const name of ["Button", "Card", "CardRow", "StatCard"]) {
    assert.match(
      read(`src/widgets/${name}.tsx`),
      /from "\.\.\/contexts\/LoadingScope\.js"/,
      `${name} must import the scope from src/contexts`,
    );
  }
});

test("TextSkeleton lines occupy their size's line box, bone centered", async () => {
  // Source pins: the size prop, the line-box table (md is the
  // default: 18 box, 12 bone; 3xl: 34 box, 24 bone), and the
  // centered wrapper — no flat 12px bone row, no inter-line gap.
  const source = readCode("src/widgets/TextSkeleton.tsx");
  assert.match(source, /size\?: TextSkeletonSize/, "TextSkeleton takes a size prop");
  assert.match(source, /md: \{ lineBox: 18, bone: 12 \}/, "the md line box is 18, its bone 12");
  assert.match(source, /"3xl": \{ lineBox: 34, bone: 24 \}/, "the 3xl line box is 34, its bone 24");
  assert.match(
    source,
    /<View key=\{index\} height=\{lineBox\} justifyContent="center">/,
    "each line renders inside a View of its line-box height, bone vertically centered",
  );
  assert.doesNotMatch(source, /gap=/, "line boxes stack with no inter-line gap");

  const { React, TextSkeleton } = await loadRuntime();
  const md = await renderToHtml(React.createElement(TextSkeleton, { lines: 2 }));
  assert.equal(hiddenBones(md), 2, "a 2-line TextSkeleton renders exactly 2 bones");
  assert.ok(md.includes("height:18px"), "a default (md) line occupies the 18px line box");
  assert.ok(md.includes("height:12px"), "the md bone is 12px, centered in its box");
  const lg = await renderToHtml(React.createElement(TextSkeleton, { size: "lg", lines: 1 }));
  assert.ok(lg.includes("height:21px"), "an lg line occupies the 21px line box");
  assert.ok(lg.includes("height:14px"), "the lg bone is 14px");
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
  assert.match(read("src/pages/RecipesPage.tsx"), /\bloadingOwn\?: boolean/);
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
// prop-drilling), renders skeletons with no real content while
// loading — its actions stay in place as inert skeletons
// (Buttons skeletonize themselves inside the scope — filled
// buttons as rectangles, ghost buttons as text bones, Stephen
// on #551) — and renders unchanged while not loading.
// The collection widgets (CheckboxSelectList, StatBand) render
// exactly 3 dummy items while loading when their items are not
// known — and mirror the known items' count when they are
// (Stephen on #579); MasonryGrid renders 24
// varied-height dummies so its loading state still reads as a
// masonry grid (Stephen on #551). CheckboxSelectList's centered
// spinner is gone.

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

test("T1 SSR: loading rows and cards render skeletons, no real content, actions as skeletons", async () => {
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
  assert.equal(hiddenBones(cardRow), 3, "a loading CardRow renders title + 2-line subtitle bones");
  assert.ok(!cardRow.includes("Secret Plan"), "a loading CardRow shows no real title");
  assert.ok(
    cardRow.includes("Delete"),
    "a loading CardRow keeps its action, as an inert rectangle skeleton",
  );
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
  assert.equal(
    hiddenBones(comment),
    4,
    "a loading CommentItem renders author + 1 body bone + its 2 ghost action bones",
  );
  assert.ok(!comment.includes("Secret Author"), "a loading CommentItem shows no author");
  assert.ok(!comment.includes("Secret body text"), "a loading CommentItem shows no body");
  // Its actions are ghost Buttons: inside the scope they
  // skeletonize as TEXT — one bone per label, the label text
  // itself gone (Stephen on #551) — not as filled rectangles.
  assert.ok(
    !comment.includes(">Edit<") && !comment.includes(">Delete<"),
    "a loading CommentItem's ghost actions render as text bones, not labels",
  );

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
  assert.equal(
    hiddenBones(logEntry),
    3,
    "a loading LogEntryCard renders date + rating + notes bones (its structured header)",
  );
  assert.ok(!logEntry.includes("Secret notes"), "a loading LogEntryCard shows no notes");
  assert.ok(!logEntry.includes("Oct 12, 2026"), "a loading LogEntryCard shows no date");
  assert.ok(
    logEntry.includes("Delete"),
    "a loading LogEntryCard keeps its delete action, as an inert rectangle skeleton",
  );

  const tokenRow = await renderToHtml(
    React.createElement(TokenRow, {
      name: "Secret Token",
      prefix: "eci_pat_secret",
      metaLabel: "Created Oct 2, 2026",
      onRevoke: noop,
      loading: true,
    }),
  );
  assert.equal(
    hiddenBones(tokenRow),
    3,
    "a loading TokenRow renders name (sm) + prefix (xs) + meta (xs) bones",
  );
  assert.ok(!tokenRow.includes("Secret Token"), "a loading TokenRow shows no token name");
  assert.ok(
    tokenRow.includes("Revoke"),
    "a loading TokenRow keeps its revoke action, as an inert rectangle skeleton",
  );
});

test("T1 SSR: loading StatCard, PreviewCard, and the collections render their dummy items", async () => {
  const { React, StatCard, StatBand, PreviewCard, CheckboxSelectList, MasonryGrid, Button } =
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

  const statBandOne = await renderToHtml(
    React.createElement(
      StatBand,
      { loading: true, loadingCount: 1 },
      React.createElement(StatCard, { value: "4", label: "Servings" }),
    ),
  );
  assert.equal(
    hiddenBones(statBandOne),
    2,
    "a loading StatBand with loadingCount=1 renders 1 dummy stat (2 bones) — composites with a conditional stat count mirror their loaded composition",
  );

  const statBandSeven = await renderToHtml(
    React.createElement(
      StatBand,
      { loading: true, loadingCount: 7 },
      React.createElement(StatCard, { value: "4", label: "Servings" }),
    ),
  );
  assert.equal(
    hiddenBones(statBandSeven),
    14,
    "a loading StatBand with loadingCount=7 renders 7 dummy stats — counts above six are honored, not truncated",
  );

  const preview = await renderToHtml(
    React.createElement(
      PreviewCard,
      {
        title: "Your recipe",
        loading: true,
        actions: React.createElement(Button, { onPress: noop }, "ConfirmAction"),
      },
      React.createElement("span", null, "SecretPreviewBody"),
    ),
  );
  assert.equal(hiddenBones(preview), 4, "a loading PreviewCard renders title + 3 body bones");
  assert.ok(!preview.includes("SecretPreviewBody"), "a loading PreviewCard shows no content");
  assert.ok(
    preview.includes("ConfirmAction"),
    "a loading PreviewCard keeps its actions, as inert rectangle skeletons",
  );

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
  assert.equal(
    hiddenBones(selectList),
    4,
    "a loading CheckboxSelectList renders one row per known item (2 rows x 2 bones)",
  );
  assert.ok(!selectList.includes("AlphaItem"), "a loading CheckboxSelectList shows no real items");

  const unknownSelectList = await renderToHtml(
    React.createElement(CheckboxSelectList, {
      items: [],
      selectedIds: [],
      onToggle: noop,
      loading: true,
    }),
  );
  assert.equal(
    hiddenBones(unknownSelectList),
    6,
    "a loading CheckboxSelectList with no known items renders 3 dummy rows x 2 bones",
  );

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
  assert.equal(hiddenBones(grid), 24, "a loading MasonryGrid renders 24 varied-height dummy items");
  assert.equal(renderCalls, 0, "a loading MasonryGrid never calls renderItem with dummy data");
  assert.ok(!grid.includes("GridItemBody"), "a loading MasonryGrid shows no real items");
});

test("T1: a Button inside a LoadingScope renders the rectangle-skeleton treatment", async () => {
  // Source pins: the scope drives the fill (the theme's border
  // role, SkeletonBone's fill), the press handler is dropped,
  // and the disabled skeleton state withholds the link href.
  const button = readCode("src/widgets/Button.tsx");
  assert.match(button, /const scopedLoading = useLoadingScope\(\)/, "Button reads the scope");
  assert.match(
    button,
    /backgroundColor: "\$borderColor", borderColor: "\$borderColor"/,
    "the skeleton frame and its border take the bone fill",
  );
  assert.match(
    button,
    /onPress=\{scopedLoading \? undefined : onPress\}/,
    "a skeleton button carries no press handler",
  );
  assert.match(
    button,
    /const effectiveDisabled = disabled \|\| scopedLoading/,
    "a skeleton button renders disabled (which withholds the link form's href)",
  );
  assert.match(
    button,
    /accessibilityElementsHidden: scopedLoading \? true : accessibilityElementsHidden/,
    "a skeleton button is hidden from assistive tech",
  );

  const { React, Button, LoadingScope } = await loadRuntime();
  const noop = () => {};
  const scoped = await renderToHtml(
    React.createElement(
      LoadingScope,
      { active: true },
      React.createElement(Button, { onPress: noop }, "ScopedAction"),
    ),
  );
  assert.ok(scoped.includes("ScopedAction"), "the skeleton button keeps its label (its size)");
  assert.match(scoped, /aria-hidden="true"/, "the skeleton button is hidden from assistive tech");
  assert.match(scoped, /aria-disabled="true"/, "the skeleton button renders disabled");

  const scopedLink = await renderToHtml(
    React.createElement(
      LoadingScope,
      { active: true },
      React.createElement(Button, { href: "/secret-destination" }, "ScopedLink"),
    ),
  );
  assert.ok(scopedLink.includes("ScopedLink"), "the skeleton link keeps its label");
  assert.ok(
    !scopedLink.includes("/secret-destination"),
    "the skeleton link's href is withheld — it cannot be followed",
  );

  const plain = await renderToHtml(React.createElement(Button, { onPress: noop }, "PlainAction"));
  assert.ok(plain.includes("PlainAction"), "a Button outside any scope renders its label");
  assert.ok(
    !plain.includes('aria-disabled="true"'),
    "a Button outside any scope is not disabled by the scope",
  );
  const plainLink = await renderToHtml(
    React.createElement(Button, { href: "/visible-destination" }, "PlainLink"),
  );
  assert.ok(
    plainLink.includes('href="/visible-destination"'),
    "a link Button outside any scope keeps its href",
  );
});

test("T1: the MasonryGrid skeleton fills its columns and the ListRow skeleton hides its hairline", () => {
  const grid = readCode("src/widgets/MasonryGrid.tsx");
  assert.match(
    grid,
    /<View key=\{`loading-\$\{itemIndex\}`\} width="100%">/,
    "a loading MasonryGrid item wrapper takes the column's full width",
  );
  const row = readCode("src/widgets/ListRow.tsx");
  assert.match(
    row,
    /borderBottomColor="transparent"/,
    "a loading ListRow's hairline renders transparent",
  );
  assert.equal(
    (row.match(/borderBottomColor=\{tokens\.colors\.gray\.gray2\}/g) ?? []).length,
    1,
    "only the loaded ListRow keeps the visible gray hairline",
  );
});

test("T1: structured skeletons mirror the loaded layout (StatCard, CheckboxSelectList, LogEntryCard)", () => {
  // StatCard: explicit per-row bones in each run's line box, read
  // from TextSkeleton's LINE_BOXES table (the one source of truth
  // for skeleton text geometry) — value (3xl: 34 box, 24 bone,
  // 46%), label (lg: 21 box, 14 bone, 76%), sublabel (sm: 16 box,
  // 11 bone, 58%) — not a one-size TextSkeleton.
  const stat = readCode("src/widgets/StatCard.tsx");
  assert.match(
    stat,
    /<View height=\{LINE_BOXES\["3xl"\]\.lineBox\} justifyContent="center">/,
    "the value row uses the 3xl line box (34)",
  );
  assert.match(
    stat,
    /<SkeletonBone\s+width="46%"\s+height=\{LINE_BOXES\["3xl"\]\.bone\}/,
    "the value bone is 46% wide, the 3xl bone (24) high",
  );
  assert.match(
    stat,
    /<View height=\{LINE_BOXES\.lg\.lineBox\} justifyContent="center">/,
    "the label row uses the lg line box (21)",
  );
  assert.match(
    stat,
    /<SkeletonBone\s+width="76%"\s+height=\{LINE_BOXES\.lg\.bone\}/,
    "the label bone is 76% wide, the lg bone (14) high",
  );
  assert.match(
    stat,
    /<View height=\{LINE_BOXES\.sm\.lineBox\} justifyContent="center">/,
    "the sublabel row uses the sm line box (16)",
  );
  assert.match(
    stat,
    /<SkeletonBone\s+width="58%"\s+height=\{LINE_BOXES\.sm\.bone\}/,
    "the sublabel bone is 58% wide, the sm bone (11) high",
  );
  assert.doesNotMatch(
    stat,
    /<TextSkeleton/,
    "StatCard's mixed run sizes use explicit bones, not the TextSkeleton component",
  );

  // CheckboxSelectList: the box bone sits in the CheckboxField's
  // 44x44 touch-target slot, centered — the loaded field's visual
  // box is centered in its 44px target, so the skeleton's bone
  // starts after the slot, not at the row's left edge.
  const list = readCode("src/widgets/CheckboxSelectList.tsx");
  assert.match(
    list,
    /<View width=\{44\} height=\{44\} alignItems="center" justifyContent="center">/,
    "the checkbox bone sits in a 44x44 touch-target slot",
  );
  assert.match(list, /<BoxSkeleton width=\{24\} height=\{24\} \/>/, "the box bone is the 24dp box");
  assert.match(
    list,
    /<TextSkeleton size="md" lines=\{1\} \/>/,
    "the label bone is at the label's size (md)",
  );

  // LogEntryCard: the skeleton header mirrors the loaded header
  // row — a date bone (sm) in a 104-wide slot, and a 72x12 box
  // bone where the star rating sits.
  const entry = readCode("src/widgets/LogEntryCard.tsx");
  assert.match(entry, /<YStack width=\{104\}>/, "the date bone sits in a 104-wide slot");
  assert.match(
    entry,
    /<TextSkeleton size="sm" lines=\{1\} \/>/,
    "the date and notes bones are at the sm size",
  );
  assert.match(
    entry,
    /starRating \? <BoxSkeleton width=\{72\} height=\{12\} \/> : null/,
    "the rating bone renders only when a rating is set, at 72x12",
  );
});

test("T1: a ghost Button inside a LoadingScope renders a text bone, no filled box", async () => {
  // Source pins: ghostness comes from the `ghost` prop or the
  // deprecated `ghost` variant; the skeleton frame stays
  // transparent and borderless; the label is replaced by a
  // SkeletonBone sized from the label.
  const button = readCode("src/widgets/Button.tsx");
  assert.match(
    button,
    /const ghostSkeleton = scopedLoading && \(ghost \|\| variant === "ghost"\)/,
    "ghost skeletonization keys off the ghost prop or the ghost variant",
  );
  assert.match(
    button,
    /backgroundColor: "transparent", borderColor: "transparent", borderWidth: 0/,
    "the ghost skeleton frame has no filled background and no border",
  );
  assert.match(button, /ghostLabelBone/, "the ghost label is replaced by one text bone");
  assert.match(button, /from "\.\/SkeletonClock\.js"/, "the ghost bone is the shared clock's bone");

  const { React, Button, LoadingScope } = await loadRuntime();
  const noop = () => {};
  const scopedGhost = await renderToHtml(
    React.createElement(
      LoadingScope,
      { active: true },
      React.createElement(Button, { ghost: true, size: "sm", onPress: noop }, "GhostAction"),
    ),
  );
  assert.equal(hiddenBones(scopedGhost), 1, "a scoped ghost Button renders exactly 1 text bone");
  assert.ok(
    !scopedGhost.includes(">GhostAction<"),
    "the ghost skeleton shows no label text — the bone replaces it",
  );
  assert.match(
    scopedGhost,
    /aria-hidden="true"/,
    "the ghost skeleton is hidden from assistive tech",
  );

  const scopedGhostLink = await renderToHtml(
    React.createElement(
      LoadingScope,
      { active: true },
      React.createElement(Button, { ghost: true, href: "/ghost-destination" }, "GhostLink"),
    ),
  );
  assert.equal(hiddenBones(scopedGhostLink), 1, "a scoped ghost link renders exactly 1 text bone");
  assert.ok(
    !scopedGhostLink.includes("/ghost-destination"),
    "the ghost skeleton link's href is withheld",
  );

  // The deprecated variant spelling skeletonizes the same way.
  const scopedVariant = await renderToHtml(
    React.createElement(
      LoadingScope,
      { active: true },
      React.createElement(Button, { variant: "ghost", onPress: noop }, "VariantGhost"),
    ),
  );
  assert.equal(hiddenBones(scopedVariant), 1, "a scoped variant=ghost Button renders 1 text bone");
  assert.ok(!scopedVariant.includes(">VariantGhost<"), "the variant ghost shows no label text");

  // Outside a scope a ghost Button is unchanged: label, no bone.
  const plainGhost = await renderToHtml(
    React.createElement(Button, { ghost: true, onPress: noop }, "PlainGhost"),
  );
  assert.equal(hiddenBones(plainGhost), 0, "an unscoped ghost Button renders no bones");
  assert.ok(plainGhost.includes("PlainGhost"), "an unscoped ghost Button renders its label");
});

test("T1 SSR: shells propagate loading through LoadingScope; non-loading is unchanged", async () => {
  const { React, Card, SectionCard, CardRow, CheckboxSelectList, Button } = await loadRuntime();
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
  // scope — the section's title skeletonizes, its Button action
  // stays as a rectangle skeleton, and a row two shells deep
  // still skeletonizes.
  const nested = await renderToHtml(
    React.createElement(
      Card,
      { loading: true },
      React.createElement(
        SectionCard,
        {
          title: "Nested Section Title",
          action: React.createElement(
            Button,
            { ghost: true, size: "sm", onPress: noop },
            "NestedAction",
          ),
        },
        React.createElement(CardRow, { title: "Nested Row Title", onPress: noop }),
      ),
    ),
  );
  assert.equal(
    hiddenBones(nested),
    3,
    "nested shells keep the scope: title + row bones + the ghost action's text bone",
  );
  assert.ok(!nested.includes("Nested Section Title"), "the nested section title is skeletonized");
  assert.ok(!nested.includes("Nested Row Title"), "the doubly nested row is skeletonized");
  // The section's action is a ghost Button: it stays in place,
  // skeletonized as TEXT (one bone, no label — Stephen on #551),
  // where a filled button would keep its label as a rectangle.
  assert.ok(
    !nested.includes("NestedAction"),
    "the nested section's ghost action renders as a text bone, not a label",
  );

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

  // Explicit ARIA wins over the RN state form for every field
  // except busy (CodeRabbit on #551, round 3): a loading Card
  // handed aria-disabled={false} beside a disabled accessibility
  // state renders aria-disabled="false" — and still renders busy.
  const ariaCard = await renderToHtml(
    React.createElement(
      Card,
      {
        loading: true,
        "aria-disabled": false,
        accessibilityState: { disabled: true },
      },
      React.createElement(CardRow, { title: "Aria Row Title", onPress: noop }),
    ),
  );
  assert.match(ariaCard, /aria-busy="true"/, "busy is forced even beside explicit ARIA state");
  assert.match(
    ariaCard,
    /aria-disabled="false"/,
    "the caller's explicit aria-disabled wins over the state form",
  );

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

// ---------------------------------------------------------------------------
// #278 Tranche 2 — data panels and the remaining data widgets:
// NutritionPanel, RatingsCard, RecipeIngredientsPanel,
// RecipeInstructionsPanel, RecipeOverviewPanel, SecretRevealPanel,
// StatRow, and TagList take the same explicit `loading` prop,
// read the internal LoadingScope, render skeletons mirroring
// their loaded layout (actions kept as inert skeleton Buttons
// inside the scope, hairlines transparent), show no real content
// while loading, and render unchanged while not loading.

const T2_SCOPE_WIDGETS = [
  "NutritionPanel",
  "RatingsCard",
  "RecipeIngredientsPanel",
  "RecipeInstructionsPanel",
  "RecipeOverviewPanel",
  "SecretRevealPanel",
  "StatRow",
  "TagList",
] as const;

test("T2: every converted data widget declares `loading` and reads the LoadingScope", () => {
  for (const name of T2_SCOPE_WIDGETS) {
    const code = readCode(`src/widgets/${name}.tsx`);
    assert.match(code, /\bloading\?: boolean/, `${name} must declare the explicit loading prop`);
    assert.match(code, /useLoadingScope/, `${name} must read the internal LoadingScope`);
    assert.match(
      code,
      /TextSkeleton|BoxSkeleton|SkeletonBone|StatCard/,
      `${name} must render skeletons (directly, or via a skeletonized child)`,
    );
    assert.match(
      code,
      /from "\.\.\/contexts\/LoadingScope\.js"/,
      `${name} must import the scope from src/contexts`,
    );
  }
});

test("T2 SSR: loading NutritionPanel renders the ready layout's skeleton, no real values", async () => {
  const { React, NutritionPanel } = await loadRuntime();
  const noop = () => {};

  // The view-model's own loading state: header bone + exactly 3
  // dummy rows x label/value bones + the disclaimer bone.
  const loading = await renderToHtml(
    React.createElement(NutritionPanel, { nutrition: { state: "loading" } }),
  );
  assert.equal(
    hiddenBones(loading),
    8,
    "a loading NutritionPanel renders header + 3x2 row + disclaimer bones",
  );
  assert.ok(!loading.includes("Estimating nutrition"), "the plain loading line is gone");
  assert.match(loading, /aria-busy/, "a loading NutritionPanel marks its region busy");

  // The explicit prop over ready data mirrors the ready rows'
  // own count, and its Refresh action stays as a skeleton.
  const readyLoading = await renderToHtml(
    React.createElement(NutritionPanel, {
      nutrition: {
        state: "ready",
        rows: [
          { label: "Calories", valueLabel: "520 kcal" },
          { label: "Protein", valueLabel: "42 g" },
        ],
        disclaimer: "SecretDisclaimer",
        onRefreshPress: noop,
      },
      loading: true,
    }),
  );
  assert.equal(
    hiddenBones(readyLoading),
    6,
    "a ready-but-loading NutritionPanel renders header + 2x2 row + disclaimer bones",
  );
  assert.ok(!readyLoading.includes("520 kcal"), "a loading NutritionPanel shows no real values");
  assert.ok(
    !readyLoading.includes("SecretDisclaimer"),
    "a loading NutritionPanel shows no disclaimer",
  );
  assert.ok(
    readyLoading.includes("Refresh"),
    "a loading NutritionPanel keeps its Refresh action, as an inert rectangle skeleton",
  );

  const idle = await renderToHtml(
    React.createElement(NutritionPanel, {
      nutrition: {
        state: "ready",
        rows: [{ label: "Calories", valueLabel: "520 kcal" }],
        disclaimer: "Estimates vary.",
      },
    }),
  );
  assert.equal(hiddenBones(idle), 0, "a non-loading NutritionPanel renders no bones");
  assert.ok(idle.includes("520 kcal"), "a non-loading NutritionPanel renders its rows");
});

test("T2 SSR: loading RatingsCard, TagList, and StatRow render skeletons, no real content", async () => {
  const { React, RatingsCard, TagList, StatRow, StatCard } = await loadRuntime();
  const noop = () => {};

  const ratings = await renderToHtml(
    React.createElement(RatingsCard, {
      ratings: {
        community: { stars: "★★★★☆", label: "4.6 (9)" },
        viewer: { value: 4 },
      },
      onViewerRatingChange: noop,
      loading: true,
    }),
  );
  assert.equal(
    hiddenBones(ratings),
    9,
    "a loading RatingsCard renders eyebrow + star-line + label + eyebrow + 5 star bones",
  );
  assert.ok(!ratings.includes("4.6 (9)"), "a loading RatingsCard shows no community label");
  assert.ok(!ratings.includes("★"), "a loading RatingsCard shows no real stars");
  assert.ok(
    !ratings.includes('aria-label="Rate'),
    "a loading RatingsCard renders no live star controls",
  );
  assert.match(ratings, /aria-busy/, "a loading RatingsCard marks its region busy");

  const idleRatings = await renderToHtml(
    React.createElement(RatingsCard, {
      ratings: {
        community: { stars: "★★★★☆", label: "4.6 (9)" },
        viewer: { value: 4 },
      },
      onViewerRatingChange: noop,
    }),
  );
  assert.equal(hiddenBones(idleRatings), 0, "a non-loading RatingsCard renders no bones");
  assert.ok(idleRatings.includes("4.6 (9)"), "a non-loading RatingsCard renders its label");

  const tags = await renderToHtml(
    React.createElement(TagList, {
      tags: [
        { id: "t1", name: "SecretTagOne", color: "red" },
        { id: "t2", name: "SecretTagTwo", color: "blue" },
      ],
      loading: true,
    }),
  );
  assert.equal(hiddenBones(tags), 2, "a loading TagList renders one pill bone per tag");
  assert.ok(!tags.includes("SecretTagOne"), "a loading TagList shows no real tag names");
  assert.match(tags, /aria-busy/, "a loading TagList marks its region busy");

  const emptyTags = await renderToHtml(React.createElement(TagList, { tags: [], loading: true }));
  assert.equal(
    hiddenBones(emptyTags),
    3,
    "a tag-less loading TagList renders exactly 3 dummy pills",
  );

  const idleTags = await renderToHtml(
    React.createElement(TagList, { tags: [{ id: "t1", name: "VisibleTag", color: "red" }] }),
  );
  assert.equal(hiddenBones(idleTags), 0, "a non-loading TagList renders no bones");
  assert.ok(idleTags.includes("VisibleTag"), "a non-loading TagList renders its tags");

  const row = await renderToHtml(
    React.createElement(
      StatRow,
      { loading: true },
      React.createElement(StatCard, { value: "4", label: "Servings" }),
    ),
  );
  assert.equal(hiddenBones(row), 6, "a loading StatRow renders 3 dummy stats (2 bones each)");
  assert.ok(!row.includes("Servings"), "a loading StatRow shows none of its children");

  const idleRow2 = await renderToHtml(
    React.createElement(
      StatRow,
      null,
      React.createElement(StatCard, { value: "4", label: "Servings" }),
    ),
  );
  assert.equal(hiddenBones(idleRow2), 0, "a non-loading StatRow renders no bones");
  assert.ok(idleRow2.includes("Servings"), "a non-loading StatRow renders its children");
});

test("T2 SSR: loading SecretRevealPanel and RecipeInstructionsPanel hide their content", async () => {
  const { React, SecretRevealPanel, RecipeInstructionsPanel } = await loadRuntime();
  const noop = () => {};

  const secret = await renderToHtml(
    React.createElement(SecretRevealPanel, {
      secret: "fixture-hidden-value",
      onCopy: noop,
      onDismiss: noop,
      loading: true,
    }),
  );
  assert.equal(
    hiddenBones(secret),
    3,
    "a loading SecretRevealPanel renders title + hint + secret-box bones",
  );
  assert.ok(
    !secret.includes("fixture-hidden-value"),
    "a loading SecretRevealPanel never shows the secret",
  );
  assert.ok(secret.includes("Copy"), "its Copy action stays, as an inert rectangle skeleton");
  assert.ok(secret.includes("Dismiss"), "its Dismiss action stays, as an inert rectangle skeleton");
  assert.match(secret, /aria-busy/, "a loading SecretRevealPanel marks its region busy");

  const idleSecret = await renderToHtml(
    React.createElement(SecretRevealPanel, { secret: "fixture-shown-value", onCopy: noop }),
  );
  assert.equal(hiddenBones(idleSecret), 0, "a non-loading SecretRevealPanel renders no bones");
  assert.ok(
    idleSecret.includes("fixture-shown-value"),
    "a non-loading SecretRevealPanel shows the secret",
  );

  const steps = [
    { id: "s1", stepNumber: 1, body: "Secret first step body" },
    { id: "s2", stepNumber: 2, body: "Secret second step body" },
  ];
  const instructions = await renderToHtml(
    React.createElement(RecipeInstructionsPanel, { instructions: steps, loading: true }),
  );
  assert.equal(
    hiddenBones(instructions),
    6,
    "a loading RecipeInstructionsPanel renders eyebrow + 2 body bones per step card",
  );
  assert.ok(
    !instructions.includes("Secret first step body"),
    "a loading RecipeInstructionsPanel shows no step text",
  );
  assert.match(
    instructions,
    /aria-busy/,
    "a loading RecipeInstructionsPanel marks its region busy",
  );

  const idleSteps = await renderToHtml(
    React.createElement(RecipeInstructionsPanel, { instructions: steps }),
  );
  assert.equal(hiddenBones(idleSteps), 0, "a non-loading RecipeInstructionsPanel renders no bones");
  assert.ok(
    idleSteps.includes("Secret first step body"),
    "a non-loading RecipeInstructionsPanel renders its steps",
  );
});

test("T2 SSR: loading RecipeOverviewPanel mirrors its blocks; no real content", async () => {
  const { React, RecipeOverviewPanel } = await loadRuntime();
  const overviewProps = {
    imageUrl: "https://example.com/hero.jpg",
    title: "Secret Recipe Title",
    description: "A secret description.",
    statusTone: "success",
    statusLabel: "Perfected",
    servingsLabel: "4",
    prepTimeLabel: "15m",
    cookTimeLabel: "30m",
    tags: [
      { id: "dinner", name: "Dinner", color: "orange" },
      { id: "chicken", name: "Chicken", color: "indigo" },
      { id: "one-pan", name: "One pan", color: "teal" },
    ],
  };
  const loading = await renderToHtml(
    React.createElement(RecipeOverviewPanel, { ...overviewProps, loading: true }),
  );
  assert.equal(
    hiddenBones(loading),
    14,
    "hero + title + badge + 2 description + 6 stat-band + 3 tag bones",
  );
  assert.ok(!loading.includes("Secret Recipe Title"), "a loading overview shows no title");
  assert.ok(!loading.includes("Dinner"), "a loading overview shows no tag names");
  assert.match(loading, /aria-busy/, "a loading overview marks its region busy");

  const idle = await renderToHtml(React.createElement(RecipeOverviewPanel, overviewProps));
  assert.equal(hiddenBones(idle), 0, "a non-loading overview renders no bones");
  assert.ok(idle.includes("Secret Recipe Title"), "a non-loading overview renders its title");
});

test("T2 SSR: loading RecipeIngredientsPanel skeletonizes controls and rows", async () => {
  const { React, RecipeIngredientsPanel } = await loadRuntime();
  const noop = () => {};
  const view = {
    servings: 4,
    onServingsChange: noop,
    scaleValue: "1",
    onScaleChange: noop,
    ingredients: [
      { id: "a", label: "Secret chicken" },
      { id: "b", label: "Secret cream", isOptional: true, isMissing: true },
    ],
    onIngredientPress: noop,
    substitutions: [{ ingredient: "Secret cream", suggestions: "Secret substitute" }],
  };
  const loading = await renderToHtml(
    React.createElement(RecipeIngredientsPanel, { ingredients: view, loading: true }),
  );
  assert.equal(
    hiddenBones(loading),
    10,
    "servings label/value + scale label + 2 rows (one with its optional-note bone) + hint + substitutions title/entry bones",
  );
  assert.ok(!loading.includes("Secret chicken"), "a loading panel shows no ingredient labels");
  assert.ok(!loading.includes("Secret substitute"), "a loading panel shows no substitution text");
  assert.ok(
    loading.includes("Custom"),
    "the scale selector's Custom action stays, as an inert rectangle skeleton",
  );
  assert.match(loading, /aria-busy/, "a loading RecipeIngredientsPanel marks its region busy");

  const idle = await renderToHtml(
    React.createElement(RecipeIngredientsPanel, { ingredients: view }),
  );
  assert.equal(hiddenBones(idle), 0, "a non-loading RecipeIngredientsPanel renders no bones");
  assert.ok(idle.includes("Secret chicken"), "a non-loading panel renders its ingredients");
  assert.ok(idle.includes("Substitutions"), "a non-loading panel renders its substitutions");

  // The substitutions fetch state is a skeleton panel now, not a
  // plain "Finding substitutions…" line.
  const fetching = await renderToHtml(
    React.createElement(RecipeIngredientsPanel, {
      ingredients: { ...view, substitutions: undefined, loadingSubstitutions: true },
    }),
  );
  assert.equal(
    hiddenBones(fetching),
    3,
    "the substitutions fetch renders the skeleton panel (title + one entry's bones)",
  );
  assert.ok(
    fetching.includes("Finding substitutions"),
    "the substitutions fetch announces a screen-reader progress status",
  );
  assert.match(fetching, /aria-busy/, "the fetching substitutions region is marked busy");
  assert.match(
    fetching,
    /role="status"/,
    "the substitutions status is a polite live region, not a visible line",
  );
  assert.ok(
    fetching.indexOf('role="status"') < fetching.indexOf("aria-busy"),
    "the substitutions status renders outside (before) the busy region so it is not deferred by aria-busy",
  );
});

// ---------------------------------------------------------------------------
// #278 Tranche 4 — pages: the centered-Spinner-while-loading
// pattern is deleted. A page in `loading` keeps its real frame
// (shell, headings, filters, frame actions) and renders its
// content regions as skeletons — dummy rows in the region's own
// row shape (exactly 3 where a list loads), actions kept as
// inert skeleton Buttons inside the loading scope, no real
// content while loading, non-loading rendering unchanged.
// DiscoverPage converts through RecipesPage's public variant
// (it delegates, #547). The two approved spinner survivors
// (Stephen approved the plan's survivor list, 2026-11-08) keep
// their Spinners: PayPage's external payment window and
// VerseSearchPage's inline search.

const T4_CONVERTED_PAGES = [
  "HomePage",
  "MealPlansPage",
  "MealsHubPage",
  "MealPlanDetailPage",
  "ShoppingListPage",
  "TagsPage",
  "PublicRecipePage",
  "RecipeDetailPage",
  "RecipeFormPage",
  "RecipesPage",
] as const;

test("T4: every converted page renders skeletons — no Spinner remains in its code", () => {
  for (const name of T4_CONVERTED_PAGES) {
    const code = readCode(`src/pages/${name}.tsx`);
    assert.doesNotMatch(code, /Spinner/, `${name} must not render a Spinner (#278 tranche 4)`);
    assert.match(
      code,
      /LoadingScope|TextSkeleton|BoxSkeleton|TagList|CardRow|DiscoveryCard|LogEntryCard|StatBand/,
      `${name} must render skeletons (directly, or via a skeletonized child)`,
    );
  }
  // The per-page skeleton compositions, pinned:
  assert.match(
    readCode("src/pages/RecipeFormPage.tsx"),
    /<TagList tags=\{\[\]\} loading \/>/,
    "RecipeFormPage's tags fetch renders TagList's loading pills, not a spinner",
  );
  assert.match(
    readCode("src/pages/RecipesPage.tsx"),
    /function LoadingOwnRows\(\)/,
    "RecipesPage's own section loads as MediaRow-shaped skeleton rows",
  );
  assert.match(
    readCode("src/pages/RecipesPage.tsx"),
    /function LoadingDiscoveryRows\(/,
    "RecipesPage's discovery/public sections load as skeleton DiscoveryCards",
  );
  const detail = readCode("src/pages/RecipeDetailPage.tsx");
  assert.match(
    detail,
    /LOADING_COOK_LOG_KEYS\.map/,
    "RecipeDetailPage's cook history loads as dummy LogEntryCards",
  );
  assert.match(
    detail,
    /state === "loading"[\s\S]*?<Toolbar>[\s\S]*?<\/Toolbar>[\s\S]*?<ScrollRegion>/,
    "RecipeDetailPage's loading state keeps the pinned toolbar's skeleton above its scroll region, mirroring the ready chrome",
  );
});

test("T4: the approved spinner survivors keep their Spinners", () => {
  assert.match(
    readCode("src/pages/PayPage.tsx"),
    /<Spinner label="Opening the secure payment window" \/>/,
    "PayPage's wait is an external secure-payment window — no page content shape to skeletonize (approved survivor)",
  );
  assert.match(
    readCode("src/pages/VerseSearchPage.tsx"),
    /\{isSearching \? <Spinner label="Loading" \/> : null\}/,
    "VerseSearchPage's inline search keeps its spinner — the field and existing results stay live (approved survivor)",
  );
});

// Pages are the package's public surface (the internal dist
// carries widgets/views). Load the page modules individually,
// never the pages barrel: the barrel also pulls the pages that
// import react-native directly (BoundedList's FlatList), whose
// Flow-typed sources this harness cannot parse.
let pagesPromise: Promise<Record<string, any>> | undefined;
function loadPages() {
  pagesPromise ??= (async () => {
    const modules = await Promise.all([
      import("../../dist/pages/HomePage.js"),
      import("../../dist/pages/MealPlansPage.js"),
      import("../../dist/pages/MealsHubPage.js"),
      import("../../dist/pages/MealPlanDetailPage.js"),
      import("../../dist/pages/ShoppingListPage.js"),
      import("../../dist/pages/TagsPage.js"),
      import("../../dist/pages/PublicRecipePage.js"),
      import("../../dist/pages/RecipeDetailPage.js"),
    ]);
    return Object.assign({}, ...modules) as Record<string, any>;
  })();
  return pagesPromise;
}

test("T4 SSR: loading MealPlansPage and HomePage render skeleton rows, frames intact", async () => {
  const { React } = await loadRuntime();
  const { MealPlansPage, HomePage } = await loadPages();
  const noop = () => {};

  const plans = await renderToHtml(
    React.createElement(MealPlansPage, {
      plans: [{ id: "p1", href: "/plans/secret", title: "Secret Plan", subtitle: "Secret meta" }],
      loading: true,
      createHref: "/plans/new",
      onPlanDelete: noop,
    }),
  );
  assert.equal(hiddenBones(plans), 9, "3 dummy CardRows x (title + 2-line subtitle) bones");
  assert.ok(!plans.includes("Secret Plan"), "a loading MealPlansPage shows no real plan titles");
  assert.ok(plans.includes("Meal plans"), "the page heading stays rendered while loading");
  assert.ok(plans.includes("New meal plan"), "the create action stays rendered while loading");
  assert.match(plans, /aria-busy/, "a loading MealPlansPage marks its list busy");

  const plansIdle = await renderToHtml(
    React.createElement(MealPlansPage, {
      plans: [{ id: "p1", href: "/plans/secret", title: "Secret Plan", subtitle: "Secret meta" }],
      loading: false,
      createHref: "/plans/new",
      onPlanDelete: noop,
    }),
  );
  assert.equal(hiddenBones(plansIdle), 0, "a non-loading MealPlansPage renders no bones");
  assert.ok(plansIdle.includes("Secret Plan"), "a non-loading MealPlansPage renders its plans");

  const home = await renderToHtml(
    React.createElement(HomePage, {
      title: "Home",
      subtitle: "Welcome back",
      browseLabel: "Browse recipes",
      addLabel: "Add a recipe",
      sharedWithMeLabel: "Shared with me",
      recipesTitle: "Recently viewed",
      emptyMessage: "Nothing here yet",
      recipes: [{ id: "r1" }],
      renderRecipeRow: () => null,
      loading: true,
      browseHref: "/recipes",
      addHref: "/recipes/new",
      sharedWithMeHref: "/shared-with-me",
    }),
  );
  assert.equal(hiddenBones(home), 6, "3 dummy rows x (title + subtitle) bones");
  assert.ok(home.includes("Browse recipes"), "the frame actions stay rendered while loading");
  assert.ok(home.includes("Recently viewed"), "the section heading stays rendered while loading");
});

test("T4 SSR: loading MealsHubPage and ShoppingListPage render skeleton rows", async () => {
  const { React } = await loadRuntime();
  const { MealsHubPage, ShoppingListPage } = await loadPages();
  const noop = () => {};

  const hub = await renderToHtml(
    React.createElement(MealsHubPage, {
      activeTab: "meals",
      onSelectTab: noop,
      meals: [{ id: "m1", href: "/meals/secret", title: "Secret Meal", subtitle: "Secret meta" }],
      plans: [],
      loading: true,
      createMealHref: "/meals/new",
      createPlanHref: "/plans/new",
      onDeleteMeal: noop,
      onDeletePlan: noop,
    }),
  );
  assert.equal(
    hiddenBones(hub),
    9,
    "3 dummy rows x (title + subtitle bones + the Delete ghost text bone)",
  );
  assert.ok(!hub.includes("Secret Meal"), "a loading MealsHubPage shows no real meal titles");
  assert.ok(hub.includes("New meal"), "the create action stays rendered while loading");

  const list = await renderToHtml(
    React.createElement(ShoppingListPage, {
      lines: [{ key: "l1", name: "Secret item", quantityLabel: "2 lb", isChecked: false }],
      loading: true,
      onToggleLine: noop,
    }),
  );
  assert.equal(hiddenBones(list), 6, "3 dummy rows x (checkbox box + label) bones");
  assert.ok(!list.includes("Secret item"), "a loading ShoppingListPage shows no real lines");
  assert.ok(list.includes("Shopping list"), "the page title stays rendered while loading");

  const listIdle = await renderToHtml(
    React.createElement(ShoppingListPage, {
      lines: [{ key: "l1", name: "Secret item", quantityLabel: "2 lb", isChecked: false }],
      loading: false,
      onToggleLine: noop,
    }),
  );
  assert.equal(hiddenBones(listIdle), 0, "a non-loading ShoppingListPage renders no bones");
  assert.ok(listIdle.includes("Secret item"), "a non-loading ShoppingListPage renders its lines");
});

test("T4 SSR: loading TagsPage renders skeleton rows, the create form stays live", async () => {
  const { React } = await loadRuntime();
  const { TagsPage } = await loadPages();
  const noop = () => {};

  const tags = await renderToHtml(
    React.createElement(TagsPage, {
      tags: [{ id: "t1", name: "SecretTag", color: "red" }],
      loading: true,
      name: "",
      color: "red",
      colorOptions: ["red", "green"],
      onNameChange: noop,
      onColorChange: noop,
      onCreate: noop,
      onDelete: noop,
      onStartEdit: noop,
    }),
  );
  assert.equal(
    hiddenBones(tags),
    9,
    "3 dummy rows x (badge pill bone + Edit and Delete ghost text bones)",
  );
  assert.ok(!tags.includes("SecretTag"), "a loading TagsPage shows no real tag names");
  assert.ok(tags.includes("Tag name"), "the create form stays rendered while loading");
  assert.ok(tags.includes("Tags"), "the page title stays rendered while loading");
});

test("T4 SSR: the union pages' loading states render their skeleton compositions", async () => {
  const { React } = await loadRuntime();
  const { MealPlanDetailPage, PublicRecipePage, RecipeDetailPage } = await loadPages();

  const plan = await renderToHtml(React.createElement(MealPlanDetailPage, { state: "loading" }));
  assert.equal(
    hiddenBones(plan),
    15,
    "title (1) + meta (3) + goals card (title 1 + 3 lines) + entries card (title 1 + 3 rows x 2)",
  );
  assert.match(plan, /aria-busy/, "a loading MealPlanDetailPage marks its regions busy");
  assert.ok(plan.includes("Shopping list"), "the action row stays, as skeleton Buttons");

  const pub = await renderToHtml(React.createElement(PublicRecipePage, { state: "loading" }));
  assert.equal(
    hiddenBones(pub),
    17,
    "hero (1) + title (1) + description (3) + stat band (6) + ingredients (4) + instructions (2)",
  );
  assert.ok(pub.includes("Ingredients"), "the section headings stay rendered while loading");
  assert.ok(pub.includes("Instructions"), "the section headings stay rendered while loading");

  const detail = await renderToHtml(React.createElement(RecipeDetailPage, { state: "loading" }));
  assert.equal(
    hiddenBones(detail),
    25,
    "skeleton toolbar (badge 1 + picker 1) + overview (hero 1 + title 1 + description 3 + stat band 6) + ingredients (4) + instructions (2) + cook history (3) + nutrition (3)",
  );
  assert.ok(detail.includes("Cook History"), "the section headings stay rendered while loading");
  assert.ok(detail.includes("Nutrition"), "the section headings stay rendered while loading");
});

test("T4: RecipesPage's loading sections and footers render the skeleton rows", () => {
  // RecipesPage cannot be SSR'd in this harness — it imports
  // react-native through BoundedList, whose Flow-typed sources
  // the Node loader cannot parse (the same reason the page's
  // own contract tests are source scans) — so its wiring is
  // pinned here at the source level; the skeleton rows it
  // renders are the T1-verified DiscoveryCard loading state and
  // the MediaRow-shaped composition below.
  const code = readCode("src/pages/RecipesPage.tsx");
  assert.match(code, /case "loadingOwn":\s*return <LoadingOwnRows \/>;/);
  assert.match(code, /case "loadingOwnMore":\s*return <LoadingOwnRows \/>;/);
  assert.match(
    code,
    /case "loadingDiscovery":\s*return <LoadingDiscoveryRows variant="section" \/>;/,
  );
  assert.match(
    code,
    /publicLoading \? \(\s*<LoadingDiscoveryRows \/>\s*\)/,
    "the public web first load",
  );
  assert.match(
    code,
    /isFetchingNextPage \? <LoadingDiscoveryRows \/> : null/,
    "the public web footer",
  );
  assert.match(
    code,
    /isFetchingNextPage && !discoveryLoadMoreErrorMessage \? <LoadingOwnRows \/> : null/,
    "the signed-in web footer",
  );
  assert.match(
    code,
    /function LoadingOwnRows\(\) \{[\s\S]*?<BoxSkeleton width=\{64\} height=\{64\} \/>/,
    "the own skeleton rows mirror MediaRow's 64dp thumbnail geometry",
  );
  assert.match(
    code,
    /function LoadingDiscoveryRows\([\s\S]*?<DiscoveryCard[\s\S]*?loading/,
    "the discovery skeleton rows are DiscoveryCards in their loading state",
  );
  assert.match(
    code,
    /const LOADING_ROW_KEYS = \["loading-1", "loading-2", "loading-3"\] as const;/,
    "exactly 3 dummy rows per loading section, from the frozen constant",
  );
});

// #278 Tranche 3 — views: the data-bearing views take the same
// explicit `loading` prop, read the internal LoadingScope,
// render skeletons mirroring their loaded layout (actions kept
// as inert skeleton Buttons inside the scope, hairlines
// transparent), show no real content while loading, and render
// unchanged while not loading. The three spinner views
// (RecipeCommentsView, SubscriptionView, and LazySlot's Suspense
// fallback) render skeletons instead of a Spinner.

const T3_PROP_VIEWS = [
  "AccessTokensPanel",
  "AccountDataView",
  "CandidateList",
  "CatalogHeader",
  "ChangedListBanner",
  "FeedbackPreferenceView",
  "LegalSection",
  "NutritionGoalsForm",
  "RecipeCommentsView",
  "RecipeExportPickerView",
  "RecipeImageView",
  "RecipeSharingView",
  "ScaledIngredientsView",
  "SubscriptionView",
  "TransferRecipesView",
] as const;

test("T3: every converted view declares `loading` and reads the LoadingScope", () => {
  for (const name of T3_PROP_VIEWS) {
    const code = readCode(`src/views/${name}.tsx`);
    assert.match(code, /\bloading\?: boolean/, `${name} must declare the explicit loading prop`);
    assert.match(code, /useLoadingScope/, `${name} must read the internal LoadingScope`);
    assert.match(
      code,
      /from "\.\.\/contexts\/LoadingScope\.js"/,
      `${name} must import the scope from src/contexts`,
    );
    assert.match(
      code,
      /TextSkeleton|BoxSkeleton|CircleSkeleton|TokenRow|CommentItem|CheckboxSelectList/,
      `${name} must render skeletons (directly, or via a skeletonized child)`,
    );
  }
});

test("T3: the spinner views' spinners are gone; LazySlot's fallback is a skeleton", () => {
  for (const name of ["RecipeCommentsView", "SubscriptionView", "LazySlot"]) {
    const code = readCode(`src/views/${name}.tsx`);
    assert.doesNotMatch(code, /Spinner/, `${name} must not render a content-loading spinner`);
  }
  const lazySlot = readCode("src/views/LazySlot.tsx");
  assert.match(lazySlot, /BoxSkeleton/, "LazySlot's fallback renders box skeletons");
  assert.match(lazySlot, /TextSkeleton/, "LazySlot's fallback renders text skeletons");
  const tokensPanel = readCode("src/views/AccessTokensPanel.tsx");
  assert.doesNotMatch(
    tokensPanel,
    /Loading tokens/,
    "AccessTokensPanel's plain loading line is gone — the list skeletonizes",
  );
});

test("T3 SSR: loading RecipeCommentsView renders comment skeletons, no real content", async () => {
  const { React, RecipeCommentsView } = await loadRuntime();
  const loading = await renderToHtml(
    React.createElement(RecipeCommentsView, { comments: [], loading: true }),
  );
  assert.equal(hiddenBones(loading), 6, "3 dummy CommentItems x (author bone + 1 body-line bone)");
  assert.ok(!loading.includes("No comments yet"), "the empty state does not show while loading");
  assert.match(loading, /aria-busy/, "a loading RecipeCommentsView marks its region busy");

  const idle = await renderToHtml(
    React.createElement(RecipeCommentsView, {
      comments: [{ id: "c1", authorName: "Jamie", body: "Loved the crust" }],
    }),
  );
  assert.equal(hiddenBones(idle), 0, "a non-loading RecipeCommentsView renders no bones");
  assert.ok(idle.includes("Loved the crust"), "a non-loading view renders its comments");
});

test("T3 SSR: loading SubscriptionView and AccessTokensPanel hide their real content", async () => {
  const { React, SubscriptionView, AccessTokensPanel } = await loadRuntime();
  const noop = () => {};

  const subscription = await renderToHtml(
    React.createElement(SubscriptionView, {
      planLabel: "Secret Plus plan",
      statusText: "Secret status line",
      onManage: noop,
      onRefresh: noop,
      portalUrl: "https://example.com/portal",
      loading: true,
    }),
  );
  assert.ok(hiddenBones(subscription) > 0, "a loading SubscriptionView renders bones");
  assert.ok(!subscription.includes("Secret Plus plan"), "no real plan label while loading");
  assert.ok(!subscription.includes("Secret status line"), "no real status text while loading");
  assert.ok(!subscription.includes("Loading subscription"), "the spinner's loading line is gone");
  assert.match(subscription, /aria-busy/, "a loading SubscriptionView marks its region busy");

  const tokens = await renderToHtml(
    React.createElement(AccessTokensPanel, {
      tokens: [],
      tokenName: "",
      onTokenNameChange: noop,
      onCreate: noop,
      createdSecret: null,
      onDismissSecret: noop,
      onRevoke: noop,
      loading: true,
    }),
  );
  assert.ok(
    hiddenBones(tokens) >= 9,
    "a loading AccessTokensPanel renders 3 dummy token rows' bones",
  );
  assert.ok(!tokens.includes("No tokens yet"), "the empty state does not show while loading");
  assert.match(tokens, /aria-busy/, "a loading AccessTokensPanel marks its region busy");
});

test("T3 SSR: loading CandidateList and NutritionGoalsForm render skeletons", async () => {
  const { React, CandidateList, NutritionGoalsForm } = await loadRuntime();
  const noop = () => {};

  const candidates = await renderToHtml(
    React.createElement(CandidateList, {
      title: "Ready to activate",
      candidates: [
        { id: "v2", label: "Secret version two" },
        { id: "v3", label: "Secret version three" },
      ],
      onActivatePress: noop,
      loading: true,
    }),
  );
  assert.ok(hiddenBones(candidates) > 0, "a loading CandidateList renders bones");
  assert.ok(
    !candidates.includes("Secret version two"),
    "a loading CandidateList shows no real labels",
  );
  assert.match(candidates, /aria-busy/, "a loading CandidateList marks its region busy");

  const goals = await renderToHtml(
    React.createElement(NutritionGoalsForm, {
      goals: { calories: 2000, proteinG: 120, carbsG: null, fatG: null, satietyScore: null },
      onChange: noop,
      onSave: noop,
      loading: true,
    }),
  );
  assert.ok(hiddenBones(goals) > 0, "a loading NutritionGoalsForm renders bones");
  assert.ok(!goals.includes("2000"), "a loading NutritionGoalsForm shows no real goal values");
  assert.match(goals, /aria-busy/, "a loading NutritionGoalsForm marks its region busy");
});

test("T5 survivor audit: only the approved survivor files render a Spinner", () => {
  // #278 tranche 5: content loading is skeletons. The only non-story
  // sources that may render a Spinner are the three survivor waits
  // Stephen approved in the 2026-11-08 plan — PayPage's external
  // payment window, and the two inline search-in-flight indicators
  // (AutocompletePicker, VerseSearchPage). Spinner's own file and
  // stories are exempt (stories demonstrate the widget itself, and
  // Center's story uses it as arbitrary example content).
  const allowed = new Set([
    "src/pages/PayPage.tsx",
    "src/pages/VerseSearchPage.tsx",
    "src/widgets/AutocompletePicker.tsx",
  ]);
  const rendering = [];
  for (const file of sourceFiles(join(root, "src"))) {
    const rel = file.slice(root.length).replace(/^\//, "");
    if (rel.endsWith(".stories.tsx") || rel === "src/widgets/Spinner.tsx") continue;
    if (readCode(rel).includes("<Spinner")) rendering.push(rel);
  }
  assert.deepEqual(
    [...rendering].sort(),
    [...allowed].sort(),
    "a Spinner rendered outside the approved survivor files is a #278 regression — " +
      "give the surface a skeleton loading state instead; a survivor that stops " +
      "rendering one must leave this list in the same change",
  );
});
