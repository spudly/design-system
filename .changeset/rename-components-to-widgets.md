---
"@spudly/ui": patch
---

Internal reorganization (#182): the widget components that lived in `src/components/` now live in `src/widgets/`, matching the name the codebase already used for them in prose. Testable terms: in Storybook the widget stories appear under the Widgets grouping (for example Widgets/Button and Widgets/Accordion) instead of the Components grouping; every page that composes them renders and behaves exactly as before, and the package's public surface is unchanged — no component behavior or public API changes.
