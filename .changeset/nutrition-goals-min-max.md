---
"@spudly/ui": major
---

NutritionGoalsForm now mirrors Eciperay's min/max nutrition-goal ranges (#607, companion to eciperay #521): NutritionGoalsValues replaces its five scalar fields (calories, proteinG, carbsG, fatG, satietyScore) with ten flat min/max fields (caloriesMin/caloriesMax, proteinGMin/proteinGMax, carbsGMin/carbsGMax, fatGMin/fatGMax, satietyScoreMin/satietyScoreMax, each number | null), the form renders a Min and a Max input per goal (ten fields, blank = null, same parse/format behavior), and its loading skeleton covers all ten fields. The nutritionGoalsForm voice gains minLabel and maxLabel slots, composed with each goal's existing label (e.g. "Calories min"); apps must supply the two new slots through VoiceProvider and pass goals in the new min/max shape. Test it by opening ProfilePage or the NutritionGoalsForm stories (Filled, WithError, Loading, LoadingOverlay) and confirming each goal shows min and max fields with the fixture range values.
