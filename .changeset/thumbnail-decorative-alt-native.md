---
"@spudly/ui": patch
---

Thumbnail: an unnamed (decorative) image is no longer exposed as an unlabeled accessibility element on native. The empty `alt` that keeps web screen readers from announcing a decorative image by filename is now applied on web only — React Native's Image turns any `alt` value into an accessible element carrying that label, so on native an unnamed Thumbnail previously appeared in the accessibility tree as a focusable element with an empty name (verified against the Android accessibility tree, #339). Named images (hero, banner, and row variants with an accessible name) are unchanged, and no consumer changes are needed. On a @spudly/ui bump, re-check in Storybook: Components/Thumbnail's Row story renders the 64px row thumbnail as before, and the Hero and Banner stories still render their named images.
