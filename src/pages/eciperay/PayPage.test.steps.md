---
component: PayPage
run_when:
  - "src/pages/eciperay/PayPage.tsx, its stories, or a changeset naming PayPage."
---

# PayPage — manual test steps

Colocated manual test steps for `src/pages/eciperay/PayPage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## PayPage

Open in `Pages/Eciperay/PayPage`: Opening, Closed, ErrorState,
NeedsTransaction, Unconfigured.

1. Opening: a spinner and "Opening the secure payment window…"
   render inside the card; no action button renders.
2. Closed offers "Reopen checkout"; ErrorState offers
   "Try again"; NeedsTransaction's card title reads "Checkout"
   and its button carries the host-supplied home label;
   Unconfigured renders its explanatory line and, when the host
   supplies homeHref, the home button (like NeedsTransaction);
   ErrorState's body renders as an error Alert (icon + ramp) with
   its "Try again" button kept.

**Run when:** `src/pages/eciperay/PayPage.tsx`, its stories, or a
changeset naming PayPage.
