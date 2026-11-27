---
"@spudly/ui": minor
---

AiSessionPage renders a skeleton loading state (#874, following the #278 pattern), so hosts can mount the AI session page before the session it will start resolves instead of gating the screen on a spinner. AiSessionPage gains an optional `loading` prop: while loading, it renders bones in the start view's at-rest shape — the heading's title and intro lines, the prompt area as one tall box, and the action row's button box — and no controls render. AiSessionPage gains a `Loading` story pinning the state. Verify after adopting: passing `loading` to AiSessionPage shows the start view as skeleton bones with no prompt field, transcript, or buttons, and omitting it renders the page exactly as before. This is a partial tranche of #874 — the remaining pages without skeleton states are inventoried in the pull request's audit table and follow in a later tranche.
