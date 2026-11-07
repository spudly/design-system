---
component: PublicRecipePage
run_when:
  - src/widgets/ButtonRow.tsx, its stories, the pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage, MealPlanDetailPage), PublicRecipePage's CTA bar, or a changeset naming ButtonRow.
  - src/widgets/MessageCard.tsx, its stories, PublicRecipePage's notFound and unavailable states, or a changeset naming MessageCard.
  - src/widgets/ScrollShell.tsx, its stories, PublicRecipePage, or a changeset naming ScrollShell.
  - src/widgets/RatingsCard.tsx, its stories, PublicRecipePage's engagement block, or a changeset naming RatingsCard.
  - src/pages/PublicRecipePage.tsx, its stories, the recipe panels the page composes (RecipeOverviewPanel, RecipeIngredientsPanel, RecipeInstructionsPanel), or a changeset naming PublicRecipePage.
  - src/widgets/RecipeOverviewPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeOverviewPanel.
  - src/widgets/RecipeIngredientsPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeIngredientsPanel.
  - src/widgets/RecipeInstructionsPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeInstructionsPanel.
---

# PublicRecipePage — manual test steps

Colocated manual test steps for `src/pages/PublicRecipePage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

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
   composition PublicRecipePage adopts).

**Run when:** `src/widgets/ButtonRow.tsx`, its stories, the
pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage,
MealPlanDetailPage), PublicRecipePage's CTA bar, or a changeset
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
3. PublicRecipePage's NotFound and Unavailable stories show
   the identical state once the page adopts the component.

**Run when:** `src/widgets/MessageCard.tsx`, its stories,
PublicRecipePage's notFound and unavailable states, or a
changeset naming MessageCard.

## ScrollShell

Open in `Widgets/ScrollShell`: Default.

1. The shell's blocks sit 16px from the canvas edges and from
   each other, on a surface background that fills the frame; the
   content scrolls as one region when it overflows.

**Run when:** `src/widgets/ScrollShell.tsx`, its stories,
PublicRecipePage, or a changeset naming ScrollShell.

## RatingsCard

Open in `Widgets/RatingsCard`: Default, Stale, No Ratings Yet.

1. Default: the community average shows ("4.6 (9)"); "Your
   rating" shows the viewer's stars — pressing the currently
   selected star clears the rating, and pressing another star
   changes it.
2. Stale: the stale-ratings hint shows under the community
   average and under "Your rating". No Ratings Yet shows "No
   community ratings yet" with an empty star input. The
   signed-out form (no "Your rating" block) is exercised by
   PublicRecipePage's Default story.

**Run when:** `src/widgets/RatingsCard.tsx`, its stories,
PublicRecipePage's engagement block, or a changeset naming
RatingsCard.

## PublicRecipePage

Open in `Pages/Eciperay/PublicRecipePage`: Default, SignedIn,
ClonePending, Minimal, Loading, NotFound, Unavailable, Ingredients.

1. One scroll, no tab bar: overview, Ingredients, Instructions,
   and the engagement block (ratings card above the comments
   stand-in) are all reachable by scrolling the Default story —
   nothing is hidden behind a tab.
2. Default (signed out): the CTA bar shows "Sign up free",
   "Clone this recipe", and "Get the mobile app"; the ratings
   card shows the community rating only — no "Your rating" star
   input. SignedIn shows the star input; ClonePending's primary
   button reads "Saving…" and is disabled. The CTA buttons size
   to equal shares of the bar with a 40% minimum width: the
   first two share the first line and "Get the mobile app" wraps
   onto a second line filling its width rather than shrinking
   below the minimum; buttons sharing a line share its height.
3. NotFound shows the card "Recipe not found" / "This recipe may
   be private or no longer available.", centered horizontally
   and vertically on the surface; Unavailable shows "Recipe
   unavailable" / "This recipe link is invalid or has expired."
4. Overview: on Default the title, status pill, description,
   stat band, and tag pills stack — 8px below the title, 16px
   between the other blocks — and the tag pills carry their
   named colors. Minimal shows the title, the "Idea" pill, and
   the Servings stat only: no description, Prep/Cook stats, or
   tag row.
5. Ingredients: the Ingredients story opens with the "Heavy
   cream" row already marked missing — the row is dimmed and the
   substitutions panel shows below the list. Tapping the row
   clears the missing mark (the dim and the panel disappear);
   tapping it again restores them. The servings stepper and the
   Scale preset buttons fit the story width without wrapping the
   Scale row; the selected scale is primary-filled, and the
   Custom button turns into a number input when pressed and
   shows the applied value selected (e.g. "4×").
6. Instructions: the first step card is highlighted (primary
   border and tint) on open; pressing another card moves the
   highlight to it. Steps render in step-number order.
   **Run when:** `src/pages/PublicRecipePage.tsx`,
   its stories, the recipe
   panels the page composes (RecipeOverviewPanel,
   RecipeIngredientsPanel, RecipeInstructionsPanel), or a
   changeset naming PublicRecipePage.

## RecipeOverviewPanel

Open in `Widgets/RecipeOverviewPanel`: Default, Minimal.

1. Default: the title, status pill, description, stat band,
   and tag pills stack with even 16px separation; the tag
   pills carry their named colors. Minimal shows the title,
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
