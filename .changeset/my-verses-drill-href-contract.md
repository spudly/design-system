---
"@spudly/ui": patch
---

MyVersesPage: the `drillHref` contract is now documented on the page — the host owns a canonical drill destination for every verse (web hosts parse `/drill/:id`, native hosts handle their scheme's `drill/<id>` deep link, e.g. `memorize://drill/<id>`), and there is no callback form of the Drill control. No API change: `drillHref` was already required; hosts that pass an href their own routing ignores should add the destination handling host-side.
