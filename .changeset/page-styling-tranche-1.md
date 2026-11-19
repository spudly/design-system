---
"@spudly/ui": patch
---

ProfilePage, HomePage, and AiSessionPage no longer apply styling directly (#119 tranche 1): ProfilePage's legal links render in the new LinkStack, HomePage's loading recipe rows render as the new LoadingCardRow, and AiSessionPage's transcript renders as the new ChatTranscript. Rendering is unchanged.
