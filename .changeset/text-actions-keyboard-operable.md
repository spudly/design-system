---
"@spudly/ui": patch
---

Text actions are now keyboard-operable on web. On the Tags page, the Delete action on each tag row can be reached with Tab and activated with Enter or Space. In a comment, the Edit, Save, Cancel, and Delete actions can likewise be tabbed to and activated with Enter or Space. Both now render through a new shared TextAction component — the design-system pattern for small text-style actions — which looks identical to the text it replaces; use TextAction for any new text-style action so it is keyboard-operable on web and operable by press on native.
