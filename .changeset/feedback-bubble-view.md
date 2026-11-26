---
"@spudly/ui": minor
---

New `FeedbackBubbleView`, exported from the package root as a named exception: a floating feedback bubble plus its panel that hosts mount with their own feedback form as the panel's content and the open state as data. The bubble is a circular primary button named "Send feedback" (overridable via the `label` prop) that reports its expanded state; the stack pins to the viewport's bottom-right, and the panel renders as a raised card capped at 24rem wide. Verify after adopting: with the bubble mounted, the closed state shows only the bubble at the bottom-right; pressing it opens the panel with the host's form inside, and pressing it again closes the panel.
