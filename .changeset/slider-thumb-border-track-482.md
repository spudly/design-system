---
"@spudly/ui": patch
---

Slider: the knob no longer shows a square black border around it, the track renders thicker than before (12px, up from 8px), and the fill's end under the knob is square so no rounded corner shows against the knob. Test: open the Slider stories (Default, ticks, disabled, error) and confirm the round knob has no square frame around it, the bar is visibly thicker, the fill runs clean under the knob at low values, and drag and keyboard behavior are unchanged.
