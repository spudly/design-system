/**
 * Unit tests for the shard-union merge of issue #432 phase 2
 * (tools/visualRegression/ci/mergeShards.mjs): the merged capture
 * tree must be exactly the shards' captures combined (the union a
 * serial run would have produced), summaries must aggregate, the
 * merged verdict must be regen when any shard needs regeneration
 * — and the merge must REFUSE an incomplete union (missing
 * shard), a poisoned one (a shard's non-diff failure), and a
 * colliding one (the same capture from two shards), because a
 * staged set built from any of those is not the serial set.
 */
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { mergeShards } = await import(join(repoRoot, "tools/visualRegression/ci/mergeShards.mjs"));

type ShardSpec = {
  verdict: string;
  missing?: number;
  diffs?: number;
  standard?: string[];
  narrow?: string[];
  failed?: string[];
};

// Build a synthetic downloaded-artifacts tree: one
// dsvr-shard-<i> directory per spec, in the shape
// actions/download-artifact + capture-compare.sh pr-shard produce.
function syntheticShards(specs: ShardSpec[]) {
  const root = mkdtempSync(join(tmpdir(), "dsvr-merge-shards-"));
  const shardsDir = join(root, "shards");
  const put = (path: string, bytes: string) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes);
  };
  specs.forEach((spec, i) => {
    const dir = join(shardsDir, `dsvr-shard-${i}`);
    for (const [setName, files] of [
      ["dsvr-out", spec.standard ?? []],
      ["dsvr-out-narrow", spec.narrow ?? []],
    ] as const) {
      for (const rel of files) put(join(dir, setName, "actual", rel), `png-${setName}-${rel}`);
      put(
        join(dir, setName, "summary.json"),
        JSON.stringify({
          captured: files.length,
          compared: files.length,
          updated: 0,
          skipped: 0,
          noBaseline: spec.missing ?? 0,
          failed: spec.failed ?? [],
        }),
      );
    }
    put(
      join(dir, "dsvr-shard-result.json"),
      JSON.stringify({ verdict: spec.verdict, missing: spec.missing ?? 0, diffs: spec.diffs ?? 0 }),
    );
  });
  return {
    shardsDir,
    outDir: join(root, "out"),
    outNarrowDir: join(root, "out-narrow"),
  };
}

function merge(specs: ShardSpec[], expected = specs.length) {
  const { shardsDir, outDir, outNarrowDir } = syntheticShards(specs);
  const result = mergeShards({ shardsDir, expected, outDir, outNarrowDir });
  return { result, outDir, outNarrowDir };
}

test("clean shards merge to a clean verdict with the full capture union", () => {
  const { result, outDir, outNarrowDir } = merge([
    { verdict: "clean", standard: ["light/a.png"], narrow: ["light/n-narrow.png"] },
    { verdict: "clean", standard: ["light/b.png"], narrow: [] },
  ]);
  assert.equal(result.verdict, "clean");
  assert.ok(existsSync(join(outDir, "actual/light/a.png")));
  assert.ok(existsSync(join(outDir, "actual/light/b.png")));
  assert.ok(existsSync(join(outNarrowDir, "actual/light/n-narrow.png")));
  const summary = JSON.parse(readFileSync(join(outDir, "summary.json"), "utf8"));
  assert.equal(summary.captured, 2);
  assert.equal(summary.compared, 2);
});

test("any regen shard makes the merged verdict regen, with counts summed", () => {
  const { result } = merge([
    { verdict: "clean" },
    { verdict: "regen", missing: 2, diffs: 3 },
    { verdict: "regen", missing: 1, diffs: 0 },
  ]);
  assert.deepEqual(result, { verdict: "regen", missing: 3, diffs: 3, shards: 3 });
});

test("merged summaries concatenate failure lists across shards", () => {
  const { outDir } = merge([
    { verdict: "regen", failed: ["light/a.png: 1.000% pixels differ"] },
    { verdict: "regen", failed: ["light/b.png: 2.000% pixels differ"] },
  ]);
  const summary = JSON.parse(readFileSync(join(outDir, "summary.json"), "utf8"));
  assert.deepEqual(summary.failed, [
    "light/a.png: 1.000% pixels differ",
    "light/b.png: 2.000% pixels differ",
  ]);
});

test("a missing shard artifact refuses the merge", () => {
  const { shardsDir, outDir, outNarrowDir } = syntheticShards([{ verdict: "clean" }]);
  assert.throws(
    () => mergeShards({ shardsDir, expected: 2, outDir, outNarrowDir }),
    /shard 1 of 2 is missing/,
  );
});

test("a shard with a non-diff failure refuses the merge", () => {
  assert.throws(
    () => merge([{ verdict: "clean" }, { verdict: "other" }]),
    /non-diff compare failure/,
  );
});

test("an unreadable or unknown shard verdict refuses the merge", () => {
  assert.throws(() => merge([{ verdict: "green-ish" }]), /unknown verdict/);
  const { shardsDir, outDir, outNarrowDir } = syntheticShards([{ verdict: "clean" }]);
  writeFileSync(join(shardsDir, "dsvr-shard-0/dsvr-shard-result.json"), "not json");
  assert.throws(
    () => mergeShards({ shardsDir, expected: 1, outDir, outNarrowDir }),
    /missing or not readable JSON/,
  );
});

test("the same capture produced by two shards refuses the merge", () => {
  assert.throws(
    () =>
      merge([
        { verdict: "clean", standard: ["light/same.png"] },
        { verdict: "clean", standard: ["light/same.png"] },
      ]),
    /more than one shard/,
  );
});

test("a shard that captured nothing for a set still merges (empty set, present summary)", () => {
  const { result, outNarrowDir } = merge([
    { verdict: "clean", standard: ["light/a.png"], narrow: [] },
    { verdict: "clean", standard: ["light/b.png"], narrow: [] },
  ]);
  assert.equal(result.verdict, "clean");
  const summary = JSON.parse(readFileSync(join(outNarrowDir, "summary.json"), "utf8"));
  assert.equal(summary.captured, 0);
});
