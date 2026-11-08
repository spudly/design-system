---
component: MealPlansPage
run_when:
  - "src/widgets/CardStack.tsx, its stories, the pages that compose CardStack (MealPlansPage), or a changeset naming CardStack."
  - "src/widgets/Center.tsx, its stories, the pages that compose Center (MealPlansPage), or a changeset naming Center."
  - "src/widgets/CardRow.tsx, its stories, MealPlansPage's list, or a changeset naming CardRow."
  - "src/widgets/PresetValueSelector.tsx, its stories, the recipe pages' scale rows, or a changeset naming PresetValueSelector."
  - "src/pages/MealPlansPage.tsx, src/pages/MealPlanDetailPage.tsx, their stories, or a changeset naming either page."
---

# MealPlansPage — manual test steps

Colocated manual test steps for `src/pages/MealPlansPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CardStack

Open in `Widgets/CardStack`: Default.

A CardStack is a stack of cards — a list whose rows are cards.

1. The three cards stack with an even 8px gap between them,
   each keeping its own internal padding and full width
   (MealPlansPage's plan list is the live case, including the
   first card's danger Delete action).

**Run when:** `src/widgets/CardStack.tsx`, its stories, the
pages that compose CardStack (MealPlansPage), or a changeset
naming CardStack.

## Center

Open in `Widgets/Center`: Centered, HorizontalOnly.

Center centers a single child; `horizontal` and `vertical` are
booleans, both defaulting to true. `fill` is the semantic
full-area form (the Center grows to the height its parent
offers) — the detail pages' loading states use it, so their
spinner centers in the shell's content area.

1. Centered: the spinner sits at the center of the framed
   block, both dimensions on. Toggle `vertical` off in the
   controls: the spinner moves to the top, still centered
   horizontally; toggle `horizontal` off instead: it moves to
   the left edge, still centered vertically.
2. HorizontalOnly: the notice sits at the top of its block,
   centered horizontally (MealPlansPage's loading block is the
   live page case — the spinner centered under the heading and
   create button).

**Run when:** `src/widgets/Center.tsx`, its stories, the
pages that compose Center (MealPlansPage), or a changeset
naming Center.

## CardRow

Open in `Widgets/CardRow`: Default, WithAction, TitleOnly.

1. Default: an elevated card with the title in semibold over its
   muted meta line; the text block presses (pointer cursor on
   web, Enter/Space activate) and no action button shows.
2. WithAction: a small soft-red action button ("Delete",
   danger tone) sits at the card's right edge, vertically
   centered, and pressing it does not trigger the row's press.
3. TitleOnly: the card shows the title alone, no meta line and no
   empty gap where it would sit.

**Run when:** `src/widgets/CardRow.tsx`, its stories,
MealPlansPage's list, or a changeset naming CardRow.

## PresetValueSelector

Open in `Widgets/PresetValueSelector`: Default,
CustomSelected.

1. Default: the Scale row shows ½× / 1× / 2× / 3× preset buttons
   at equal width in one non-wrapping row, 1× selected
   (primary-filled, light label), plus the Custom button
   unselected. The Custom label sits on one line (never wrapped
   mid-word) and all five buttons are the same height.
2. CustomSelected: the Custom button shows "2.5×" and is
   selected (primary-filled); no preset is selected.
3. Pressing Custom swaps it in place for a decimal number
   input; entering 4 and blurring applies 4× (the button
   returns showing "4×", selected); entering 0 or text commits
   nothing and restores the previous value. On web the Custom
   button carries `aria-pressed` matching its selected state.

**Run when:** `src/widgets/PresetValueSelector.tsx`, its
stories, the recipe pages' scale rows, or a changeset naming
PresetValueSelector.

## MealPlansPage & MealPlanDetailPage

Open in `Pages/Eciperay/MealPlansPage`: Default, Empty, Loading,
NoActions. Open in `Pages/Eciperay/MealPlanDetailPage`: Default,
Empty, Loading, NoGoals, NutritionUnavailable.

1. MealPlansPage Default: the "Meal plans" heading, the full-width
   "New meal plan" button under it, then the plan cards stacked
   at an even rhythm — each title over its meta line; NoActions
   drops the create button and the row Delete buttons.
2. MealPlansPage Loading: the spinner sits centered horizontally
   in place of the list — loading replaces the content, and the
   Loading story renders no create button to measure from;
   Empty shows "No meal plans yet."
3. MealPlanDetailPage Default: the plan title (xl bold, heading
   level 1) and its muted meta lines separated by the page's
   uniform 32px section gap, the Nutrition goals card (plan
   total, then label/value rows over hairlines at the card's
   even content rhythm), the Shopping list / Edit buttons side
   by side with a 12px gap, then the Entries card with
   kind-prefixed entry rows as one continuous ruled list.
4. MealPlanDetailPage Loading shows only the centered loading
   gate; NoGoals (a nutrition summary is present but no goals
   are set) shows the goals card with the plan total, the
   set-goals hint, and the "Set nutrition goals" link;
   NutritionUnavailable forces the same card via the visibility
   control when no summary exists.

**Run when:** `src/pages/MealPlansPage.tsx`,
`src/pages/MealPlanDetailPage.tsx`, their stories, or a changeset
naming either page.
