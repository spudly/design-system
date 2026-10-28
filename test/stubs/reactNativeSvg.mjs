/**
 * Inert stand-in for react-native-svg, substituted by the test
 * harness (see ../registerSvgStub.mjs) when the contract tests run
 * in plain Node.
 *
 * The real package's dependency chain reaches react-native's
 * Flow-typed entry, which plain Node cannot parse — so any test
 * that imports the built package (whose module graph includes the
 * icons module since AccordionSection renders CollapsibleIcon,
 * #250) would fail at import time. The contract tests assert
 * exports, source shape, and SSR markup of non-icon components;
 * they never render an icon, so each SVG element is a component
 * that renders nothing.
 */
const inert = () => null;

export const Svg = inert;
export const Circle = inert;
export const Line = inert;
export const Path = inert;
export const Polyline = inert;
export const Rect = inert;
