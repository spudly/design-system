---
"@spudly/ui": minor
---

Generalize the cook-log form into a generic RatingForm component: CookLogForm is renamed to RatingForm (file, component, props/values types, and its Components/RatingForm stories in both storybooks), the submit view-model now carries a plain `rating` field instead of `authorStarRating`, and the heading and notes placeholder are configurable via `title` and `notesPlaceholder` props with neutral defaults ("How did it go?" / "Notes (optional)") instead of cooking-specific text. Behavior is unchanged — optional star rating with toggle-off, trimmed-or-null notes, dark/light variants, pending disables Save only. Consuming apps update their imports and submit-field name on their next @spudly/ui bump; test the rating form wherever a "rate this and leave a note" surface renders (in Eciperay, the cook-log form on the recipe detail page, recipe list cards, and the cooking overlay).
