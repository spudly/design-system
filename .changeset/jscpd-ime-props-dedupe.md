---
"@spudly/ui": patch
---

Internal refactor with no visual or behavior change: SearchField and TextField now receive the IME composition and submit-editing prop spreads from the shared useImeCompositionGuard hook instead of each building the identical spread pair inline, so both fields keep behaving exactly as before when a user confirms an IME composition candidate with Enter.
