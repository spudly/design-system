---
"@spudly/ui": patch
---

Badge tones inverted, globally: every Badge tone (neutral, info, success, warning, danger) now takes the dark step of its color ramp as the background and the light step as the label and border ink — the visual direction's dark-pill treatment — resolved through the shared tokens in Badge's one tone map, so all tones and themes change together with no per-component override. The success ramp remains the sage/olive rebalance anchored on the visual direction's sampled sage, and RecipeDetailPage's metadata pill (the reusable MetadataBadge widget, which renders through Badge's success tone) takes the dark sage pill with it. Verify: in Storybook, Widgets/Badge All Tones shows five dark pills with light labels (the success one dark sage), and Widgets/MetadataBadge shows the same dark sage pill joining its parts with " • " (rendering nothing when no part is present).
