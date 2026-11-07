---
component: CookingModePage
run_when:
  - src/pages/CookingModePage.tsx, its stories, src/widgets/StepOverlay.tsx, src/views/ScaledIngredientsView.tsx, or a changeset naming CookingModePage.
  - src/views/ScaledIngredientsView.tsx, its stories, CookingModePage, or a changeset naming ScaledIngredientsView.
---

# CookingModePage — manual test steps

Colocated manual test steps for `src/pages/CookingModePage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## CookingModePage

Open in `Pages/Eciperay/CookingModePage`: WithIngredientsPanel,
FirstStep, LastStep.

1. WithIngredientsPanel: the scaled-ingredients panel renders
   between the "Step 2 of 3" label and the step body — heading
   line plus the four ingredient lines on the translucent
   panel, readable against the dark overlay.
2. FirstStep: no Back control renders (the nav shows only
   Next); LastStep: the Next control renders disabled and Back
   is present.
3. The progress dots track the step (second dot active in
   WithIngredientsPanel, first in FirstStep, third in LastStep).

**Run when:** `src/pages/CookingModePage.tsx`, its stories,
`src/widgets/StepOverlay.tsx`, `src/views/ScaledIngredientsView.tsx`,
or a changeset naming CookingModePage.

## ScaledIngredientsView

Open in `Views/ScaledIngredientsView`: OnOverlay.

1. The panel renders on the dark surface with its heading and
   five ingredient lines readable; with more lines than fit,
   the list scrolls inside the panel instead of growing it.

**Run when:** `src/views/ScaledIngredientsView.tsx`, its
stories, CookingModePage, or a changeset naming
ScaledIngredientsView.
