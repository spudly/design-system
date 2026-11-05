/**
 * Unit tests for the verification re-capture scoping of issue #432
 * phase 1 (tools/visualRegression/verifyScope.mjs): the staged set
 * is the files in the commit gate's staged tree whose bytes differ
 * from the committed baselines (plus new baselines); zero staged
 * files skips verification, a staged set over the named ratio falls
 * back to a full verification, and a scoped decision lists exactly
 * the staged story ids plus their standard/narrow counterparts.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { computeVerifyScope, parseBaselineRel, VERIFY_SCOPE_MAX_STAGED_RATIO } = await import(
  join(repoRoot, "tools/visualRegression/verifyScope.mjs")
);

// A synthetic baselines/staged pair: `total` committed baselines
// under one theme, with the staged tree a byte copy except for the
// named `changed` files (different bytes) and `added` files (no
// committed counterpart).
function syntheticTrees({ total = 8, changed = [] as string[], added = [] as string[] }) {
  const root = mkdtempSync(join(tmpdir(), "dsvr-verify-scope-"));
  const baselines = join(root, "baselines");
  const staged = join(root, "staged");
  const put = (dir: string, rel: string, bytes: string) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), bytes);
  };
  for (let i = 0; i < total; i++) {
    const rel = `light_warmHarvest/pages-eciperay-page${i}--default.png`;
    put(baselines, rel, `committed-${i}`);
    put(staged, rel, changed.includes(rel) ? `regenerated-${i}` : `committed-${i}`);
  }
  for (const rel of added) put(staged, rel, "new-baseline");
  return { baselines, staged };
}

test("parseBaselineRel splits story id and narrow suffix", () => {
  assert.deepEqual(parseBaselineRel("light_warmHarvest/pages-eciperay-recipespage--default.png"), {
    storyId: "pages-eciperay-recipespage--default",
    narrow: false,
  });
  assert.deepEqual(
    parseBaselineRel("light_warmHarvest/pages-eciperay-recipespage--default-narrow.png"),
    { storyId: "pages-eciperay-recipespage--default", narrow: true },
  );
  // A standard story outside the narrow scope whose id ends in
  // "-narrow" keeps its full id — the suffix alone is not the
  // variant signal.
  assert.deepEqual(parseBaselineRel("light_quietDawn/pages-memorize-home--narrow.png"), {
    storyId: "pages-memorize-home--narrow",
    narrow: false,
  });
  assert.equal(parseBaselineRel("README.md"), null);
});

test("zero staged files skips the verification pass", () => {
  const { baselines, staged } = syntheticTrees({});
  const decision = computeVerifyScope({ baselinesDir: baselines, stagedDir: staged });
  assert.equal(decision.mode, "skip");
  assert.equal(decision.stagedCount, 0);
  assert.equal(decision.totalCount, 8);
  assert.deepEqual(decision.standard, []);
  assert.deepEqual(decision.narrow, []);
});

test("a scoped decision lists only the staged stories", () => {
  const rel = "light_warmHarvest/pages-eciperay-page3--default.png";
  const { baselines, staged } = syntheticTrees({ changed: [rel] });
  const decision = computeVerifyScope({ baselinesDir: baselines, stagedDir: staged });
  assert.equal(decision.mode, "scoped");
  assert.equal(decision.stagedCount, 1);
  assert.deepEqual(decision.standard, ["pages-eciperay-page3--default"]);
  assert.deepEqual(decision.narrow, []);
});

test("a staged standard baseline pulls in its narrow counterpart", () => {
  const root = mkdtempSync(join(tmpdir(), "dsvr-verify-scope-"));
  const baselines = join(root, "baselines");
  const staged = join(root, "staged");
  const put = (dir: string, rel: string, bytes: string) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), bytes);
  };
  // 8 baselines: one RecipesPage story in both surfaces, 6 others.
  const std = "light_warmHarvest/pages-eciperay-recipespage--default.png";
  const narrowRel = "light_warmHarvest/pages-eciperay-recipespage--default-narrow.png";
  for (const dir of [baselines, staged]) {
    put(dir, std, dir === staged ? "regenerated" : "committed");
    put(dir, narrowRel, "committed-narrow");
    for (let i = 0; i < 6; i++)
      put(dir, `light_warmHarvest/pages-eciperay-page${i}--default.png`, `c${i}`);
  }
  const decision = computeVerifyScope({ baselinesDir: baselines, stagedDir: staged });
  assert.equal(decision.mode, "scoped");
  assert.deepEqual(decision.standard, ["pages-eciperay-recipespage--default"]);
  assert.deepEqual(decision.narrow, ["pages-eciperay-recipespage--default"]);
});

test("a new baseline with no committed counterpart counts as staged", () => {
  const { baselines, staged } = syntheticTrees({
    added: ["light_quietDawn/pages-memorize-home--default.png"],
  });
  const decision = computeVerifyScope({ baselinesDir: baselines, stagedDir: staged });
  assert.equal(decision.mode, "scoped");
  assert.equal(decision.stagedCount, 1);
  assert.deepEqual(decision.standard, ["pages-memorize-home--default"]);
});

test("a staged set over the ratio falls back to full verification", () => {
  assert.equal(VERIFY_SCOPE_MAX_STAGED_RATIO, 0.25);
  const changed = [0, 1, 2].map((i) => `light_warmHarvest/pages-eciperay-page${i}--default.png`);
  const { baselines, staged } = syntheticTrees({ changed });
  const decision = computeVerifyScope({ baselinesDir: baselines, stagedDir: staged });
  // 3 of 8 = 37.5% > 25%.
  assert.equal(decision.mode, "full");
  assert.equal(decision.stagedCount, 3);
});

test("a staged set exactly at the ratio stays scoped", () => {
  const changed = [0, 1].map((i) => `light_warmHarvest/pages-eciperay-page${i}--default.png`);
  const { baselines, staged } = syntheticTrees({ changed });
  const decision = computeVerifyScope({ baselinesDir: baselines, stagedDir: staged });
  // 2 of 8 = 25%, not over the threshold.
  assert.equal(decision.mode, "scoped");
  assert.equal(decision.standard.length, 2);
});

test("the CLI rejects an omitted --capture-total instead of reading it as 0", () => {
  let error: any = null;
  try {
    execFileSync(
      "node",
      [
        join(repoRoot, "tools/visualRegression/verifyScope.mjs"),
        "--baselines",
        "baselines",
        "--staged",
        "staged",
      ],
      { stdio: "pipe" },
    );
  } catch (e) {
    error = e;
  }
  assert.ok(error, "CLI must fail without --capture-total");
  assert.equal(error.status, 1);
  assert.match(String(error.stderr), /--capture-total <n> are required/);
});

test("the CLI rejects a --capture-total flag with no operand", () => {
  let error: any = null;
  try {
    execFileSync(
      "node",
      [
        join(repoRoot, "tools/visualRegression/verifyScope.mjs"),
        "--baselines",
        "baselines",
        "--staged",
        "staged",
        "--capture-total",
      ],
      { stdio: "pipe" },
    );
  } catch (e) {
    error = e;
  }
  assert.ok(error, "CLI must fail when --capture-total has no operand");
  assert.equal(error.status, 1);
  assert.match(String(error.stderr), /--capture-total <n> are required/);
});

test("the ratio divides by the capture scope, not the baseline tree", () => {
  // A scoped run (#114) captures fewer stories than the full
  // baseline tree holds: 1 staged file is 1/8 of the tree but 1/3
  // of a 3-capture scope — over the threshold, so full verification.
  const rel = "light_warmHarvest/pages-eciperay-page3--default.png";
  const { baselines, staged } = syntheticTrees({ changed: [rel] });
  const decision = computeVerifyScope({
    baselinesDir: baselines,
    stagedDir: staged,
    captureTotal: 3,
  });
  assert.equal(decision.mode, "full");
  assert.equal(decision.stagedCount, 1);
  assert.equal(decision.totalCount, 3);
});
