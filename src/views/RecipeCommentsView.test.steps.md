---
component: RecipeCommentsView
run_when:
  - src/views/RecipeCommentsView.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeCommentsView.
---

# RecipeCommentsView — manual test steps

Colocated manual test steps for `src/views/RecipeCommentsView.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeCommentsView

Open in `Views/RecipeCommentsView`: WithComposer, Editing,
Empty, Loading, SignedOut.

1. WithComposer: two comments render in the bordered card (the
   stale one with its warning marker), and the composer shows
   an empty field with a disabled Post button.
2. Editing: the first comment renders its inline editor with
   the draft text and Save / Cancel actions. Empty shows
   "No comments yet" with the composer; Loading shows only a
   spinner; SignedOut shows the comments with no composer.

**Run when:** `src/views/RecipeCommentsView.tsx`, its
stories, RecipeDetailPage, or a changeset naming
RecipeCommentsView.
