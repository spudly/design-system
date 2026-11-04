---
"@spudly/ui": minor
---

MealPlanDetailPage gains an optional weekly totals / per-day averages band: when the caller passes the new `weeklyTotals` prop, the page renders a "Weekly totals" section beside the nutrition-goals section showing, for each nutrition field, a "Weekly total" row and a "Daily average" row with the caller-composed value labels (for example, Calories · Weekly total — 12,950 cal, paired with Calories · Daily average — 1,850 cal / day), verifiable in the MealPlanDetailPage WeeklyTotals story. When `weeklyTotals` is omitted, null, or empty, MealPlanDetailPage renders exactly as before — the existing summary line, nutrition-goals section, actions, and entries are unchanged — so hosts can test that supplying the band adds the section and omitting it leaves every existing state (Default, Empty, Loading, NoGoals, NutritionUnavailable) untouched.
