---
"@spudly/ui": major
---

RecipeInstructionsPanel is removed (#747): its loading skeleton moves into StepList, which gains a `loading` prop (one skeleton card per step in its own card geometry, exactly 3 dummy cards when no steps are known, also driven by an enclosing LoadingScope) plus Loading and LoadingOverlay stories. PublicRecipePage — the panel's only remaining production consumer — now renders StepList directly, sorting its instructions by step number and composing each step's "Step N" label in the page, mirroring RecipeDetailPage.
