import process from "node:process";
import test from "node:test";

// TEMPORARY diagnostic B: SkeletonClock deep import in isolation.
test("probe B: SkeletonClock only", async () => {
  try {
    const m = await import("../dist/components/SkeletonClock.js");
    process.stdout.write(`# PROBEB-OK ${typeof m.SkeletonClock}\n`);
  } catch (error) {
    process.stdout.write(`# PROBEB-FAIL\n${error.stack}\n`);
    throw error;
  }
});
