---
component: ProfilePage
run_when:
  - "src/pages/eciperay/ProfilePage.tsx, its stories, the four section views below, or a changeset naming ProfilePage."
  - "src/views/eciperay/SubscriptionView.tsx, its stories, ProfilePage, or a changeset naming SubscriptionView."
  - "src/views/eciperay/FeedbackPreferenceView.tsx, its stories, ProfilePage, or a changeset naming FeedbackPreferenceView."
  - "src/views/eciperay/TransferRecipesView.tsx, src/views/eciperay/RecipeExportPickerView.tsx, their stories, ProfilePage, or a changeset naming either view."
  - "src/views/eciperay/AccountDataView.tsx, its stories, ProfilePage, or a changeset naming AccountDataView."
  - "src/views/eciperay/ShowLessView.tsx, src/views/eciperay/AuthorDisplayView.tsx, src/views/eciperay/FamilySharingView.tsx, their stories, ProfilePage, or a changeset naming any of the three views."
---

# ProfilePage — manual test steps

Colocated manual test steps for `src/pages/eciperay/ProfilePage.tsx` (design-system #530).
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
2. The #873 sections render in their host order directly
   before the feedback Preferences card: Show less like this
   (two entries with Undo buttons), Author name on public
   recipes (name field + checked show-my-name checkbox), then
   Family sharing (one grant row with a Remove button).
3. Loading (#874): every composed section renders its
   skeleton state, the email line is a bone, and no section
   data (plan name, display name, grant email, consent
   status) renders; Legal links and Sign Out still render.

**Run when:** `src/pages/eciperay/ProfilePage.tsx`, its stories, the
four section views below, or a changeset naming ProfilePage.

## SubscriptionView

Open in `Views/SubscriptionView`: Active, FreeUpsell, Loading.

1. Active: plan name, status line, Manage subscription and
   Check again buttons, and the portal link render on the
   elevated card. FreeUpsell shows the upsell line and its
   manage action only. Loading shows the spinner with its
   "Loading subscription…" line.

**Run when:** `src/views/eciperay/SubscriptionView.tsx`, its stories,
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

**Run when:** `src/views/eciperay/FeedbackPreferenceView.tsx`, its
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

**Run when:** `src/views/eciperay/TransferRecipesView.tsx`,
`src/views/eciperay/RecipeExportPickerView.tsx`, their stories,
ProfilePage, or a changeset naming either view.

## AccountDataView

Open in `Views/AccountDataView`: Default, WithError.

1. Default: the hint line and the Download my data / Delete
   account row render on the elevated card, Delete in the
   danger treatment. WithError adds the error line under the
   buttons.

**Run when:** `src/views/eciperay/AccountDataView.tsx`, its stories,
ProfilePage, or a changeset naming AccountDataView.
