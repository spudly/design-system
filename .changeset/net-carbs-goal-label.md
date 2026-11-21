---
"@spudly/ui": major
---

NutritionGoalsForm: the carbs goal Min/Max fields are now labeled "Net carbs Min" / "Net carbs Max", because the carbs goal is a net carbs goal. Hosts supplying a voice object rename its `nutritionGoalsForm.carbsLabel` key to `nutritionGoalsForm.netCarbsLabel`; the goal value props (`carbsGMin` / `carbsGMax`) are unchanged.
