#!/usr/bin/env node
// Android Storybook visual-regression driver (design-system #43).
//
// Device mode (default): drives the DS Storybook host app on an
// Android emulator/device over ADB. The app exposes a capture protocol
// (see apps/storybook/App.tsx): it writes its story index to its files
// dir at boot, and a `spudlyds://capture/<storyId>?theme=<theme>`
// deep link renders exactly one story (no Storybook chrome) and logs
// `DSVR READY <nonce> <storyId>` via ReactNativeJS when it is on
// screen. This driver sends the links, waits for READY, captures with
// `screencap`, and pixel-compares against committed baselines.
//
// Compare-only mode (--from-dir): compares two folders of PNGs with
// the same comparator — used for local harness validation and for
// re-checking CI artifacts offline. No device needed.
//
// Exit code: 0 = all compared screenshots within tolerance (or update
// mode completed), 1 = a diff exceeded tolerance / a capture failed /
// compare mode found no baselines at all.

import { execFile } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { decodePng, diffImages } from "./png.mjs";

const run = promisify(execFile);
const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(TOOL_DIR, "..", "..");

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}
function argFlag(name) {
  return args.includes(name);
}

const CONFIG = {
  packageName: argValue("--package", "dev.spudly.designsystem.storybook"),
  scheme: argValue("--scheme", "spudlyds"),
  themes: argValue(
    "--themes",
    "light_warmHarvest,dark_warmHarvest,light_quietDawn,dark_quietDawn",
  ).split(","),
  storyFilter: argValue("--stories", ""), // substring filter, empty = all
  baselinesDir: argValue("--baselines", join(TOOL_DIR, "baselines")),
  outDir: argValue("--out", join(TOOL_DIR, "out")),
  update: argFlag("--update"),
  fromDir: argValue("--from-dir", ""),
  threshold: Number(argValue("--threshold", "16")),
  maxRatio: Number(argValue("--max-ratio", "0.001")),
  readyTimeoutMs: Number(argValue("--ready-timeout", "30000")),
  settleMs: Number(argValue("--settle", "500")),
};

async function adb(...adbArgs) {
  const { stdout } = await run("adb", adbArgs, { maxBuffer: 64 * 1024 * 1024 });
  return stdout;
}

async function adbBuffer(...adbArgs) {
  const { stdout } = await run("adb", adbArgs, {
    maxBuffer: 256 * 1024 * 1024,
    encoding: "buffer",
  });
  return stdout;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function logcatDump() {
  try {
    return await adb("logcat", "-d", "-s", "ReactNativeJS:I", "*:S");
  } catch {
    return "";
  }
}

async function waitForLog(needle, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const logs = await logcatDump();
    if (logs.includes(needle)) return true;
    await sleep(700);
  }
  return false;
}

function listPngs(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      for (const f of listPngs(p)) out.push(join(entry, f));
    } else if (entry.endsWith(".png")) {
      out.push(entry);
    }
  }
  return out.sort();
}

function comparePair(baselinePath, actualPath, diffPath) {
  const base = decodePng(readFileSync(baselinePath));
  const actual = decodePng(readFileSync(actualPath));
  const result = diffImages(base, actual, CONFIG.threshold);
  if (result.ratio > CONFIG.maxRatio) {
    mkdirSync(dirname(diffPath), { recursive: true });
    writeFileSync(diffPath, result.diffPng);
    return { ok: false, ...result };
  }
  return { ok: true, ...result };
}

async function fromDirMode() {
  const actualDir = CONFIG.fromDir;
  const baselineFiles = listPngs(CONFIG.baselinesDir);
  console.log(`compare-only: ${baselineFiles.length} baseline(s) vs ${actualDir}`);
  if (baselineFiles.length === 0) {
    console.error("FAIL: no baselines found — nothing to compare against.");
    return 1;
  }
  let failed = 0;
  let compared = 0;
  for (const rel of baselineFiles) {
    const actualPath = join(actualDir, rel);
    if (!existsSync(actualPath)) {
      console.error(`FAIL ${rel}: no actual screenshot`);
      failed++;
      continue;
    }
    compared++;
    const r = comparePair(
      join(CONFIG.baselinesDir, rel),
      actualPath,
      join(CONFIG.outDir, "diff", rel),
    );
    if (!r.ok) {
      console.error(
        `FAIL ${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ (${r.diffCount}/${r.total})`,
      );
      failed++;
    }
  }
  console.log(`compare-only done: ${compared} compared, ${failed} failed`);
  return failed > 0 ? 1 : 0;
}

async function deviceMode() {
  await adb("wait-for-device");
  const pkg = CONFIG.packageName;

  // Fresh app start; the app writes its story index at boot.
  await adb("shell", "am", "force-stop", pkg).catch(() => {});
  await adb("logcat", "-c").catch(() => {});
  await adb(
    "shell",
    "am",
    "start",
    "-a",
    "android.intent.action.MAIN",
    "-c",
    "android.intent.category.LAUNCHER",
    "-n",
    `${pkg}/.MainActivity`,
  );
  const indexReady = await waitForLog("DSVR INDEX_END", CONFIG.readyTimeoutMs);
  if (!indexReady) {
    console.error("FAIL: app did not report its story index (DSVR INDEX_END) in time");
    return 1;
  }
  const logs = await logcatDump();
  let stories = [...logs.matchAll(/DSVR INDEX_ITEM (\S+)/g)].map((m) => ({ id: m[1] }));
  // Dedupe while preserving order (the boot log can repeat on relaunch).
  stories = [...new Map(stories.map((s) => [s.id, s])).values()];
  if (stories.length === 0) {
    console.error("FAIL: story index was empty");
    return 1;
  }
  if (CONFIG.storyFilter) {
    stories = stories.filter((s) => s.id.includes(CONFIG.storyFilter));
  }
  console.log(
    `capturing ${stories.length} stor${stories.length === 1 ? "y" : "ies"} x ${CONFIG.themes.length} theme(s)`,
  );

  const summary = { captured: 0, compared: 0, updated: 0, noBaseline: 0, failed: [] };
  let nonce = 0;

  for (const theme of CONFIG.themes) {
    for (const story of stories) {
      nonce++;
      const url = `${CONFIG.scheme}://capture/${story.id}?theme=${encodeURIComponent(theme)}&nonce=${nonce}`;
      await adb("shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", url, pkg);
      const ready = await waitForLog(`DSVR READY ${nonce} `, CONFIG.readyTimeoutMs);
      if (!ready) {
        summary.failed.push(`${theme}/${story.id}: READY timeout`);
        console.error(`FAIL ${theme}/${story.id}: READY timeout`);
        continue;
      }
      await sleep(CONFIG.settleMs);
      const png = await adbBuffer("exec-out", "screencap", "-p");
      const rel = join(theme, `${story.id}.png`);
      const actualPath = join(CONFIG.outDir, "actual", rel);
      mkdirSync(dirname(actualPath), { recursive: true });
      writeFileSync(actualPath, png);
      summary.captured++;

      if (CONFIG.update) {
        const baselinePath = join(CONFIG.baselinesDir, rel);
        mkdirSync(dirname(baselinePath), { recursive: true });
        copyFileSync(actualPath, baselinePath);
        summary.updated++;
        continue;
      }
      const baselinePath = join(CONFIG.baselinesDir, rel);
      if (!existsSync(baselinePath)) {
        summary.noBaseline++;
        console.warn(`WARN ${rel}: no baseline yet (bootstrap)`);
        continue;
      }
      summary.compared++;
      const r = comparePair(baselinePath, actualPath, join(CONFIG.outDir, "diff", rel));
      if (!r.ok) {
        summary.failed.push(
          `${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ (${r.diffCount}/${r.total})`,
        );
        console.error(`FAIL ${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ`);
      }
    }
  }

  console.log(JSON.stringify(summary, null, 2));
  writeFileSync(join(CONFIG.outDir, "summary.json"), JSON.stringify(summary, null, 2));

  if (summary.failed.length > 0) return 1;
  if (!CONFIG.update && summary.compared === 0 && summary.captured > 0) {
    console.warn(
      "BOOTSTRAP: no baselines existed, so nothing was compared. " +
        "Run with --update (or the workflow's update mode) and commit the baselines.",
    );
  }
  return 0;
}

const exitCode = CONFIG.fromDir ? await fromDirMode() : await deviceMode();
process.exit(exitCode);
