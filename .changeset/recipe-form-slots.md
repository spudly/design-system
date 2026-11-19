---
"@spudly/ui": major
---

RecipeFormPage: removed the `renderImageSection`, `renderIngredientsSection`, and `renderInstructionsSection` render slots. Pass those sections through the existing `image`, `ingredients`, and `instructions` data props instead — they render the same image and list views, and the image view keeps its revert affordance as its header action.
