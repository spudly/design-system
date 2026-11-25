---
"@spudly/ui": minor
---

Empty and error states now offer recovery actions (#856): Alert renders a severity icon (new Feather check-circle, alert-circle, and info icons, registered as "success", "error", and "info") in the severity's text ink alongside its message, so severity never rides on color alone; EmptyState gains an optional `icon` and a link-form `actionHref` action alongside its callback action. MemorizeReviewPage's nothing-due state and MyVersesPage's no-verses state accept optional host hrefs (`browseHref` / `searchHref`) for their empty-state CTAs, VerseSearchPage's error alert gains a Retry action and its no-results state a "Clear search" action, FeedbackPage's submitted state renders as a success Alert with an optional "Send more feedback" reset action (`onResetPress`), and PayPage's error state renders through Alert while its unconfigured state reuses the `homeHref` home button.
