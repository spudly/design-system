---
component: TagsPage
run_when:
  - "src/widgets/FormStack.tsx, src/widgets/TrailingActionsRow.tsx, src/widgets/Card.tsx, their stories, TagsPage's forms or rows, or a changeset naming any of them. (namely: FormStack, TrailingActionsRow, Card, TagsPage)"
  - "a catalog page's loading state (Discover, Home, MealsHub, Recipes, ShoppingList, Tags), or a changeset naming the list loading states."
  - "src/pages/TagsPage.tsx, its stories, or a changeset naming TagsPage."
  - "src/widgets/BadgeCardRow.tsx, its stories, TagsPage's rows, or a changeset naming BadgeCardRow."
  - "src/widgets/TrailingActionsRow.tsx, src/widgets/Card.tsx, their stories, TagsPage's forms or rows, or a changeset naming any of them. (namely: TrailingActionsRow, Card, TagsPage)"
---

# TagsPage — manual test steps

Colocated manual test steps for `src/pages/TagsPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FormStack & TrailingActionsRow; Card's compact variant

Open in `Widgets/FormStack`: Default, FieldsWithActions;
`Widgets/TrailingActionsRow`: FieldAndAction,
ContentAndGhostButtons, Narrow; `Widgets/Card`: Compact.

1. FormStack: the form's fields stack at an even 12px rhythm
   with the button row last.
2. TrailingActionsRow FieldAndAction: the leading group sits
   at the left and the action at the right on one line.
   ContentAndGhostButtons: the badge sits left, Edit / Delete
   right, at a 12px gap between the actions. Narrow: when the
   groups cannot fit, the action wraps below the leading group
   instead of overflowing.
3. Card Compact: the surface is the small card treatment —
   12px padding, medium corners, small shadow, no border (the
   former CompactCard, folded into Card as `variant="compact"`
   under Stephen's 2026-10-29 ruling).

**Run when:** `src/widgets/FormStack.tsx`,
`src/widgets/TrailingActionsRow.tsx`,
`src/widgets/Card.tsx`, their stories, TagsPage's
forms or rows, or a changeset naming any of them.

## List states

Open in `Pages/Eciperay/DiscoverPage`: Loading,
LoadingMore.

1. The loading state is a centered Spinner (Center +
   Spinner) composed by the page: the spinner renders
   centered in its parent with its label; the state carries
   no padding or margin of its own — spacing around it is
   the parent's. The same composition renders directly at
   the foot of a list for the loading-more slot — check
   that rendering in `Pages/Eciperay/DiscoverPage`:
   LoadingMore, where the spinner follows the last card
   with the list's own gap.
2. A list's error state has no wrapper component: the page
   renders the Alert component directly — check in
   `Pages/Eciperay/DiscoverPage`: ErrorState, where the alert
   sits under the filter bar, flush to the parent's inset.

**Run when:** a catalog page's loading state (Discover,
Home, MealsHub, Recipes, ShoppingList, Tags), or a
changeset naming the list loading states.

## TagsPage

Open in `Pages/Eciperay/TagsPage`: WithTags, Loading, FailingSaves.

1. In the create form, the **name input and the color swatches never
   overlap** at the story width — the form stacks cleanly.
2. Existing tags render their color swatch and name on one line with
   even row spacing.
3. In FailingSaves (every save handler reports failure): the story
   opens with the "Couldn't create the tag" alert already showing
   (the create failure is seeded so static captures cover the
   error surface). Pressing **Add**, **Save** in the open editor,
   and **Delete** on another row each shows the error alert above
   the create form naming the failed operation ("Couldn't create
   the tag" / "Couldn't save the tag changes" / "Couldn't delete
   the tag"); the alert's dismiss (×) clears it.

**Run when:** `src/pages/TagsPage.tsx`, its stories, or a changeset
naming TagsPage.

## BadgeCardRow

Open in `Widgets/BadgeCardRow`: Default, DeleteOnly.

1. Default: a compact card (small padding and shadow) with
   the colored badge at the left and Edit / Delete as bare
   text actions at the right, Delete in the error treatment.
2. DeleteOnly: only the Delete action shows; the badge
   keeps its color and the row height is unchanged.

**Run when:** `src/widgets/BadgeCardRow.tsx`, its
stories, TagsPage's rows, or a changeset naming
BadgeCardRow.

## TrailingActionsRow; Card's compact variant

Open in `Widgets/TrailingActionsRow`: FieldAndAction,
ContentAndGhostButtons, Narrow; `Widgets/Card`: Compact.

1. FieldAndAction: the leading group sits at the left and
   the action at the right on one line.
   ContentAndGhostButtons: the badge sits left, Edit / Delete
   right, at a 12px gap between the actions. Narrow: when
   the groups cannot fit, the action wraps below the leading
   group instead of overflowing.
2. Card Compact: the surface is the small card treatment —
   12px padding, medium corners, small shadow, no border
   (the former CompactCard, folded into Card as
   `variant="compact"` under Stephen's 2026-10-29 ruling).

**Run when:** `src/widgets/TrailingActionsRow.tsx`,
`src/widgets/Card.tsx`, their stories, TagsPage's forms
or rows, or a changeset naming any of them.
