---
component: ProfilePage
run_when:
  - "src/pages/ProfilePage.tsx, its stories, the four section views below, or a changeset naming ProfilePage."
  - "src/views/SubscriptionView.tsx, its stories, ProfilePage, or a changeset naming SubscriptionView."
  - "src/views/FeedbackPreferenceView.tsx, its stories, ProfilePage, or a changeset naming FeedbackPreferenceView."
  - "src/views/TransferRecipesView.tsx, src/views/RecipeExportPickerView.tsx, their stories, ProfilePage, or a changeset naming either view."
  - "src/views/AccountDataView.tsx, its stories, ProfilePage, or a changeset naming AccountDataView."
---

# ProfilePage — manual test steps

Colocated manual test steps for `src/pages/ProfilePage.tsx` (design-system #530).
Run these at release finalization when a trigger below matches the
release's changed components. The full index lives in
`docs/manual-tests.md` (generated — do not edit it by hand).

## ProfilePage coverage sections

Open in `Pages/Eciperay/ProfilePage`: WithCoverageSections
(WithSections covers the slot form).

1. The four typed sections render in slot order: Subscription
   (plan + status + Manage button) before the feedback
   Preferences card; Transfer recipes (picker with one selected
   recipe and "Export selected (1)") and Your data (Download /
   Delete account) after it; Legal and Sign Out close the page.

**Run when:** `src/pages/ProfilePage.tsx`, its stories, the
four section views below, or a changeset naming ProfilePage.

## SubscriptionView

Open in `Views/SubscriptionView`: Active, FreeUpsell, Loading.

1. Active: plan name, status line, Manage subscription and
   Check again buttons, and the portal link render on the
   elevated card. FreeUpsell shows the upsell line and its
   manage action only. Loading shows the spinner with its
   "Loading subscription…" line.

**Run when:** `src/views/SubscriptionView.tsx`, its stories,
ProfilePage, or a changeset naming SubscriptionView.

## FeedbackPreferenceView

Open in `Views/FeedbackPreferenceView`: ConsentAccepted,
PromptOpen, ShortcutUnavailable.

1. ConsentAccepted: the shortcut checkbox is checked, the
   status line reads "Analytics consent: Accepted", Decline
   and Withdraw consent actions render (no Accept), and the
   privacy-choices sentence ends in a real link.
2. PromptOpen: the consent prompt text renders with Decline /
   Accept buttons in place of the action row.
3. ShortcutUnavailable: the checkbox is disabled and the
   unavailable hint shows under it.

**Run when:** `src/views/FeedbackPreferenceView.tsx`, its
stories, ProfilePage, or a changeset naming
FeedbackPreferenceView.

## TransferRecipesView & RecipeExportPickerView

Open in `Views/TransferRecipesView`: Default; and in
`Views/RecipeExportPickerView`: WithSelection, Loading.

1. Transfer Default: the section hint, the picker (toolbar
   with "1 selected", two listed recipes, "Export selected
   (1)"), the Import recipes button, and the success summary
   line render in order on the elevated card.
2. Picker Loading: the list region shows the loading spinner
   and the export button is disabled.

**Run when:** `src/views/TransferRecipesView.tsx`,
`src/views/RecipeExportPickerView.tsx`, their stories,
ProfilePage, or a changeset naming either view.

## AccountDataView

Open in `Views/AccountDataView`: Default, WithError.

1. Default: the hint line and the Download my data / Delete
   account row render on the elevated card, Delete in the
   danger treatment. WithError adds the error line under the
   buttons.

**Run when:** `src/views/AccountDataView.tsx`, its stories,
ProfilePage, or a changeset naming AccountDataView.
