---
"@spudly/ui": patch
---

Accordion sections now render as one connected stack: sections in an Accordion sit flush against each other with no gap, border radius appears only on the stack's outer corners (top of the first section, bottom of the last; a single-section accordion keeps all four rounded corners), and exactly one border divides neighbouring sections. Testable terms: open the Accordion stories — a multi-section accordion reads as a single framed stack with rounded top and bottom ends and square touching edges, and expanding any section keeps the stack joined.
