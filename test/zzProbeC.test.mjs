import process from "node:process";
import test from "node:test";

// TEMPORARY diagnostic C: root import after the standard loader
// prefix (react, react-dom/server, tamagui) — the autoCompleteWeb
// order — with no other steps.
test("probe C: root after loader prefix", async () => {
  try {
    await import("react");
    await import("react-dom/server");
    await import("tamagui");
    const m = await import("../dist/index.js");
    process.stdout.write(`# PROBEC-OK ${typeof m.BoxSkeleton}\n`);
  } catch (error) {
    process.stdout.write(`# PROBEC-FAIL\n${error.stack}\n`);
    throw error;
  }
});
