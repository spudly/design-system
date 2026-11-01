---
"@spudly/ui": patch
---

TagsPage now surfaces save failures itself: when creating a tag, saving an inline tag edit, or deleting a tag fails (the handler returns `false` or rejects), TagsPage shows a dismissible error alert above the create form naming the operation that failed — "Couldn't create the tag", "Couldn't save the tag changes", or "Couldn't delete the tag" — instead of failing silently. The alert clears on the next successful operation or when dismissed. Existing hosts are unaffected: handlers that return nothing behave as before, and hosts that can report failure simply return `false` (or reject) from the existing `onCreate` / `onSaveEdit` / `onDelete` handlers. Test in Storybook (Pages/Eciperay/TagsPage, FailingSaves story): press Add, Save, and Delete and confirm the matching error alert appears and dismisses.
