---
component: TabbedShellPage
run_when:
  - src/pages/AppShellPage.tsx, src/pages/TabbedShellPage.tsx, src/views/AppTopBar.tsx, their stories, or a changeset naming any of them.
---

# TabbedShellPage — manual test steps

Colocated manual test steps for `src/pages/TabbedShellPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## App shells (AppShellPage, TabbedShellPage, AppTopBar)

Open in `Pages/Eciperay/AppShellPage`: Default, NoIcons,
LinkActions, NoFooter, ChunkFailedContent;
`Pages/Memorize/TabbedShellPage`: TabbedShell.

1. AppShellPage Default: the top bar shows the Eciperay
   wordmark (a real link home), the seven nav items with their
   icon glyphs left of their labels, and Recipes — the active
   item — filled in the primary treatment with its label in
   on-primary ink; the other items are muted. Exactly one item
   reads as current. The Sign out action sits at the bar's
   right, and the BigFooter band closes the page.
2. NoIcons: the same nav renders label-only, with no glyph
   gaps. LinkActions: Sign in / Create account render as real
   links carrying their hrefs. NoFooter: no footer band
   renders and no space is reserved for one.
3. ChunkFailedContent: the failed page surface is replaced by
   the boundary's fallback (error alert + Reload the app)
   while the top bar and footer stay in place and usable.
4. TabbedShellPage TabbedShell: the header is the same top
   bar — the app title in the brand treatment, no nav, no
   actions — above the tab bar; the shells are one chrome.

**Run when:** `src/pages/AppShellPage.tsx`,
`src/pages/TabbedShellPage.tsx`, `src/views/AppTopBar.tsx`,
their stories, or a changeset naming any of them.
