---
"@spudly/ui": patch
---

SectionHeading is now a real heading for screen readers: the shared `SectionHeading` component (the section label over a detail page's Ingredients, Instructions, Cook History, and Nutrition sections) previously rendered its label as plain text, so screen-reader heading navigation could not jump between a detail page's sections. It now carries the heading role at level 2 — under the page title's level 1 — rendering as `role="heading"` with `aria-level="2"` on web and as the `header` accessibility role on native, with visuals unchanged. On a @spudly/ui bump, re-check in Storybook (Components/SectionHeading, and a detail page story such as Pages/Eciperay/RecipeDetailPage): each section label is exposed as a level-2 heading in the accessibility panel / rendered DOM, the page title remains the page's only level-1 heading, and no `accessibilityrole` attribute appears in the DOM.
