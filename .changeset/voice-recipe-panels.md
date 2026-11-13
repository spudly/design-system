---
"@spudly/ui": major
---

RecipeOverviewPanel and RecipeIngredientsPanel now read their panel labels from the app-supplied voice object instead of hard-coded strings, as tranche 1e of the voice-as-theme system (#539): the overview stat band's Servings/Prep/Cook labels, and the ingredients panel's Servings/Scale labels, Custom scale label and accessible name, servings stepper accessible names, missing-ingredients hint, finding-substitutions status, and Substitutions title. Apps must supply the new recipeOverviewPanel and recipeIngredientsPanel voice slots through VoiceProvider; Storybook's fixture voice carries the same strings the panels previously hard-coded, so rendered output is unchanged.
