---
"@spudly/ui": major
---

#746 tranche 7 (conversion, widgets/data + widgets/content): the data and content widgets' internal stacks convert to Row/Col. The former styled roots (Badge, StatRow, TagList's row, Avatar's fallback, Thumbnail's hero frame, StepDots' dot, WeekDayColumns/WeekDayColumn, LegalSection's section, BigFooter's frames) are rebuilt as function components rendering Row/Col, translating variant props to props/styles in code (Stephen's Option B ruling, 2026-11-24) — public variant APIs and call sites unchanged; compositional stacks render Row/Col directly. Geometry the strict subset cannot express rides the channels it leaves open (single-side insets as Spacer compositions or the style channel, absolute edge insets and flex bases via style). No new Option B styled surfaces. Internal only.
