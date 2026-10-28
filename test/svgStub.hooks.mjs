/**
 * Module customization hooks for the contract-test harness:
 * redirect the bare `react-native-svg` specifier to the inert stub
 * in ./stubs/. Registered by ./registerSvgStub.mjs; see that file
 * for why this exists (#250).
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const stubUrl = pathToFileURL(
  join(dirname(fileURLToPath(import.meta.url)), "stubs", "reactNativeSvg.mjs"),
).href;

export function resolve(specifier, context, nextResolve) {
  if (specifier === "react-native-svg") {
    return { shortCircuit: true, url: stubUrl };
  }
  return nextResolve(specifier, context);
}
