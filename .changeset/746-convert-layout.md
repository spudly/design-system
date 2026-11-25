---
"@spudly/ui": major
---

#746 tranche 5 (conversion, widgets/layout): the layout widgets' internal stacks convert to Row/Col. The former styled roots (Card, Center, ProseColumn, FormScreenLayout, ScreenContainer, ScreenShell, AppTopBar's nav roots) are rebuilt as function components rendering Row/Col, translating their variant props to props/styles in code (Stephen's Option B ruling, 2026-11-24) — public variant APIs and call sites unchanged; compositional stacks in the shells and columns render Row/Col directly. No public API change beyond the stack's earlier tranches; internal only.
