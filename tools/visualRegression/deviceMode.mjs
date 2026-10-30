// Device mode for the visual-regression driver (run.mjs): boots the
// Storybook host app on an emulator/device, walks the capture
// scope, captures each in-scope story, and compares against
// baselines (or writes them, in update mode). Captures are
// app-drawn full-content frames (appCapture.mjs, issue #137)
// unless --no-app-capture selects the legacy screencap path.
// Split out of run.mjs so the driver stays under the file-length
// cap — the driver passes its CONFIG and scope helpers in.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { pullAppCapture } from "./appCapture.mjs";
import { updateBaselineThroughGate } from "./commitGate.mjs";
import { comparePair } from "./compare.mjs";
import {
  adb,
  adbBuffer,
  captureFailureEvidence,
  launchAndReadStoryIndex,
  sleep,
  waitForLog,
} from "./device.mjs";

export async function deviceMode(config, inActiveScope, baselineFileName) {
  await adb("wait-for-device");
  const pkg = config.packageName;

  // Fresh app start; the app writes its story index at boot. The
  // launch gets one relaunch when the index never arrives (issue
  // #352 — see launchAndReadStoryIndex in device.mjs).
  let stories = await launchAndReadStoryIndex(config);
  if (!stories) {
    console.error("FAIL: app did not report its story index (DSVR INDEX_END) in time");
    await captureFailureEvidence(pkg, config.outDir);
    return 1;
  }
  if (stories.length === 0) {
    console.error("FAIL: story index was empty");
    return 1;
  }
  if (config.storyFilter) stories = stories.filter((s) => s.id.includes(config.storyFilter));
  if (config.storyIds) {
    // Scoped run (issue #114): capture only the affected stories.
    // A scoped id missing from the app index means the mapping and
    // the app disagree — warn loudly rather than silently skip it.
    const missing = [...config.storyIds].filter((id) => !stories.some((s) => s.id === id));
    if (missing.length > 0) console.warn("WARN: scoped ids not in app index:", missing.join(", "));
    stories = stories.filter((s) => config.storyIds.has(s.id));
  }
  const inScopeCount = config.themes.reduce(
    (n, theme) => n + stories.filter((s) => inActiveScope(s.id, theme)).length,
    0,
  );
  console.log(
    `capturing ${inScopeCount} (story x theme) pairs in capture scope ${
      config.variant === "narrow"
        ? `(narrow-viewport variant: RecipesPage stories only, own brand; index holds ${stories.length} stories x ${config.themes.length} themes)`
        : `(page stories only, own brand; index holds ${stories.length} stories x ${config.themes.length} themes)`
    }`,
  );

  const summary = { captured: 0, compared: 0, updated: 0, skipped: 0, noBaseline: 0, failed: [] };
  let nonce = 0;

  for (const theme of config.themes) {
    for (const story of stories) {
      if (!inActiveScope(story.id, theme)) continue;
      nonce++;
      const storyStartMs = Date.now();
      const appParam = config.appCapture ? "&appcapture=1" : "";
      const url = `${config.scheme}://capture/${story.id}?theme=${encodeURIComponent(theme)}&nonce=${nonce}${appParam}`;
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
      const ready = await waitForLog(`DSVR READY ${nonce} `, config.readyTimeoutMs);
      if (!ready) {
        summary.failed.push(`${theme}/${story.id}: READY timeout`);
        console.error(`FAIL ${theme}/${story.id}: READY timeout`);
        continue;
      }
      await sleep(config.settleMs);
      // The frame: app-drawn full content by default (issue #137 —
      // the app draws the story's whole page, below the fold
      // included, via the dsvr-capture native module; see
      // appCapture.mjs). --no-app-capture keeps the legacy path:
      // one screencap of the display surface, first viewport only.
      let png = null;
      if (config.appCapture) {
        const pulled = await pullAppCapture(config, summary, { theme, story, nonce, storyStartMs });
        if (pulled.error) continue;
        png = pulled.png;
      } else {
        png = await adbBuffer("exec-out", "screencap", "-p").catch((error) => {
          summary.failed.push(`${theme}/${story.id}: screencap failed: ${error.message}`);
          console.error(`FAIL ${theme}/${story.id}: screencap failed: ${error.message}`);
          return null;
        });
        if (!png) continue;
      }
      const rel = join(theme, baselineFileName(story.id));
      const actualPath = join(config.outDir, "actual", rel);
      mkdirSync(dirname(actualPath), { recursive: true });
      writeFileSync(actualPath, png);
      summary.captured++;

      const baselinePath = join(config.baselinesDir, rel);
      if (config.update) {
        // Pixel-diff commit gate (issue #296) — see commitGate.mjs:
        // sub-gate captures keep their baseline; new ones write.
        updateBaselineThroughGate(baselinePath, actualPath, config, summary);
        continue;
      }
      if (!existsSync(baselinePath)) {
        summary.noBaseline++;
        console.warn(`WARN ${rel}: no baseline yet (bootstrap)`);
        continue;
      }
      summary.compared++;
      const r = comparePair(config, baselinePath, actualPath, join(config.outDir, "diff", rel));
      if (r.sizeMismatch) {
        console.error(
          `SIZE ${rel}: baseline is ${r.baselineSize}, capture is ${r.actualSize} — counted as a full diff`,
        );
      }
      if (!r.ok) {
        summary.failed.push(
          `${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ (${r.diffCount}/${r.total})`,
        );
        console.error(`FAIL ${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ`);
      }
    }
  }

  console.log(JSON.stringify(summary, null, 2));
  // A session with zero captures (a set scoped to no stories,
  // issue #114) never creates outDir through the capture paths —
  // ensure it exists before writing the summary into it.
  mkdirSync(config.outDir, { recursive: true });
  writeFileSync(join(config.outDir, "summary.json"), JSON.stringify(summary, null, 2));

  if (summary.failed.length > 0) return 1;
  if (!config.update && summary.compared === 0 && summary.captured > 0) {
    console.warn(
      "BOOTSTRAP: no baselines existed, so nothing was compared. " +
        "Run with --update (or the workflow's update mode) and commit the baselines.",
    );
  }
  return 0;
}
