---
"@spudly/ui": minor
---

SearchRow is removed — it duplicated FieldRow except for one alignment difference, so the two are consolidated into FieldRow, which now stretches its action to the field's height. Every field-and-action row is affected: the catalog filter bar's search row (CatalogFiltersBar, on the Discover and Recipes pages), VerseSearchPage's search row, and any other page composing FieldRow. Test: open the Widgets/FieldRow Default and SmallAction stories and confirm the action (the Search button; the small Filters button) is exactly the search field's height with no gap above or below it; open the CatalogFiltersBar stories and confirm the Filters button lines up with the search field as one bar; open VerseSearchPage and confirm its Search button matches the field's height.
