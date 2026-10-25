// App-side full-content capture pull (design-system #137): the
// host app draws the story's full content to a PNG itself via the
// dsvr-capture native module (apps/storybook/modules/dsvr-capture)
// and logs `DSVR APPCAP <nonce> <storyId> path=... ipath=... w=...
// h=... content=... viewport=... root=... mode=... scrolls=...
// chain=... ms=...`. This module waits for that line, enforces
// the truncation guard, pulls the PNG over adb, and applies the
// blank-tail crop (crop.mjs). Split out of deviceMode.mjs so each
// file stays under the file-length cap.

import { cropBlankTailPng } from "./crop.mjs";
import { adb, adbBuffer, logcatDump, sleep } from "./device.mjs";

const APPCAP_RE =
  /DSVR APPCAP (\d+) \S+ path=(\S*) ipath=(\S+) w=(\d+) h=(\d+) content=(\d+) viewport=(\d+) root=(\d+) mode=(\w+) scrolls=(\d+) chain=(\d+) ms=(\d+)/;
const APPCAP_ERROR_RE = /DSVR APPCAP_ERROR (\d+) \S+ (.*)/;

function isPng(buf) {
  return (
    buf &&
    buf.length > 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

async function pullPng(metrics) {
  let png = metrics.path
    ? await adbBuffer("exec-out", "cat", metrics.path).catch(() => null)
    : null;
  if (isPng(png)) return png;
  // The external path was unreadable (scoped-storage shells):
  // root the emulator shell and read the internal copy instead.
  await adb("root").catch(() => null);
  await adb("wait-for-device").catch(() => null);
  png = await adbBuffer("exec-out", "cat", metrics.internalPath).catch(() => null);
  return isPng(png) ? png : null;
}

// Poll logcat for THIS nonce's APPCAP / APPCAP_ERROR line (an
// earlier story's line must not satisfy the wait).
async function waitForAppCaptureLine(config, nonce) {
  let m = null;
  let errorMatch = null;
  const deadline = Date.now() + config.appCaptureTimeoutMs;
  while (Date.now() < deadline && !m && !errorMatch) {
    const logs = await logcatDump();
    for (const match of logs.matchAll(new RegExp(APPCAP_RE, "g"))) {
      if (Number(match[1]) === nonce) m = match;
    }
    if (!m) {
      for (const match of logs.matchAll(new RegExp(APPCAP_ERROR_RE, "g"))) {
        if (Number(match[1]) === nonce) errorMatch = match;
      }
    }
    if (!m && !errorMatch) await sleep(700);
  }
  return { m, errorMatch };
}

// Returns { png } with the frame ready to write, or { error }
// after recording the failure on the summary. Every failure here
// is loud: a story that cannot be app-captured fails the run —
// there is no silent fallback to a viewport-only screencap, which
// would quietly reintroduce the above-the-fold blindness #137
// exists to remove. The one designed fallback is INSIDE the
// native module (mode="root" for no-ScrollView stories) and is
// logged explicitly below.
export async function pullAppCapture(config, summary, target) {
  const { theme, story, nonce, storyStartMs } = target;
  const label = `${theme}/${story.id}`;
  const { m, errorMatch } = await waitForAppCaptureLine(config, nonce);
  if (!m) {
    const why = errorMatch ? `app capture error: ${errorMatch[2].trim()}` : "APPCAP timeout";
    summary.failed.push(`${label}: ${why}`);
    console.error(`FAIL ${label}: ${why}`);
    return { error: why };
  }
  const metrics = {
    path: m[2],
    internalPath: m[3],
    width: Number(m[4]),
    height: Number(m[5]),
    contentHeight: Number(m[6]),
    viewportHeight: Number(m[7]),
    rootHeight: Number(m[8]),
    mode: m[9],
    scrollViews: Number(m[10]),
    chainDepth: Number(m[11]),
    appMs: Number(m[12]),
  };
  // Truncation guard: the frame's content region (drawn height
  // minus the on-screen chrome, root minus viewport) must equal
  // the measured content height exactly — nothing clipped,
  // nothing invented — or the frame is rejected.
  const contentRegion = metrics.height - (metrics.rootHeight - metrics.viewportHeight);
  metrics.contentRegion = contentRegion;
  metrics.totalMs = Date.now() - storyStartMs;
  summary.appCapture = summary.appCapture || [];
  summary.appCapture.push({ story: label, ...metrics });
  console.log(
    `DSVR APPCAP ${label}: frame=${metrics.width}x${metrics.height} content=${metrics.contentHeight} ` +
      `viewport=${metrics.viewportHeight} root=${metrics.rootHeight} mode=${metrics.mode} ` +
      `app=${metrics.appMs}ms total=${metrics.totalMs}ms`,
  );
  if (contentRegion !== metrics.contentHeight) {
    const why =
      `APPCAP GUARD: drawn content region ${contentRegion}px != measured content ` +
      `${metrics.contentHeight}px — frame rejected (issue #137 truncation guard)`;
    summary.failed.push(`${label}: ${why}`);
    console.error(`DSVR APPCAP GUARD FAIL ${label}: ${why}`);
    return { error: why };
  }
  if (metrics.mode === "root") {
    // Explicit fallback, never silent: the story has no
    // ScrollView worth unrolling (single-viewport by construction
    // — a loading spinner, an error state, an empty virtualized
    // list in a fixed shell), so the module drew the root
    // hierarchy at its natural height instead of unrolling a
    // scroller. The frame is complete; it is also not cropped —
    // there is no below-viewport tail to trim.
    console.log(
      `DSVR APPCAP FALLBACK ${label}: no unrollable ScrollView in this story — root-draw frame ` +
        `(${metrics.width}x${metrics.height}); single-viewport story, frame is complete by construction`,
    );
  }
  let png = await pullPng(metrics);
  if (!png) {
    const why = "APPCAP pull failed: no readable PNG at the external or internal path";
    summary.failed.push(`${label}: ${why}`);
    console.error(`FAIL ${label}: ${why}`);
    return { error: why };
  }
  if (metrics.mode === "scroll") {
    // Blank-tail crop (safety net): trims the frame's uniform
    // below-viewport tail so the baseline ends at the page's real
    // last row. A scroll frame that trims NOTHING while ending on
    // a non-uniform row is truncation-suspect — fail loudly.
    const crop = cropBlankTailPng(png);
    summary.crop = summary.crop || [];
    summary.crop.push({
      story: label,
      rawHeight: crop.rawHeight,
      height: crop.height,
      removedRows: crop.removedRows,
    });
    console.log(
      `DSVR CROP ${label}: ${crop.rawHeight} -> ${crop.height} rows (${crop.removedRows} blank tail rows trimmed)`,
    );
    if (crop.truncationSuspect) {
      const why =
        "APPCAP CROP GUARD: scroll-mode frame trimmed 0 blank tail rows and its bottom " +
        "row is not uniform — content may run past the drawn frame (issue #137)";
      summary.failed.push(`${label}: ${why}`);
      console.error(`DSVR APPCAP CROP GUARD FAIL ${label}: ${why}`);
      return { error: why };
    }
    png = crop.png;
  }
  return { png };
}
