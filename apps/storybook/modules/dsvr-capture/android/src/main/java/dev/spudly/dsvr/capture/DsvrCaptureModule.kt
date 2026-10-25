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
 * SPIKE (design-system issue #137, option 3): app-side full-content
 * capture for the Android visual-regression host app.
 *
 * The display pipeline never renders the app taller than the
 * physical surface (the `wm size` spike proved the compositor tiles
 * the <=2400px render), so this module bypasses the display: it
 * finds the story's ScrollView, temporarily re-lays out the
 * ancestor chain from the ScrollView up to the React root view at
 * the content's full height, draws the hierarchy into a
 * Bitmap-backed (software) Canvas, writes the PNG to app storage,
 * and restores every frame it touched.
 *
 * Returns the drawn geometry plus the measured content geometry so
 * the driver can enforce the spike's truncation guard: the content
 * region of the drawn frame must equal the measured content height
 * exactly, or the capture is rejected loudly.
 */
class DsvrCaptureModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DsvrCapture")

    AsyncFunction("captureFullPage") { fileName: String ->
      val latch = CountDownLatch(1)
      var result: Map<String, Any>? = null
      var failure: Throwable? = null
      Handler(Looper.getMainLooper()).post {
        try {
          result = doCapture(fileName)
        } catch (t: Throwable) {
          failure = t
        } finally {
          latch.countDown()
        }
      }
      if (!latch.await(120, TimeUnit.SECONDS)) {
        throw Exception("DSVR capture timed out waiting for the UI thread")
      }
      failure?.let { throw Exception("DSVR capture failed: ${it.message}", it) }
      result ?: throw Exception("DSVR capture produced no result")
    }
  }

  private fun doCapture(fileName: String): Map<String, Any> {
    val started = System.currentTimeMillis()
    val activity = appContext.currentActivity
      ?: throw Exception("no current activity")
    val decor = activity.window.decorView as? ViewGroup
      ?: throw Exception("decor view is not a ViewGroup")

    // Find every ScrollView in the hierarchy (React Native's
    // ReactScrollView extends android.widget.ScrollView) and keep
    // the one whose content child is tallest — the story's page
    // scroller. Sheets/menus are closed during captures.
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
    if (scrolls.isEmpty()) throw Exception("no ScrollView found in the hierarchy")
    var scroll: ScrollView? = null
    var bestContentHeight = -1
    for (candidate in scrolls) {
      if (candidate.childCount == 0) continue
      val h = candidate.getChildAt(0).height
      if (h > bestContentHeight) {
        bestContentHeight = h
        scroll = candidate
      }
    }
    val scrollView = scroll ?: throw Exception("every ScrollView is childless")
    val content = scrollView.getChildAt(0)
    val contentHeight = content.height
    val viewportHeight = scrollView.height
    if (contentHeight <= 0) throw Exception("measured content height is $contentHeight")

    // Ancestor chain from the ScrollView up to (and including) the
    // React root view — the view whose parent is the activity's
    // android:id/content frame. The system containers above it are
    // NOT grown: the root is drawn directly into our canvas, so only
    // RN-side frames matter.
    val chain = ArrayList<View>()
    var cur: View = scrollView
    while (true) {
      chain.add(cur)
      val parent = cur.parent as? View ?: break
      if (parent === decor) break
      if (parent.id == android.R.id.content) break
      cur = parent
    }
    val root = chain[chain.size - 1]
    val rootHeight = root.height
    val rootWidth = root.width
    if (rootWidth <= 0 || rootHeight <= 0) {
      throw Exception("root view has no size (${rootWidth}x${rootHeight})")
    }
    val delta = contentHeight - viewportHeight
    val drawnHeight = rootHeight + delta
    if (drawnHeight <= 0 || drawnHeight > 32768) {
      throw Exception("drawn height $drawnHeight out of range")
    }

    // Record frames, then grow: the ScrollView takes the content's
    // full height; every ancestor grows by the same delta with its
    // top anchored. In this hierarchy each growing child is the
    // only or last child of its parent (decorator > viewport > page
    // column of [header, ScrollView]), so no sibling is displaced.
    val frames = ArrayList<IntArray>(chain.size)
    for (v in chain) frames.add(intArrayOf(v.left, v.top, v.right, v.bottom))
    val originalLayerType = root.layerType
    var bitmap: Bitmap? = null
    try {
      scrollView.scrollTo(0, 0)
      scrollView.layout(
        scrollView.left,
        scrollView.top,
        scrollView.right,
        scrollView.top + contentHeight
      )
      for (i in 1 until chain.size) {
        val v = chain[i]
        v.layout(v.left, v.top, v.right, v.bottom + delta)
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
        "width" to rootWidth,
        "height" to drawnHeight,
        "contentHeight" to contentHeight,
        "viewportHeight" to viewportHeight,
        "rootHeight" to rootHeight,
        "scrollViews" to scrolls.size,
        "chainDepth" to chain.size,
        "drawMs" to (System.currentTimeMillis() - started).toInt()
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
      bitmap?.recycle()
    }
  }
}
