---
component: Alert
run_when:
  - "src/widgets/Alert.tsx, its stories, or a changeset naming Alert."
---

# Alert — manual test steps

Colocated manual test steps for `src/widgets/Alert.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Alert

Open in `Widgets/Alert`: Info, Success, Warning, Error,
Dismissible, DismissibleWarning, WithActions. (This section
covered DismissibleBanner and InlineAlert until both were
consolidated into Alert; the checks below are theirs, retargeted
at the unified component's stories.)

1. Dismissible / DismissibleWarning: the dismiss (×) glyph
   renders **large and clearly visible** (2xl class), centered
   in its 44px touch target — not a tiny × in the corner.
2. Dismissible / DismissibleWarning: pressing the dismiss
   target fires the dismiss callback — the stories count
   activations, so each press increments the "Dismiss
   activated (N)" line under the alert. Alert does not hide
   itself (visibility is the host's state), so the alert
   stays mounted; the counter is what verifies the callback
   fired, with no layout shift around the alert.
3. WithActions: the action buttons sit clear of the dismiss
   target and the message text; nothing overlaps at the story
   width.
4. Info / Success / Warning / Error: each severity's icon/text
   treatment is distinguishable and the message is readable
   against its background in all four stories.

**Run when:** `src/widgets/Alert.tsx`, its stories, or a
changeset naming Alert.
