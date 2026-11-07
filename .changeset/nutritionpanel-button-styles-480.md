---
"@spudly/ui": patch
---

Button no longer accepts background or color styling props: its label ink comes only from its variant and its new semantic tone. NutritionPanel's Estimate action now renders as a primary Button and its Refresh action as a plain secondary Button. A secondary Button with tone="danger" renders the tinted danger treatment (pale danger fill, darker danger ink) that CardRow's danger action and LogEntryCard's Delete button previously passed in as styling props, so those actions look the same. Test: open the NutritionPanel stories — Unavailable shows a primary-filled "Estimate nutrition" button, Ready shows a plain light-gray "Refresh" button; open the CardRow and LogEntryCard stories and confirm the danger actions still render with the pale danger fill and darker danger text; open the Alert Dismissible story and confirm the dismiss × still renders in the alert's own severity color.
