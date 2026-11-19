---
"@spudly/ui": major
---

AiSessionPage and ImportReviewPage: removed the `preview` render slot. Pass the parsed recipe's preview as data instead (`preview` carrying a title, an optional meta line, ingredient lines, and instruction lines) — both pages render the new shared RecipePreviewView inside their PreviewCard.
