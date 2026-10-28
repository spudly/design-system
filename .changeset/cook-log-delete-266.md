---
"@spudly/ui": minor
---

RecipeDetailPage Cook History: each cook log entry now renders a Delete button when the host passes the new optional `onDeleteCookLogPress` callback (the entry's id is reported; confirmation and the delete itself stay app-side). Hosts that omit the callback keep a read-only history, unchanged. On a @spudly/ui bump, re-test: open a recipe's Cook History, delete one of your own cook log entries, and confirm the entry disappears; recipes whose host passes no delete callback show no Delete button.
