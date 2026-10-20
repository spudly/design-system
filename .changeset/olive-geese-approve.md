---
"@spudly/ui": patch
---

Fix two Android crashes from Tamagui v3 umbrella-component skins leaking bare token names into native props (spudly/eciperay#150). `SelectField` now pins a numeric `fontSize` on its styled select value and item-text frames: the umbrella Select skin's "md" size variant sets `fontSize: "sm"`, which never resolves against this package's number-keyed font size scale (1–8) and reached the native text view as a string, throwing ClassCastException (String -> Double) on mount. `SearchField`'s inner input likewise pins `borderRadius` to the numeric zero token instead of inheriting the umbrella Input skin's unresolved "md" radius string — the durable home for the stopgap pin the eciperay app/web wrappers added in spudly/eciperay#153.
