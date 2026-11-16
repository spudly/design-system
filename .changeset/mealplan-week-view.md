---
"@spudly/ui": minor
---

MealPlanDetailPage can now show a plan as a week — one column per day with that day's entries and its calorie, protein, carb, fat, and satiety totals below the day — when the host supplies the new optional `weekView` prop (`{ days: [{ id, label, dateLabel?, entries, dailyTotals, satietyLabel? }] }`, days pre-grouped and totals pre-computed from servings eaten by the host). Without `weekView` (or with an empty day list) the page renders its flat entry list exactly as before, and the weekly-totals band is unchanged.
