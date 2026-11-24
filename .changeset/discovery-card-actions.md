---
"@spudly/ui": minor
---

Discovery cards on the browse pages can now carry a per-card actions menu supplied by the host: `RecipesPageDiscoveryItem` (and `DiscoveryCard`) accept an optional `actions` array of `{ id, label, onSelect }` entries, rendered as an overflow menu on the card whose rows fire the host's callbacks. Cards without actions render exactly as before.
