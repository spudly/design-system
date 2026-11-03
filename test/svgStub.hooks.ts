/**
 * Module customization hooks for the contract-test harness:
 * redirect the bare `react-native-svg` specifier to the inert stub
 * in ./stubs/. Registered by ./registerSvgStub.ts; see that file
 * for why this exists (#250).
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const stubUrl = pathToFileURL(
  join(dirname(fileURLToPath(import.meta.url)), "stubs", "reactNativeSvg.js"),
).href;

type NextResolve = (
  specifier: string,
  context: unknown,
) => Promise<{ url: string; shortCircuit?: boolean }>;

export function resolve(
  specifier: string,
  context: unknown,
  nextResolve: NextResolve,
): Promise<{ url: string; shortCircuit?: boolean }> {
  if (specifier === "react-native-svg") {
    return Promise.resolve({ shortCircuit: true, url: stubUrl });
  }
  return nextResolve(specifier, context);
}
