---
"@spudly/ui": patch
---

Fix web rendering under Tamagui v3: replace the Tamagui v2 `$platform-web` prop (removed in v3, where it was silently dropped with an "Invalid attribute name" React error) with v3 flat `web:` clauses in `ScreenContainer` and `TextLink`. The `ScreenContainer` scroll view now actually receives its web `display: flex`, `flex-direction: column`, and `min-height: 100%` styles instead of collapsing, and `TextLink` gets its web pointer cursor.
