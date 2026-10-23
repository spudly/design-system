// Capture-mode theme override for the visual-regression harness.
//
// Why this exists: page stories pin their brand theme in their CSF
// meta (`globals: { theme: "light_warmHarvest" }` / `"light_quietDawn"`)
// so the web Storybook and Chromatic render them in-brand by default.
// Storybook composes the globals a decorator sees as
// `{ ...userGlobals, ...storyGlobals }` — story globals are spread
// LAST, so they win over runtime updates. The capture driver asks for
// a theme via UPDATE_GLOBALS, which therefore changed nothing for
// page stories: a `dark_*` capture rendered the pinned light theme,
// byte-identical to the light capture (found reviewing PR #91; the
// dark baselines were light renders).
//
// Capture mode hence hands the requested theme to the preview
// decorator directly through this module: App.tsx sets it from the
// capture deep link, and .rnstorybook/preview.tsx prefers it over
// `context.globals.theme` whenever it is set. Browse mode never sets
// it and keeps the globals behavior.

let captureThemeOverride: string | null = null;

export function setCaptureThemeOverride(theme: string | null): void {
  captureThemeOverride = theme;
}

export function getCaptureThemeOverride(): string | null {
  return captureThemeOverride;
}
