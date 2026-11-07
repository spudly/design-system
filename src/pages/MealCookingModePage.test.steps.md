---
component: MealCookingModePage
run_when:
  - src/widgets/StepOverlay.tsx, its stories, MealCookingModePage, or a changeset naming StepOverlay.
  - any of the five pages' sources or stories, or a changeset naming any of them. Run only the numbered cases for the page(s) that changed.
---

# MealCookingModePage — manual test steps

Colocated manual test steps for `src/pages/MealCookingModePage.tsx` (design-system #530).
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

## Meals & planning pages (MealDetailPage, MealsHubPage, ShoppingListPage, HomePage, MealCookingModePage)

Open in `Pages/Eciperay/MealDetailPage`: Default,
NoNotesOrNutrition; `Pages/Eciperay/MealsHubPage`: Default,
PlansTab, Empty; `Pages/Eciperay/ShoppingListPage`: Default,
Loading, Empty; `Pages/Eciperay/HomePage`: WithRecipes, Empty,
Loading; `Pages/Eciperay/MealCookingModePage`: Default,
FirstStep, LastStep, LoadError.

1. MealDetailPage Default: xl bold title, muted notes and
   nutrition lines, Cook meal / Edit side by side, then the
   Recipes card whose member rows link (title over its meta
   line); an unavailable member would show its
   " (unavailable)" suffix and not link. NoNotesOrNutrition
   drops the two muted lines with no leftover gaps.
2. MealsHubPage Default: Meals title over the tab bar, the
   full-width New meal button, then meal cards at an even 8px
   rhythm, each card's Delete a bare text action at its right
   edge. PlansTab: the same chrome stays pinned above the
   plans list. Empty: the empty state replaces the list.
3. ShoppingListPage Default: each line's box, bold name, and
   muted quantity / "optional" segments render on one line;
   checking a line fills its box and strikes the line through.
   Loading shows the spinner under the title; Empty shows the
   empty state.
4. HomePage WithRecipes: hero title, centered muted subtitle,
   three full-width buttons, then the section title over the
   host-rendered rows at the rows' own rhythm. Loading centers
   the spinner under the section title; Empty centers the
   empty message there.
5. MealCookingModePage: the dark overlay covers the frame —
   uppercase meal title and "Step N of M · recipe" eyebrows
   over the step body, Done pill at the top right, dots and
   Back / Next below. FirstStep has no Back; LastStep disables
   Next.
6. MealCookingModePage LoadError: no overlay and no step UI —
   the meal title over an error alert reading "Couldn't load
   the cook plan for this meal. Please try again.", with a
   Done button below it as the way out.

**Run when:** any of the five pages' sources or stories, or a
changeset naming any of them. Run only the numbered cases for
the page(s) that changed.

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
