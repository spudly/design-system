import { requireNativeModule } from "expo-modules-core";

/** SPIKE (design-system #137, option 3): geometry of one app-side
 * full-content capture, as measured and drawn by the native module.
 * The driver checks the truncation guard from these numbers:
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
  /** The ScrollView content child's laid-out height in px. */
  contentHeight: number;
  /** The ScrollView's on-screen viewport height in px. */
  viewportHeight: number;
  /** The React root view's on-screen height in px. */
  rootHeight: number;
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
