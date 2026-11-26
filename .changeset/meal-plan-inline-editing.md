---
"@spudly/ui": minor
---

MealPlanDetailPage gains optional inline editing for meal plans (eciperay #646, tranche 1): when a host passes the new editing handlers, each day gains "Add meal" and "Add recipe" buttons, meal entries gain "Add recipe" and "Delete meal" actions and render their recipe members with servings steppers and delete actions (labeled with the meal's shared-editing note), and recipe entries gain quantity and servings steppers plus a delete action — all unchanged when no handlers are passed. A new day view shows one day at a time with previous/next navigation. MealPlanFormPage's entries section is now optional: omitting the entry props renders a details-only form (title, notes, dates) whose save needs only a title, so a plan can be created empty and filled in on its view page.
