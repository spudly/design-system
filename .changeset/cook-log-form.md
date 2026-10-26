---
"@spudly/ui": minor
---

Add the standalone CookLogForm component (issue #126, contract
option A): the "How did it go?" star-rating and notes form as one
design-system component, replacing the copies previously carried
by app hosts and page slots. The rating and notes are internal
uncontrolled state; only the submit view-model crosses the
boundary (`onSubmit({ authorStarRating, notes })`, with empty
notes crossing as null), alongside `onSkip`, `isPending`, a
`variant` for light surfaces or the dark cooking-mode overlay,
and a customizable `secondaryLabel`. It reuses StarRatingInput
as-is — no contract change.
