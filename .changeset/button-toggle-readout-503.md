---
"@spudly/ui": patch
---

Button Toggle story: the "Selected" readout now names the option actually pressed — previously it read one step above the pressed button (the ½× button read as 1×, 2× read as 3×). Test: open the Button Toggle story and confirm the readout reads "Selected: ½×" on load with ½× pressed, and that clicking 1× / 2× / 3× makes the readout name the clicked option exactly.
