---
"@spudly/ui": patch
---

TagsPage now honors per-row Edit/Delete eligibility: a host can mark a tag `canEdit: false` and/or `canDelete: false` on the `TagsPageTag` data, and that tag's row renders without the corresponding action (an edit-ineligible row also never opens the inline editor). Tags carrying neither flag behave exactly as before: when the host supplies `onStartEdit`, both actions render; without it, only Delete renders. A host can still show the inline editor by supplying `editingTagId` for an eligible tag. This lets hosts that serve read-only preset tags alongside caller-owned tags stop offering Edit/Delete controls the server would reject. On a @spudly/ui bump, re-check: in Storybook (Pages/Eciperay/TagsPage, WithTags story) the preset-style row shows its badge with no Edit or Delete action, while the other rows still offer both, and starting an edit on an eligible row still opens the inline editor.
