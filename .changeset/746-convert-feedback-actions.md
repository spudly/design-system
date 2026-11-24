---
"@spudly/ui": major
---

Convert the feedback, actions, and overlays widgets' internal stacks to Row/Col (#746, Option B): the styled roots (ActionBar, Alert, ButtonRow, SkeletonPanel, Toast's card, Toolbar, Tabs' link list, BrandLink's marked frame) are rebuilt as function components rendering Row/Col with their variant geometry computed in code, and the remaining compositional stacks across feedback, actions, overlays, and CollapsibleIcon convert in place. Public APIs and call sites are unchanged. SearchField's focus-ring container and MasonryGrid remain as recorded exceptions.
