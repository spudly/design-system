---
component: StepOverlay
run_when:
  - src/widgets/StepOverlay.tsx, its stories, MealCookingModePage, or a changeset naming StepOverlay.
  - src/pages/CookingModePage.tsx, its stories, src/widgets/StepOverlay.tsx, src/views/ScaledIngredientsView.tsx, or a changeset naming CookingModePage.
---

# StepOverlay — manual test steps

Colocated manual test steps for `src/widgets/StepOverlay.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## StepOverlay

Open in `Widgets/StepOverlay`: Default, LongBody.

1. The dark overlay fills its frame: title and step eyebrows
   render uppercase and dimmed over the step body in large
   light text, and the translucent Done pill sits at the top
   right (focusable on web; Enter/Space activate it).
2. The story's dots and Back / Next row render below the body,
   composed by the caller — the controls are the caller's; the
   shell owns only the gap above them (its 32px body bottom
   padding).
3. On open (web), keyboard focus lands on the overlay itself:
   it announces as a modal dialog named for its title, and
   Tab moves through the controls inside it — Tab wraps from
   the last control back to the first and Shift+Tab wraps
   the other way, so focus never reaches content behind it.
4. LongBody: the long step body fills the short frame and the
   region scrolls — scroll to the bottom to reach the dots
   and the Back / Next row; the Done pill stays pinned at the
   top right at every scroll position, and the short Default
   body stays vertically centered.
5. Close and reopen (web): press Done — the overlay closes.
   Focus the "Reopen the overlay" button under the frame and
   activate it: the overlay reopens with focus inside it.
   Press Done again: the overlay closes and keyboard focus
   returns to the "Reopen the overlay" button.

**Run when:** `src/widgets/StepOverlay.tsx`, its stories,
MealCookingModePage, or a changeset naming StepOverlay.

## StepOverlay

Open in `Widgets/StepOverlay`: Default, LongBody.

1. The dark overlay fills its frame: title and step eyebrows
   render uppercase and dimmed over the step body in large
   light text, and the translucent Done pill sits at the
   top right (focusable on web; Enter/Space activate it —
   each activation adds to the "Done activated" line under
   the frame).
2. The story's dots and Back / Next row render below the
   body, composed by the caller, and walk the demo's three
   steps (Back disables on the first step, Next on the
   last) — the controls are the caller's; the shell owns
   only the gap above them (its 32px body bottom padding).
3. On open (web), keyboard focus lands on the overlay
   itself: it announces as a modal dialog named for its
   title, and Tab moves through the controls inside it —
   Tab wraps from the last control back to the first and
   Shift+Tab wraps the other way, so focus never reaches
   content behind it.
4. LongBody: the long step body fills the short frame and
   the region scrolls — scroll to the bottom to reach the
   dots and the Back / Next row; the Done pill stays
   pinned at the top right at every scroll position.
5. Close and reopen (web): press Done — the overlay
   closes. Focus the "Reopen the overlay" button under
   the frame and activate it: the overlay reopens with
   focus inside it. Press Done again: the overlay closes
   and keyboard focus returns to the "Reopen the overlay"
   button.

**Run when:** `src/widgets/StepOverlay.tsx`, its
stories, MealCookingModePage, or a changeset naming
StepOverlay.

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
