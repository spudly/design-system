---
component: RecipeDetailPage
run_when:
  - "src/pages/eciperay/RecipeDetailPage.tsx, its stories, or a changeset naming RecipeDetailPage."
  - "src/views/eciperay/RecipeOverviewPanel.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeOverviewPanel."
  - "src/views/eciperay/RecipeIngredientsPanel.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeIngredientsPanel."
  - "src/widgets/data/StepList.tsx, its stories, RecipeDetailPage, or a changeset naming StepList."
  - "src/views/eciperay/RecipeCommentsView.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeCommentsView."
  - "src/views/eciperay/RecipeSharingView.tsx, its stories, RecipeDetailPage, or a changeset naming RecipeSharingView."
  - "src/views/eciperay/ConfirmActionView.tsx, its stories, RecipeDetailPage, or a changeset naming ConfirmActionView."
  - "src/widgets/actions/ButtonRow.tsx, its stories, the pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage, MealPlanDetailPage), RecipeDetailPage's guest-mode CTA bar, or a changeset naming ButtonRow."
  - "src/widgets/content/MessageCard.tsx, its stories, RecipeDetailPage's notFound and unavailable states, or a changeset naming MessageCard."
  - "src/widgets/layout/ScrollShell.tsx, its stories, RecipeDetailPage's guest mode, or a changeset naming ScrollShell."
  - "src/widgets/data/RatingsCard.tsx, its stories, RecipeDetailPage's engagement blocks, or a changeset naming RatingsCard."
---

# RecipeDetailPage — manual test steps

Colocated manual test steps for `src/pages/eciperay/RecipeDetailPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## RecipeDetailPage

Open in `Pages/Eciperay/RecipeDetailPage`: Default, Minimal, CreateDraft,
Loading, Ingredients, Instructions, CookHistory, CookLogFormOpen, Nutrition,
SharingAndComments.

1. The overview action row: Print and Share render as **real icons**
   (printer / share-2 from the DS internal icons module) in the same neutral
   button treatment as Edit (Delete renders in the danger
   treatment and is not part of this comparison) — no emoji or text glyphs, no
   color-rendered printer.
2. Tags render as bordered Badge pills whose border matches the tag
   label color.
3. CookLogFormOpen: the text stand-in "Cook log form renders
   here (app-side fixture stand-in)" replaces the "Log a cook"
   button in the section — there is no form, rating stars, or
   fields to check in this story.
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

**Run when:** `src/pages/eciperay/RecipeDetailPage.tsx`, its stories, or a
changeset naming RecipeDetailPage.

## RecipeDetailPage — guest mode

Open in `Pages/Eciperay/RecipeDetailPage`: SignedOut, SignedInNonOwner,
SignedInClonePending, CommentsAsData, SignedOutMinimal, SignedOutIngredients,
NotFound, Unavailable.

1. One scroll, no tab bar: overview, Ingredients, Instructions,
   and the engagement block (ratings card above the comments
   section) are all reachable by scrolling the SignedOut story —
   nothing is hidden behind a tab.
2. SignedOut (signed out): the CTA bar shows "Sign up free",
   "Clone this recipe", and "Get the mobile app"; the ratings
   card shows the community rating only — no "Your rating" star
   input. SignedInNonOwner shows the star input;
   SignedInClonePending's primary button reads "Saving…" and is
   disabled. The CTA buttons size to equal shares of the bar
   with a 40% minimum width: the first two share the first line
   and "Get the mobile app" wraps onto a second line filling
   its width rather than shrinking below the minimum; buttons
   sharing a line share its height.
3. NotFound shows the card "Recipe not found" / "This recipe may
   be private or no longer available.", centered horizontally
   and vertically on the surface; Unavailable shows "Recipe
   unavailable" / "This recipe link is invalid or has expired."
4. Overview: on SignedOut the title, description, stat band,
   and tag pills stack — 16px between blocks — and the tag
   pills carry their named colors. SignedOutMinimal shows the
   title and the Servings stat only: no description, Prep/Cook
   stats, or tag row.
5. Ingredients: the SignedOutIngredients story opens with the
   "Heavy cream" row already marked missing — the row is dimmed
   and the substitutions panel shows below the list. Tapping
   the row clears the missing mark (the dim and the panel
   disappear); tapping it again restores them. The servings
   stepper and the Scale preset buttons fit the story width
   without wrapping the Scale row; the selected scale is
   primary-filled, and the Custom button turns into a number
   input when pressed; entering a value does not apply it
   immediately — press Enter or move focus outside the selector,
   and only then it shows the applied value selected (e.g.
   "4×").
6. Instructions: the first step card is highlighted (primary
   border and tint) on open; pressing another card moves the
   highlight to it. Steps render in step-number order.
7. CommentsAsData: the comments section renders from the
   `comments` data prop under the ratings card — a Comments
   card listing the two fixture comments, with no composer
   (signed out, the host passes no `onPost`).

**Run when:** `src/pages/eciperay/RecipeDetailPage.tsx` in its
guest mode, its guest stories, the recipe panels the guest mode
composes (RecipeOverviewPanel, RecipeIngredientsPanel,
StepList), or a changeset naming the guest mode.

## ButtonRow

Open in `Widgets/ButtonRow`: Default, Equal,
EqualThreeButtons, EqualInCard.

A ButtonRow is a row of action buttons that follows content.
It owns the bar's whole treatment — there are no spacing props
to pass.

1. The button row follows the text at the separation its parent
   supplies (in the story, the wrapping stack's gap — the bar
   itself carries no margin), the two buttons sit 12px apart,
   and at a narrow width the second button wraps onto the next
   line instead of overflowing (MealPlanDetailPage's Shopping
   list / Edit bar and the Memorize card footers are the live
   cases).

With `equal`, the row's buttons share the row's width equally:
the row owns the sizing of every button (flex 1 with a 40%
minimum width), so there are no sizing props to pass.

2. Equal: the two buttons split the row as equal halves at the
   same height, 12px apart, their labels on one line each.
3. EqualThreeButtons: the first two buttons share line 1 as
   equal halves and the third wraps to line 2 at the full row
   width — no line of three thirds, and no label wraps inside
   a button.
4. EqualInCard: the same two-over-one treatment inside the
   card, inset by the card's own padding (the CTA-bar
   composition RecipeDetailPage's guest mode adopts).

**Run when:** `src/widgets/actions/ButtonRow.tsx`, its stories, the
pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage,
MealPlanDetailPage), RecipeDetailPage's guest-mode CTA bar, or a changeset
naming ButtonRow.

## MessageCard

Open in `Widgets/MessageCard`: Default, LongMessage.

A MessageCard is a whole-screen message state: a card carrying
a heading and one explanatory line, centered — horizontally
and vertically — on a surface-filled shell that fills the
story frame's height, inset 16px from the frame's edges. It
owns the whole treatment; the caller supplies only the two
strings.

1. Default: the card sits at the vertical center of the frame
   (not the top), the heading reads centered over the muted
   message line, also centered.
2. LongMessage: the message wraps inside the card and every
   wrapped line stays centered; the card grows taller and
   remains vertically centered.
3. RecipeDetailPage's NotFound and Unavailable stories show
   the identical state in the page's guest treatment.

**Run when:** `src/widgets/content/MessageCard.tsx`, its stories,
RecipeDetailPage's notFound and unavailable states, or a
changeset naming MessageCard.

## ScrollShell

Open in `Widgets/ScrollShell`: Default.

1. The shell's blocks sit 16px from the shell frame's edges
   (the edges of the story's 430px frame — not the Storybook
   canvas edges, which sit a further 24px out from the
   preview's padding) and 16px from each other, on a surface
   background that fills the frame; the content scrolls as
   one region when it overflows.

**Run when:** `src/widgets/layout/ScrollShell.tsx`, its stories,
RecipeDetailPage's guest mode, or a changeset naming ScrollShell.

## RatingsCard

Open in `Widgets/RatingsCard`: Default, Stale, No Ratings Yet.

1. Default: the community average shows ("4.6 (9)"); "Your
   rating" shows the viewer's stars — pressing the currently
   selected star clears the rating, and pressing another star
   changes it.
2. Stale: the stale-ratings hint shows under the community
   average and under "Your rating". No Ratings Yet shows "No
   community ratings yet" with no "Your rating" block.
   RecipeDetailPage's SignedOut story also exercises the
   signed-out form.

**Run when:** `src/widgets/data/RatingsCard.tsx`, its stories,
RecipeDetailPage's engagement blocks, or a changeset naming
RatingsCard.

## RecipeOverviewPanel

Open in `Widgets/RecipeOverviewPanel`: Default, Minimal.

1. Default: the title, status pill, description, stat band,
   and tag pills stack — 8px below the title, 16px between
   the other blocks; the tag pills carry their named colors. Minimal shows the title,
   the "Idea" pill, and the Servings stat only — no
   description, Prep/Cook stats, or tag row.

**Run when:** `src/views/eciperay/RecipeOverviewPanel.tsx`, its
stories, RecipeDetailPage, or a changeset
naming RecipeOverviewPanel.

## RecipeIngredientsPanel

Open in `Views/RecipeIngredientsPanel`: Default, Plain.

1. Default: the servings stepper and the Scale preset row
   fit the width without the Scale row wrapping; the Custom
   button turns into a number input when pressed and, once a
   value is entered and applied by pressing Enter or moving
   focus outside the selector, shows it selected (e.g.
   "4×"). The
   dimmed "heavy cream" row is marked missing and the
   Substitutions panel shows below the list; pressing the
   row clears the dim.
2. Plain: two unadorned rows with hairline separators and no
   substitutions panel.

**Run when:** `src/views/eciperay/RecipeIngredientsPanel.tsx`,
its stories, RecipeDetailPage, or a
changeset naming RecipeIngredientsPanel.

## StepList

Open in `Widgets/StepList`: Default.

1. The first step card is highlighted (primary border and
   tint) on open; pressing another card moves the highlight
   to it. Steps render in step-number order.

**Run when:** `src/widgets/data/StepList.tsx`,
its stories, RecipeDetailPage, or a
changeset naming StepList.

## RecipeCommentsView

Open in `Views/RecipeCommentsView`: WithComposer, Editing,
Empty, Loading, SignedOut.

1. WithComposer: two comments render in the bordered card (the
   stale one with its warning marker), and the composer shows
   an empty field with a disabled Post button.
2. Editing: the first comment renders its inline editor with
   the draft text and Save / Cancel actions. Empty shows
   "No comments yet" with the composer; Loading shows the
   "Comments" heading above a spinner; SignedOut shows the
   comments with no composer.

**Run when:** `src/views/eciperay/RecipeCommentsView.tsx`, its
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

**Run when:** `src/views/eciperay/RecipeSharingView.tsx`, its stories,
RecipeDetailPage, or a changeset naming RecipeSharingView.

## ConfirmActionView

Open in `Views/ConfirmActionView`: DeleteConfirmation,
WithError, Notice.

1. DeleteConfirmation: the dialog title is "Delete this
   recipe?" and its description is "This permanently deletes
   the recipe and its cook history."; Cancel in the secondary
   treatment and Delete recipe in the danger treatment;
   keyboard focus lands inside the dialog and Tab cycles
   within it.
2. WithError: the error alert renders inside the dialog above
   the actions. Notice: a single primary OK action, no Cancel.

**Run when:** `src/views/eciperay/ConfirmActionView.tsx`, its stories,
RecipeDetailPage, or a changeset naming ConfirmActionView.
