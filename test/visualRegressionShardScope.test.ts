/**
 * Unit tests for the capture sharding of issue #432 phase 2
 * (tools/visualRegression/shardScope.mjs): the shard count the
 * workflow plan job asks for, and the split itself — shards must
 * be disjoint, union exactly to the input scope (a sharded run
 * captures precisely the set a serial run would), balance
 * round-robin, and be a pure function of the story SET (input
 * order must not matter).
 */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const { planShardCount, splitScope, MAX_SHARDS, SHARD_SERIAL_MAX_CAPTURES } = await import(
  join(repoRoot, "tools/visualRegression/shardScope.mjs")
);

function decision(standardCount: number, narrowCount: number, mode = "full") {
  return {
    mode,
    reasons: ["synthetic"],
    standard: Array.from(
      { length: standardCount },
      (_, i) => `story-${String(i).padStart(3, "0")}`,
    ),
    narrow: Array.from({ length: narrowCount }, (_, i) => `narrow-${i}`),
  };
}

test("planShardCount keeps small scopes on one serial shard", () => {
  assert.equal(planShardCount(decision(0, 0)), 1);
  assert.equal(planShardCount(decision(3, 2)), 1);
  // The threshold counts standard + narrow captures together.
  assert.equal(
    planShardCount(decision(SHARD_SERIAL_MAX_CAPTURES - 2, 2)),
    1,
    "a scope exactly at the serial threshold stays serial",
  );
});

test("planShardCount fans wide scopes out to MAX_SHARDS", () => {
  assert.equal(planShardCount(decision(SHARD_SERIAL_MAX_CAPTURES + 1, 0)), MAX_SHARDS);
  assert.equal(planShardCount(decision(145, 12)), MAX_SHARDS);
});

test("planShardCount honors forceSerial (update mode) at any size", () => {
  assert.equal(planShardCount(decision(500, 50), { forceSerial: true }), 1);
});

test("splitScope with one shard returns the decision unchanged", () => {
  const d = decision(30, 5);
  assert.equal(
    splitScope(d, 0, 1),
    d,
    "a serial split must keep mode 'full' so run.mjs takes the untouched set",
  );
});

test("splitScope shards are disjoint and union exactly to the input scope", () => {
  const d = decision(37, 11);
  const standards: string[] = [];
  const narrows: string[] = [];
  for (let i = 0; i < 4; i++) {
    const shard = splitScope(d, i, 4);
    assert.equal(shard.mode, "scoped", "a multi-shard split must scope each shard to its slice");
    standards.push(...shard.standard);
    narrows.push(...shard.narrow);
  }
  assert.equal(new Set(standards).size, standards.length, "standard shards overlap");
  assert.equal(new Set(narrows).size, narrows.length, "narrow shards overlap");
  assert.deepEqual([...standards].sort(), [...d.standard].sort());
  assert.deepEqual([...narrows].sort(), [...d.narrow].sort());
});

test("splitScope balances shards to within one capture (round-robin)", () => {
  const sizes = [0, 1, 2, 3].map((i) => splitScope(decision(37, 0), i, 4).standard.length);
  assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `unbalanced shards: ${sizes}`);
  // Round-robin spreads a sorted family across shards instead of
  // handing shard 0 the whole first chunk.
  assert.deepEqual(splitScope(decision(8, 0), 0, 4).standard, ["story-000", "story-004"]);
});

test("splitScope depends only on the story set, not the input order", () => {
  const d = decision(20, 6);
  const shuffled = {
    ...d,
    standard: [...d.standard].reverse(),
    narrow: [...d.narrow].reverse(),
  };
  for (let i = 0; i < 4; i++) {
    assert.deepEqual(splitScope(shuffled, i, 4), splitScope(d, i, 4));
  }
});

test("splitScope partitions standard and narrow independently", () => {
  // A narrow-heavy scope still shards its narrow list on its own
  // round-robin; the standard split must not consume narrow slots.
  const shard = splitScope(decision(4, 8), 1, 4);
  assert.deepEqual(shard.standard, ["story-001"]);
  assert.deepEqual(shard.narrow, ["narrow-1", "narrow-5"]);
});

test("splitScope rejects invalid shard coordinates and malformed decisions", () => {
  const d = decision(4, 2);
  assert.throws(() => splitScope(d, 0, 0));
  assert.throws(() => splitScope(d, 4, 4));
  assert.throws(() => splitScope(d, -1, 4));
  assert.throws(() => splitScope({ mode: "full", reasons: [] } as never, 0, 2));
});
