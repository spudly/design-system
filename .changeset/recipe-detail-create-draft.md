---
"@spudly/ui": minor
---

RecipeDetailPage gains a create-a-draft action in its overview (#357): hosts can now pass an optional `onCreateDraftPress` callback, offered when there is no `editDraftHref`. When a recipe (for example a Perfected recipe whose active version is locked) has no existing draft, the overview now shows the "Edit draft" button in its callback form — pressing it lets the host create a draft version and then open the new draft in the version editor. When a draft already exists, nothing changes: "Edit draft" remains the `editDraftHref` link to that draft, and the create callback does not render. On a @spudly/ui bump, re-check in Storybook: Pages/Eciperay/RecipeDetailPage's CreateDraft story shows a Perfected recipe whose "Edit draft" renders as a button (not a link on web), and the Default story's "Edit draft" remains a link to the existing draft.
