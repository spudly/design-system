// Affected unit tests for the pre-commit hook.
//
// DS unit tests are colocated with their subjects (see #530): the test
// for `src/**/Name.ts(x)` is `src/**/Name.test.ts` beside it, and the
// tests exercise the built `dist/`, so a build runs first. Given the
// staged files, this runs only the colocated tests of staged src/
// sources (plus any staged test files themselves). With no matching
// tests it exits immediately, so docs-only and untested-area commits
// stay fast.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const staged = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

const tests = new Set();
for (const file of staged) {
  if (!file.startsWith("src/") || !/\.tsx?$/.test(file)) continue;
  if (/\.test\.tsx?$/.test(file)) {
    tests.add(file);
    continue;
  }
  if (/\.stories\.tsx?$/.test(file)) continue;
  const base = file.replace(/\.tsx?$/, "");
  for (const candidate of [`${base}.test.ts`, `${base}.test.tsx`]) {
    if (existsSync(path.resolve(candidate))) tests.add(candidate);
  }
}

if (tests.size === 0) process.exit(0);

const testFiles = [...tests].sort();
console.log(`[pre-commit] affected tests: ${testFiles.join(", ")}`);
// The build gets its own tsBuildInfoFile: its options (emit) differ
// from the typecheck's (noEmit), and sharing one file would thrash
// both caches.
execFileSync(
  "npm",
  ["run", "build", "--", "--incremental", "--tsBuildInfoFile", ".build.tsbuildinfo"],
  {
    stdio: "inherit",
  },
);
execFileSync("npx", ["tsx", "--test", ...testFiles], { stdio: "inherit" });
