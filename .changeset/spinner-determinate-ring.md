---
"@spudly/ui": minor
---

Spinner gains a determinate mode: pass a `value` (0–100) and it renders a progress ring — the brand primary arc over the progress track color — instead of spinning, for waits whose progress is known (uploads, AI generation). Screen readers announce it as a progress bar with the current percentage, and the existing `size` (small/large/number) and `label` props apply to the ring as they do to the spinner. Spinners without a `value` are unchanged. On a @spudly/ui bump, re-check in Storybook: Components/Spinner's Determinate story shows a ring filled about two-thirds in the brand primary; DeterminateStates shows rings at 0/25/50/75/100 filling clockwise from the top (0 is the empty track only, 100 the full ring); DeterminateLarge shows the larger ring; Default and Large still spin.
