---
component: RecipeIngredientsPanel
run_when:
  - src/pages/PublicRecipePage.tsx, its stories, the recipe panels the page composes (RecipeOverviewPanel, RecipeIngredientsPanel, RecipeInstructionsPanel), or a changeset naming PublicRecipePage.
  - src/widgets/RecipeIngredientsPanel.tsx, its stories, PublicRecipePage, RecipeDetailPage, or a changeset naming RecipeIngredientsPanel.
---

# RecipeIngredientsPanel — manual test steps

Colocated manual test steps for `src/widgets/RecipeIngredientsPanel.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

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
