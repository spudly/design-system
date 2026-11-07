---
"@spudly/ui": minor
---

StatusBadge is removed. The status pills it rendered now render as Badge directly, with the same tones and caller-supplied labels: the recipe overview panel (shown on the public recipe page), and the status badge in the recipe detail page's toolbar. Rendered output is unchanged — the same Badge element with the same tone and label. Test: open the Badge stories (Widgets/Badge: Neutral, Info, Success, Warning, Danger) and confirm one pill per tone; open the RecipeDetailPage and PublicRecipePage stories and confirm the status pill beside the version picker and in the overview header shows the same label and tone color as before.
