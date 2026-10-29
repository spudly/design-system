/**
 * Coverage-parity contract for the two storybooks (design-system
 * #122, B1 of the #121 completion program).
 *
 * The design system has exactly two storybooks over ONE shared set of
 * CSF files in src/:
 *
 * - the react storybook (web): .storybook/ at the repo root,
 *   @storybook/react-vite, published via Chromatic;
 * - the react-native storybook: apps/storybook, @storybook/react-native
 *   in an Expo host app, which also drives the Android VR captures.
 *
 * Both configs glob the same tree (src/**\/*.stories.@(ts|tsx)), and
 * the react-native side materializes that glob through the generated
 * .rnstorybook/storybook.requires.ts (Metro require.context). Parity
 * is therefore a property of three things, all pinned here:
 *
 * 1. Every widget module in src/components and every page module in
 *    src/pages has a sibling .stories.tsx with the organized title
 *    (Components/<Name>, Pages/<App>/<Name>) and at least one story —
 *    a module without a story file is invisible in BOTH storybooks.
 * 2. Both storybook configs declare the same stories glob (modulo the
 *    relative prefix), so neither side can quietly narrow its set.
 * 3. The committed storybook.requires.ts still matches the
 *    react-native config's glob, so the generated registry cannot go
 *    stale against the config it was generated from.
 *
 * The naming formalization is pinned too: the root package.json
 * carries storybook:react / build-storybook:react /
 * storybook:react-native scripts (with the legacy `storybook` and
 * `build-storybook` names kept working as aliases — Chromatic's
 * default build script name is `build-storybook`), and
 * apps/storybook carries storybook:react-native.
 *
 * Documented exceptions (not components/pages, so no stories):
 * - src/components/accessibility.ts — ARIA helper utilities.
 * - src/components/tagColors.ts — the shared tag-color resolver hook
 *   (#207); exercised through the Badge/ColorPickerField stories.
 * - src/pages/PageFrame.tsx — internal page scaffolding shared by the
 *   page components; NOT exported from src/pages/index.ts, so it is
 *   not part of the @spudly/ui/pages surface. It is exercised through
 *   every page story. If it is ever exported, this test fails and a
 *   story decision is required.
 * - src/pages/BoundedList.tsx — internal page scaffolding (#119): the
 *   shared bounded FlatList the fixed-shell list pages render. It
 *   imports react-native, so it cannot be a root-exported component;
 *   NOT exported from src/pages/index.ts, exercised through the
 *   pages that use it (VerseSearchPage, MemorizeReviewPage,
 *   MyVersesPage). Same rule as PageFrame: export means a story
 *   decision is required.
 * - src/pages/fixtures.ts — static story fixtures, not a component.
 *
 * Source scan, like the other story contract tests
 * (pagesStoryCategories.test.mjs, pageStories.test.mjs): the
 * invariants are per-file properties of the source, and the actual
 * story indexes are produced by Storybook in CI (Chromatic build for
 * react, the VR host app for react-native).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function storyExportCount(source) {
  return [...source.matchAll(/^export const \w+/gm)].length;
}

function declaredTitle(source) {
  const match = /title: "([^"]+)"/.exec(source);
  return match ? match[1] : null;
}

/** One module's parity obligations: exported from its area index, a
 * sibling story file exists, the story's title satisfies the area's
 * organization rule, and it exports at least one story. */
function assertModuleStory({ dir, index, base, titleDescription, titleMatches }) {
  assert.ok(
    index.includes(`from "./${base}.js"`),
    `${base} is not exported from its area index.ts`,
  );
  const storyPath = join(dir, `${base}.stories.tsx`);
  assert.ok(
    existsSync(storyPath),
    `${base}.stories.tsx is missing — ${base} has no story in either storybook`,
  );
  const story = readFileSync(storyPath, "utf8");
  const title = declaredTitle(story);
  assert.ok(
    titleMatches(title),
    `${base}.stories.tsx declares "${title}" — expected ${titleDescription}`,
  );
  assert.ok(storyExportCount(story) >= 1, `${base}.stories.tsx exports no stories`);
}

test("every widget component has a story file titled Components/<Name>", () => {
  const dir = join(root, "src", "components");
  const index = read("src/components/index.ts");
  // Internal helpers, not widgets: accessibility.ts / tagColors.ts
  // are prop/style translators, and linkOverlay.tsx is the
  // native-only link layer other components compose — none is a
  // standalone component with a story of its own.
  const exceptions = new Set(["accessibility.ts", "index.ts", "tagColors.ts", "linkOverlay.tsx"]);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    assert.ok(
      entry.isFile(),
      `src/components/${entry.name}: unexpected directory — the parity scan is flat`,
    );
    if (exceptions.has(entry.name) || entry.name.endsWith(".stories.tsx")) continue;
    assert.ok(
      entry.name.endsWith(".tsx"),
      `src/components/${entry.name}: unaccounted file — add it to the parity exceptions with a reason, or give it stories`,
    );
    const base = entry.name.replace(/\.tsx$/, "");
    assertModuleStory({
      dir,
      index,
      base,
      titleDescription: `title "Components/${base}"`,
      titleMatches: (t) => t === `Components/${base}`,
    });
  }
});

test("every page component has a story file titled Pages/<App>/<Name>", () => {
  const dir = join(root, "src", "pages");
  const index = read("src/pages/index.ts");
  // Internal files with no story of their own (see header): PageFrame
  // and BoundedList are scaffolding exercised through the page stories;
  // fixtures.ts is data; useCatalogPagination.ts is the shared hook
  // (#285) exercised through the RecipesPage/DiscoverPage stories.
  // None is exported from src/pages/index.ts.
  const exceptions = new Set([
    "PageFrame.tsx",
    "BoundedList.tsx",
    "fixtures.ts",
    "useCatalogPagination.ts",
    "index.ts",
  ]);
  assert.ok(
    !index.includes('from "./PageFrame.js"'),
    "PageFrame is exported from src/pages/index.ts — it is now public surface and needs its own story decision (see storybookParity header)",
  );
  assert.ok(
    !index.includes('from "./BoundedList.js"'),
    "BoundedList is exported from src/pages/index.ts — it is now public surface and needs its own story decision (see storybookParity header)",
  );
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    assert.ok(
      entry.isFile(),
      `src/pages/${entry.name}: unexpected directory — the parity scan is flat`,
    );
    if (exceptions.has(entry.name) || entry.name.endsWith(".stories.tsx")) continue;
    assert.ok(
      entry.name.endsWith(".tsx"),
      `src/pages/${entry.name}: unaccounted file — add it to the parity exceptions with a reason, or give it stories`,
    );
    const base = entry.name.replace(/\.tsx$/, "");
    assertModuleStory({
      dir,
      index,
      base,
      titleDescription: `a Pages/<App>/${base} title (#70)`,
      titleMatches: (t) => t === `Pages/Eciperay/${base}` || t === `Pages/Memorize/${base}`,
    });
  }
});

test("every story file is organized under Components/ or Pages/<App>/ and exports stories", () => {
  for (const area of ["components", "pages"]) {
    const dir = join(root, "src", area);
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".stories.tsx")) continue;
      const story = readFileSync(join(dir, name), "utf8");
      const title = declaredTitle(story);
      assert.ok(
        title !== null &&
          (title.startsWith("Components/") ||
            title === "Pages/Eciperay" ||
            title === "Pages/Memorize" ||
            title.startsWith("Pages/Eciperay/") ||
            title.startsWith("Pages/Memorize/")),
        `src/${area}/${name} declares title "${title}" — stories live under Components/ or Pages/<App>/`,
      );
      assert.ok(storyExportCount(story) >= 1, `src/${area}/${name} exports no stories`);
    }
  }
});

/** The stories glob(s) a Storybook config declares, normalized by
 * stripping the relative prefix so the web and react-native configs
 * can be compared for covering the same tree. */
function storyGlobs(configSource) {
  return [...configSource.matchAll(/"([^"]*\.stories\.[^"]*)"/g)]
    .map((m) => m[1].replace(/^(\.\.\/)+/, ""))
    .sort();
}

test("both storybook configs glob the same src story tree", () => {
  const web = storyGlobs(read(".storybook/main.ts"));
  const rn = storyGlobs(read("apps/storybook/.rnstorybook/main.ts"));
  assert.deepEqual(
    web,
    ["src/**/*.stories.@(ts|tsx)"],
    "web .storybook/main.ts stories glob changed — update the parity contract deliberately",
  );
  assert.deepEqual(
    rn,
    web,
    "react-native .rnstorybook/main.ts must glob the same story tree as the web config",
  );
});

test("the committed react-native story registry matches its config glob", () => {
  const requires = read("apps/storybook/.rnstorybook/storybook.requires.ts");
  assert.ok(
    requires.includes('directory: "../../src"'),
    "storybook.requires.ts does not point at ../../src — regenerate with `npm run generate` in apps/storybook",
  );
  assert.ok(
    requires.includes('files: "**/*.stories.@(ts|tsx)"'),
    "storybook.requires.ts files pattern drifted from the .rnstorybook/main.ts glob — regenerate with `npm run generate` in apps/storybook",
  );
  assert.ok(
    requires.includes("require.context("),
    "storybook.requires.ts must include stories via require.context",
  );
});

test("package scripts name both storybooks (legacy names kept as aliases)", () => {
  const rootPkg = JSON.parse(read("package.json"));
  for (const name of ["storybook:react", "build-storybook:react", "storybook:react-native"]) {
    assert.ok(
      rootPkg.scripts[name],
      `root package.json is missing the "${name}" script (#122 naming)`,
    );
  }
  for (const legacy of ["storybook", "build-storybook"]) {
    assert.ok(
      rootPkg.scripts[legacy],
      `root package.json dropped the legacy "${legacy}" script — it must keep working (Chromatic builds with the default "build-storybook" script name)`,
    );
  }
  const appPkg = JSON.parse(read("apps/storybook/package.json"));
  assert.ok(
    appPkg.scripts["storybook:react-native"],
    'apps/storybook package.json is missing the "storybook:react-native" script (#122 naming)',
  );
});
