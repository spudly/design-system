---
"@spudly/ui": major
---

#746 tranche 3: the alignment/special stack wrappers are eliminated. BannerRow, CenteredRow, CompactRow, EndRow, StartStack, PanelStack, HeroStack, ListHeaderStack, SpacedTopStack, and Grow are removed from the package; their consumers compose Row / Col directly (BannerRow → Row middle between gap "l", CenteredRow → Row middle gap "m" with its 44px min-height, CompactRow → Row middle wrap gap "s", EndRow → Row right, StartStack → Col left gap "s", PanelStack → Col gap "l" p "l", Grow → Col grow, HeroStack → Col center gap "m", ListHeaderStack → Col gap "l", and SpacedTopStack's single consumer renders its button directly under SectionCard's gap). Per the approved plan, HeroStack's top inset and ListHeaderStack's insets are parent-owned spacing now.
