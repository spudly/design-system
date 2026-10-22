/**
 * Regression test for spudly/design-system#53 (Chromatic runs triggered
 * by dependabot[bot] fail at visual-check label removal).
 *
 * Dependabot-triggered workflow runs receive a read-only GITHUB_TOKEN
 * regardless of the workflow's declared permissions, so the DELETE in
 * the "Consume the visual-check label" step returns 403 — and because
 * that step deliberately re-raises non-404 errors, the whole job failed
 * and snapshot publication was blocked for an otherwise eligible PR.
 *
 * The contract now:
 * 1. The consume step does not run when the triggering actor is
 *    dependabot[bot] (its `if` excludes that actor explicitly).
 * 2. A separate warning step runs exactly in that case, telling a human
 *    the label survives and must be removed manually, while publication
 *    proceeds.
 * 3. The consume step keeps failing on non-404 API errors for every
 *    other actor (the PR #52 round-2 behavior is unchanged).
 *
 * This is a source scan of the workflow YAML: the failure happens in
 * GitHub's token provisioning, which no local runner reproduces, and
 * the invariant is a per-literal property of the workflow source (same
 * rationale as test/glyph-line-height.test.mjs). The scan fails loudly
 * if the steps it looks for cannot be found, rather than passing
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
  "chromatic.yml",
);
const workflow = readFileSync(workflowPath, "utf8");

/** Return the YAML block for the step named `name` (from its `- name:`
 * line up to the next step or end of file). Fails loudly when absent. */
function stepBlock(name) {
  const start = workflow.indexOf(`- name: ${name}`);
  assert.notEqual(start, -1, `step "${name}" not found in chromatic.yml`);
  const rest = workflow.slice(start + name.length + "- name: ".length);
  const next = rest.indexOf("\n      - name: ");
  return next === -1 ? rest : rest.slice(0, next);
}

test("consume step is skipped for dependabot[bot]-triggered runs (#53)", () => {
  const block = stepBlock("Consume the visual-check label (one-shot)");
  assert.match(
    block,
    /if:.*github\.actor != 'dependabot\[bot\]'/,
    "consume step must exclude dependabot[bot] actors (read-only token)",
  );
});

test("a warning step covers the dependabot[bot] case and publication proceeds (#53)", () => {
  const block = stepBlock("Warn that a Dependabot-triggered run cannot consume the label");
  assert.match(
    block,
    /if:.*github\.actor == 'dependabot\[bot\]'/,
    "warning step must run exactly for dependabot[bot] actors",
  );
  assert.match(block, /::warning::/, "warning step must emit a warning");
  assert.match(block, /removed manually/, "warning must say the label has to be removed manually");
});

test("consume step still fails on non-404 errors for other actors (#53)", () => {
  const block = stepBlock("Consume the visual-check label (one-shot)");
  assert.match(block, /"404"/, "consume step must keep the already-absent (404) exemption");
  assert.match(block, /exit 1/, "consume step must keep failing the step on other API errors");
});
