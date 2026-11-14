---
"@spudly/ui": patch
---

RatingForm: the dark variant's tint layer is unchanged in rendering — the form shell, notes field, and secondary action still show the theme surface at 10% opacity over the dark chrome, and the light variant still shows no tint layer. Testable: open the RatingForm stories in both variants — the dark form's three tinted surfaces look exactly as before and the light form is untinted.
