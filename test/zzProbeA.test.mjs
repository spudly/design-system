import process from "node:process";
import test from "node:test";

// TEMPORARY diagnostic A: LoadingScope deep import in isolation.
test("probe A: LoadingScope only", async () => {
  try {
    const m = await import("../dist/components/LoadingScope.js");
    process.stdout.write(`# PROBEA-OK ${typeof m.LoadingScope}\n`);
  } catch (error) {
    process.stdout.write(`# PROBEA-FAIL\n${error.stack}\n`);
    throw error;
  }
});
