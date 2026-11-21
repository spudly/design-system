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
LoadingOverlay, Unavailable, UnavailableRefreshing.

1. Ready: the "Per Serving" header with its Refresh action
   above a fixed black-on-white Nutrition Facts label — strong
   black border, large heavy "Nutrition Facts" title, serving
   lines, a very thick black bar, very large Calories, a
   right-aligned "% Daily Value*" column with bold primary
   nutrients and indented sub-nutrients (net carbs indented
   under the carbohydrate group with no %DV value), the
   vitamin/mineral block (Vitamin D, Calcium, Iron, Potassium)
   after a medium bar, and the standard %DV footnote inside
   the label; the app disclaimer sits below the panel in small
   muted text. The label renders black-on-white identically in
   light and dark themes.
2. Loading: skeletons mirroring the Ready label — a header
   bone, the bordered panel shape with title, serving, and
   calories bones, one label/value bone row per nutrient, and
   footnote and disclaimer bones; no nutrient values show.
   LoadingOverlay: the skeleton layer aligns with the Ready
   label's panel, blocks, and rows underneath it.
3. Unavailable: the not-available line with the Estimate
   nutrition action below it. UnavailableRefreshing: the
   action reads "Refreshing…" and renders disabled while
   the refresh is in flight.

**Run when:** `src/widgets/NutritionPanel.tsx`, its
stories, or a changeset naming NutritionPanel.
