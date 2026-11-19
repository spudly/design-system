---
"@spudly/ui": patch
---

Android: Edit Recipe, Edit Version, and Manual Entry pages render their form body again instead of a blank area under the heading. ScreenContainer's default variant regains the native bounded-height flex it lost in the page-scroll rework, so the form's scroll region no longer collapses to zero height. Web rendering is unchanged.
