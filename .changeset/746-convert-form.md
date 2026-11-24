---
"@spudly/ui": major
---

#746 tranche 6 (conversion, widgets/form): the form widgets' internal stacks convert to Row/Col. Compositional stacks across the fields, pickers, and panels render Row/Col directly; geometry the strict subset cannot express rides the channels it leaves open (single-side insets as Spacer compositions or the style channel, absolute edge insets via style, the custom slot's proportional share as grow={0.35} with a zero basis in style). One Option B exception: SearchField's bordered container keeps its styled surface because the focus-within ring needs pseudo-style props Tamagui exposes only in styled() configs (recorded for the tranche-9 allowlist). Public APIs and call sites unchanged; internal only.
