---
"@spudly/ui": minor
---

Catalog search can now explain its own syntax: the new SearchHelpPopover widget renders a "Search syntax" button (help icon plus label) beside the search field that opens a popover listing the host's search qualifiers and operators, and CatalogFiltersBar and RecipesPage (signed-in and public) accept optional `searchHelp` content and a `searchHint` line under the search field. Hosts that pass neither prop render exactly as before.
