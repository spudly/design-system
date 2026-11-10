// Affected unit tests for the pre-commit hook.
//
// DS unit tests are colocated with their subjects (see #530): the test
// for `src/**/Name.ts(x)` is `src/**/Name.test.ts` beside it, and the
// tests exercise the built `dist/`, so a build runs first. Given the
// staged files, this runs only the colocated tests of staged src/
// sources (plus any staged test files themselves). With no matching
// tests it exits immediately, so docs-only and untested-area commits
// stay fast.
//
// This runs as the last lint-staged task for staged ts/tsx files (see
// the "lint-staged" config in package.json): while lint-staged runs,
// unstaged changes and untracked files are hidden (--hide-all), so the
// build and tests validate the staged state, not the working tree.
// lint-staged passes the matched filenames as arguments; they are
// ignored on purpose — the script queries the index itself so deleted
// and renamed sources are visible too.
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

// --name-status with rename detection: a deleted source's colocated
// test still has to run (it fails without its subject), and a renamed
// source can leave a test beside its old path.
const staged = execFileSync("git", ["diff", "--cached", "--name-status", "-M"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("\t"));

const tests = new Set();
const selectColocated = (sourceFile) => {
  const base = sourceFile.replace(/\.tsx?$/, "");
  for (const candidate of [`${base}.test.ts`, `${base}.test.tsx`]) {
    if (existsSync(path.resolve(candidate))) tests.add(candidate);
  }
};
for (const [status, file, renamedTo] of staged) {
  const paths = status.startsWith("R") && renamedTo ? [file, renamedTo] : [file];
  for (const candidatePath of paths) {
    if (!candidatePath.startsWith("src/") || !/\.tsx?$/.test(candidatePath)) continue;
    if (/\.test\.tsx?$/.test(candidatePath)) {
      // A staged test runs itself — unless it was deleted, or renamed
      // away from this path.
      if (status !== "D" && existsSync(path.resolve(candidatePath))) tests.add(candidatePath);
      continue;
    }
    if (/\.stories\.tsx?$/.test(candidatePath)) continue;
    selectColocated(candidatePath);
  }
}

if (tests.size === 0) process.exit(0);

const testFiles = [...tests].sort();
console.log(`[pre-commit] affected tests: ${testFiles.join(", ")}`);
// If dist/ was removed (e.g. `npm run clean`) but the incremental
// build info survived, tsc trusts the stale build info and emits
// nothing — discard it so the build recreates the missing output.
if (!existsSync("dist")) rmSync(".build.tsbuildinfo", { force: true });
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
