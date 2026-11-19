---
"@spudly/ui": major
---

BigFooter: removed the brand `logo` render slot. Logos are owned by the design system — the brand anchor always renders the DS-owned text wordmark, and brand identity reaches the footer as data only (the brand `label` and `href`). Hosts that passed a logo element should remove it; the wordmark renders in its place.
