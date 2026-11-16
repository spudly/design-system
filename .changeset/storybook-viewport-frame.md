---
"@spudly/ui": patch
---

Storybook story harness: page stories now render in a viewport-driven frame (phone/wide/desktop/full, selectable in the toolbar, with a per-story default frame parameter) instead of a fixed 430px phone frame — on both the web and on-device previews — and view stories share one StoryFrame component with named frame variants — no library component behavior changes.
