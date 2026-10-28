---
"@spudly/ui": patch
---

Internal cleanup, no user-visible change: every `interface` declaration in the `@spudly/ui` source is now a `type` alias, per the project's type-alias convention (interfaces that extended other types are now intersections with identical members). Component and page props, exported type names, and all runtime behavior are unchanged — anything that imported these types keeps working as before. One deliberate exception remains an interface: `TamaguiCustomConfig`, whose whole purpose is merging with Tamagui's own config interface via module augmentation, which only an interface can do. A contract test now guards the convention so new interfaces fail CI.
