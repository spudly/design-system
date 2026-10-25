#!/usr/bin/env node
// Android Storybook visual-regression driver (design-system #43).
//
// Device mode (default): drives the DS Storybook host app on an
// Android emulator/device over ADB. The app exposes a capture protocol
// (see apps/storybook/App.tsx): it writes its story index to its files
// dir at boot, and a `spudlyds://capture/<storyId>?theme=<theme>`
// deep link renders exactly one story (no Storybook chrome) and logs
// `DSVR READY <nonce> <storyId>` via logcat when it is on
// screen. This driver sends the links, waits for READY, and captures
// each story as an app-drawn FULL-CONTENT frame (issue #137: the app
// draws the page — below the fold included — via the dsvr-capture
// native module; see appCapture.mjs), then pixel-compares against
// committed baselines. --no-app-capture falls back to one `screencap`
// of the display surface (first viewport only) for debugging.
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
//
// This file is the CLI surface — argument parsing, CONFIG, and the
// capture-scope tables. The modes and helpers live in sibling
// modules (device.mjs, deviceMode.mjs, appCapture.mjs, crop.mjs,
// compare.mjs; the PNG codec in png.mjs/pngChunks.mjs, the
// comparator in imageDiff.mjs) so each file stays under the
// file-length cap.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { fromDirMode } from "./compare.mjs";
import { deviceMode } from "./deviceMode.mjs";

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
  // Affected-stories scoping (issue #114): a scope decision JSON
  // written by scope.mjs (--scope-file); a "scoped" decision
  // restricts device mode to the listed story ids for the active
  // variant, a "full" decision leaves the capture set untouched.
  // Absent = unscoped (local runs, update mode).
  scopeFile: argValue("--scope-file", ""),
  storyIds: null,
  // App-side full-content capture (issue #137): the host app draws
  // the story's full content to a PNG itself (deep link gains
  // &appcapture=1) and the driver pulls that file instead of
  // screenshotting the display surface. On by default for every
  // capture set (standard and narrow variant alike — the narrow
  // display settings change the layout the app measures, not the
  // capture mechanism); --no-app-capture restores the screencap
  // path for debugging.
  appCapture: !argFlag("--no-app-capture"),
  appCaptureTimeoutMs: Number(argValue("--app-capture-timeout", "90000")),
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

if (CONFIG.scopeFile) {
  let scope = null;
  try {
    scope = JSON.parse(readFileSync(CONFIG.scopeFile, "utf8"));
  } catch (error) {
    console.error(
      `FAIL: --scope-file ${CONFIG.scopeFile} is not readable JSON (${error.message}). ` +
        "Refusing to guess a capture set.",
    );
    process.exit(1);
  }
  if (scope.mode !== "full" && scope.mode !== "scoped") {
    console.error(
      `FAIL: scope file has unknown mode "${scope.mode}". Refusing to guess a capture set.`,
    );
    process.exit(1);
  }
  if (scope.mode === "scoped") {
    const list = CONFIG.variant === "narrow" ? scope.narrow : scope.standard;
    if (!Array.isArray(list)) {
      console.error(
        "FAIL: scoped decision is missing its story list. Refusing to guess a capture set.",
      );
      process.exit(1);
    }
    CONFIG.storyIds = new Set(list);
  }
  console.log(
    `VR scope (#114): ${scope.mode}` +
      `${CONFIG.storyIds ? ` — ${CONFIG.storyIds.size} stories for the ${CONFIG.variant === "narrow" ? "narrow" : "standard"} set` : " — full capture set"}. ` +
      `${(scope.reasons ?? []).join("; ")}`,
  );
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

const exitCode = CONFIG.fromDir
  ? await fromDirMode(CONFIG)
  : await deviceMode(CONFIG, inActiveScope, baselineFileName);
process.exit(exitCode);
