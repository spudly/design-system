---
"@spudly/ui": minor
---

Button: ghost is now a boolean prop that composes with the real variants — `<Button ghost />`, optionally with `variant="secondary"` or `variant="danger"`. A ghost button renders with a transparent background and no border, and its label and icon ink match its variant (primary buttons ink in the primary color, secondary in gray10, danger in danger7). The `variant="ghost"` value is deprecated (it still renders as before) and will be removed once host apps stop using it; DropdownButton accepts the same `ghost` prop. All design-system call sites and stories now use the prop.
