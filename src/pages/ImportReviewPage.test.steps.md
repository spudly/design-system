---
component: ImportReviewPage
run_when:
  - src/pages/ImportTextPage.tsx, src/pages/ImportUrlPage.tsx, src/pages/ImportReviewPage.tsx, their stories, or a changeset naming the import pages.
  - src/widgets/PreviewCard.tsx, its stories, AiSessionPage, ImportReviewPage, or a changeset naming PreviewCard.
---

# ImportReviewPage — manual test steps

Colocated manual test steps for `src/pages/ImportReviewPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Import pages (ImportTextPage, ImportUrlPage, ImportReviewPage)

Open in `Pages/Eciperay/ImportTextPage`: Empty, WithError.
Open in `Pages/Eciperay/ImportUrlPage`: Filled, Interactive.
Open in `Pages/Eciperay/ImportReviewPage`: Ready, WithImage.

1. ImportTextPage: the paste field is findable by the accessible
   name "Recipe text" (Storybook accessibility panel or DOM
   `aria-label`), not only by its "Paste your recipe here…"
   placeholder. The Import button stays disabled on blank text.
2. ImportUrlPage (Interactive): pressing Enter in the URL field
   increments the "Submitted N times" counter, exactly like
   pressing the Import button; clear the field first and Enter
   does nothing (the counter does not move).
3. ImportReviewPage (WithImage): the render passes `imageAlt`
   (hosts pass the recipe title), which Thumbnail exposes as
   the hero image's accessible name — `role="img"` with an
   `aria-label` on web, the accessibility label on native; the
   Ready render, which passes no image, shows no image at all.

**Run when:** `src/pages/ImportTextPage.tsx`,
`src/pages/ImportUrlPage.tsx`, `src/pages/ImportReviewPage.tsx`,
their stories, or a changeset naming the import pages.

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
