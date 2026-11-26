---
component: FeedbackBubbleView
run_when:
  - "src/views/shared/FeedbackBubbleView.tsx or its stories."
---

# FeedbackBubbleView — manual test steps

Colocated manual test steps for `src/views/shared/FeedbackBubbleView.tsx` (design-system #876).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## FeedbackBubbleView

Open in `Views/Shared/FeedbackBubbleView`: Closed; and Open.

1. Closed: only the circular primary bubble button renders,
   pinned to the bottom-right of the viewport (clear of the
   bottom edge), carrying the feedback glyph and the
   accessible name "Send feedback".
2. Open: the panel renders above the bubble as a raised card
   capped at 24rem wide, holding the slotted feedback form
   content; the bubble reports the expanded state.
3. Pressing the bubble toggles the panel open and closed.

**Run when:** `src/views/shared/FeedbackBubbleView.tsx` or
its stories.
