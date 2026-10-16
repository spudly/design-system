---
"@spudly/ui": minor
---

App-migration styling primitives (Stage 1 of the Eciperay app styling migration):

- Button gains a `danger` variant for destructive actions, filled from the danger ramp at the step that keeps white label text WCAG AA.
- Card gains an appearance `variant` (`default` | `bordered` | `muted` | `elevated`); SectionCard inherits it through CardProps. The legacy `elevated` boolean still works and maps to `variant="elevated"`. Card colors move to the semantic `$surface`/`$border` theme tokens.
- ScreenContainer gains shell `variant`s (`default` | `padded` | `list` | `auth`) covering the app's screen shells.
- New ActionBar: a bordered, shadowed bar pinned to the top or bottom screen edge for primary actions.
- New TextLink: an inline semantic link for prose (primary color, medium weight, underlined, `accessibilityRole="link"`).
