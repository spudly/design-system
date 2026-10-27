---
"@spudly/ui": minor
---

StarRatingInput: new `tone`, `allowClear`, `readOnly`, and `disabled` props. With `tone="dark"` (for dark surfaces such as the cooking-mode overlay) unselected stars render near-white at reduced opacity instead of gray; with `allowClear`, tapping the star that matches the current rating clears it to 0; `readOnly` renders the rating as a static non-interactive display; `disabled` dims the input and blocks presses. Default rendering and behavior are unchanged. This closes the gaps that kept the eciperay app-side StarRatingInput adapter alive (#159).
