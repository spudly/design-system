---
"@spudly/ui": patch
---

Internal cleanup: styled-component names no longer carry a "Spudly" prefix (e.g. the number stepper's value now registers as `NumberStepperValue`). These are internal Tamagui names used by devtools only — no component, page, prop, or visual behavior changes, and the public API is unchanged.
