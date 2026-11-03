import process from "node:process";
import test from "node:test";

// TEMPORARY diagnostic (diag/278-ci-probe): find which import in the
// skeletonLoading runtime chain throws under CI's Node 22 + lockfile
// tree, printing the full stack to the TAP stream.
test("probe imports", async () => {
  const steps = [
    ["react", () => import("react")],
    ["react-dom/server", () => import("react-dom/server")],
    ["tamagui", () => import("tamagui")],
    ["@tamagui/constants", () => import("@tamagui/constants")],
    ["dist/index.js", () => import("../dist/index.js")],
    ["dist/components/LoadingScope.js", () => import("../dist/components/LoadingScope.js")],
    ["dist/components/SkeletonClock.js", () => import("../dist/components/SkeletonClock.js")],
  ];
  for (const [name, fn] of steps) {
    try {
      await fn();
      process.stdout.write(`# PROBE-OK ${name}\n`);
    } catch (error) {
      process.stdout.write(`# PROBE-FAIL ${name}\n${error.stack}\n`);
      throw error;
    }
  }
});
