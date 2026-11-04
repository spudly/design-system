package dev.spudly.dsvr.capture

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.ScrollView
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.util.ArrayDeque
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/**
 * App-side full-content capture for the Android visual-regression
 * host app (design-system issue #137).
 *
 * The display pipeline never renders the app taller than the
 * physical surface (a `wm size` spike proved the compositor tiles
 * the <=2400px render), so a screencap can only ever show the
 * first viewport of a page. This module bypasses the display: it
 * finds the story's ScrollView, temporarily re-lays out the
 * ancestor chain from the ScrollView up to the React root view at
 * the content's full height, draws the hierarchy into a
 * Bitmap-backed (software) Canvas, writes the PNG to app storage,
 * and restores every frame it touched. The driver pulls the PNG
 * over adb instead of screenshotting.
 *
 * Stories with no ScrollView worth unrolling (a loading state
 * that renders only a centered spinner, or an empty virtualized
 * list whose content measures zero height inside a fixed shell)
 * are single-viewport by construction: the module draws the root
 * hierarchy at its natural height instead and reports
 * mode="root", so the driver can log the fallback explicitly
 * rather than failing or silently screenshotting.
 *
 * Returns the drawn geometry plus the measured content geometry
 * so the driver can enforce the truncation guard: the content
 * region of the drawn frame must equal the measured content
 * height exactly, or the capture is rejected loudly.
 *
 * Settle (design-system issue #420): a single draw can catch an
 * image mid fade-in. React Native's Android Image view fades a
 * non-resource image in over 300ms (Fresco, when no fadeDuration
 * prop is set — and data-URI story fixtures count as remote), and
 * the fade starts only once the image decodes, which lands at a
 * variable time after the story renders. Two failing baseline
 * auto-commit runs proved it: the WithImage re-compare differed
 * ONLY in the hero-image band, and the first pass was the second
 * pass blended toward the page background at a uniform alpha —
 * 0.898 in one run, 0.831 in the other — i.e. two captures at
 * different points of the same fade. So the module draws, waits
 * 400ms (past the 300ms fade), and draws again, repeating until
 * two consecutive draws are pixel-identical — a frame is settled
 * only when drawing it again changes nothing. The match must
 * also span at least 1000ms from the first draw: two early draws
 * could match pre-decode (both showing the image's empty well)
 * and settle on a frame the decoded image later replaces. Story
 * images are inline data URIs by repo rule (#352 — nothing is
 * fetched), so decode is local work with room to land inside
 * that span. The waits are Handler.postDelayed, never a sleep on
 * the UI thread: sleeping there would freeze the fade animator
 * itself and make a mid-fade frame look (falsely) settled.
 * Perpetually animated stories never settle; the cap below
 * bounds them to the last draw, which is exactly the old
 * single-draw behaviour.
 */
class DsvrCaptureModule : Module() {
  companion object {
    /** Past React Native's 300ms image fade; see the class doc. */
    private const val SETTLE_INTERVAL_MS = 400L
    /** A match only counts once the draws span at least this
     * long from the first draw: two early draws could match
     * pre-decode (both showing the image's empty well) and settle
     * on a frame the image later replaces. Story images are
     * inline data URIs by repo rule (issue #352 — no network), so
     * decode is local work; this span gives it room to land
     * before a match is believed. See the class doc. */
    private const val MIN_SETTLE_SPAN_MS = 1000L
    /** Max draws per capture (1 first draw + 5 re-draws). */
    private const val MAX_SETTLE_DRAWS = 6
  }

  override fun definition() = ModuleDefinition {
    Name("DsvrCapture")

    AsyncFunction("captureFullPage") { fileName: String ->
      val started = System.currentTimeMillis()
      val latch = CountDownLatch(1)
      var result: Map<String, Any>? = null
      var failure: Throwable? = null
      val handler = Handler(Looper.getMainLooper())
      val stepper = object : Runnable {
        var prev: Bitmap? = null
        var draws = 0
        var firstDrawAt = 0L

        override fun run() {
          try {
            val frame = drawFrame()
            draws++
            if (draws == 1) firstDrawAt = System.currentTimeMillis()
            val spanned = System.currentTimeMillis() - firstDrawAt >= MIN_SETTLE_SPAN_MS
            val settled = spanned && prev != null && bitmapsEqual(prev!!, frame.bitmap)
            if (settled || draws >= MAX_SETTLE_DRAWS) {
              prev?.recycle()
              result = writeResult(fileName, frame, draws, started)
              frame.bitmap.recycle()
              latch.countDown()
            } else {
              prev?.recycle()
              prev = frame.bitmap
              handler.postDelayed(this, SETTLE_INTERVAL_MS)
            }
          } catch (t: Throwable) {
            prev?.recycle()
            failure = t
            latch.countDown()
          }
        }
      }
      handler.post(stepper)
      if (!latch.await(120, TimeUnit.SECONDS)) {
        throw Exception("DSVR capture timed out waiting for the UI thread")
      }
      failure?.let { throw Exception("DSVR capture failed: ${it.message}", it) }
      result ?: throw Exception("DSVR capture produced no result")
    }
  }

  /** True when two drawn frames are pixel-identical. Bitmap.sameAs
   * compares natively — materializing both frames as IntArrays
   * would cost ~45MB of heap on a tall page frame. */
  private fun bitmapsEqual(a: Bitmap, b: Bitmap): Boolean = a.sameAs(b)

  /** The React root view: the largest child of the activity's
   * android:id/content frame. Null when the frame cannot be found. */
  private fun findRootView(decor: ViewGroup): View? {
    val stack = ArrayDeque<View>()
    stack.addLast(decor)
    while (!stack.isEmpty()) {
      val v = stack.removeFirst()
      if (v.id == android.R.id.content && v is ViewGroup) {
        var best: View? = null
        var bestArea = -1
        for (i in 0 until v.childCount) {
          val child = v.getChildAt(i)
          val area = child.width * child.height
          if (area > bestArea) {
            bestArea = area
            best = child
          }
        }
        if (best != null) return best
      }
      if (v is ViewGroup) {
        for (i in 0 until v.childCount) stack.addLast(v.getChildAt(i))
      }
    }
    return null
  }

  /** One drawn frame plus the geometry the driver checks. The
   * caller owns the bitmap and must recycle it. */
  private class DrawFrame(
    val bitmap: Bitmap,
    val contentHeight: Int,
    val viewportHeight: Int,
    val rootHeight: Int,
    val mode: String,
    val scrollViews: Int,
    val chainDepth: Int,
  )

  /** Writes a settled frame to app storage and builds the result
   * map the JS side returns to the driver. */
  private fun writeResult(
    fileName: String,
    frame: DrawFrame,
    settleDraws: Int,
    started: Long,
  ): Map<String, Any> {
    val activity = appContext.currentActivity
      ?: throw Exception("no current activity")
    val bmp = frame.bitmap
    val internalFile = File(activity.filesDir, fileName)
    FileOutputStream(internalFile).use { out ->
      bmp.compress(Bitmap.CompressFormat.PNG, 100, out)
    }
    var externalPath = ""
    val externalDir = activity.getExternalFilesDir(null)
    if (externalDir != null) {
      val externalFile = File(externalDir, fileName)
      FileOutputStream(externalFile).use { out ->
        bmp.compress(Bitmap.CompressFormat.PNG, 100, out)
      }
      externalPath = externalFile.absolutePath
    }
    return mapOf(
      "path" to externalPath,
      "internalPath" to internalFile.absolutePath,
      "width" to bmp.width,
      "height" to bmp.height,
      "contentHeight" to frame.contentHeight,
      "viewportHeight" to frame.viewportHeight,
      "rootHeight" to frame.rootHeight,
      "mode" to frame.mode,
      "scrollViews" to frame.scrollViews,
      "chainDepth" to frame.chainDepth,
      "settleDraws" to settleDraws,
      "drawMs" to (System.currentTimeMillis() - started).toInt()
    )
  }

  private fun drawFrame(): DrawFrame {
    val activity = appContext.currentActivity
      ?: throw Exception("no current activity")
    val decor = activity.window.decorView as? ViewGroup
      ?: throw Exception("decor view is not a ViewGroup")

    // Find every ScrollView in the hierarchy (React Native's
    // ReactScrollView extends android.widget.ScrollView) and keep
    // the one whose content child is tallest — the story's page
    // scroller. Sheets/menus are closed during captures. A story
    // may legitimately have no scroller worth unrolling
    // (single-viewport states); that is the root-draw fallback
    // below, not an error. A content child measuring ZERO height
    // does not count: an empty virtualized list in a fixed shell
    // (VerseSearchPage with no results) has nothing below any
    // fold — the shell bounds it to the viewport — so it takes
    // the root-draw path like any other single-viewport story.
    val scrolls = ArrayList<ScrollView>()
    val stack = ArrayDeque<View>()
    stack.addLast(decor)
    while (!stack.isEmpty()) {
      val v = stack.removeFirst()
      if (v is ScrollView) scrolls.add(v)
      if (v is ViewGroup) {
        for (i in 0 until v.childCount) stack.addLast(v.getChildAt(i))
      }
    }
    var scroll: ScrollView? = null
    var bestContentHeight = 0
    for (candidate in scrolls) {
      if (candidate.childCount == 0) continue
      val h = candidate.getChildAt(0).height
      if (h > bestContentHeight) {
        bestContentHeight = h
        scroll = candidate
      }
    }

    // Ancestor chain from the ScrollView up to (and including) the
    // React root view — the view whose parent is the activity's
    // android:id/content frame. The system containers above it are
    // NOT grown: the root is drawn directly into our canvas, so only
    // RN-side frames matter. Empty in root mode (nothing grows).
    val chain = ArrayList<View>()
    val root: View
    val contentHeight: Int
    val viewportHeight: Int
    val mode: String
    if (scroll != null) {
      val scrollView = scroll
      val content = scrollView.getChildAt(0)
      contentHeight = content.height
      viewportHeight = scrollView.height
      if (contentHeight <= 0) throw Exception("measured content height is $contentHeight")
      var cur: View = scrollView
      while (true) {
        chain.add(cur)
        val parent = cur.parent as? View ?: break
        if (parent === decor) break
        if (parent.id == android.R.id.content) break
        cur = parent
      }
      root = chain[chain.size - 1]
      mode = "scroll"
    } else {
      root = findRootView(decor)
        ?: throw Exception("no ScrollView and no root view found in the hierarchy")
      // Single-viewport story: the root's own height IS the full
      // content; the guard arithmetic below degenerates to
      // drawn == root == content, which the driver still checks.
      contentHeight = root.height
      viewportHeight = root.height
      mode = "root"
    }
    val rootHeight = root.height
    val rootWidth = root.width
    if (rootWidth <= 0 || rootHeight <= 0) {
      throw Exception("root view has no size (${rootWidth}x${rootHeight})")
    }
    val delta = contentHeight - viewportHeight
    // Never draw shorter than the root's natural height. When the
    // content overflows the viewport (delta > 0) the frame grows
    // by the overflow; when the content FITS the viewport
    // (delta <= 0) nothing is hidden below the fold and the full
    // on-screen page is the complete frame — a bitmap shorter
    // than the root would clip the root's lower rows, and with
    // them whatever part of the page sits there (a short list's
    // rows, a loading spinner), leaving a frame of pure
    // background. First version of this module drew
    // rootHeight + delta unconditionally and produced exactly
    // that for short-content stories under the narrow geometry.
    val drawnHeight = if (delta > 0) rootHeight + delta else rootHeight
    if (drawnHeight <= 0 || drawnHeight > 32768) {
      throw Exception("drawn height $drawnHeight out of range")
    }

    // Record frames, then grow (scroll mode, positive delta only):
    // the ScrollView takes the content's full height; every
    // ancestor grows by the same delta with its top anchored. In
    // this hierarchy each growing child is the only or last child
    // of its parent (decorator > viewport > page column of
    // [header, ScrollView]), so no sibling is displaced. A
    // non-positive delta needs no re-layout at all: the hierarchy
    // is drawn exactly as it sits on screen.
    val frames = ArrayList<IntArray>(chain.size)
    for (v in chain) frames.add(intArrayOf(v.left, v.top, v.right, v.bottom))
    val originalLayerType = root.layerType
    var keepBitmap = false
    var bitmap: Bitmap? = null
    try {
      if (scroll != null && delta > 0) {
        scroll.scrollTo(0, 0)
        scroll.layout(
          scroll.left,
          scroll.top,
          scroll.right,
          scroll.top + contentHeight
        )
        for (i in 1 until chain.size) {
          val v = chain[i]
          v.layout(v.left, v.top, v.right, v.bottom + delta)
        }
      }
      // Force software rendering for the whole subtree: the target
      // canvas is software, and hardware layers would rasterize
      // through display lists meant for the compositor.
      root.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
      root.invalidate()

      val bmp = Bitmap.createBitmap(rootWidth, drawnHeight, Bitmap.Config.ARGB_8888)
      bitmap = bmp
      val canvas = Canvas(bmp)
      // Anything no view paints (root is exactly covered by the
      // decorator's background in practice) defaults to the light
      // theme's window white rather than transparent black.
      canvas.drawColor(Color.WHITE)
      canvas.save()
      canvas.translate(-root.left.toFloat(), -root.top.toFloat())
      root.draw(canvas)
      canvas.restore()

      keepBitmap = true
      return DrawFrame(
        bitmap = bmp,
        contentHeight = contentHeight,
        viewportHeight = viewportHeight,
        rootHeight = rootHeight,
        mode = mode,
        scrollViews = scrolls.size,
        chainDepth = chain.size
      )
    } finally {
      // Restore every frame exactly as found, whatever happened.
      for (i in chain.indices) {
        val v = chain[i]
        val f = frames[i]
        try {
          v.layout(f[0], f[1], f[2], f[3])
        } catch (ignored: Throwable) {
          // Best effort: the next capture target remounts anyway.
        }
      }
      try {
        root.setLayerType(originalLayerType, null)
        root.invalidate()
      } catch (ignored: Throwable) {
        // Best effort, same reasoning as above.
      }
      // On success the bitmap's ownership passed to the caller
      // (the settle loop in captureFullPage); on any failure it
      // is still ours to recycle here.
      if (!keepBitmap) bitmap?.recycle()
    }
  }
}
