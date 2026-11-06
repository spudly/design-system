---
"@spudly/ui": patch
---

Accordion sections now animate open and closed instead of snapping instantly: the Collapsible frame's height and the disclosure chevron's rotation run on the shared "fast" spring transition, quick with a slight spring settle. Root cause: the components used Tamagui's `animation` prop, which compiles on web to a 0-second keyframe-animation reference, so nothing ever transitioned; they now use the `transition` prop the animation driver actually turns into a transition. Testable terms: open the Accordion, AccordionSection, or Collapsible stories and toggle a section — the body visibly expands and collapses over a fraction of a second and the chevron rotates smoothly between pointing right (closed) and pointing down (open), with aria-expanded still flipping immediately on press.
