---
"@spudly/ui": patch
---

EqualButtonRow is merged into ButtonRow: ButtonRow gains an `equal` prop (default false) that gives its buttons the equal-width treatment EqualButtonRow carried — each button grows to an equal share of its line with a 40% minimum width, wrapping instead of shrinking. PublicRecipePage's CTA bar now renders `<ButtonRow equal>` instead of EqualButtonRow, with the same rendering: two buttons as equal halves, three as two halves over one full-width button. Test: open the ButtonRow Equal, EqualThreeButtons, and EqualInCard stories and confirm the equal halves / two-over-one treatment; open the PublicRecipePage story and confirm its CTA bar is unchanged.
