---
component: RecipeDetailPage
run_when:
  - "src/pages/RecipeDetailPage.tsx, its stories, or a changeset naming RecipeDetailPage."
  - "src/widgets/RecipeOverviewPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeOverviewPanel."
  - "src/widgets/RecipeIngredientsPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeIngredientsPanel."
  - "src/widgets/RecipeInstructionsPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeInstructionsPanel."
  - "src/views/RecipeCommentsView.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeCommentsView."
  - "src/views/RecipeSharingView.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeSharingView."
  - "src/views/ConfirmActionView.tsx, its stories, RecipeDetailPage, or a changeset naming ConfirmActionView."
---

# RecipeDetailPage — manual test steps

Colocated manual test steps for `src/pages/RecipeDetailPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeDetailPage

Open in `Pages/Eciperay/RecipeDetailPage`: Default, Minimal, CreateDraft,
Loading, Ingredients, Instructions, CookHistory, CookLogFormOpen, Nutrition,
SharingAndComments.

1. The overview action row: Print and Share render as **real icons**
   (printer / share-2 from the DS internal icons module) in the same neutral
   button treatment as Edit/Delete — no emoji or text glyphs, no
   color-rendered printer.
2. Tags render as bordered Badge pills whose border matches the tag
   label color.
3. CookLogFormOpen: the inline form fits the section width; its
   rating stars and fields do not overflow the card.
4. CreateDraft: the recipe is Perfected and has no existing draft,
   so the overview action row's "Edit draft" is the create-a-draft
   callback form — on web it renders as a **button, not an anchor**
   (there is no draft to link to yet; the host creates one, then
   navigates). In Default, where a draft exists, "Edit draft"
   renders as a link carrying the existing draft's href.
5. SharingAndComments: the Sharing card renders in the overview
   after the lifecycle section (visibility radio group with the
   Unlisted option selected, share-link row with Rotate and Copy
   buttons), and the Comments card renders under the ratings
   card — two comments (the stale one carrying its warning
   marker) over an empty composer with a disabled Post button.

**Run when:** `src/pages/RecipeDetailPage.tsx`, its stories, or a
changeset naming RecipeDetailPage.

## RecipeOverviewPanel

Open in `Widgets/RecipeOverviewPanel`: Default, Minimal.

1. Default: the title, status pill, description, stat band,
   and tag pills stack — 8px below the title, 16px between
   the other blocks; the tag pills carry their named colors. Minimal shows the title,
   the "Idea" pill, and the Servings stat only — no
   description, Prep/Cook stats, or tag row.

**Run when:** `src/widgets/RecipeOverviewPanel.tsx`, its
stories, PublicRecipePage, RecipeDetailPage, or a changeset
naming RecipeOverviewPanel.

## RecipeIngredientsPanel

Open in `Widgets/RecipeIngredientsPanel`: Default, Plain.

1. Default: the servings stepper and the Scale preset row
   fit the width without the Scale row wrapping; the Custom
   button turns into a number input when pressed and, once a
   value is entered, shows it selected (e.g. "4×"). The
   dimmed "heavy cream" row is marked missing and the
   Substitutions panel shows below the list; pressing the
   row clears the dim.
2. Plain: two unadorned rows with hairline separators and no
   substitutions panel.

**Run when:** `src/widgets/RecipeIngredientsPanel.tsx`,
its stories, PublicRecipePage, RecipeDetailPage, or a
changeset naming RecipeIngredientsPanel.

## RecipeInstructionsPanel

Open in `Widgets/RecipeInstructionsPanel`: Default.

1. The first step card is highlighted (primary border and
   tint) on open; pressing another card moves the highlight
   to it. Steps render in step-number order.

**Run when:** `src/widgets/RecipeInstructionsPanel.tsx`,
its stories, PublicRecipePage, RecipeDetailPage, or a
changeset naming RecipeInstructionsPanel.

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

## RecipeSharingView

Open in `Views/RecipeSharingView`: PublicWithConsent, Private.

1. PublicWithConsent: the Public option is selected, the
   discoverability warning shows, the consent checkbox is
   unchecked and **Save visibility is disabled** until it is
   checked; the share-link row (Rotate / Copy) and the public
   permalink row render under the Save button.
2. Private: no warning, no consent checkbox, no permalink row.

**Run when:** `src/views/RecipeSharingView.tsx`, its stories,
RecipeDetailPage, or a changeset naming RecipeSharingView.

## ConfirmActionView

Open in `Views/ConfirmActionView`: DeleteConfirmation,
WithError, Notice.

1. DeleteConfirmation: the dialog is titled with its
   description, Cancel in the secondary treatment and Delete
   recipe in the danger treatment; keyboard focus lands inside
   the dialog and Tab cycles within it.
2. WithError: the error alert renders inside the dialog above
   the actions. Notice: a single primary OK action, no Cancel.

**Run when:** `src/views/ConfirmActionView.tsx`, its stories,
RecipeDetailPage, or a changeset naming ConfirmActionView.
