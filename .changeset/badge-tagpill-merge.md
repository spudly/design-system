---
"@spudly/ui": minor
---

Merge TagPill into Badge: Badge gains a `color` prop typed as a tag color token name (`TagColorName`, e.g. `color="blue"`) that renders it as a colored tag — surface tinted from the name's color in the active theme, label in that color — exactly as TagPill rendered, and the separate `TagPill` / `TagPillProps` exports are removed (use `<Badge color={...}>` instead). Tag colors stay named design-system tokens: a raw hex is not accepted. Tone badges are unchanged. TagsPage now renders its tag rows with Badge's colored-tag form. On a @spudly/ui bump, re-test tag rendering on TagsPage and anywhere tags are displayed.
