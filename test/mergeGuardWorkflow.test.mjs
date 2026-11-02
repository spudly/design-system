/**
 * Regression test for the merge-guard self-reference fix (2026-11-01).
 *
 * The merge-guard job in ci.yml fails a PR while its body contains
 * unchecked task-list items — but one template item, "CI is green for
 * the exact head commit", asserts the result of the very workflow the
 * guard belongs to (ci-gate needs merge-guard). Enforcing it made the
 * gate circular: the box could only be honestly checked once CI was
 * already green, and CI could never be green while the guard failed
 * on the unchecked box, so every intermediate head failed merge-guard.
 * The guard now exempts that self-referential item and keeps enforcing
 * every other item.
 *
 * The guard is an inline `node <<'NODE'` heredoc in the workflow, so
 * this test extracts that exact script from ci.yml and runs it against
 * fixture PR bodies — the behavior under test is the shipped script,
 * not a copy. The extraction fails loudly if the heredoc markers move,
 * rather than passing vacuously (same rationale as
 * test/chromaticWorkflow.test.mjs).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const workflowPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".github",
  "workflows",
  "ci.yml",
);
const workflow = readFileSync(workflowPath, "utf8");

/** Extract the merge-guard's inline Node script from ci.yml, dedented
 * the way the YAML block scalar presents it to the shell. */
function guardScript() {
  const marker = "node <<'NODE'";
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, "merge-guard heredoc start not found in ci.yml");
  const lines = workflow.slice(start + marker.length).split("\n");
  const end = lines.findIndex((line, idx) => idx > 0 && line.trim() === "NODE");
  assert.notEqual(end, -1, "merge-guard heredoc end not found in ci.yml");
  const body = lines.slice(1, end);
  const indent = body.find((line) => line.trim() !== "").match(/^\s*/)[0];
  return body
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join("\n");
}

const workdir = mkdtempSync(join(tmpdir(), "merge-guard-"));
const scriptPath = join(workdir, "merge-guard.cjs");
writeFileSync(scriptPath, guardScript());

/** Run the extracted guard against a fixture PR body. */
function runGuard(body) {
  const bodyPath = join(workdir, `body-${Math.random().toString(36).slice(2)}.md`);
  writeFileSync(bodyPath, body);
  return spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, PR_BODY_FILE: bodyPath },
    encoding: "utf8",
  });
}

const CHECKED = "- [x] Changeset added, or not required (docs/CI/test-only)";
const CI_GREEN_UNCHECKED = "- [ ] CI is green for the exact head commit";
const CHANGESET_UNCHECKED =
  "- [ ] Changeset added, or not required (docs/CI/test-only)";

test("an unchecked CI-green item alone passes: it is self-referential", () => {
  const result = runGuard(`## Pre-merge checklist\n\n${CI_GREEN_UNCHECKED}\n${CHECKED}\n`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Exempt \(self-referential\)/);
});

test("other unchecked items still fail, and the CI-green item is not listed", () => {
  const result = runGuard(
    `## Pre-merge checklist\n\n${CI_GREEN_UNCHECKED}\n${CHANGESET_UNCHECKED}\n`,
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Changeset added/);
  assert.doesNotMatch(result.stderr, /CI is green/);
});

test("struck-through items still count as waived", () => {
  const result = runGuard(
    `## Pre-merge checklist\n\n${CI_GREEN_UNCHECKED}\n- [ ] ~~Stories updated for component/page changes~~ — not applicable\n${CHECKED}\n`,
  );
  assert.equal(result.status, 0, result.stderr);
});
