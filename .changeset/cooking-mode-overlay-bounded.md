---
"@spudly/ui": patch
---

CookingModePage and MealCookingModePage: the step view now fills the viewport on web when the host supplies no footer data. The pages' shell gained an "overlay" mode that bounds the content region to the viewport (with or without footer data), so the step overlay renders visibly in the host composition that passes no `footer` — previously the step content was present but covered/invisible. Hosts need no changes; `footer` stays optional.
