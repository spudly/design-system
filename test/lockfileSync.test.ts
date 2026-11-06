/**
 * Regression test for spudly/design-system#449: the root
 * package-lock.json must stay in sync with package.json. A manifest
 * spec that the locked version does not satisfy (the eciperay shape —
 * specs edited ahead of the lockfile, so installs resolve a different
 * tree than the manifest promises) must fail CI here instead of
 * surfacing as lockfile churn in an unrelated PR.
 *
 * Scope: direct dependencies only (dependencies + devDependencies of
 * the root package.json), checked against the lockfile's top-level
 * `node_modules/<name>` entry. Non-semver specs (file:, link:,
 * workspace:, npm:, git/URL specs, "*") are skipped.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

type Version = {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
};

type Bound = [operator: string, bound: Version];

type Manifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type Lockfile = {
  packages?: Record<string, { version?: string }>;
};

type OutOfSync = { name: string; spec: string; locked: string | null };

const version = (major: number, minor: number, patch: number): Version => ({
  major,
  minor,
  patch,
  prerelease: [],
});

const isWild = (part: string): boolean => part === "x" || part === "X" || part === "*";

function parseVersion(text: string): Version | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(text);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

function comparePrerelease(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  if (a.length === 0) return 1;
  if (b.length === 0) return -1;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const left = a[i];
    const right = b[i];
    if (left === undefined) return -1;
    if (right === undefined) return 1;
    if (left === right) continue;
    const leftNum = /^\d+$/.test(left) ? Number(left) : null;
    const rightNum = /^\d+$/.test(right) ? Number(right) : null;
    if (leftNum !== null && rightNum !== null) return leftNum < rightNum ? -1 : 1;
    if (leftNum !== null) return -1;
    if (rightNum !== null) return 1;
    return left < right ? -1 : 1;
  }
  return 0;
}

function compareVersions(a: Version, b: Version): number {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  return comparePrerelease(a.prerelease, b.prerelease);
}

function caretBounds(major: number, minor: number | null, patch: number | null): Bound[] {
  const lower = version(major, minor ?? 0, patch ?? 0);
  if (major > 0) return [[">=", lower], ["<", version(major + 1, 0, 0)]];
  if (minor !== null && minor > 0) return [[">=", lower], ["<", version(0, minor + 1, 0)]];
  if (minor !== null && patch !== null) return [[">=", lower], ["<", version(0, 0, patch + 1)]];
  if (minor !== null) return [[">=", lower], ["<", version(0, minor + 1, 0)]];
  return [[">=", lower], ["<", version(1, 0, 0)]];
}

function tildeBounds(major: number, minor: number | null, patch: number | null): Bound[] {
  const lower = version(major, minor ?? 0, patch ?? 0);
  const upper = minor === null ? version(major + 1, 0, 0) : version(major, minor + 1, 0);
  return [[">=", lower], ["<", upper]];
}

function exactBounds(major: number, minor: number | null, patch: number | null): Bound[] {
  if (minor === null) return [[">=", version(major, 0, 0)], ["<", version(major + 1, 0, 0)]];
  if (patch === null) return [[">=", version(major, minor, 0)], ["<", version(major, minor + 1, 0)]];
  return [["=", version(major, minor, patch)]];
}

// Expand one comparator token ("^1.2.3", "~1.2", ">=2.0.0", "1.2.x",
// "1.2.3") into [operator, version] bounds. Returns null when the
// token is not a plain semver comparator.
function expandComparator(token: string): Bound[] | null {
  const match = /^(\^|~|>=|<=|>|<|=)?\s*(.+)$/.exec(token);
  if (!match) return null;
  const operator = match[1] ?? "=";
  const parts = match[2].split(".");
  if (parts.length > 3) return null;
  if (parts.some((part) => !isWild(part) && !/^\d+$/.test(part))) return null;
  const nums = parts.map((part) => (isWild(part) ? null : Number(part)));
  while (nums.length < 3) nums.push(null);
  const [major, minor, patch] = nums;
  if (operator === "^") return major === null ? [] : caretBounds(major, minor, patch);
  if (operator === "~") return major === null ? [] : tildeBounds(major, minor, patch);
  if (operator === "=" || operator === "") {
    return major === null ? [] : exactBounds(major, minor, patch);
  }
  if (major === null) return null;
  return [[operator, version(major, minor ?? 0, patch ?? 0)]];
}

function satisfiesBound(versionToCheck: Version, operator: string, bound: Version): boolean {
  const cmp = compareVersions(versionToCheck, bound);
  if (operator === "=") return cmp === 0;
  if (operator === ">") return cmp > 0;
  if (operator === ">=") return cmp >= 0;
  if (operator === "<") return cmp < 0;
  if (operator === "<=") return cmp <= 0;
  return false;
}

// Returns true/false when the spec is a semver range this checker
// understands, or null when the spec is non-semver and must be
// skipped (file:, link:, workspace:, npm:, URLs, tags, "*").
export function satisfies(versionText: string, spec: string): boolean | null {
  const parsed = parseVersion(versionText);
  if (!parsed) return null;
  const trimmed = spec.trim();
  if (trimmed === "" || trimmed === "*" || trimmed === "latest") return null;
  if (!/^[\^~>=<=\d\s.|xX*-]+$/.test(trimmed)) return null;
  for (const alternative of trimmed.split("||")) {
    const tokens = alternative.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;
    let all = true;
    for (const token of tokens) {
      const bounds = expandComparator(token);
      if (bounds === null) return null;
      for (const [operator, bound] of bounds) {
        if (!satisfiesBound(parsed, operator, bound)) all = false;
      }
    }
    if (all) return true;
  }
  return false;
}

// Returns the direct dependencies whose locked version does not
// satisfy the manifest spec.
export function findOutOfSync(manifest: Manifest, lockfile: Lockfile): OutOfSync[] {
  const specs = { ...manifest.dependencies, ...manifest.devDependencies };
  const packages = lockfile.packages ?? {};
  const outOfSync: OutOfSync[] = [];
  for (const [name, spec] of Object.entries(specs)) {
    const locked = packages[`node_modules/${name}`]?.version;
    if (typeof locked !== "string") {
      outOfSync.push({ name, spec, locked: null });
      continue;
    }
    if (satisfies(locked, spec) === false) outOfSync.push({ name, spec, locked });
  }
  return outOfSync;
}

test("satisfies: caret, tilde, exact and range comparators", () => {
  assert.equal(satisfies("3.0.3", "^3.0.3"), true);
  assert.equal(satisfies("3.1.9", "^3.0.15"), true);
  assert.equal(satisfies("4.0.0", "^3.0.15"), false);
  assert.equal(satisfies("2.9.0", "^3.0.3"), false);
  assert.equal(satisfies("0.2.5", "^0.2.0"), true);
  assert.equal(satisfies("0.3.0", "^0.2.0"), false);
  assert.equal(satisfies("1.2.9", "~1.2.3"), true);
  assert.equal(satisfies("1.3.0", "~1.2.3"), false);
  assert.equal(satisfies("3.1.3", "3.1.3"), true);
  assert.equal(satisfies("3.1.4", "3.1.3"), false);
  assert.equal(satisfies("2.0.0", ">=1.5.0 <3.0.0"), true);
  assert.equal(satisfies("3.0.0", ">=1.5.0 <3.0.0"), false);
  assert.equal(satisfies("1.2.7", "1.2.x"), true);
  assert.equal(satisfies("1.3.0", "1.2.x"), false);
});

test("satisfies: non-semver specs are skipped", () => {
  assert.equal(satisfies("1.0.0", "file:../local"), null);
  assert.equal(satisfies("1.0.0", "workspace:*"), null);
  assert.equal(satisfies("1.0.0", "npm:other@1.0.0"), null);
  assert.equal(satisfies("1.0.0", "*"), null);
});

test("findOutOfSync flags a locked version below its spec floor", () => {
  const manifest: Manifest = { dependencies: { posthog: "^4.0.0", left: "^1.0.0" } };
  const lockfile: Lockfile = {
    packages: {
      "node_modules/posthog": { version: "3.5.0" },
      "node_modules/left": { version: "1.2.0" },
    },
  };
  assert.deepEqual(findOutOfSync(manifest, lockfile), [
    { name: "posthog", spec: "^4.0.0", locked: "3.5.0" },
  ]);
});

test("root package-lock.json is in sync with package.json", () => {
  const manifest = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as Manifest;
  const lockfile = JSON.parse(
    readFileSync(join(repoRoot, "package-lock.json"), "utf8"),
  ) as Lockfile;
  const outOfSync = findOutOfSync(manifest, lockfile);
  assert.deepEqual(
    outOfSync,
    [],
    `direct dependencies whose locked version does not satisfy package.json: ${JSON.stringify(outOfSync)} — regenerate the lockfile with the pinned npm (npm install --package-lock-only), never hand-edit it`,
  );
});
