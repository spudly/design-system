---
"@spudly/ui": patch
---

AutocompletePicker: a failed search now shows its error inside an error Alert (consistent with the other form-field error surfaces) instead of as bare error text. Testable: trigger a failed search in the AutocompletePicker Search Error story — the message appears in the Alert box.
