---
component: ChatTranscript
run_when:
  - "src/widgets/content/ChatTranscript.tsx, its stories, the pages that compose ChatTranscript (AiSessionPage), or a changeset naming ChatTranscript."
---

# ChatTranscript — manual test steps

Colocated manual test steps for `src/widgets/content/ChatTranscript.tsx` (design-system #119).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ChatTranscript

Open in `Widgets/ChatTranscript`: Default.

A ChatTranscript is the message bubbles of a two-party
conversation.

1. The other party's bubbles sit inset from the right with the
   primary-subtle surface; the user's own bubble sits inset
   from the left with the neutral gray surface. Each bubble
   shows its author label over the message body, and the
   bubbles stack with a 12px rhythm (AiSessionPage's session
   transcript is the live case).

**Run when:** `src/widgets/content/ChatTranscript.tsx`, its stories,
the pages that compose ChatTranscript (AiSessionPage), or a
changeset naming ChatTranscript.
