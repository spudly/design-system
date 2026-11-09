---
component: AiSessionPage
run_when:
  - "src/pages/AiSessionPage.tsx, its stories, or a changeset naming AiSessionPage."
  - "src/widgets/PreviewCard.tsx, its stories, AiSessionPage, ImportReviewPage, or a changeset naming PreviewCard."
---

# AiSessionPage — manual test steps

Colocated manual test steps for `src/pages/AiSessionPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## AiSessionPage

Open in `Pages/Eciperay/AiSessionPage`: Start, Planning, PreviewReady.

1. Start: the Cancel button is a **ghost (text-only) button with a
   readable label** — never a filled button whose label clashes with
   the fill. The Refine plan button in Planning follows the same
   treatment.
2. PreviewReady renders the plan preview with all sections visible
   and no clipped footer actions.

**Run when:** `src/pages/AiSessionPage.tsx`, its stories, or a
changeset naming AiSessionPage.

## PreviewCard

Open in `Widgets/PreviewCard`: Default, NoTitle,
NoActions.

1. Default: the title heads the framed preview in its own
   treatment, the preview content follows, and the actions
   sit below the content inside the card — the frame is the
   fixed gray3 hairline on the surface fill.
2. NoTitle: no title block renders; the content starts at
   the card's inset.
3. NoActions: no actions row renders below the content.

**Run when:** `src/widgets/PreviewCard.tsx`, its stories,
AiSessionPage, ImportReviewPage, or a changeset naming
PreviewCard.
