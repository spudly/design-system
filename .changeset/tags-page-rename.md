---
"@spudly/ui": minor
---

TagsPage: tags can now be renamed and recolored in place. Each tag row gains an Edit action (when the host supplies the edit callbacks); choosing it swaps the row for an inline form pre-filled with the tag's current name and color, with Save and Cancel actions — so on the Tags page a user can create a tag, rename it, change its color, and delete it without deleting and recreating it.
The edit form is controlled by the host screen, mirroring the create form: the host seeds the draft from the tag, holds it while the user types, and applies it on save.
