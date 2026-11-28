

/**
 * The platform flag, re-exported through the widgets layer
 * (#119): pages branch on web vs native for their layout
 * choice (a scrolling web column vs a windowed native list)
 * but must not import from `tamagui` directly — Tamagui lives
 * inside reusable components under src/widgets. This module
 * is the one bridge: it carries no styling, only the flag.
 */


export {isWeb} from "tamagui";