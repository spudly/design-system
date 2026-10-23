---
"@spudly/ui": minor
---

Verse text in the Quiet Dawn (Memorize) theme now renders in Alegreya (#66). A new `verse` typography role (web stack + native/Android names) defaults to the existing Georgia serif stack; Quiet Dawn's tokens override only that role to Alegreya. `createTamaguiConfig` registers the role as a Tamagui `verse` font, and `VerseText` plus the `Text` `verse` variant now reference `$verse` — so the verse family follows the app's brand config, and apps keep marking verse text with the component/variant instead of naming a family. The Memorize app must register/load a font under the exact name "Alegreya" (Google Fonts on web) for native rendering, the same contract as Raleway.
