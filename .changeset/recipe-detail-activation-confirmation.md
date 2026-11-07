---
"@spudly/ui": patch
---

RecipeDetailPage: hosts can now confirm a version activation before it fires. The ready props gain an `activationConfirmation` prop in the same shape as the existing `recipeDeleteConfirmation` / `cookLogDeleteConfirmation` view-models — the host opens it from `onActivateCandidatePress` with the pressed version's label in the title/description, and the activation mutation fires from the dialog's `onConfirm` (activation is reversible, so hosts pass `confirmTone: "primary"`). When the prop is absent or null, no activation dialog renders and activation behavior is unchanged. Test: open the RecipeDetailPage ActivationConfirmationOpen story and confirm the "Activate this version?" dialog shows the candidate version's label with a primary Activate action; open the Default story and confirm no activation dialog renders.
