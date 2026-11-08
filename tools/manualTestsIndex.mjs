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
 * Strips a YAML inline comment from a scalar value. A quoted scalar
 * runs to its closing quote — a `#` inside it, or escaped inside a
 * double-quoted scalar, is part of the value, and only whitespace
 * plus a comment may follow the closing quote. In a plain scalar a
 * `#` preceded by whitespace begins the comment; a `#` anywhere
 * else (and any quote character past the first position) is data.
 */
function stripInlineComment(item) {
  if (item.startsWith('"') || item.startsWith("'")) {
    const quote = item[0];
    for (let i = 1; i < item.length; i++) {
      if (quote === '"' && item[i] === "\\") i++;
      else if (item[i] === quote) {
        // A doubled single quote is an escaped quote, not the end.
        if (quote === "'" && item[i + 1] === "'") i++;
        else {
          // Only whitespace or an inline comment may follow the
          // closing quote; anything else stays in the returned text
          // so the decode step below rejects the scalar instead of
          // silently dropping the trailing text.
          const tail = item.slice(i + 1);
          return /^\s*$/.test(tail) || /^\s+#/.test(tail) ? item.slice(0, i + 1) : item;
        }
      }
    }
    return item;
  }
  const comment = item.match(/\s#/);
  return comment ? item.slice(0, comment.index).trimEnd() : item;
}

/**
 * Parses a steps file's YAML front-matter: the `component:` scalar
 * and the `run_when:` list, whose values are YAML double-quoted
 * strings (decoded with JSON.parse), single-quoted strings
 * (decoded by removing the outer quotes and undoubling escaped
 * single quotes), or plain scalars. A whitespace-separated inline
 * `#` comment after a value is stripped first, so the published
 * trigger is the scalar itself. A quoted value that does not
 * decode — no closing quote, or trailing text after it — is
 * rejected: publishing the raw text would silently index a
 * different trigger than the one the steps file declares.
 */
/**
 * Decodes one `run_when:` list item: strips any inline comment, then
 * decodes a double-quoted scalar with JSON.parse, a single-quoted
 * scalar by removing the outer quotes and undoubling escaped single
 * quotes, or returns a plain scalar as-is. A quoted scalar that does
 * not decode is rejected (see parseFrontMatter's contract above).
 */
function decodeScalar(item) {
  const scalar = stripInlineComment(item);
  if (scalar.startsWith('"')) {
    try {
      return JSON.parse(scalar);
    } catch {
      throw new Error(`manualTestsIndex: invalid double-quoted run_when scalar: ${item}`);
    }
  }
  if (scalar.startsWith("'")) {
    if (!/^'([^']|'')*'$/.test(scalar)) {
      throw new Error(`manualTestsIndex: invalid single-quoted run_when scalar: ${item}`);
    }
    return scalar.slice(1, -1).replaceAll("''", "'");
  }
  return scalar;
}

function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  // Line-based scan (not a block regex): only list items under the
  // `run_when:` key are triggers. Blank lines and comment lines are
  // legal anywhere in YAML and never change the current key; any
  // other top-level key ends the run_when list, so a list under a
  // different key is never read as triggers — and a file whose
  // run_when is absent or empty yields no triggers, so the
  // missing-trigger validation below rejects it.
  let component;
  let inRunWhen = false;
  const runWhen = [];
  for (const line of match[1].split(/\r?\n/)) {
    if (/^\s*$/.test(line) || /^\s*#/.test(line)) continue;
    if (inRunWhen) {
      const item = line.match(/^\s*-\s+(.+)$/)?.[1]?.trim();
      if (item !== undefined) {
        runWhen.push(decodeScalar(item));
        continue;
      }
    }
    const key = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (key) {
      inRunWhen = key[1] === "run_when";
      if (key[1] === "component") component = key[2].trim();
    }
  }
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
