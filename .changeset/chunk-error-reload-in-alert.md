---
"@spudly/ui": patch
---

ChunkErrorBoundary: the failure state now shows its "Reload the app" button inside the error Alert at content width, instead of as a full-width button under the Alert. Testable terms: in the ChunkErrorBoundary FailedToLoad story (and on any LazySlot-backed page whose chunk fails to load after a deploy), the error Alert itself contains a "Reload the app" button at its right side, sized to its label; pressing it still reloads the app exactly as before, and where no recovery action exists no button appears.
