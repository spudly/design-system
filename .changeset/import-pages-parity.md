---
"@spudly/ui": patch
---

Import pages accessibility and Enter-to-submit parity fixes (#254): ImportReviewPage gains an optional `imageAlt` prop — hosts pass the recipe title and the hero image now carries it as its accessible name (alt text on web, accessibility label on native) instead of having no name at all. ImportTextPage's paste field is announced as "Recipe text" (the retired web editor's accessible name) instead of only a placeholder. ImportUrlPage now submits when Enter is pressed in the URL field, guarded exactly like its Import button (a non-blank URL, not already loading). On a @spudly/ui bump, re-check in Storybook: Pages/Eciperay/ImportTextPage's field is findable by the accessible name "Recipe text"; Pages/Eciperay/ImportUrlPage's Filled story accepts Enter in the URL field as a submit; and an ImportReviewPage rendered with `imageAlt` exposes that text as the hero image's accessible name, with no image rendered nameless.
