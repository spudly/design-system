---
"@spudly/ui": major
---

#746 tranche 2: the rhythm stack wrappers are eliminated. ButtonStack, CardStack, CompactStack, ContentStack, FormStack, LinkStack, ListStack, ProseStack, SectionStack, and TightStack are removed from the package; their consumers compose Col directly with the matching t-shirt gap (ButtonStack/FormStack → gap "m", CardStack/CompactStack/LinkStack → gap "s", ContentStack/ProseStack → gap "m", SectionStack → gap "xxl", TightStack → gap "xs", ListStack → a plain Col). Part of the Row/Col conversion: direct XStack/YStack usages convert by area in the tranches that follow.
