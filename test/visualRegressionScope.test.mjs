// Tests for the affected-stories scoping of issue #114
// (tools/visualRegression/scope.mjs + storyGraph.mjs): story-id
// derivation, CSF story-file parsing, the changed-file -> story-set
// mapper over a synthetic import graph, the full-run fallback
// triggers, and a real-repo invariant pinning the derived capture
// set against the committed baselines so the mapper cannot drift
// away from what the pipeline actually captures.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, statSync, writeFileSync } from "node:fs";
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

test("real repo: derived capture set matches the committed baselines", () => {
  // The mapper's story inventory must reproduce exactly the ids
  // the pipeline has baselines for — every baseline derivable, and
  // the standard/narrow sets at their known sizes (58 + 7 = 65;
  // the standard set grew by the eight B3a recipe-form stories,
  // #124 — their baselines are generated by the pipeline's
  // auto-commit flow).
  const scope = computeScope({ repoRoot, changedFiles: [], forceFull: true });
  assert.equal(scope.standard.length, 58);
  assert.equal(scope.narrow.length, 7);
  const standard = new Set(scope.standard);
  const narrow = new Set(scope.narrow);
  const baselineRoot = join(repoRoot, "tools/visualRegression/baselines");
  for (const theme of readdirSync(baselineRoot)) {
    const dir = join(baselineRoot, theme);
    if (!statSync(dir).isDirectory()) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".png")) continue;
      if (file.endsWith("-narrow.png")) {
        assert.ok(narrow.has(file.slice(0, -"-narrow.png".length)), `narrow baseline ${file}`);
      } else {
        assert.ok(standard.has(file.slice(0, -".png".length)), `baseline ${file}`);
      }
    }
  }
  assert.ok(existsSync(baselineRoot));
});
