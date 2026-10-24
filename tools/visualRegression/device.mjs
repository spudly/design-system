// Device primitives for the visual-regression driver (run.mjs):
// promisified adb calls, logcat access, and the failure-evidence
// dump left behind when the app never reports its story index.
// Split out of run.mjs so the driver stays under the file-length
// cap; behavior identical.

import { execFile } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

export async function adb(...adbArgs) {
  const { stdout } = await run("adb", adbArgs, { maxBuffer: 64 * 1024 * 1024 });
  return stdout;
}

export async function adbBuffer(...adbArgs) {
  const { stdout } = await run("adb", adbArgs, {
    maxBuffer: 256 * 1024 * 1024,
    encoding: "buffer",
  });
  return stdout;
}

export const sleep = (ms) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

export async function logcatDump() {
  // Unfiltered on purpose: which logcat tag JS console output lands
  // on varies across React Native versions/architectures (classic
  // bridge: ReactNativeJS; bridgeless builds differ). Filtering to
  // one tag made a healthy app look silent (PR #87, third CI run:
  // app alive, bundle served, zero lines under the expected tag).
  try {
    return await adb("logcat", "-d");
  } catch {
    return "";
  }
}

export async function waitForLog(needle, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const logs = await logcatDump();
    if (logs.includes(needle)) return true;
    await sleep(700);
  }
  return false;
}

// Leave evidence for the next diagnosis when the app does not
// report its story index in time: is the app process even alive,
// what did it log last (any tag), and what is on screen?
export async function captureFailureEvidence(pkg, outDir) {
  const pid = await adb("shell", "pidof", pkg).catch(() => "");
  console.error(`app process: ${pid.trim() ? `alive (pid ${pid.trim()})` : "NOT RUNNING"}`);
  const logs = await logcatDump();
  console.error("last logcat lines (all tags):");
  console.error(logs.trim().split("\n").slice(-200).join("\n"));
  mkdirSync(outDir, { recursive: true });
  try {
    const shot = await adbBuffer("exec-out", "screencap", "-p");
    writeFileSync(join(outDir, "failure-screen.png"), shot);
    console.error("saved failure-screen.png to the output dir");
  } catch {
    console.error("could not capture a failure screenshot");
  }
  writeFileSync(
    join(outDir, "summary.json"),
    JSON.stringify({ failed: ["story index timeout"] }, null, 2),
  );
}
