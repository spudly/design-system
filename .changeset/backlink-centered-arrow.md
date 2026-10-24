---
"@spudly/ui": minor
---

Add a shared `BackLink` component whose arrow is drawn from fixed-dimension shapes instead of the "←" text glyph, whose ink sat at the bottom of the line on Android (#95). The arrow and label are flex-centered in one pressable row, so the arrow is vertically centered by construction. MemorizationSessionPage now renders its back affordance through BackLink instead of an inline ghost Button.
