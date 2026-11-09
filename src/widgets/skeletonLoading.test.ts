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
    const loadingScope: Record<string, any> = await import("../../dist/contexts/LoadingScope.js");
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
// prop-drilling), renders skeletons with no real content while
// loading — its actions stay in place as inert skeletons
// (Buttons skeletonize themselves inside the scope — filled
// buttons as rectangles, ghost buttons as text bones, Stephen
// on #551) — and renders unchanged while not loading.
// The collection widgets (CheckboxSelectList, StatBand) render
// exactly 3 dummy items while loading; MasonryGrid renders 24
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
    5,
    "a loading CommentItem renders author + 2 body bones + its 2 ghost action bones",
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
