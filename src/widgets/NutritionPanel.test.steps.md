---
component: NutritionPanel
run_when:
  - "src/widgets/NutritionPanel.tsx, its stories, or a changeset naming NutritionPanel."
---

# NutritionPanel — manual test steps

Colocated manual test steps for `src/widgets/NutritionPanel.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## NutritionPanel

Open in `Widgets/NutritionPanel`: Ready, Loading,
Unavailable, UnavailableRefreshing.

1. Ready: the "Per Serving" header with its Refresh action,
   one hairline label/value row per nutrient, and the
   disclaimer in small muted text below.
2. Loading: a single "Estimating nutrition…" line.
3. Unavailable: the not-available line with the Estimate
   nutrition action below it. UnavailableRefreshing: the
   action reads "Refreshing…" and renders disabled while
   the refresh is in flight.

**Run when:** `src/widgets/NutritionPanel.tsx`, its
stories, or a changeset naming NutritionPanel.
