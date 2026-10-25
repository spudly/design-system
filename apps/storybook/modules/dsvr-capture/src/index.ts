import { requireNativeModule } from "expo-modules-core";

/** Geometry of one app-side full-content capture, as measured and
 * drawn by the native module (design-system #137). The driver
 * checks the truncation guard from these numbers:
 * (height - (rootHeight - viewportHeight)) must equal
 * contentHeight — the content region of the frame is exactly the
 * measured content, nothing clipped, nothing invented. */
export interface FullPageCaptureResult {
  /** App-specific external files path (adb-readable), "" if none. */
  path: string;
  /** Internal files path (needs a rooted shell to read). */
  internalPath: string;
  width: number;
  /** Drawn frame height in px (root height + content overflow). */
  height: number;
  /** The ScrollView content child's laid-out height in px. In
   * "root" mode: the root view's own height. */
  contentHeight: number;
  /** The ScrollView's on-screen viewport height in px. In "root"
   * mode: equal to rootHeight (nothing scrolls). */
  viewportHeight: number;
  /** The React root view's on-screen height in px. */
  rootHeight: number;
  /** How the frame was produced: "scroll" = a ScrollView's full
   * content was unrolled and drawn; "root" = the story has no
   * ScrollView worth unrolling (e.g. a loading spinner, or an
   * empty virtualized list measuring zero height in a fixed
   * shell), so the root hierarchy was drawn at its natural
   * single-viewport height. The driver logs "root" captures as an
   * explicit fallback, never silently. */
  mode: "scroll" | "root";
  scrollViews: number;
  chainDepth: number;
  /** Measure + draw + write time inside the module, ms. */
  drawMs: number;
}

interface DsvrCaptureNativeModule {
  captureFullPage(fileName: string): Promise<FullPageCaptureResult>;
}

const nativeModule = requireNativeModule<DsvrCaptureNativeModule>("DsvrCapture");

export function captureFullPage(fileName: string): Promise<FullPageCaptureResult> {
  return nativeModule.captureFullPage(fileName);
}

export default { captureFullPage };
