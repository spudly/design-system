---
"@spudly/ui": patch
---

Badge success tone and the recipe metadata pill: the success color ramp is rebalanced to sage/olive greens at the token level (anchored on the visual direction's sampled sage), and Badge's success tone now resolves through those tokens with the same step pattern as every other tone — no per-component color override, so all badge tones and every other success consumer (Alert, Text) stay consistent across themes. RecipeDetailPage's inline metadata pill is extracted into a reusable MetadataBadge widget that takes its summary `parts` as a prop and joins them with " • ". Verify: in Storybook, Widgets/Badge Success shows the sage tint family alongside the other tones, and Widgets/MetadataBadge joins its parts into one pill (rendering nothing when no part is present).
