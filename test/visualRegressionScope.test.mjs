// Tests for the affected-stories scoping of issue #114
// (tools/visualRegression/scope.mjs + storyGraph.mjs): story-id
// derivation, CSF story-file parsing, the changed-file -> story-set
// mapper over a synthetic import graph, the full-run fallback
// triggers, and a real-repo invariant pinning the derived capture
// set against the committed baselines so the mapper cannot drift
// away from what the pipeline actually captures.

import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
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

test("isFallbackPath classifies the guardrail list", () => {
  assert.equal(isFallbackPath("tools/visualRegression/scope.mjs"), true);
  assert.equal(isFallbackPath("src/components/Button.tsx"), false);
  assert.equal(isFallbackPath("metro.config.js"), true);
  assert.equal(isFallbackPath("README.md"), false);
});

// Helpers for the real-repo completeness gate below (issue #128),
// at module scope per the repo lint rules.
const themeOfStory = (id) =>
  id.startsWith("pages-memorize") ? "light_quietDawn" : "light_warmHarvest";
const groupOfStory = (id) => id.split("--")[0];

function readBaselineFiles(baselineRoot) {
  const files = new Map();
  for (const theme of readdirSync(baselineRoot)) {
    const dir = join(baselineRoot, theme);
    if (!statSync(dir).isDirectory()) continue;
    files.set(theme, new Set(readdirSync(dir).filter((f) => f.endsWith(".png"))));
  }
  return files;
}

function parseCoverageListing(docs) {
  const begin = docs.indexOf("<!-- VR-COVERAGE-BEGIN -->");
  const end = docs.indexOf("<!-- VR-COVERAGE-END -->");
  assert.ok(begin !== -1 && end > begin, "docs coverage listing markers present");
  const rows = new Map();
  let totalStories = 0;
  let totalBaselines = 0;
  for (const line of docs.slice(begin, end).split("\n")) {
    const raw = line.split("|").map((c) => c.replaceAll("**", "").trim());
    const cells = raw.slice(1, raw.at(-1) === "" ? -1 : undefined);
    if (cells.length !== 4) continue;
    const [group, theme, stories, baselines] = cells;
    if (group === "Total") {
      totalStories = Number(stories);
      totalBaselines = Number(baselines);
      continue;
    }
    if (!group.startsWith("pages-")) continue;
    rows.set(group, { theme, stories: Number(stories), baselines: Number(baselines) });
  }
  return { rows, totalStories, totalBaselines };
}

function derivedGroupsOf(scope) {
  const groups = new Map();
  for (const id of scope.standard) {
    const key = groupOfStory(id);
    if (!groups.has(key)) groups.set(key, { theme: themeOfStory(id), standard: [], narrow: [] });
    groups.get(key).standard.push(id);
  }
  for (const id of scope.narrow) groups.get(groupOfStory(id)).narrow.push(id);
  return groups;
}

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

// One standard row (+ its narrow-variant row when the group has
// narrow stories) against the derived group and the files on
// disk. Returns [stories, baselines] counted for the row.
function assertListingRow(key, group, rows, baselineFiles) {
  const row = rows.get(key);
  assert.ok(row, `docs coverage listing has a row for ${key}`);
  assert.equal(row.theme, group.theme, `docs theme for ${key}`);
  assert.equal(row.stories, group.standard.length, `docs story count for ${key}`);
  assert.equal(
    row.baselines,
    group.standard.filter((id) => baselineFiles.get(group.theme).has(`${id}.png`)).length,
    `docs baseline count for ${key}`,
  );
  let stories = row.stories;
  let baselines = row.baselines;
  if (group.narrow.length > 0) {
    const narrowRow = rows.get(`${key} — narrow variant`);
    assert.ok(narrowRow, `docs coverage listing has the narrow-variant row for ${key}`);
    assert.equal(narrowRow.stories, group.narrow.length, `docs narrow story count for ${key}`);
    assert.equal(
      narrowRow.baselines,
      group.narrow.filter((id) => baselineFiles.get("light_warmHarvest").has(`${id}-narrow.png`))
        .length,
      `docs narrow baseline count for ${key}`,
    );
    stories += narrowRow.stories;
    baselines += narrowRow.baselines;
  }
  return [stories, baselines];
}

// The docs coverage listing must match the derived set and the
// files on disk, group by group, totals included.
function assertCoverageListing(scope, baselineFiles) {
  const docs = readFileSync(join(repoRoot, "docs/android-visual-regression.md"), "utf8");
  const { rows, totalStories, totalBaselines } = parseCoverageListing(docs);
  const derivedGroups = derivedGroupsOf(scope);
  let countedStories = 0;
  let countedBaselines = 0;
  for (const [key, group] of derivedGroups) {
    const [stories, baselines] = assertListingRow(key, group, rows, baselineFiles);
    countedStories += stories;
    countedBaselines += baselines;
  }
  assert.equal(
    rows.size,
    derivedGroups.size + 1,
    "docs listing has no rows beyond the derived groups (+ narrow)",
  );
  assert.equal(totalStories, countedStories, "docs listing total stories");
  assert.equal(totalBaselines, countedBaselines, "docs listing total baselines");
}

test("real repo: derived capture set matches the committed baselines", () => {
  // Completeness gate (issue #128): the mapper's story inventory
  // and the committed baselines must agree in BOTH directions —
  // every baseline derivable, and every derivable in-scope story
  // HAS a committed baseline — and the coverage listing in
  // docs/android-visual-regression.md must match both. The
  // standard/narrow sets are at their known sizes (99 + 11 = 110;
  // the standard set grew by the eight B3a recipe-form stories,
  // #124, the sixteen B3b meals/shopping stories, #125, the
  // twenty-three B3c account/auth stories, #126, the three
  // B4 Memorize settings stories, #127, and the TagsPage
  // inline-edit story, eciperay#254; #185 then retired the
  // RecipesBrowse/SharedWithMe demos and the four
  // SharedWithMePage stories (−6 standard) and added the four
  // Shared* RecipesPage stories (+4 standard, +4 narrow — every
  // RecipesPage story carries the narrow variant), and #242
  // added the VerseSearchPage added-state story (+1 standard)
  // — their baselines are generated by the pipeline's
  // auto-commit flow).
  const scope = computeScope({ repoRoot, changedFiles: [], forceFull: true });
  assert.equal(scope.standard.length, 100);
  assert.equal(scope.narrow.length, 11);
  const baselineRoot = join(repoRoot, "tools/visualRegression/baselines");
  const baselineFiles = readBaselineFiles(baselineRoot);
  assertBaselinesMatchScope(scope, baselineFiles);
  assert.ok(existsSync(baselineRoot));
  assertCoverageListing(scope, baselineFiles);
});
