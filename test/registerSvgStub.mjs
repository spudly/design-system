/**
 * Registers the react-native-svg stub for this test process.
 *
 * Import this module FIRST in any contract test that imports the
 * built package (dist/index.js or anything whose module graph
 * reaches the icons module). Since #250, AccordionSection renders
 * the icons module's CollapsibleIcon, so the root entry's graph
 * includes react-native-svg — whose react-native dependency is
 * Flow-typed and unparseable by plain Node. The stub keeps the
 * built package importable in Node; the tests assert exports,
 * source shape, and SSR markup, and never render an icon.
 *
 * A static import of this module is enough: static imports evaluate
 * before the test file's dynamic `await import("../dist/...")`
 * calls run, and the registered hooks apply to those imports.
 */
import { register } from "node:module";

register("./svgStub.hooks.mjs", import.meta.url);
