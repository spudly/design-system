---
"@spudly/ui": patch
---

Fix the Android crash `JSApplicationIllegalArgumentException: Invalid accessibility role value: "status"` (spudly/eciperay#156). `status` is a web ARIA live-region role, not a valid React Native `accessibilityRole`. `InlineAlert` (info/success), `Toast`, `DismissibleBanner`, and `SecretRevealPanel` now announce through a platform split: `role="status"` on web only, `accessibilityLiveRegion="polite"` on native (`InlineAlert`'s error/warning severities keep the cross-platform-valid `accessibilityRole="alert"`). The same defect class is fixed in `Avatar` (`accessibilityRole="img"` → `"image"`) and in `NumberStepper`/`ColorPickerField` (`accessibilityRole="group"` → web-only `role="group"`). A new regression test pins that no component in the package passes an `accessibilityRole` outside React Native's supported set.
