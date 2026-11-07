---
"@spudly/ui": patch
---

Dropdown: an open dropdown now reads as one connected surface with its trigger. Open a Dropdown (the Dropdown stories' InitiallyOpen, WidePanelShortButton, and WideButtonShortPanel stories show it): the panel and the DropdownButton lose their border radius exactly where they touch — the corner at the aligned edge always, and each element's far corner whenever its far edge actually lands on the other element. When the button is wider than the panel (a long button label over short rows), the panel squares both of its top corners and the button's overhanging bottom corner keeps its rounding; when the panel is wider (long menu rows), the button squares both of its bottom corners and the panel's overhanging top corner keeps its rounding; at the same width all four touching corners square. A corner that touches nothing keeps its normal rounding instead of showing a squared notch. Closed, the button keeps its full rounding as before.
