---
"@spudly/ui": patch
---

Switch: the knob now sits on the right of the track in the On state and animates its travel when toggled. The thumb's horizontal offset is driven from the switch state (20px when on) and transitioned with the shared fast spring, instead of relying on Tamagui's runtime-measured travel, which was not applied with this repo's custom styled frame.
