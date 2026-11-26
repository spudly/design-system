---
"@spudly/ui": minor
---

ProfilePage gains three section data props (#873): `authorDisplay`, `familySharing`, and `showLess`, rendered at the before-feedback position in the host's order (show-less, author display, family sharing). Each section is a new DS view — AuthorDisplayView (display-name field, hint, and show-my-name checkbox over whole-settings changes), FamilySharingView (designate-by-email form plus the current grants as rows with Remove actions), and ShowLessView ("show less like this" entries with Undo actions) — composed from SectionCard and the shared form widgets, with their copy in new voice slots (`authorDisplayView`, `familySharingView`, `showLessView`) that hosts can override per prop. Hosts now supply only data and handlers for these sections and no longer render their own profile section UI.
