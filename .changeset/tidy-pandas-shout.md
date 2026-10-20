---
"@spudly/ui": major
---

Remove the pre-built Tamagui config exports (`tamaguiConfig`, `eciperayTamaguiConfig`, `memorizeTamaguiConfig`, `storybookTamaguiConfig`, and the default export). Tamagui v3 resolves all styling against the single global config installed by the most recent `createTamagui()` call — `TamaguiProvider`'s `config` prop does not install its config — so creating four configs at module scope meant merely importing the package left the last-created brand (Memorize) in charge of every app's rendering; the Eciperay app shipped with teal Memorize buttons and background (spudly/eciperay#149).

Migration: each app creates its own config exactly once, in app-owned code that evaluates after this package:

- `eciperayTamaguiConfig` → `createTamaguiConfig(eciperayTheme)`
- `memorizeTamaguiConfig` → `createTamaguiConfig(memorizeTheme)`
- `tamaguiConfig` → `createTamaguiConfig(baseTheme)`
- `storybookTamaguiConfig` → `createStorybookTamaguiConfig()` (new factory; the Storybook preview now calls it itself)
