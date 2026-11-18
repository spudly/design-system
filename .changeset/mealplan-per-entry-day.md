---
"@spudly/ui": minor
---

MealPlanFormPage now renders an optional per-entry Day field for each selected entry — a date input on web and text entry on native, with the same YYYY-MM-DD value contract as the plan's Starts on / Ends on fields — driven by the new optional `dayByKey` / `onDayChange` props, so a day (or blank for no day) can be set independently for every meal and recipe entry; hosts that don't pass the props render exactly as before with no day fields.
