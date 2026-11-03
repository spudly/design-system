/**
 * Regression test for the `android-sanity` label trigger
 * (PR #396 review, Stephen's Option B decision, 2026-11-03).
 *
 * The workflow originally declared a bare `pull_request:` trigger,
 * so GitHub's default activity types (opened / synchronize /
 * reopened) applied and adding the `android-sanity` label to a
 * quiet PR started no run at all — the sanity job only evaluated
 * the label inside a run some other event had started, while the
 * docs told readers to run it by adding the label.
 *
 * The contract now:
 * 1. The trigger's types list restates the defaults plus
 *    `labeled`, so adding a label starts a run.
 * 2. On a label-triggered run the heavy jobs (visual-regression,
 *    commit-pr-baselines) never run — not even on a release PR.
 * 3. On a label-triggered run the sanity job runs only when the
 *    added label IS `android-sanity`; any other label no-ops the
 *    whole run.
 * 4. On ordinary PR events the sanity job keeps its original
 *    behavior: it runs when the label is present at run start.
 * 5. Label-triggered runs get their own per-label concurrency
 *    group, so label churn cannot cancel an in-progress heavy run
 *    (nor a sanity run started by the `android-sanity` label).
 *
 * This is a source scan of the workflow YAML: GitHub's
 * activity-type and job-gating semantics cannot be reproduced by
 * a local runner, and the invariant is a per-literal property of
 * the workflow source (same rationale as
 * test/chromaticWorkflow.test.ts). The scan fails loudly if the
 * blocks it looks for cannot be found, rather than passing
 * vacuously.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const workflowPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".github",
  "workflows",
  "android-storybook.yml",
);
const workflow = readFileSync(workflowPath, "utf8");

/** Return the YAML block for job `name` (from its two-space-indented
 * `name:` line up to the next job at the same indent, or EOF). Fails
 * loudly when absent. */
function jobBlock(name: string) {
  const start = workflow.indexOf(`\n  ${name}:`);
  assert.notEqual(start, -1, `job "${name}" not found in android-storybook.yml`);
  const rest = workflow.slice(start + name.length + 4);
  const next = rest.search(/\n {2}[a-z][a-z-]*:/);
  return next === -1 ? rest : rest.slice(0, next);
}

/** Return a job's `if:` condition with all whitespace collapsed, so
 * folded scalars match as one string. Fails loudly when absent. */
function jobCondition(name: string) {
  const block = jobBlock(name);
  const match = block.match(/\n {4}if:(?: >-\n((?: {6}.*\n?)+)| (.*))/);
  assert.ok(match, `job "${name}" has no if: condition`);
  return (match[1] ?? match[2]).replaceAll(/\s+/g, " ").trim();
}

test("the pull_request trigger includes the labeled activity type", () => {
  const trigger = workflow.match(/\n {2}pull_request:\n {4}types: \[([^\]]*)\]/);
  assert.ok(trigger, "pull_request trigger must declare an explicit types list");
  const types = trigger[1].split(",").map((t) => t.trim());
  assert.deepEqual(types, ["opened", "synchronize", "reopened", "labeled"]);
});

test("label-triggered runs never start the heavy jobs, even on a release PR", () => {
  for (const job of ["visual-regression", "commit-pr-baselines"]) {
    assert.match(
      jobCondition(job),
      /github\.event\.action != 'labeled'/,
      `${job} must exclude labeled events`,
    );
  }
});

test("the sanity job runs on a labeled event only for the android-sanity label", () => {
  assert.match(
    jobCondition("sanity"),
    /github\.event\.action == 'labeled' && github\.event\.label\.name == 'android-sanity'/,
    "sanity must key its labeled branch to the added label being android-sanity",
  );
});

test("the sanity job keeps its label-presence behavior on ordinary PR events", () => {
  assert.match(
    jobCondition("sanity"),
    /github\.event\.action != 'labeled' && contains\(github\.event\.pull_request\.labels\.\*\.name, 'android-sanity'\)/,
    "sanity must still run on non-labeled PR events when the label is present",
  );
});

test("label-triggered runs get their own per-label concurrency group", () => {
  const group = workflow.match(/\n {2}group: android-storybook-vr-(.*)/);
  assert.ok(group, "concurrency group not found in android-storybook.yml");
  assert.match(
    group[1],
    /github\.event\.action == 'labeled'.*github\.event\.label\.name/,
    "the group must suffix label-triggered runs with the label name",
  );
});
