---
component: SectionStack
run_when:
  - src/widgets/SectionStack.tsx, its stories, the pages that compose SectionStack (MealPlanDetailPage), or a changeset naming SectionStack.
---

# SectionStack — manual test steps

Colocated manual test steps for `src/widgets/SectionStack.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## SectionStack

Open in `Widgets/SectionStack`: Default.

A SectionStack is a stack of a page's sections — its major
blocks in order.

1. Every block in the stack — title, meta line, paragraph — is
   separated by the same 32px gap, and children fill the
   stack's width (MealPlanDetailPage's page stack is the live
   case: every section separation on the page is that one gap).

**Run when:** `src/widgets/SectionStack.tsx`, its stories,
the pages that compose SectionStack (MealPlanDetailPage), or a
changeset naming SectionStack.
