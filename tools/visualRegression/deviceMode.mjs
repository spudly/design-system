// Device mode for the visual-regression driver (run.mjs): boots the
// Storybook host app on an emulator/device, walks the capture
// scope, screenshots each in-scope story, and compares against
// baselines (or writes them, in update mode). Split out of run.mjs
// so the driver stays under the file-length cap; behavior
// identical — the driver passes its CONFIG and scope helpers in.

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { comparePair } from "./compare.mjs";
import {
  adb,
  adbBuffer,
  captureFailureEvidence,
  logcatDump,
  sleep,
  waitForLog,
} from "./device.mjs";

// SPIKE (issue #137, option 3): pull one app-drawn capture. The
// app logs `DSVR APPCAP <nonce> <storyId> path=... ipath=... w=...
// h=... content=... viewport=... root=... scrolls=... chain=...
// ms=...` after writing the PNG. Returns { png, metrics } or
// { error }. The truncation guard lives here: the frame's content
// region (drawn height minus the on-screen chrome, root minus
// viewport) must equal the measured content height exactly.
async function pullAppCapture(config, summary, theme, story, nonce, storyStartMs) {
  const label = `${theme}/${story.id}`;
  const lineRe = new RegExp(
    `DSVR APPCAP ${nonce} \\S+ path=(\\S*) ipath=(\\S+) w=(\\d+) h=(\\d+) content=(\\d+) viewport=(\\d+) root=(\\d+) scrolls=(\\d+) chain=(\\d+) ms=(\\d+)`,
  );
  const errorRe = new RegExp(`DSVR APPCAP_ERROR ${nonce} \\S+ (.*)`);
  // Poll logcat for THIS nonce's line (an earlier story's APPCAP
  // line must not satisfy the wait).
  let m = null;
  let errorMatch = null;
  const deadline = Date.now() + config.appCaptureTimeoutMs;
  while (Date.now() < deadline && !m && !errorMatch) {
    const logs = await logcatDump();
    m = logs.match(lineRe);
    if (!m) errorMatch = logs.match(errorRe);
    if (!m && !errorMatch) await sleep(700);
  }
  if (!m) {
    const why = errorMatch
      ? `app capture error: ${errorMatch[1].trim()}`
      : "APPCAP timeout";
    summary.failed.push(`${label}: ${why}`);
    console.error(`FAIL ${label}: ${why}`);
    return { error: why };
  }
  const metrics = {
    path: m[1],
    internalPath: m[2],
    width: Number(m[3]),
    height: Number(m[4]),
    contentHeight: Number(m[5]),
    viewportHeight: Number(m[6]),
    rootHeight: Number(m[7]),
    scrollViews: Number(m[8]),
    chainDepth: Number(m[9]),
    appMs: Number(m[10]),
  };
  const contentRegion = metrics.height - (metrics.rootHeight - metrics.viewportHeight);
  metrics.contentRegion = contentRegion;
  metrics.totalMs = Date.now() - storyStartMs;
  summary.appCapture = summary.appCapture || [];
  summary.appCapture.push({ story: label, ...metrics });
  console.log(
    `DSVR APPCAP ${label}: frame=${metrics.width}x${metrics.height} content=${metrics.contentHeight} ` +
      `viewport=${metrics.viewportHeight} root=${metrics.rootHeight} app=${metrics.appMs}ms total=${metrics.totalMs}ms`,
  );
  if (contentRegion !== metrics.contentHeight) {
    const why =
      `APPCAP GUARD: drawn content region ${contentRegion}px != measured content ` +
      `${metrics.contentHeight}px — frame rejected (issue #137 truncation guard)`;
    summary.failed.push(`${label}: ${why}`);
    console.error(`DSVR APPCAP GUARD FAIL ${label}: ${why}`);
    return { error: why, metrics };
  }
  const isPng = (buf) =>
    buf && buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  let png = metrics.path
    ? await adbBuffer("exec-out", "cat", metrics.path).catch(() => null)
    : null;
  if (!isPng(png)) {
    // The external path was unreadable (scoped-storage shells):
    // root the emulator shell and read the internal copy instead.
    console.warn(`WARN ${label}: external pull failed; retrying via adb root + internal path`);
    await adb("root").catch(() => {});
    await adb("wait-for-device").catch(() => {});
    png = await adbBuffer("exec-out", "cat", metrics.internalPath).catch(() => null);
  }
  if (!isPng(png)) {
    const why = "APPCAP pull failed: no readable PNG at the external or internal path";
    summary.failed.push(`${label}: ${why}`);
    console.error(`FAIL ${label}: ${why}`);
    return { error: why, metrics };
  }
  return { png, metrics };
}

export async function deviceMode(config, inActiveScope, baselineFileName) {
  await adb("wait-for-device");
  const pkg = config.packageName;

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
  const indexReady = await waitForLog("DSVR INDEX_END", config.indexTimeoutMs);
  if (!indexReady) {
    console.error("FAIL: app did not report its story index (DSVR INDEX_END) in time");
    await captureFailureEvidence(pkg, config.outDir);
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
  if (config.storyFilter) {
    stories = stories.filter((s) => s.id.includes(config.storyFilter));
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

  const summary = { captured: 0, compared: 0, updated: 0, noBaseline: 0, failed: [] };
  let nonce = 0;

  for (const theme of config.themes) {
    for (const story of stories) {
      if (!inActiveScope(story.id, theme)) continue;
      nonce++;
      const storyStartMs = Date.now();
      const url =
        `${config.scheme}://capture/${story.id}?theme=${encodeURIComponent(theme)}&nonce=${nonce}` +
        (config.appCapture ? "&appcapture=1" : "");
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
      // SPIKE (#137, option 3): with --app-capture the frame comes
      // from the app itself (full content height, drawn natively);
      // otherwise the production path — one screencap of the
      // display surface.
      let png = null;
      if (config.appCapture) {
        const pulled = await pullAppCapture(config, summary, theme, story, nonce, storyStartMs);
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

      if (config.update) {
        const baselinePath = join(config.baselinesDir, rel);
        mkdirSync(dirname(baselinePath), { recursive: true });
        copyFileSync(actualPath, baselinePath);
        summary.updated++;
        continue;
      }
      const baselinePath = join(config.baselinesDir, rel);
      if (!existsSync(baselinePath)) {
        summary.noBaseline++;
        console.warn(`WARN ${rel}: no baseline yet (bootstrap)`);
        continue;
      }
      summary.compared++;
      const r = comparePair(config, baselinePath, actualPath, join(config.outDir, "diff", rel));
      if (!r.ok) {
        summary.failed.push(
          `${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ (${r.diffCount}/${r.total})`,
        );
        console.error(`FAIL ${rel}: ${(r.ratio * 100).toFixed(3)}% pixels differ`);
      }
    }
  }

  console.log(JSON.stringify(summary, null, 2));
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
