// Full-suite test runner for the `test` script (package.json).
//
// The suite runs under node's test runner via tsx, over the same three
// glob patterns the `test` script has always used. Locally, the
// runner's file-level concurrency is capped at 2: on a machine with
// few or shared CPUs the runner's default (one worker per core)
// oversubscribes the processors, which slows the suite down and can
// starve individual tests into flaky timeouts. CI runners have
// dedicated cores, so when the CI environment variable is set the cap
// is omitted and the runner keeps its default parallelism. The check
// compares against the literal "true" (what CI systems set): any other
// value, including "false", counts as a local run.
//
// The patterns are passed as arguments (never through a shell), so the
// test runner expands the globs itself, exactly as it did when the
// command lived inline in package.json. The child's exit code is
// propagated, so `npm test` still fails when any test fails.
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const args = ["tsx", "--test"];
if (process.env.CI !== "true") args.push("--test-concurrency=2");
args.push("src/**/*.test.ts", "test/**/*.test.ts", "eslintRules/*.test.ts");

// On Windows, npx is a .cmd shim, which child_process cannot launch
// by its bare name without a shell; naming the shim explicitly works
// and keeps the arguments literal (no shell quoting involved).
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npx, args, { cwd: root, stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
