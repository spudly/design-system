---
"@spudly/ui": patch
---

StarRatingInput: with `tone="dark"`, the field label now renders in near-white ink at full opacity, so it stays legible on the dark surfaces the tone is for (previously the label kept the default dark ink and was invisible against a dark background). On a @spudly/ui bump, re-check in Storybook: Components/StarRatingInput — the Dark Tone story's "Rate this recipe" label is plainly readable above the stars, and the Default story's label rendering is unchanged.
