---
"@spudly/ui": patch
---

Internal reorganization (#438 Part 2): the design system now has a views category (src/views) for the page fragments pages share, forms included. AccessTokensPanel, CheckboxField, NumberStepper, NutritionGoalsForm, RadioOptionGroup, RatingForm, SearchField, TextAreaField, and TextField moved there from src/components and are composed by pages exactly as before; their stories moved with them (now titled Views/<Name> in both storybooks). No public API change: views stay internal and are not exported from the package root.
