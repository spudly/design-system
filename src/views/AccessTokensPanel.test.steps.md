---
component: AccessTokensPanel
run_when:
  - "src/views/AccessTokensPanel.tsx, its stories, or a changeset naming AccessTokensPanel."
---

# AccessTokensPanel — manual test steps

Colocated manual test steps for `src/views/AccessTokensPanel.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## AccessTokensPanel

Open in `Views/AccessTokensPanel`: WithTokens,
SecretJustCreated, PlanNotice.

1. SecretJustCreated: there is a **visible gap** between the info
   alert at the top and the amber new-token panel below it — the two
   panels never touch.
2. The new-token secret text is fully visible (no clipping) and its
   warning copy sits clear of the panel edges.
3. PlanNotice renders its notice without pushing the token list into
   overlap or horizontal scroll.

**Run when:** `src/views/AccessTokensPanel.tsx`, its stories, or
a changeset naming AccessTokensPanel.
