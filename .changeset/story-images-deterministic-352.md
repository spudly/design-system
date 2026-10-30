---
"@spudly/ui": patch
---

Story images are deterministic (issue #352): the Thumbnail, Avatar, and ImportReviewPage stories no longer fetch their photos from picsum.photos — they render small inline placeholder images (a warm plated-dish drawing, committed in `src/storyFixtures.ts`), so the image is in the same load state on every capture instead of racing the network. On a @spudly/ui bump, re-check in Storybook: Components/Thumbnail's Hero and Banner stories show the placeholder wide image cover-cropped in each shape and its Row story shows the square placeholder in the 64px row frame; Components/Avatar's WithImage story shows the square placeholder as the avatar photo; Pages/Eciperay/ImportReviewPage's WithImage story shows the wide placeholder as the banner above the preview frame.
