---
"@spudly/ui": patch
---

AppTopBar (used by AppShellPage): on web, each nav item's icon is now centered over its label. The glyph and label render in a centered column stack inside the nav link instead of as inline children of the anchor, which left each icon offset to the left of its label's center by an amount that varied with label width. Test it by opening the AppTopBar PhoneWidthNav stories (390px and 430px) and confirming every nav glyph — including Profile on the wrapped second row, active and inactive items alike — sits centered over its label.
