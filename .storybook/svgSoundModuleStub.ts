/**
 * Web stub for react-native-svg's fabric/NativeSvgSoundModule.
 *
 * That module is native-only: it calls
 * `TurboModuleRegistry.getEnforcing('RNSVGSoundModule')` at import
 * time, and react-native-web (the web Storybook's react-native alias)
 * exports no TurboModuleRegistry, so Rolldown fails the whole
 * Storybook build on the missing export. The module is only ever
 * loaded lazily by SvgTouchableMixin for the touch-sound feature,
 * which no DS component uses (the icons module renders static
 * shapes). The web build therefore aliases it to this inert stub;
 * native builds (apps/storybook, the apps) use the real module.
 */
export default null;
