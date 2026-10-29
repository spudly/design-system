// Tests for the affected-stories scoping of issue #114
// (tools/visualRegression/scope.mjs + storyGraph.mjs): story-id
// derivation, CSF story-file parsing, the changed-file -> story-set
// mapper over a synthetic import graph, the full-run fallback
// triggers, and a real-repo invariant pinning the derived capture
// set against the committed baselines so the mapper cannot drift
// away from what the pipeline actually captures.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const { sanitizeStoryPart, storyId, storyNameFromExport, parseStoryFile } = await import(
  join(repoRoot, "tools/visualRegression/storyGraph.mjs")
);
const { computeScope, isFallbackPath } = await import(
  join(repoRoot, "tools/visualRegression/scope.mjs")
);
const {
  buildCoverageRows,
  generateCoverageDocs,
  readBaselineFiles,
  renderCoverageTable,
  themeOfStory,
} = await import(join(repoRoot, "tools/visualRegression/coverageListing.mjs"));

test("story id derivation mirrors Storybook's sanitize + startCase", () => {
  assert.equal(sanitizeStoryPart("Pages/Eciperay/RecipesPage"), "pages-eciperay-recipespage");
  assert.equal(storyNameFromExport("CookLogFormOpen"), "Cook Log Form Open");
  assert.equal(storyNameFromExport("Default"), "Default");
  assert.equal(
    storyId("Pages/Eciperay/RecipesPage", "FilterChooserOpen"),
    "pages-eciperay-recipespage--filter-chooser-open",
  );
  assert.equal(storyId("Pages/Eciperay", "MealPlans"), "pages-eciperay--meal-plans");
});

test("parseStoryFile reads the meta title, not fixture titles", () => {
  const text = [
    'import type { Meta, StoryObj } from "@storybook/react-native";',
    "const meta = {",
    '  title: "Pages/Eciperay/RecipesPage",',
    "  component: RecipesPage,",
    "} satisfies Meta<typeof RecipesPage>;",
    "export default meta;",
    "const recipes = [{ id: '1', title: 'Soup' }];",
    "export const Default: Story = {};",
    "export const Empty: Story = {};",
    "",
  ].join("\n");
  const parsed = parseStoryFile(text);
  assert.equal(parsed.title, "Pages/Eciperay/RecipesPage");
  assert.deepEqual(parsed.storyExports, ["Default", "Empty"]);
});

test("parseStoryFile falls back to the unique slash-bearing title", () => {
  const text = [
    "export default {",
    '  title: "Components/Button",',
    "};",
    "export const Primary = {};",
    "",
  ].join("\n");
  assert.equal(parseStoryFile(text).title, "Components/Button");
  assert.equal(parseStoryFile("export const A = {};\n").title, null);
});

// A tiny synthetic src tree with capture-prefixed story titles:
// Leaf is rendered by page A only, Shared by both pages.
function syntheticRepo() {
  const root = mkdtempSync(join(tmpdir(), "dsvr-scope-"));
  const put = (rel, text) => {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  };
  put("src/components/Leaf.tsx", "export const Leaf = () => null;\n");
  put("src/components/Shared.tsx", "export const Shared = () => null;\n");
  put(
    "src/pages/PageA.tsx",
    'import { Leaf } from "../components/Leaf.js";\nimport { Shared } from "../components/Shared.js";\nexport const PageA = () => null;\n',
  );
  put(
    "src/pages/PageB.tsx",
    'import { Shared } from "../components/Shared.js";\nexport const PageB = () => null;\n',
  );
  put(
    "src/pages/RecipesPage.stories.tsx",
    'import { PageA } from "./PageA.js";\nconst meta = { title: "Pages/Eciperay/RecipesPage" };\nexport default meta;\nexport const Default = {};\nexport const Empty = {};\n',
  );
  put(
    "src/pages/PageB.stories.tsx",
    'import { PageB } from "./PageB.js";\nconst meta = { title: "Pages/Eciperay/PageB" };\nexport default meta;\nexport const Default = {};\n',
  );
  return root;
}

test("mapper: changed files map to story ids through the import graph", () => {
  const root = syntheticRepo();
  const leaf = computeScope({ repoRoot: root, changedFiles: ["src/components/Leaf.tsx"] });
  assert.equal(leaf.mode, "scoped");
  assert.deepEqual(leaf.standard, [
    "pages-eciperay-recipespage--default",
    "pages-eciperay-recipespage--empty",
  ]);
  // RecipesPage stories also carry the narrow variant.
  assert.deepEqual(leaf.narrow, [
    "pages-eciperay-recipespage--default",
    "pages-eciperay-recipespage--empty",
  ]);
  const shared = computeScope({ repoRoot: root, changedFiles: ["src/components/Shared.tsx"] });
  assert.deepEqual(shared.standard, [
    "pages-eciperay-pageb--default",
    "pages-eciperay-recipespage--default",
    "pages-eciperay-recipespage--empty",
  ]);
  assert.deepEqual(shared.narrow, leaf.narrow);
  const storyFile = computeScope({
    repoRoot: root,
    changedFiles: ["src/pages/PageB.stories.tsx"],
  });
  assert.deepEqual(storyFile.standard, ["pages-eciperay-pageb--default"]);
  const pageItself = computeScope({ repoRoot: root, changedFiles: ["src/pages/PageA.tsx"] });
  assert.deepEqual(pageItself.standard, leaf.standard);
  const docsOnly = computeScope({ repoRoot: root, changedFiles: ["docs/guide.md"] });
  assert.equal(docsOnly.mode, "scoped");
  assert.deepEqual(docsOnly.standard, []);
  assert.deepEqual(docsOnly.narrow, []);
});

test("fallback: shared/harness paths force the full set", () => {
  const root = syntheticRepo();
  const triggers = [
    "src/tokens/spacing.ts",
    "src/themes/eciperay.ts",
    "src/tamagui.config.ts",
    "tools/visualRegression/run.mjs",
    "apps/storybook/App.tsx",
    ".github/workflows/ci.yml",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
  ];
  for (const file of triggers) {
    const scope = computeScope({ repoRoot: root, changedFiles: [file] });
    assert.equal(scope.mode, "full", `${file} must force a full run`);
  }
  // One fallback file among mappable ones still forces full.
  const mixed = computeScope({
    repoRoot: root,
    changedFiles: ["src/components/Leaf.tsx", "src/tokens/spacing.ts"],
  });
  assert.equal(mixed.mode, "full");
});

test("fallback: deleted src files, unparseable stories, explicit override", () => {
  const root = syntheticRepo();
  const deleted = computeScope({ repoRoot: root, changedFiles: ["src/components/Gone.tsx"] });
  assert.equal(deleted.mode, "full");
  const forced = computeScope({ repoRoot: root, changedFiles: [], forceFull: true });
  assert.equal(forced.mode, "full");
  writeFileSync(join(root, "src/pages/Broken.stories.tsx"), "export const A = {};\n");
  const broken = computeScope({ repoRoot: root, changedFiles: ["src/components/Leaf.tsx"] });
  assert.equal(broken.mode, "full");
  assert.match(broken.reasons[0], /Broken\.stories\.tsx/);
});

test("coverage listing: rows derive from the scope and the files on disk (#284)", () => {
  const scope = {
    standard: [
      "pages-eciperay-recipespage--default",
      "pages-eciperay-recipespage--empty",
      "pages-memorize-myversespage--default",
    ],
    narrow: ["pages-eciperay-recipespage--default"],
  };
  const baselineFiles = new Map([
    [
      "light_warmHarvest",
      new Set([
        "pages-eciperay-recipespage--default.png",
        "pages-eciperay-recipespage--default-narrow.png",
      ]),
    ],
    ["light_quietDawn", new Set(["pages-memorize-myversespage--default.png"])],
  ]);
  const rows = buildCoverageRows(scope, baselineFiles);
  assert.deepEqual(rows, [
    { group: "pages-eciperay-recipespage", theme: "light_warmHarvest", stories: 2, baselines: 1 },
    {
      group: "pages-eciperay-recipespage — narrow variant",
      theme: "light_warmHarvest",
      stories: 1,
      baselines: 1,
    },
    { group: "pages-memorize-myversespage", theme: "light_quietDawn", stories: 1, baselines: 1 },
  ]);
  const table = renderCoverageTable(rows);
  assert.match(table, /\| \*\*Total\*\*.*\| +\*\*4\*\* \| +\*\*3\*\* \|/);
});

test("isFallbackPath classifies the guardrail list", () => {
  assert.equal(isFallbackPath("tools/visualRegression/scope.mjs"), true);
  assert.equal(isFallbackPath("src/components/Button.tsx"), false);
  assert.equal(isFallbackPath("metro.config.js"), true);
  assert.equal(isFallbackPath("README.md"), false);
});

// Helpers for the real-repo completeness gate below (issue #128),
// at module scope per the repo lint rules. The coverage-listing
// derivation itself lives in tools/visualRegression/coverageListing.mjs
// (issue #284) — the listing assertion below is a pure verification
// that the committed table matches what the generator derives from
// the capture set and the baseline files on disk.

// Both directions of the completeness gate: every committed
// baseline must be derivable, and every derivable in-scope story
// must have a committed baseline.
function assertBaselinesMatchScope(scope, baselineFiles) {
  const standard = new Set(scope.standard);
  const narrow = new Set(scope.narrow);
  for (const files of baselineFiles.values()) {
    for (const file of files) {
      if (file.endsWith("-narrow.png")) {
        assert.ok(narrow.has(file.slice(0, -"-narrow.png".length)), `narrow baseline ${file}`);
      } else {
        assert.ok(standard.has(file.slice(0, -".png".length)), `baseline ${file}`);
      }
    }
  }
  for (const id of scope.standard) {
    assert.ok(
      baselineFiles.get(themeOfStory(id)).has(`${id}.png`),
      `missing committed baseline for ${id} (${themeOfStory(id)})`,
    );
  }
  for (const id of scope.narrow) {
    assert.ok(
      baselineFiles.get("light_warmHarvest").has(`${id}-narrow.png`),
      `missing committed narrow baseline for ${id}`,
    );
  }
}

test("real repo: derived capture set matches the committed baselines", () => {
  // Completeness gate (issue #128): the mapper's story inventory
  // and the committed baselines must agree in BOTH directions —
  // every baseline derivable, and every derivable in-scope story
  // HAS a committed baseline — and the coverage listing in
  // docs/android-visual-regression.md must match both. The
  // Current light set: 138 standard-width stories (108 light_warmHarvest + 22
  // light_quietDawn on disk minus the 3 Reading-screen stories the capture app
  // excludes, ReadingView replicating Memorize's reading screen and landing in
  // B4; the #168 DiscoverPage/DiscoveryCard baselines joined through merges
  // after the #169 +11 / #170 +2 page growth, and #171 added the
  // LandingPage story (+1 standard)). The #119 recipes-list
  // tranche added the ten stories of its extracted components
  // (FieldStack, FilterBar, SearchRow, ChoiceRow, RemovableField,
  // RatingStars ×3, MediaRow ×2 — +10 standard).
  const EXPECTED_LIGHT_STORY_COUNT = 138;
  // the standard set grew by the eight B3a recipe-form stories,
  // #124, the sixteen B3b meals/shopping stories, #125, the
  // twenty-three B3c account/auth stories, #126, the three
  // B4 Memorize settings stories, #127, and the TagsPage
  // inline-edit story, eciperay#254; #185 then retired the
  // RecipesBrowse/SharedWithMe demos and the four
  // SharedWithMePage stories (−6 standard) and added the four
  // Shared* RecipesPage stories (+4 standard, +4 narrow — every
  // RecipesPage story carries the narrow variant), and #242
  // added the VerseSearchPage added-state story (+1 standard),
  // and #255 added the four auth pages' Loading stories
  // (+4 standard) and #254 added the ImportUrlPage
  // Interactive story (+1 standard), #169 added the eight
  // PublicRecipePage stories and three PublicPageFrame stories
  // (+11 standard), #170 added the two LegalDocumentPage
  // stories (+2 standard), and #168 added the eight
  // DiscoverPage stories (+8 standard), and #292 added the
  // RecipesPage LoadingMore story (+1 standard, +1 narrow —
  // every RecipesPage story carries the narrow variant), and the
  // #119 recipes-list tranche added its ten component stories
  // (+10 standard) — their baselines are generated by the
  // pipeline's auto-commit flow).
  const scope = computeScope({ repoRoot, changedFiles: [], forceFull: true });
  assert.equal(scope.standard.length, EXPECTED_LIGHT_STORY_COUNT);
  assert.equal(scope.narrow.length, 12);
  const baselineRoot = join(repoRoot, "tools/visualRegression/baselines");
  const baselineFiles = readBaselineFiles(baselineRoot);
  assertBaselinesMatchScope(scope, baselineFiles);
  assert.ok(existsSync(baselineRoot));
  const docs = readFileSync(join(repoRoot, "docs/android-visual-regression.md"), "utf8");
  assert.equal(
    docs,
    generateCoverageDocs(repoRoot, docs),
    "docs coverage listing matches the generated table (run tools/visualRegression/coverageListing.mjs)",
  );
});
