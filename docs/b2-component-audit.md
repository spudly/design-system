# B2 audit: eciperay `packages/app/src/components` (issue #123)

Part of the design-system completion program (epic #121): **all views are
owned by the design system; all business logic is owned by the app repos.**
This audit covers 100% of the source files under eciperay's
`packages/app/src/components` — 113 source files (52 test files follow their
component; 165 files total) — read at eciperay `master` (`cf2820f`, the
v1.32.0 release commit). Every file was read in full and cross-checked
against its importers across `packages/app/src` (screens included), so
"legacy" below means _no production importer_, not "looks old".

Kinds: **widget** (pure view, reusable), **page view** (full-screen or
screen-section view driven by props), **mixed** (view + logic in one file),
**container** (data/logic wiring that renders a view), **adapter** (thin
prop-translation layer over a DS component), **dev** (developer tooling),
**legacy** (superseded scaffolding with no production importer).

Dispositions: **move** (into @spudly/ui in this batch), **already in DS**
(name it; the app file is an adapter or page host and stays until B6),
**page — B3**, **split** (view half to DS, logic stays app-side), **stays**
(with reason), **delete** (in B6, with its tests).

## Moved into @spudly/ui in this batch (7 files → 7 components)

| App file                                        | Kind   | DS component         | Notes                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------- | ------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ui/BulkSelectToolbar.tsx`                      | widget | `BulkSelectToolbar`  | Search field + select-all/clear + selection count over DS SearchField/Button/Text. Same prop shape; no production importer in the app today (dev showcase only — its web mirror is live), so the DS is its first real home.                                                                                                                                                      |
| `ui/CheckboxSelectList.tsx`                     | widget | `CheckboxSelectList` | Checkbox list with loading and empty states over DS CheckboxField/Spinner/EmptyState. Live consumers: MealFormView, MealPlanFormView. DS prop takes `selectedIds` as an array (the ToggleChipGroup multi-select convention); the app passes a `Set` today — the B6 adapter converts.                                                                                             |
| `ui/FixedActionBanner.tsx`                      | widget | `FixedActionBanner`  | Pinned consent/action bar: DS ActionBar + InlineAlert + primary/secondary/dismiss buttons. Exists because DismissibleBanner's contract can't express it (gap 1 below). Dev-showcase-only in the app; its web mirror backs the consent/install banners.                                                                                                                           |
| `ui/TagPill.tsx`                                | widget | `TagPill`            | Display pill tinted by a data color (surface = color at `22` alpha, label = the color). Live consumers across recipe/tags surfaces.                                                                                                                                                                                                                                              |
| `ui/StatBadge.tsx` (`StatBadgeRow` export)      | widget | `StatRow`            | The recessed band that lays out a row of DS StatCards. The file's other export, `StatBadge`, is an adapter over DS `StatCard` (already in DS).                                                                                                                                                                                                                                   |
| `recipe/RecipeCommentItem.tsx`                  | widget | `CommentItem`        | Pure view: author line, stale marker, inline edit form, edit/delete actions — all state arrives via props. DS props are flattened view-model values (`authorName`, `body`, `canEdit`, `canDelete`, …) instead of the app's comment record. The stale marker is a ⚠ glyph with the hint as its accessibility label (the app renders a Feather icon via its Icon adapter — gap 5). |
| `profile/AccessTokensTokenRow.tsx` (`TokenRow`) | widget | `TokenRow`           | Pure view row: name, revoked marker, mono prefix line, meta line, revoke action. DS props are pre-formatted strings (`prefixLabel`, `metaLabel`) — date formatting stays app-side.                                                                                                                                                                                               |

## Already in DS — adapter or host stays app-side until B6 (34 files)

The `ui/` adapters translate the app's historical prop APIs onto DS
components; the page hosts map app data to DS page view-models and keep
queries/mutations app-side. Both patterns are the intended end state for
now — B6 deletes the adapters when screens consume the DS directly.

| App file                                | Kind             | DS equivalent                                                                                                                                    |
| --------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ui/AuthScreenLayout.tsx`               | adapter          | `ScreenContainer` (`variant="auth"`)                                                                                                             |
| `ui/CheckboxField.tsx`                  | adapter          | `CheckboxField` (+ rich-description composition)                                                                                                 |
| `ui/ColorPickerField.tsx`               | adapter          | `ColorPickerField` (adapter supplies the default palette — app data)                                                                             |
| `ui/DestructiveButton.tsx`              | adapter          | `Button` (`variant="danger"`)                                                                                                                    |
| `ui/EmptyMessage.tsx`                   | adapter          | `Text`                                                                                                                                           |
| `ui/ErrorText.tsx`                      | adapter          | `Text` (`variant="error"`)                                                                                                                       |
| `ui/FormScreenLayout.tsx`               | adapter          | `FormScreenLayout` (+ title/description composition)                                                                                             |
| `ui/InfoBanner.tsx`                     | adapter          | `InlineAlert` (`severity="info"`)                                                                                                                |
| `ui/ListLoadingFooter.tsx`              | adapter          | `Spinner`                                                                                                                                        |
| `ui/MultilineField.tsx`                 | adapter          | `MultilineField`                                                                                                                                 |
| `ui/NumberStepper.tsx`                  | adapter          | `NumberStepper`                                                                                                                                  |
| `ui/OptionCard.tsx`                     | adapter          | `OptionCard`                                                                                                                                     |
| `ui/PageTitle.tsx`                      | adapter          | `Text` (heading/subheading variants + size/spacing scale)                                                                                        |
| `ui/PrevNextNav.tsx`                    | adapter          | `PrevNextNav` (gap 4)                                                                                                                            |
| `ui/PrimaryButton.tsx`                  | adapter          | `Button` (`variant="primary"`, + loading label)                                                                                                  |
| `ui/ProgressDots.tsx`                   | adapter          | `StepDots` (gap 10)                                                                                                                              |
| `ui/RadioOptionGroup.tsx`               | adapter          | `RadioOptionGroup`                                                                                                                               |
| `ui/ScreenContainer.tsx`                | adapter          | `ScreenContainer` (gap 3)                                                                                                                        |
| `ui/ScreenScroll.tsx`                   | adapter          | `ScreenContainer` in an app ScrollView (gap 3)                                                                                                   |
| `ui/SearchField.tsx`                    | adapter          | `SearchField` (its radius pin is now redundant — gap 9)                                                                                          |
| `ui/SecondaryButton.tsx`                | adapter          | `Button` (`variant="secondary"`)                                                                                                                 |
| `ui/SectionCard.tsx`                    | adapter          | `SectionCard`                                                                                                                                    |
| `ui/SelectField.tsx`                    | adapter          | `SelectField`                                                                                                                                    |
| `ui/StarRatingInput.tsx`                | adapter          | `StarRatingInput` (gap 2 notes)                                                                                                                  |
| `ui/StatBadge.tsx` (`StatBadge` export) | adapter          | `StatCard`                                                                                                                                       |
| `ui/StatusBadge.tsx`                    | adapter          | `Badge` (maps legacy Tailwind class strings to tones — B6 should retire the class-string API)                                                    |
| `ui/TabBar.tsx`                         | adapter          | `Tabs`                                                                                                                                           |
| `ui/TextField.tsx`                      | adapter          | `TextField`                                                                                                                                      |
| `ui/TextLinkButton.tsx`                 | adapter          | `TextLink`                                                                                                                                       |
| `ui/ToggleChipGroup.tsx`                | adapter          | `ToggleChipGroup` (gap 2)                                                                                                                        |
| `recipe/RecipeStatusBadge.tsx`          | adapter          | `Badge` via `ui/StatusBadge` (status→tone mapping is app data)                                                                                   |
| `meals/MealPlanDetailView.tsx`          | container (host) | `MealPlanDetailPage` (`@spudly/ui/pages`)                                                                                                        |
| `recipes/RecipesListView.tsx`           | container (host) | `RecipesPage` (`@spudly/ui/pages`); also exports `InlineCookLogForm`, the mutation wiring for the page's per-row accessory slot — stays app-side |
| `shared/SharedWithMeView.tsx`           | container (host) | `SharedWithMePage` (`@spudly/ui/pages`)                                                                                                          |
| `recipe/RecipeDetailView.tsx`           | container (host) | `RecipeDetailPage` (`@spudly/ui/pages`); every section query/mutation and the slotted panels stay here                                           |

## Page views — defer to B3 (24 files)

Pure prop-driven views; B3 moves them into the DS as pages organized by
app (B3a recipe forms #124, B3b meals/shopping/cooking #125, B3c
account/auth/remaining #126).

| App file                             | Kind                | B3 home                                                                                                               |
| ------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `add/AddRecipeMenuView.tsx`          | page view           | B3c                                                                                                                   |
| `auth/ForgotPasswordView.tsx`        | page view           | B3c (auth)                                                                                                            |
| `auth/ResetPasswordView.tsx`         | page view           | B3c (auth)                                                                                                            |
| `auth/SignInView.tsx`                | page view           | B3c (auth)                                                                                                            |
| `auth/SignUpView.tsx`                | page view           | B3c (auth)                                                                                                            |
| `feedback/FeedbackView.tsx`          | page view           | B3c (hosts the FeedbackForm split below)                                                                              |
| `home/HomeView.tsx`                  | page view           | B3c (embeds the RecipeListCard container — split point noted there)                                                   |
| `import/ImportImageView.tsx`         | page view           | B3c                                                                                                                   |
| `import/ImportReviewView.tsx`        | page view           | B3c                                                                                                                   |
| `import/ImportTextView.tsx`          | page view           | B3c (holds its textarea state locally today; B3 decides props vs. local state)                                        |
| `import/ImportUrlView.tsx`           | page view           | B3c                                                                                                                   |
| `meals/MealCookingModeView.tsx`      | page view           | B3b (cooking overlay; G9 family with CookingModeParts)                                                                |
| `meals/MealDetailView.tsx`           | page view           | B3b                                                                                                                   |
| `meals/MealFormView.tsx`             | page view           | B3b (form screen; consumes DS CheckboxSelectList from this batch)                                                     |
| `meals/MealPlanFormView.tsx`         | page view           | B3b (form screen; consumes DS CheckboxSelectList from this batch)                                                     |
| `meals/MealsHubView.tsx`             | page view           | B3b (hub chrome + meals tab; the plans tab already hosts DS `MealPlansPage`)                                          |
| `meals/ShoppingListView.tsx`         | page view           | B3b                                                                                                                   |
| `profile/AccessTokensView.tsx`       | page view (section) | B3c (its created-secret panel should adopt DS `SecretRevealPanel` — gap 8; its row moved in this batch as `TokenRow`) |
| `profile/NutritionGoalsFormView.tsx` | page view (section) | B3c                                                                                                                   |
| `profile/ProfileView.tsx`            | page view           | B3c (section slots stay as page slots)                                                                                |
| `recipe/EditRecipeView.tsx`          | page view (shell)   | B3a (title shell around the RecipeForm split)                                                                         |
| `recipe/ManualEntryView.tsx`         | page view (shell)   | B3a                                                                                                                   |
| `recipe/EditVersionView.tsx`         | page view (shell)   | B3a                                                                                                                   |
| `tags/TagsView.tsx`                  | page view           | B3c (renders DS `TagPill` from this batch)                                                                            |

## Mixed — split: view to DS, logic stays app-side (8 files)

| App file                              | Kind      | Split                                                                                                                                                                                                                                                                                                          |
| ------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FeedbackForm.tsx`                    | mixed     | Form view → DS with the Feedback page (B3c). Analytics submit, auth session, reply-email prefill rules, and validation stay app-side.                                                                                                                                                                          |
| `RecipeListCard.tsx`                  | mixed     | Cook-log mutation + form-open state stay app-side. The row view is already DS composition (ThumbnailListCard / RecipesPage rows); B6 deletes this once the Home list renders DS page rows directly.                                                                                                            |
| `ai/AiSessionFlow.tsx`                | mixed     | Conversational session view → DS page (B3c). Session state machine and the five mutations stay app-side behind the already-injected `api` prop interface, so the split is clean.                                                                                                                               |
| `cooking/CookLogForm.tsx`             | mixed     | Rating/notes form state + submit stay app-side. The form's view has no standalone DS home — DS pages embed their own cook-log form (gap 6); B3 reconciles to one DS form, including the dark cooking-overlay variant.                                                                                          |
| `recipe/RecipeForm.tsx`               | mixed     | Form view → DS recipe-form page (B3a). Form state, parent-version diffing, AI description/image calls, and image upload stay app-side.                                                                                                                                                                         |
| `recipe/RecipeImageField.tsx`         | mixed     | Preview frame + action row view → DS form widget (B3a). The native picker invocation (`react-native-image-picker` + Android permission prompt) stays app-side behind an `onPickImage`-style callback — **flagged: the picker library is native-only**; the view itself is plain RN/Tamagui and cross-platform. |
| `recipe/RecipeCommentsSection.tsx`    | container | Live: slotted into DS `RecipeDetailPage` by RecipeDetailView. Comments query/mutations and edit state stay app-side; its item view moved in this batch as DS `CommentItem`; the section shell is a B3 candidate to fold into the page.                                                                         |
| `recipe/RecipeVisibilityControls.tsx` | container | Live: slotted into DS `RecipeDetailPage` by RecipeDetailView. Sharing mutations, permalink building, and `Linking`/`Share` side effects stay app-side; the controls view is a B3 page-section candidate.                                                                                                       |

## Containers — logic stays app-side (4 files)

| App file                          | Kind      | Disposition                                                                                                                                       |
| --------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile/AccessTokensSection.tsx` | container | Token/entitlement queries + create/revoke mutations. Pure logic remainder — B6 relocates it out of `components/`; renders AccessTokensView (B3c). |
| `ProfileFeedbackPreference.tsx`   | container | Feedback-shortcut hook + analytics-config flag; view composes DS adapters. Stays with the profile cluster (B3c/B6).                               |
| `SharedRecipeListCard.tsx`        | container | Builds the recipe permalink and opens it via `Linking`; row view is ThumbnailListCard. Stays (side effect is the component's job).                |
| `recipe/TagPicker.tsx`            | container | Tags query; view is already the DS `ToggleChipGroup` adapter. Stays; exposes gap 2 (per-chip color dropped).                                      |

## Legacy — delete in B6 (17 files)

No production importer (verified across `packages/app/src`): each is
reachable only from its own tests and the dev showcase. All were orphaned
by the #49 page migration and the #71 single-scroll RecipeDetailPage
rewire, which deleted the tab state these files implemented.

| App file                              | Kind    | Why legacy                                                                                                                                           |
| ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth/AuthTextField.tsx`              | widget  | Zero importers anywhere. Hand-rolled field duplicating DS `TextField` chrome.                                                                        |
| `recipe/RecipeDetailChrome.tsx`       | legacy  | Tab-era toolbar + tab bar; DS `RecipeDetailPage` owns the chrome now. Only importer was the tab panel group itself.                                  |
| `recipe/RecipeDetailTabBar.tsx`       | legacy  | Only imported (type) by RecipeDetailTabPanel.                                                                                                        |
| `recipe/RecipeDetailTabPanel.tsx`     | legacy  | Tab switcher for the removed tab UI; no importer outside its test.                                                                                   |
| `recipe/RecipeEngagementPanel.tsx`    | legacy  | Only consumer was RecipeDetailTabPanel; RecipeDetailView slots comments/visibility directly into the DS page.                                        |
| `recipe/OverviewTab.tsx`              | legacy  | Only consumer was the tab panel; its view is the DS page's overview section, its side effects (print/share) live in the host.                        |
| `recipe/OverviewActions.tsx`          | legacy  | Only reachable via OverviewTab; the lifecycle mutations now live in RecipeDetailView.                                                                |
| `recipe/CookHistoryTab.tsx`           | mixed   | Only reachable via the tab panel; cook-log data wiring lives in RecipeDetailView and the DS page renders the section.                                |
| `recipe/IngredientsTab.tsx`           | mixed   | Only reachable via the tab panel; the DS page renders ingredients with servings/scale. Its AI substitutions query has no DS slot yet (gap 7).        |
| `recipe/InstructionsTab.tsx`          | widget  | Only reachable via the tab panel; the DS page renders the instructions section.                                                                      |
| `recipe/NutritionTab.tsx`             | mixed   | Only reachable via the tab panel; nutrition query/refresh lives in the host, rows in the DS page.                                                    |
| `recipe/RecipeRatingsSection.tsx`     | mixed   | Only reachable via RecipeEngagementPanel; the rating mutation and labels live in RecipeDetailView + DS page props.                                   |
| `recipe/VersionPicker.tsx`            | widget  | Only consumer was RecipeDetailChrome; the DS page has its own version picker and the host formats the labels (the formatting helpers stay app-side). |
| `recipe/ScaleMultiplierButtons.tsx`   | widget  | Only reachable via IngredientsTab; superseded by the DS page's scale controls incl. custom scale (@spudly/ui 1.8.1).                                 |
| `recipe/ServingsStepper.tsx`          | adapter | Only reachable via IngredientsTab; superseded by the DS page's direct-entry servings input (1.8.1). DS equivalent: `NumberStepper`.                  |
| `recipes/RecipeListFiltersBar.tsx`    | widget  | Superseded by the filter bars built into DS `RecipesPage`/`SharedWithMePage`; only the showcase imports it.                                          |
| `meals/NutritionGoalProgressView.tsx` | widget  | No production consumer since MealPlanDetailView folded its composition into `MealPlanDetailPage` view-models; the goal rows live in the DS page now. |

## Stays in the app, with reason (19 files)

| App file                             | Kind        | Reason                                                                                                                                                                                                                                   |
| ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Icon.tsx`                           | adapter     | Feather icon adapter; the icon-name set is app data (`@eciperay/icons`). DS has no icon component (gap 5).                                                                                                                               |
| `ui/BookLoadingSpinner.tsx`          | widget      | Branded book-flip loader. Recorded decision in the source (G10): the branded loader stays an app adapter; DS `Spinner` covers generic loading. Built on RN `Animated` + DS token values so it renders without a TamaguiProvider.         |
| `ui/bookLoadingSpinnerLayout.ts`     | — (support) | Geometry/style fragments for BookLoadingSpinner; follows it.                                                                                                                                                                             |
| `InlineLoadingIndicator.tsx`         | widget      | Composition over BookLoadingSpinner + the client's `useDelayedTrue` hook; stays with the branded loader.                                                                                                                                 |
| `ScreenLoadingGate.tsx`              | container   | Full-screen gate over BookLoadingSpinner + `useDelayedTrue`; stays with the branded loader.                                                                                                                                              |
| `LegalLinks.tsx`                     | widget      | App content: the legal URLs are app constants (`@eciperay/client`), and it renders on RN primitives without a TamaguiProvider by design.                                                                                                 |
| `cooking/CookingModeParts.tsx`       | mixed       | Cooking-mode overlay family (shells, step display, `useSwipeNav` hook). Recorded decision in the source (G9): app-domain composite stays; the swipe shell needs RN responder props. MealCookingModeView (B3b) is its page-level sibling. |
| `recipe/StaleVersionHint.tsx`        | widget      | One-icon hint bound to the app Icon adapter (Feather `alert-triangle`); stays while Icon stays. Its DS counterpart is `CommentItem`'s stale marker.                                                                                      |
| `recipe/RecipeInputPreview.tsx`      | widget      | Recipe preview rendering on RN primitives (renders without a TamaguiProvider — a test-harness constraint). Defers to B3 with its consumers (ImportReviewView, AiSessionFlow) rather than moving alone.                                   |
| `recipe/SortableIngredientList.tsx`  | widget      | **Flagged single-platform:** built on `react-native-draggable-flatlist`, which has no web equivalent in the DS. Form-editor widget for B3a, once a cross-platform drag approach is chosen.                                               |
| `recipe/SortableInstructionList.tsx` | widget      | **Flagged single-platform:** same drag dependency and disposition as SortableIngredientList.                                                                                                                                             |
| `recipe/RecipeStatusPicker.tsx`      | adapter     | Domain adapter over `ToggleChipGroup`: status options/labels are app data. Stays with RecipeForm (B3a).                                                                                                                                  |
| `ui/ThumbnailListCard.tsx`           | widget      | Recorded decision in the source (G8): app-domain list-row composite stays in the adapter layer (DS `Card` + thumbnail + text composition).                                                                                               |
| `recipe/recipeImagePreviewStyles.ts` | — (support) | Shared preview geometry for RecipeImageField and OverviewTab; follows them (B3a/B6).                                                                                                                                                     |
| `dev/ComponentShowcaseView.tsx`      | dev         | In-app component showcase; the DS-side equivalent is Storybook itself. Not product UI.                                                                                                                                                   |
| `dev/ShowcaseDemo.tsx`               | dev         | Lazy demo loader for the showcase.                                                                                                                                                                                                       |
| `dev/ShowcaseDemoFrame.tsx`          | dev         | Provider frame (query client + analytics) for showcase demos.                                                                                                                                                                            |
| `dev/ShowcasePicker.tsx`             | dev         | Showcase picker over the DS `SelectField` adapter.                                                                                                                                                                                       |
| `dev/showcaseModuleLoaders.ts`       | dev         | Showcase module registry (dynamic imports per component).                                                                                                                                                                                |

## DS gaps the audit exposes

1. **DismissibleBanner is too narrow for consent/action bars** — its
   `message` is `string`-only and `onDismiss` is required, and all actions
   render as secondary buttons. Apps needing a rich message, optional
   dismiss, and a primary action compose `FixedActionBanner` over
   ActionBar + InlineAlert instead (moved into the DS in this batch).
2. **ToggleChipGroup has no `disabled` prop and no per-chip `color`** —
   app adapters wrap it in a pointer-events/opacity shell, and TagPicker
   drops each tag's color. Related: `StarRatingInput` is fixed at 5 stars
   with no `tone`, no toggle-off, and no readOnly/disabled props (the app
   adapter supplies all four behaviors).
3. **ScreenContainer's scrollable mode forwards no ScrollView props** —
   screens needing `keyboardShouldPersistTaps="handled"` compose their
   own ScrollView around the container (the ScreenContainer/ScreenScroll
   adapters exist for exactly this).
4. **PrevNextNav has no disabled-back state** — the app adapter hides the
   back button when back is disabled.
5. **No DS icon component** — apps keep a Feather adapter with app-owned
   icon names (Icon, StaleVersionHint). Any DS icon set is a design
   decision for a later batch.
6. **No standalone DS CookLogForm** — the cook-log form exists only
   embedded in `RecipeDetailPage`/`RecipesPage`; the app keeps its own
   form for the cooking overlay and list cards. B3 should reconcile to
   one DS form.
7. **RecipeDetailPage has no substitutions slot** — the app's
   ingredients-tab AI substitutions panel has no DS home yet (B3).
8. **AccessTokensView's created-secret panel duplicates
   `SecretRevealPanel`** — B3c should adopt the DS panel when the profile
   cluster moves.
9. **SearchField radius pin — already closed in the DS.** `StyledInput`
   pins `borderRadius: tokens.radii.zero` (eciperay #150); the app
   adapter's pin is a now-redundant stopgap, removable in B6.
10. **StepDots has a single dot style** — the app ProgressDots adapter's
    legacy dark/light `variant` prop is accepted and dropped.
    Informational only.
