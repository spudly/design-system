---
component: MealPlanDetailPage
run_when:
  - src/widgets/ButtonRow.tsx, its stories, the pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage, MealPlanDetailPage), PublicRecipePage's CTA bar, or a changeset naming ButtonRow.
  - src/widgets/SectionStack.tsx, its stories, the pages that compose SectionStack (MealPlanDetailPage), or a changeset naming SectionStack.
  - src/widgets/ListStack.tsx, its stories, the pages that compose ListStack (MealPlanDetailPage, MealDetailPage), or a changeset naming ListStack.
  - src/widgets/DetailRow.tsx, its stories, MealPlanDetailPage (the nutrition-goal rows), or a changeset naming DetailRow.
  - src/widgets/ListRow.tsx, its stories, MealPlanDetailPage's entries, or a changeset naming ListRow.
  - src/pages/MealPlansPage.tsx, src/pages/MealPlanDetailPage.tsx, their stories, or a changeset naming either page.
---

# MealPlanDetailPage — manual test steps

Colocated manual test steps for `src/pages/MealPlanDetailPage.tsx` (design-system #530).
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

## SectionStack

Open in `Widgets/SectionStack`: Default.

A SectionStack is a stack of a page's sections — its major
blocks in order.

1. Every block in the stack — title, meta line, paragraph — is
   separated by the same 32px gap, and children fill the
   stack's width (MealPlanDetailPage's page stack is the live
   case: every section separation on the page is that one gap).

**Run when:** `src/widgets/SectionStack.tsx`, its stories,
the pages that compose SectionStack (MealPlanDetailPage), or a
changeset naming SectionStack.

## ListStack

Open in `Widgets/ListStack`: Default.

A ListStack composes hairline rows as one continuous list; the
stack adds no gap of its own — the rows own their separation.

1. The three rows read as one ruled surface: hairlines run
   continuously from row to row with no gaps of card background
   between them, and the third row shows the disabled treatment
   (MealPlanDetailPage's Entries card and MealDetailPage's
   Recipes card are the live cases).

**Run when:** `src/widgets/ListStack.tsx`, its stories, the
pages that compose ListStack (MealPlanDetailPage,
MealDetailPage), or a changeset naming ListStack.

## DetailRow

Open in `Widgets/DetailRow`: Default, Stacked.

1. Default: the muted label sits on the left edge and the value on
   the right edge of the same line, over a light hairline.
2. Stacked: three rows share the same hairline rhythm — labels
   aligned left, values aligned right, even vertical padding on
   every row.

**Run when:** `src/widgets/DetailRow.tsx`, its stories,
MealPlanDetailPage (the nutrition-goal rows), or a changeset
naming DetailRow.

## ListRow

Open in `Widgets/ListRow`: Prefixed, Plain, Disabled.

1. Prefixed: the title line reads "Meal · Taco Tuesday" (the
   prefix is caller-supplied content) in medium weight over the
   muted meta line, with a hairline under the row; the row presses
   (pointer cursor on web, Enter/Space activate).
2. Plain: the title line reads "Garlic cream chicken" with no
   prefix and no meta line.
3. Disabled: the title gains its caller-supplied " (unavailable)"
   suffix; the row does not press, is not focusable, and is
   exposed as disabled.

**Run when:** `src/widgets/ListRow.tsx`, its stories,
MealPlanDetailPage's entries, or a changeset naming ListRow.

## MealPlansPage & MealPlanDetailPage

Open in `Pages/Eciperay/MealPlansPage`: Default, Empty, Loading,
NoActions. Open in `Pages/Eciperay/MealPlanDetailPage`: Default,
Empty, Loading, NoGoals, NutritionUnavailable.

1. MealPlansPage Default: the "Meal plans" heading, the full-width
   "New meal plan" button under it, then the plan cards stacked
   at an even rhythm — each title over its meta line; NoActions
   drops the create button and the row Delete buttons.
2. MealPlansPage Loading: the spinner sits centered horizontally,
   16px below the create button; Empty shows "No meal plans yet."
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
