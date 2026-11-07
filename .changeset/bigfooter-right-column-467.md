---
"@spudly/ui": patch
---

BigFooter layout: the app-store links now render in a right-hand column beside the link columns, with the social icons at the bottom of that same column, instead of stacked above the link columns. On narrow (mobile) widths the right-hand column stacks below the link columns, store links first and social icons after. Test: open any page story with a full footer (for example LandingPage Default) and confirm the store badges sit in a column to the right of the link columns with the social icons at the bottom of that column; open the BigFooter MobileStacked story (430px) and confirm everything stacks in one column with no horizontal scroll.
