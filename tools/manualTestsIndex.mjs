#!/usr/bin/env node
/**
 * Generates `docs/manual-tests.md` — the index of the colocated manual
 * test steps (design-system #530).
 *
 * The steps themselves live beside the component they cover, in
 * `<Base>.test.steps.md` files under `src/`, each carrying its
 * "Run when" triggers verbatim in YAML front-matter (`run_when:`).
 * This script scans those files and rebuilds the index table, so the
 * release-finalization Storybook QA pass keeps a single trigger
 * lookup. Run it after adding or changing a steps file:
 *
 *   npm run manual-tests:index
 *
 * The generated file is committed; do not edit it by hand.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/**
 * Recursively collects every `.test.steps.md` file under `dir`.
 */
function stepsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...stepsFiles(path));
    else if (entry.name.endsWith(".test.steps.md")) out.push(path);
  }
  return out;
}

/**
 * Parses a steps file's YAML front-matter: the `component:` scalar
 * and the `run_when:` list, whose values are YAML double-quoted
 * strings (decoded with JSON.parse) or plain scalars.
 */
function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const component = match[1].match(/^component:\s*(.+)$/m)?.[1]?.trim();
  // Only the `run_when:` block's list items are triggers — a list under
  // any other front-matter key must not be read as triggers (and a file
  // whose run_when is absent or empty yields no triggers, so the
  // missing-trigger validation below rejects it).
  // Blank lines between list items are legal YAML and stay inside the
  // block; the block ends at the next top-level key (a non-empty line
  // starting at column 0).
  const runWhenBlock =
    match[1].match(/^run_when:[ \t]*\r?\n((?:(?:[ \t]+.*)?(?:\r?\n|$))*)/m)?.[1] ?? "";
  const runWhen = [...runWhenBlock.matchAll(/^\s+-\s+(.+)$/gm)].map((m) => {
    const raw = m[1].trim();
    if (raw.startsWith('"')) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return raw;
  });
  return { component, runWhen };
}

const rows = [];
for (const file of stepsFiles(join(root, "src"))) {
  const parsed = parseFrontMatter(readFileSync(file, "utf8"));
  if (!parsed?.component) {
    console.error(`manualTestsIndex: no front-matter in ${file}`);
    process.exit(1);
  }
  if (!parsed.runWhen.some((trigger) => trigger.trim())) {
    console.error(`manualTestsIndex: no run_when trigger in ${file}`);
    process.exit(1);
  }
  rows.push({
    component: parsed.component,
    path: relative(root, file).replaceAll("\\", "/"),
    runWhen: parsed.runWhen,
  });
}
rows.sort((a, b) => a.component.localeCompare(b.component));

const header = `# Manual Test Plan — Storybook QA

Manual tests are the tests that are **not run via Jest or Playwright**
(Stephen's definition). For the design system, that surface is visual:
how components and pages render, lay out, and respond in their story
states.

The steps themselves are **colocated with the component they cover**
(design-system #530): each lives in a \`<Base>.test.steps.md\` file
beside its subject under \`src/\`, carrying its "Run when" triggers
verbatim in front-matter. This document is a **generated index** of
those files — do not edit it by hand; regenerate it with
\`npm run manual-tests:index\` after adding or changing a steps file.

## How runs work

- **Scope — changed components only.** A design-system PR (including a
  Version Packages PR) gets a manual QA pass over ONLY its changed
  components/pages, at release finalization. Each steps file's
  front-matter carries a **run_when** list naming the source paths /
  component names that select it; the table below collects them. For a
  Version Packages PR, the trigger match runs against the components
  named across all changesets in the release.
- **Environment.** The Storybook deployment Chromatic publishes for
  the PR's build (the react Storybook). Use the build for the PR's
  head SHA; if no Chromatic build exists for the head yet, the pass
  is pending that build and still gates merge-ready.
- **Cases.** The checks a human would do that Jest/Playwright do not
  cover: open the named stories, verify the rendered states (variants,
  tones, empty/loading/error states the stories expose), and exercise
  the interactions the stories expose (controls/args, toggles, dismiss,
  stepping). The PR's changeset description — written in testable,
  user-visible terms — is the expected-behavior source for what the
  change should look like.
- **Recording.** One comment on the PR per head SHA: components
  tested, stories opened, pass/fail per component, and observed vs
  expected for any failure.
- **Failures.** A failure in behavior the PR changes is a loop failure
  (fix and re-run the affected stories). A pre-existing failure is
  filed as a \`bug\` + \`qa\` issue, linked on the PR, and does not block
  merge-ready.
- **Exemptions.** Diffs touching no component/page/story have nothing
  to test — the PR comment says so and the gate is satisfied.

## Maintaining the steps

- **Every PR that adds or changes a component/page's visible behavior
  updates that component's \`<Base>.test.steps.md\` file in the same
  PR** — create the steps file for a new component, adjust cases for
  changed behavior, delete cases for removed behavior — and
  regenerates this index (\`npm run manual-tests:index\`).
- Keep cases concrete: real story names, real controls, and the
  expected rendered result — not general intentions.
- When a case becomes automated (Jest contract test or Playwright),
  remove it from the steps file and say so in the PR description.

## Index

| Component | Steps file | Run when |
| --- | --- | --- |
`;

const table = rows
  .map((r) => `| ${r.component} | [\`${r.path}\`](../${r.path}) | ${r.runWhen.join("<br>")} |`)
  .join("\n");

writeFileSync(join(root, "docs/manual-tests.md"), `${header}${table}\n`);
console.log(`manualTestsIndex: indexed ${rows.length} steps files`);
