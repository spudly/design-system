---
component: RecipeImageView
run_when:
  - "src/views/RecipeImageView.tsx, its stories, RecipeFormPage, or a changeset naming the view."
---

# RecipeImageView — manual test steps

Colocated manual test steps for `src/views/RecipeImageView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeImageView

Open in `Views/RecipeImageView`: Empty, WithImage, Uploading,
Generating, ErrorState; and in `Pages/Eciperay/RecipeFormPage`:
Default and VersionDiff.

1. Empty: the "Recipe image" label, the dashed empty frame with
   its choose-an-image line, and the Browse images / Take photo
   / Generate with AI actions render; no Remove image action.
2. WithImage: the preview fills the hero frame and the Remove
   image action joins the row.
3. Uploading: the pick action reads "Uploading…" and every
   action is disabled. Generating: the generate action reads
   "Generating…" and every action is disabled.
4. ErrorState: the error alert renders below the actions; the
   preview and actions stay.
5. RecipeFormPage Default: the image section renders through
   the view (same states as above in the form's flow);
   VersionDiff: the revert affordance sits in the image
   section's label row.

**Run when:** `src/views/RecipeImageView.tsx`, its stories,
RecipeFormPage, or a changeset naming the view.
