---
"@spudly/ui": minor
---

RecipeDetailPage: replace the tab layout with a single scrollable page (#71). All five sections (overview, ingredients, instructions, cook history, nutrition) now render in one ScrollView in the order the tabs had, each section after the overview under its own heading. Breaking contract change: `activeTab` / `onTabChange` are removed from `RecipeDetailPageReadyProps` and the `RecipeDetailPageTab` type is no longer exported — the per-tab view-models are now section view-models with the same field names and callbacks, so app hosts drop their tab state and keep the rest of their mapping. The Eciperay app rewire follows in the app repo once this version is published.
