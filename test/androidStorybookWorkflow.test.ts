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

test("phase 2: the visual-regression job is a matrix over the plan job's shards", () => {
  const block = jobBlock("visual-regression");
  assert.match(block, /needs: plan/, "visual-regression must consume the plan job");
  assert.match(
    block,
    /matrix:\s*\n\s*shard: \$\{\{ fromJSON\(needs\.plan\.outputs\.shards\) \}\}/,
    "the matrix must expand the plan job's shard list",
  );
  assert.match(block, /fail-fast: false/, "one shard failing must not cancel the others");
  assert.match(
    block,
    /capture-compare\.sh "\$\{\{ github\.event_name == 'pull_request' && 'pr-shard' \|\| inputs\.mode \}\}"/,
    "PR shards must run the pr-shard compare-only mode; dispatches keep their mode",
  );
  assert.match(
    block,
    /name: dsvr-shard-\$\{\{ matrix\.shard \}\}/,
    "each shard must upload its captures under the dsvr-shard-<index> artifact name mergeShards.mjs reads",
  );
});

test("phase 2: merge-verify unions the shards and gates commit-pr-baselines", () => {
  const block = jobBlock("merge-verify");
  assert.match(block, /needs: \[plan, visual-regression\]/);
  assert.match(block, /mergeShards\.mjs/, "merge-verify must union the shard artifacts");
  assert.match(
    block,
    /capture-compare\.sh stage-merged/,
    "the gate + guard must run over the union before any verification",
  );
  assert.match(
    block,
    /capture-compare\.sh verify-merged/,
    "the phase-1 verification re-capture must run once over the merged staged set",
  );
  // The verification emulator steps must be gated on the gate
  // having staged something — a zero-staged run boots no emulator.
  assert.match(
    block,
    /steps\.stage\.outputs\.staged != '' && steps\.stage\.outputs\.staged != '0'/,
    "verification steps must skip when the gate staged zero files",
  );
  assert.match(
    jobCondition("commit-pr-baselines"),
    /needs\.merge-verify\.outputs\.pr_autocommit_ready == 'true'/,
    "commit-pr-baselines must gate on merge-verify's readiness, not the old single job's",
  );
});

test("phase 2: the plan job owns bot-head detection and the scope computation", () => {
  const plan = jobBlock("plan");
  assert.match(plan, /id: vrbot/, "bot-head detection must live in the plan job");
  assert.match(plan, /scope\.mjs/, "the capture scope must be computed once, in the plan job");
  assert.match(
    plan,
    /shardScope\.mjs --scope .* --plan/,
    "the plan job must ask shardScope.mjs for the shard plan",
  );
  assert.match(
    jobCondition("visual-regression"),
    /needs\.plan\.outputs\.skip != 'true'/,
    "a bot baseline head must skip the matrix jobs via the plan job's skip output",
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
