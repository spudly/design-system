---
component: Text
run_when:
  - "src/widgets/Text.tsx, its stories, the accessibility translator (src/widgets/accessibility.ts), or a changeset naming Text or heading semantics."
---

# Text — manual test steps

Colocated manual test steps for `src/widgets/Text.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## Text

Open in `Widgets/Text`: AllVariants (required for the variant
checks below, including `verse`); a page story, e.g.
`Pages/Eciperay/SignInPage`, serves only as an additional
heading check.

1. The `heading` variant ("Heading" in AllVariants; the page title
   on a page story) is exposed as a heading at level 1: in the
   rendered DOM / Storybook accessibility panel it carries
   `role="heading"` and `aria-level="1"`, and there is no
   `accessibilityrole` attribute.
2. The `title` variant ("Title" in AllVariants) is the compact
   page title — xl bold — and is also exposed as a heading at
   level 1 (MealPlanDetailPage's plan title renders through it).
3. The `subheading` variant carries `role="heading"` with
   `aria-level="2"`.
4. The `body`, `hint`, `error`, and `verse` variants carry no
   heading role and no `aria-level`.
5. The `formTitle` variant ("FormTitle" in the Text stories)
   is the form-flow page title — 2xl bold — and is exposed as a
   heading at level 1 (the Import pages' titles render through
   it once their tranches land).
6. The `label` variant ("Label" in the Text stories) is the
   section eyebrow — xs semibold, uppercase, letter-spaced,
   muted gray — and carries no heading role and no `aria-level`.
7. The `muted` variant ("Muted" in the Text stories) is
   body-size text in the muted treatment — the intro line under
   the auth pages' titles and the Profile page's email line
   render through it — and the `success` variant ("Success")
   is small text in the success treatment — the Feedback page's
   submitted thanks renders through it. Neither carries a
   heading role.
8. Visually nothing changes: heading/subheading keep their sizes
   and weights, and all variants keep their theme fonts.

**Run when:** `src/widgets/Text.tsx`, its stories, the
accessibility translator (`src/widgets/accessibility.ts`), or a
changeset naming Text or heading semantics.
