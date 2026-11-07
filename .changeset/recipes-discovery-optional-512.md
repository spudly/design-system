---
"@spudly/ui": minor
---

RecipesPage: the discovery section is now host-optional. A host that passes no `discoveryRecipes` gets a RecipesPage with no Discover heading, no discovery loading/error/empty rows, and inert discovery pagination — own-recipes surfaces render only their own section. Hosts that pass the discovery props see no change.
