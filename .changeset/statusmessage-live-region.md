---
"@spudly/ui": patch
---

StatusMessage: transient action confirmations (e.g. RecipeDetailPage's action message) are now announced to screen readers via a polite live region — role="status" on web, accessibilityLiveRegion="polite" on native — that stays mounted even while no message is showing, so the message announces when it appears. Its ink is now the theme-aware $textMuted token instead of fixed gray7, raising its contrast on dark surfaces from ~1.94:1 to 6.00:1 (AA in every theme, light and dark). RecipeDetailPage renders StatusMessage unconditionally for its action message.
