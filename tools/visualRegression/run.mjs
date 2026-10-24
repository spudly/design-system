#!/usr/bin/env node
// Android Storybook visual-regression driver (design-system #43).
//
// Device mode (default): drives the DS Storybook host app on an
// Android emulator/device over ADB. The app exposes a capture protocol
// (see apps/storybook/App.tsx): it writes its story index to its files
// dir at boot, and a `spudlyds://capture/<storyId>?theme=<theme>`
// deep link renders exactly one story (no Storybook chrome) and logs
// `DSVR READY <nonce> <storyId>` via logcat when it is on
// screen. This driver sends the links, waits for READY, captures with
// `screencap`, and pixel-compares against committed baselines.
//
// Compare-only mode (--from-dir): compares two folders of PNGs with
// the same comparator — used for local harness validation and for
// re-checking CI artifacts offline. No device needed.
//
// Capture scope: PAGE stories only, each under its own brand's
// themes — see CAPTURE_SCOPE below.
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
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { decodePng, diffImages } from "./png.mjs";

const run = promisify(execFile);
const TOOL_DIR = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}
function argFlag(name) {
  return args.includes(name);
}

const CONFIG = {
  packageName: argValue("--package", "dev.spudly.designsystem.storybook"),
  scheme: argValue("--scheme", "spudlyds"),
  themes: argValue("--themes", "light_warmHarvest,light_quietDawn").split(","),
  storyFilter: argValue("--stories", ""), // substring filter, empty = all
  // "" = the standard capture set; "narrow" = the narrow-viewport
  // variant (NARROW_SCOPE below, "-narrow" baseline filename suffix).
  variant: argValue("--variant", ""),
  baselinesDir: argValue("--baselines", join(TOOL_DIR, "baselines")),
  outDir: argValue("--out", join(TOOL_DIR, "out")),
  update: argFlag("--update"),
  fromDir: argValue("--from-dir", ""),
  threshold: Number(argValue("--threshold", "16")),
  maxRatio: Number(argValue("--max-ratio", "0.001")),
  readyTimeoutMs: Number(argValue("--ready-timeout", "30000")),
  // The first wait is different in kind: cold app launch + story
  // index preparation on a freshly booted emulator. Minutes, not
  // the seconds a warm per-story render needs.
  indexTimeoutMs: Number(argValue("--index-timeout", "240000")),
  settleMs: Number(argValue("--settle", "500")),
};

if (CONFIG.variant && CONFIG.variant !== "narrow") {
  console.error(`FAIL: unknown --variant "${CONFIG.variant}" (only "narrow" is supported).`);
  process.exit(1);
}

// Capture scope — Stephen's decision, 2026-10-23: the committed
// baseline set is PAGE stories only, each captured under its own
// brand's theme. Curating hundreds of component
// screenshots was more review surface than the Android check needs:
// full pages are where native layout diverges from web in ways that
// hurt users, and component stories stay covered by Chromatic on
// web. Wrong-brand page captures (an Eciperay page under Quiet
// Dawn, or vice versa) are excluded — pages pin their brand.
//
// Light themes ONLY — Stephen's decision, 2026-10-24: dark-mode
// captures doubled the snapshot count (and the VR job's emulator
// time) for a second render of the same layout; layout regressions
// are what this pipeline exists to catch, and they reproduce in
// light. Dark baselines were deleted, not just de-scoped, so the
// committed set stays exactly what CI compares.
//
// To widen or narrow the Android VR set, edit this table; the
// driver, the CI job, and the committed baselines all follow it.
// Current yield: 32 pages-eciperay stories + 18 pages-memorize
// stories, light themes only = 50 baselines.
// A second, display-variant set (RecipesPage stories at a narrow
// logical width + large font) lives in NARROW_SCOPE below.
const CAPTURE_SCOPE = [
  {
    storyPrefix: "pages-eciperay",
    themes: ["light_warmHarvest"],
  },
  {
    storyPrefix: "pages-memorize",
    themes: ["light_quietDawn"],
  },
];

// Narrow-viewport variant scope (Stephen's directive, 2026-10-24):
// ONLY the RecipesPage stories, re-captured with the emulator
// display pinned to a phone running a large display-size override
// + large font (ci/capture-compare.sh: wm size 1080x2400,
// wm density 500 -> 345.6dp logical width, font_scale 1.3 — the
// settings on Stephen's Pixel 8a that shipped eciperay #205). The
// standard set never sees that class of bug: it captures at
// density 320 / font 1.0, a 540dp-wide surface where the RecipesPage
// row's fixed children (64dp thumbnail, Log cook / Delete buttons)
// leave the flex:1 title/subtitle block ample room. At ~346dp with
// font 1.3 the buttons grow while the row shrinks, the text block
// starved to ~0dp, and PR #117 — the #205 fix (row flexWrap + a
// 60dp flexBasis on the text block) — passed the standard set with
// ZERO baseline movement. This variant exists so that regression
// class produces a failing diff instead. Baselines live beside the
// standard ones with a "-narrow" filename suffix
// (baselines/<theme>/<storyId>-narrow.png), so the auto-commit /
// guard / commit-job machinery treats them as ordinary baselines.
// Current yield: 7 pages-eciperay-recipespage stories x light
// warmHarvest = 7 baselines (57 total with the standard set). The
// variant follows the light-only policy above (Stephen,
// 2026-10-24). RecipesPage only on purpose: a second full pass
// would double the job's emulator time (issue #114 is cutting it).
const NARROW_SCOPE = [
  {
    storyPrefix: "pages-eciperay-recipespage",
    themes: ["light_warmHarvest"],
  },
];
const ACTIVE_SCOPE = CONFIG.variant === "narrow" ? NARROW_SCOPE : CAPTURE_SCOPE;
function inActiveScope(storyId, theme) {
  return ACTIVE_SCOPE.some(
    (rule) => storyId.startsWith(rule.storyPrefix) && rule.themes.includes(theme),
  );
}
function baselineFileName(storyId) {
  return CONFIG.variant === "narrow" ? `${storyId}-narrow.png` : `${storyId}.png`;
}

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

const sleep = (ms) =>
  new Promise((r) => {
    setTimeout(r, ms);
  });

async function logcatDump() {
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

function fromDirMode() {
  const actualDir = CONFIG.fromDir;
  // Standard and narrow baselines share one tree (the "-narrow"
  // suffix tells them apart); an offline compare covers exactly
  // one set — comparing a standard capture dir against the narrow
  // baselines (or vice versa) would fail every pair on dimensions.
  const baselineFiles = listPngs(CONFIG.baselinesDir).filter((rel) =>
    CONFIG.variant === "narrow" ? rel.endsWith("-narrow.png") : !rel.endsWith("-narrow.png"),
  );
  console.log(
    `compare-only: ${baselineFiles.length} ${CONFIG.variant || "standard"} baseline(s) vs ${actualDir}`,
  );
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
  await adb("shell", "am", "force-stop", pkg).catch(() => {
    // Best effort: the app may not be running yet.
  });
  await adb("logcat", "-c").catch(() => {
    // Best effort: clearing the log must not abort the run.
  });
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
  const indexReady = await waitForLog("DSVR INDEX_END", CONFIG.indexTimeoutMs);
  if (!indexReady) {
    console.error("FAIL: app did not report its story index (DSVR INDEX_END) in time");
    // Leave evidence for the next diagnosis: is the app process even
    // alive, what did it log last (any tag), and what is on screen?
    const pid = await adb("shell", "pidof", pkg).catch(() => "");
    console.error(`app process: ${pid.trim() ? `alive (pid ${pid.trim()})` : "NOT RUNNING"}`);
    const logs = await logcatDump();
    console.error("last logcat lines (all tags):");
    console.error(logs.trim().split("\n").slice(-200).join("\n"));
    mkdirSync(CONFIG.outDir, { recursive: true });
    try {
      const shot = await adbBuffer("exec-out", "screencap", "-p");
      writeFileSync(join(CONFIG.outDir, "failure-screen.png"), shot);
      console.error("saved failure-screen.png to the output dir");
    } catch {
      console.error("could not capture a failure screenshot");
    }
    writeFileSync(
      join(CONFIG.outDir, "summary.json"),
      JSON.stringify({ failed: ["story index timeout"] }, null, 2),
    );
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
  const inScopeCount = CONFIG.themes.reduce(
    (n, theme) => n + stories.filter((s) => inActiveScope(s.id, theme)).length,
    0,
  );
  console.log(
    `capturing ${inScopeCount} (story x theme) pairs in capture scope ${
      CONFIG.variant === "narrow"
        ? `(narrow-viewport variant: RecipesPage stories only, own brand; index holds ${stories.length} stories x ${CONFIG.themes.length} themes)`
        : `(page stories only, own brand; index holds ${stories.length} stories x ${CONFIG.themes.length} themes)`
    }`,
  );

  const summary = { captured: 0, compared: 0, updated: 0, noBaseline: 0, failed: [] };
  let nonce = 0;

  for (const theme of CONFIG.themes) {
    for (const story of stories) {
      if (!inActiveScope(story.id, theme)) continue;
      nonce++;
      const url = `${CONFIG.scheme}://capture/${story.id}?theme=${encodeURIComponent(theme)}&nonce=${nonce}`;
      try {
        // The URL must be single-quoted: `adb shell` re-parses its
        // arguments through the DEVICE shell, where the URL's `&`
        // would otherwise split the command (PR #87, fifth CI run —
        // the intent arrived truncated and the package name was
        // executed as a command). Story ids/themes/nonces contain no
        // single quotes, so the quoting is safe.
        await adb(
          "shell",
          "am",
          "start",
          "-a",
          "android.intent.action.VIEW",
          "-d",
          `'${url}'`,
          pkg,
        );
      } catch (error) {
        summary.failed.push(`${theme}/${story.id}: deep link failed: ${error.message}`);
        console.error(`FAIL ${theme}/${story.id}: deep link failed: ${error.message}`);
        continue;
      }
      const ready = await waitForLog(`DSVR READY ${nonce} `, CONFIG.readyTimeoutMs);
      if (!ready) {
        summary.failed.push(`${theme}/${story.id}: READY timeout`);
        console.error(`FAIL ${theme}/${story.id}: READY timeout`);
        continue;
      }
      await sleep(CONFIG.settleMs);
      const png = await adbBuffer("exec-out", "screencap", "-p").catch((error) => {
        summary.failed.push(`${theme}/${story.id}: screencap failed: ${error.message}`);
        console.error(`FAIL ${theme}/${story.id}: screencap failed: ${error.message}`);
        return null;
      });
      if (!png) continue;
      const rel = join(theme, baselineFileName(story.id));
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
