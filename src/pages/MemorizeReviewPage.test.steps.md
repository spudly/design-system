---
component: MemorizeReviewPage
run_when:
  - "src/widgets/ButtonRow.tsx, its stories, the pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage, MealPlanDetailPage), PublicRecipePage's CTA bar, or a changeset naming ButtonRow."
---

# MemorizeReviewPage — manual test steps

Colocated manual test steps for `src/pages/MemorizeReviewPage.tsx` (design-system #530).
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

5. Page composition: in `Pages/Memorize/MemorizeReviewPage`:
   Default, each verse card's "I remembered it" / "I forgot
   it" row renders as a ButtonRow under the verse text; in
   `Pages/Memorize/MyVersesPage`: Default, each verse card's
   Drill / Remove row renders as a ButtonRow under the verse
   text — a page that drops or restyles its own button row
   fails this check even if the standalone ButtonRow stories
   pass.

**Run when:** `src/widgets/ButtonRow.tsx`, its stories, the
pages that compose ButtonRow (MemorizeReviewPage, MyVersesPage,
MealPlanDetailPage), PublicRecipePage's CTA bar, or a changeset
naming ButtonRow.
