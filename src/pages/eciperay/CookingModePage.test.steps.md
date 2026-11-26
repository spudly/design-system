---
component: CookingModePage
run_when:
  - "src/pages/eciperay/CookingModePage.tsx, its stories, src/widgets/overlays/StepOverlay.tsx, src/views/eciperay/ScaledIngredientsView.tsx, or a changeset naming CookingModePage."
  - "src/views/eciperay/ScaledIngredientsView.tsx, its stories, CookingModePage, or a changeset naming ScaledIngredientsView."
---

# CookingModePage — manual test steps

Colocated manual test steps for `src/pages/eciperay/CookingModePage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CookingModePage

Open in `Pages/Eciperay/CookingModePage`: WithIngredientsPanel,
FirstStep, LastStep, NoFooter, CookLogFormOpen.

1. WithIngredientsPanel: the scaled-ingredients panel renders
   between the "Step 2 of 3" label and the step body — heading
   line plus the four ingredient lines on the translucent
   panel, readable against the dark overlay.
2. NoFooter (#729, reframed by #752): the page takes no
   footer prop at all — the dark overlay covers the full
   viewport, and step body, ingredients panel, Done pill,
   and nav controls are all visible and reachable, nothing
   covered by a cream layer.
3. FirstStep: no Back control renders (the nav shows only
   Next); LastStep: the Next control renders disabled and Back
   is present.
4. The progress dots track the step (second dot active in
   WithIngredientsPanel, first in FirstStep, third in LastStep).
5. CookLogFormOpen (#871): the dark RatingForm renders centered
   on the dark overlay in place of the step view — title, stars,
   notes field, and Skip/Save actions visible and reachable, no
   step label/body/nav and no Done pill. (The Save disabled-look
   while pending is covered by RatingForm's own steps.)

**Run when:** `src/pages/eciperay/CookingModePage.tsx`, its stories,
`src/widgets/overlays/StepOverlay.tsx`, `src/views/eciperay/ScaledIngredientsView.tsx`,
or a changeset naming CookingModePage.

## ScaledIngredientsView

Open in `Views/ScaledIngredientsView`: OnOverlay.

1. The panel renders on the dark surface with its heading and
   five ingredient lines readable. The story's line set is
   fixed at five, so the scrolls-inside-the-panel behavior
   for longer lists is not exercised by this story.

**Run when:** `src/views/eciperay/ScaledIngredientsView.tsx`, its
stories, CookingModePage, or a changeset naming
ScaledIngredientsView.

## CookingModePage loading skeleton (#874)

Open in `Pages/Eciperay/CookingModePage`: Loading.

1. Loading: no step label, step body, or nav controls render —
   a title bone, a step-label bone, and four body-line bones
   stand in for them inside the full-screen shell, even though
   the story passes no steps.

**Run when:** CookingModePage's source or stories, or a
changeset naming CookingModePage's loading state.
