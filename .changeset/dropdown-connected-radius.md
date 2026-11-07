---
"@spudly/ui": patch
---

Dropdown: an open dropdown now reads as one connected surface with its trigger. Open a Dropdown (the Dropdown stories' InitiallyOpen, WidePanelShortButton, and WideButtonShortPanel stories show it): the panel and the DropdownButton lose their border radius exactly where they touch — the corner at the aligned edge always, and the far corner only when the panel and the button are the same width. When the panel is wider than the button (long menu rows) or narrower (a long button label over short rows), the corner that touches nothing keeps its normal rounding instead of showing a squared notch. Closed, the button keeps its full rounding as before.
