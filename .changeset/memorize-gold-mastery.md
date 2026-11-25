---
"@spudly/ui": patch
---

Memorize's muted-gold accent (#b45309, the brief's progress/mastery color) is now wired into the mastery surfaces: Badge gains a `mastery` tone filled with the theme's semantic accent, Button gains an `accent` variant on the same role, MyVersesPage renders memorized verses with the mastery badge, and the memorization session's "Finish — mark memorized" action takes the accent variant. Generic progress keeps its existing treatment.
