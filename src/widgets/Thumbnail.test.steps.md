---
component: Thumbnail
run_when:
  - "src/widgets/Thumbnail.tsx, its stories, the recipe pages' imagery or the import review's preview, or a changeset naming Thumbnail."
---

# Thumbnail — manual test steps

Colocated manual test steps for `src/widgets/Thumbnail.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Thumbnail

Open in `Widgets/Thumbnail`: Hero, Banner, Row.

1. Hero: the image fills its recessed light-gray frame 256px
   tall with large rounded corners, cover-cropped at full story
   width — a portrait image fills the frame with no pale side
   bands (#573).
2. Banner: the image fills the full width at 192px tall,
   cover-cropped, with large rounded corners and no frame.
3. Row: a 64px square image, cover-cropped, medium rounded
   corners, over the hint line.

**Run when:** `src/widgets/Thumbnail.tsx`, its stories, the
recipe pages' imagery or the import review's preview, or a
changeset naming Thumbnail.
