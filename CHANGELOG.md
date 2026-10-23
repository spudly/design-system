# @spudly/ui

## 1.3.0

### Minor Changes

- da44c5a: Add MealPlanDetailPage (spudly/design-system#49), the meal plan detail screen as a controlled page component behind the `@spudly/ui/pages` subpath, following the RecipesPage pilot and MealPlansPage. The app keeps the plan query and navigation, and drives the view through a state union — `{ state: "loading" }` renders only the spinner shell (the app screen gates on loading and has no not-found UI, so the union has no such member) and `{ state: "ready", ... }` renders the detail: plan title, notes, and pre-composed `dateRangeLabel` / `nutritionLabel` strings, the "Nutrition goals" section (per-field goal rows as pre-composed `valueLabel`s, or the app's set-goals hint, with `onSetGoalsPress` for its link), the Shopping list and Edit actions, and the flat entry list. Entries are `{id, kind, targetId, title, subtitle?, isUnavailable?}` view-models: meal rows report `onMealPress(mealId)` and recipe rows `onRecipePress(recipeId)`, and an access-lost recipe row renders its "(unavailable)" suffix without press wiring. The goals section is view-modeled rather than slotted — the app's goal view is pure presentation over data — so the contract carries no render slot, and there is no delete or entry-editing surface, matching the app screen (those live on the plan list and form screens).
- 6a9b3f7: Add MealPlansPage (spudly/design-system#49): Eciperay's meal plan list — the "Meal plans" tab of the app's Meals hub — as a controlled full-page component, exported from the `@spudly/ui/pages` subpath alongside RecipesPage. The app keeps all state and business logic and drives the page entirely through props: plan view-models ({id, title, subtitle}, with the meta line — entry count · date range · nutrition — pre-composed by the app) and press callbacks out (onPlanPress, plus optional onCreatePlan and onPlanDelete, whose actions render only when the callbacks are provided). The composition mirrors the app's hub rows: a scrolling shell, the create action above the list, one elevated card per plan, loading as a content swap (the app has no filter inputs whose focus a swap would drop), and the app's "No meal plans yet." empty state. It is deliberately not the week grid the #44 demo imagined — the real app has no day/week structure — and it carries no render slot: an audit of the app view found no app-rendered content inside the list rows (creation and entry editing live on the separate plan form screen), so every action is a pure intent callback; a future inline affordance would add a slot by the renderRecipeAccessory precedent. Stories render the real component with fixture props in the Warm Harvest theme.
- 682743d: Add `RecipeDetailPage` to the `@spudly/ui/pages` subpath (spudly/design-system#49): Eciperay's recipe detail screen as a controlled page component, following the RecipesPage pilot. The app keeps all state and business logic (queries, mutations, navigation, printing) and drives the view through DS-owned per-tab view-models — chrome (status badge, version picker, the five tabs), overview (hero image, stat band, action chips, lifecycle actions with activation candidates, tags, a ratings card with a controlled viewer star input), ingredients (servings stepper, scale chips, tappable scaled rows, substitutions panel), instructions (step cards with an active step), cook history (entries plus the "Log a cook" button), and nutrition (loading / unavailable / ready states). Three self-contained app panels enter through documented render slots at the positions they occupy today — `renderCookLogForm` (replaces the "Log a cook" button while it renders content), `renderSharingControls`, and `renderComments` — so their state and mutations stay app-side. Loading is a `{ state: "loading" }` props member rendering only the spinner shell, mirroring the app screen, which has no distinct not-found UI.
- 50ae80b: Add SharedWithMePage (spudly/design-system#49), the Shared-with-me screen as a controlled page component behind the `@spudly/ui/pages` subpath, mirroring the RecipesPage pilot. The app keeps the shared-with-me query, filter state, pagination, and permalink construction, and drives the view through props: `recipes` view-models (`id`, `title`, optional `subtitle` and `imageUrl`), `isLoading` / `isFetchingNextPage`, the same filter-bar controls as RecipesPage, `onRecipePress(id)`, and `onLoadMore`. Rows are press-only, as in the app — no row actions and no accessory slot, because nothing app-rendered appears inside this view — and the empty state carries the app's shared-with-me message. The bounded-list structure (#188: flex-bounded FlatList, filters as the list header, list mounted while loading) carries over from the app's SharedWithMeView.

### Patch Changes

- 0745c9a: Name the RecipesPage row press targets for screen readers (spudly/design-system#60): the thumbnail and text press targets of each RecipeRow now carry `accessibilityRole="button"` and an accessible name built from the recipe title, the same treatment SharedWithMePage's SharedRecipeRow received in #58 — the text target's name also includes the subtitle when present, so the label does not suppress information the default accessible name announced. The thumbnail target wraps only an image (or an empty placeholder), so without the label a screen reader met an unidentified action for every recipe.

## 1.2.0

### Minor Changes

- 97deee1: Add an optional per-row accessory slot to RecipesPage (spudly/design-system#49): `renderRecipeAccessory?: (recipeId: string) => ReactNode` is called once per row, and the returned node renders directly under that row's card inside the list item; returning null/undefined renders nothing. When a row's accessory renders non-null content, that row's "Log cook" button is hidden, so the Eciperay app can expand its inline cook-log form under a recipe (form, state, and mutation stay app-side) while reproducing its button-hides-while-open behavior. Existing rendering is unchanged when the prop is not provided.

## 1.1.0

### Minor Changes

- 8b10cf5: Add RecipesPage (spudly/design-system#49, pilot): Eciperay's Browse/Recipes screen as a controlled full-page component, exported from the new `@spudly/ui/pages` subpath (page components import react-native's FlatList, so they stay off the package root, which must remain importable in plain Node). The app keeps all state and business logic and drives the page entirely through props — recipe view-models ({id, title, subtitle, imageUrl}), the full filter surface mirrored from the app's filter bar (search, status, ingredient, min/max calories and satiety, sort and order), and press/load-more callbacks out. The composition carries the app screen's layout rules with it: a non-scrolling `list` shell, a `flex: 1`-bounded FlatList (spudly/eciperay#188, guarded by a new source-scan test), the filter bar as the list header, and the DS SearchField reused as-is (no lineHeight changes — spudly/eciperay#162). Stories render the real component with fixture props in the Warm Harvest theme; the Storybook config aliases react-native to react-native-web (now a devDependency) so the FlatList renders on web.

### Patch Changes

- 482df34: Add full-page demo stories (spudly/design-system#44): a Pages section in Storybook with eight whole-screen demos — Eciperay Recipes browse (the spudly/eciperay#162 screen), Recipe detail, Meal plans, and Shared-with-me in the Warm Harvest theme, plus Memorize Home / verse search, Passage view, Memorization session, and Progress in the Quiet Dawn theme — composed from @spudly/ui components with static fixture data, so Chromatic's per-PR screenshots cover whole pages, not just components.
- b1bcca7: Fix SearchField's search icon riding above center on Android (spudly/design-system#45): the icon is no longer the "⌕" text glyph at any size — the character's ink is asymmetric inside its em box (36px rode high, and a 24px reduction still rode high on an on-device check), so the icon is now drawn from two fixed-dimension shapes (a bordered circle and a rotated bar) inside the existing 44px glyph box, and centers by construction on web and native. No explicit lineHeight is involved (that remains the banned spudly/eciperay#162 explosion mechanism). Field height is unchanged.

## 1.0.3

### Patch Changes

- 6239ad7: Refine the SearchField fix from spudly/eciperay#162: the ⌕ glyph now renders inside its own fixed-height clipping box (StyledGlyphBox) instead of the field's row being capped at a fixed height, so a mis-measured glyph still cannot stretch the row, while the row keeps its minHeight and a caller-sized input (props forward via ...rest) can still grow it.

## 1.0.2

### Patch Changes

- cad6da8: Fix SearchField stretching to the full screen height on Android (spudly/eciperay#162), which emptied the Recipes and Shared-with-me screens: the ⌕ glyph's fontSize-valued numeric lineHeight is resolved by Tamagui's style engine as a multiplier of the font size, exploding the field's row on native as it already had on web. The glyph no longer receives a lineHeight, the SearchField row is capped at a fixed 44px height with hidden overflow, and CheckboxField — which carried the identical glyph pattern — drops its glyph lineHeight and clips its box the same way.

## 1.0.1

### Patch Changes

- 7afd4b2: Fix the Android crash `JSApplicationIllegalArgumentException: Invalid accessibility role value: "status"` (spudly/eciperay#156). `status` is a web ARIA live-region role, not a valid React Native `accessibilityRole`. `InlineAlert` (info/success), `Toast`, `DismissibleBanner`, and `SecretRevealPanel` now announce through a platform split: `role="status"` on web only, `accessibilityLiveRegion="polite"` on native (`InlineAlert`'s error/warning severities keep the cross-platform-valid `accessibilityRole="alert"`). The same defect class is fixed in `Avatar` (`accessibilityRole="img"` → `"image"`) and in `NumberStepper`/`ColorPickerField` (`accessibilityRole="group"` → web-only `role="group"`). A new regression test pins that no component in the package passes an `accessibilityRole` outside React Native's supported set.

## 1.0.0

### Major Changes

- 8bdde3d: Remove the pre-built Tamagui config exports (`tamaguiConfig`, `eciperayTamaguiConfig`, `memorizeTamaguiConfig`, `storybookTamaguiConfig`, and the default export). Tamagui v3 resolves all styling against the single global config installed by the most recent `createTamagui()` call — `TamaguiProvider`'s `config` prop does not install its config — so creating four configs at module scope meant merely importing the package left the last-created brand (Memorize) in charge of every app's rendering; the Eciperay app shipped with teal Memorize buttons and background (spudly/eciperay#149).

  Migration: each app creates its own config exactly once, in app-owned code that evaluates after this package:

  - `eciperayTamaguiConfig` → `createTamaguiConfig(eciperayTheme)`
  - `memorizeTamaguiConfig` → `createTamaguiConfig(memorizeTheme)`
  - `tamaguiConfig` → `createTamaguiConfig(baseTheme)`
  - `storybookTamaguiConfig` → `createStorybookTamaguiConfig()` (new factory; the Storybook preview now calls it itself)

### Patch Changes

- 0ff9022: Fix two Android crashes from Tamagui v3 umbrella-component skins leaking bare token names into native props (spudly/eciperay#150). `SelectField` now pins a numeric `fontSize` on its styled select value and item-text frames: the umbrella Select skin's "md" size variant sets `fontSize: "sm"`, which never resolves against this package's number-keyed font size scale (1–8) and reached the native text view as a string, throwing ClassCastException (String -> Double) on mount. `SearchField`'s inner input likewise pins `borderRadius` to the numeric zero token instead of inheriting the umbrella Input skin's unresolved "md" radius string — the durable home for the stopgap pin the eciperay app/web wrappers added in spudly/eciperay#153.

## 0.5.1

### Patch Changes

- 7bef708: Fix the 20 issues from Stephen's Storybook review (#23): Storybook theme switching now works via a combined `storybookTamaguiConfig` (all brands as sub-themes of one config); Avatar renders its image (`src` instead of the web-ignored `source`); BlankWord flows inline and left-aligns in both states; the Button ghost variant is visible (subtle fill, border, readable label) and variant label colors actually reach the button text; the vertical Divider stretches to its container; the RadioOptionGroup indicator is centered; the Spinner paints (its color no longer resolves to `stroke: none`); the Switch has explicit dimensions; SearchField's icon is doubled; ToastProvider composes Viewport/List inside the Toast root; and the ScreenContainer and StepDots stories are corrected.

  Also fix items 14–20 from the same review: the Tamagui configs now register each brand theme's font stack (the Storybook config resolves it per brand via the `--dsFontStack` CSS var set by the preview), so buttons, fields, and other controls render in the same family as body text — Warm Harvest serif included; components that hardcoded the default indigo `primary` ramp (RadioOptionGroup, ToggleChipGroup, ChecklistRow, Tabs, CheckboxField, SelectField, StepDots, Switch, Avatar, DismissibleBanner's info tone) now use the semantic `$primary`/`$primarySubtle`/`$primaryEmphasis`/`$onPrimary` roles, and the Memorize theme defines the `primarySubtle`/`primaryEmphasis` roles it was missing; field and control surfaces that were fixed white (TextField, MultilineField, SearchField, SelectField, ToggleChipGroup, ChecklistRow, CheckboxField, RadioOptionGroup) now use `$surface` with `$color` text and `$borderColor` borders so they go dark in dark mode; VerseText uses the theme text color instead of fixed near-black; and BlankWord's hidden state drops its gray fill and is sized by the word itself (the word rendered invisibly under a blank line), so hidden and revealed occupy the same box and toggling no longer shifts the sentence — at the deliberate cost of the hidden control being word-sized rather than a 44px touch target.

  Follow-up fixes from review: BlankWord's hidden button also clears its vertical padding, so the hidden box matches the revealed text exactly; ProgressBar's track uses `$primarySubtle` and RadioOptionGroup's selected dot and border use the dark-aware `$link` role, restoring ≥3:1 state-indicator contrast in every brand and mode; and `createTamaguiConfig` again accepts a semantic-only theme (the font override is optional and falls back to the base font stack).

  Further review follow-ups: BlankWord's invisible sizing text is pinned to the surrounding sentence's font weight (`fontWeight: "inherit"`), so the hidden blank is sized by the word at the same weight it will be revealed at; the Tabs selected label uses the dark-aware `$link` role instead of `$primaryEmphasis` (which has no dark variant and fell to ~2.3:1 on dark backgrounds); and input boundaries — TextField, MultilineField, SearchField, and SelectField borders, the unchecked boxes/circles in CheckboxField, ChecklistRow, and RadioOptionGroup, and unselected ToggleChipGroup chips — use `$textMuted` instead of `$borderColor`, restoring ≥3:1 non-text contrast (WCAG 1.4.11) in every brand and mode, with error and selected-state colors unchanged.

  Final review follow-ups: BlankWord's hidden button frame is pinned to the sentence's font weight as well (through the frame's `style` — Tamagui routes a `fontWeight` instance prop to the button's internal text element and drops it when the children are elements, so it never reaches the frame), closing the weight-inherit chain sentence → frame → sizing text; and the registered Tamagui font families are platform-correct: React Native receives a single font name per brand instead of the web CSS fallback stack (invalid as a native `fontFamily`) — Warm Harvest registers Georgia with Georgia-Bold faces at the semibold/bold weights, Quiet Dawn registers Avenir Next with its named per-weight faces, and the base brand registers the generic `sans-serif` (its stack is platform system fonts, so the platform system font is the native equivalent). Web font registration is unchanged.

  Round-6 review follow-ups: BlankWord's `fontWeight: "inherit"` pins (frame style and sizing text) are web-only — `inherit` is a CSS value, not a supported React Native font weight; on native neither element sets a weight, so the sizing text takes the same default weight as the revealed verse text. And native font families now resolve per platform: Android has neither Georgia nor Avenir Next, so Warm Harvest registers the generic `serif` and Quiet Dawn the generic `sans-serif` there (numeric weights, no named faces) via a new optional `sansNativeAndroid` token, while iOS keeps the named families and faces. Web registration is byte-identical.

  Round-8 follow-ups (Stephen's Storybook re-review): design correction — the Button ghost variant is text-only again (transparent background, no border, reverting the fill + border an earlier round added); its label uses the dark-aware `$link` role for readability in both modes. StepDots: the Middle story now activates the actual middle dot (index 2 of 5); the component's single-current-dot semantics are unchanged, and a Streak story added in this round was removed again on review (there is no streak variant — the story misrepresented the component). The Switch thumb is vertically centered (2px top margin compensating the frame padding that left it riding high). Toast cards match the theme (`$surface` fill, `$borderColor` edge, `$color`/`$textMuted` text) instead of a fixed near-black that clashed with the themes and vanished against dark backgrounds. SearchField no longer blows up the page height: its ⌕ glyph's line height is now a px string on web (a numeric `lineHeight` reaches web CSS unitless — via a raw `style` object or Tamagui props alike — where it acted as a 36× multiplier: a 1296px line box in the 44px row), while native keeps the plain number. BlankWord drops its focus ring; focus now changes the blank line's color instead (`$link` → `$color`). The ScreenContainer Scrollable story now overflows its frame (14 verse cards) so scrolling is actually demonstrated. SearchField's focus ring now wraps the whole field: the inner input's outline is suppressed and the container shows a 2px `$link` ring via a `:focus-within` clause, and its ✓-glyph sibling fix in CheckboxField removes the same unitless line-height leak there (196px line box, previously contained only by the fixed checkbox box).

- c76fa99: Fix web rendering under Tamagui v3: replace the Tamagui v2 `$platform-web` prop (removed in v3, where it was silently dropped with an "Invalid attribute name" React error) with v3 flat `web:` clauses in `ScreenContainer` and `TextLink`. The `ScreenContainer` scroll view now actually receives its web `display: flex`, `flex-direction: column`, and `min-height: 100%` styles instead of collapsing, and `TextLink` gets its web pointer cursor.

## 0.5.0

### Minor Changes

- d6d4a55: App-migration styling primitives (Stage 1 of the Eciperay app styling migration):

  - Button gains a `danger` variant for destructive actions, filled from the danger ramp at the step that keeps white label text WCAG AA.
  - Card gains an appearance `variant` (`default` | `bordered` | `muted` | `elevated`); SectionCard inherits it through CardProps. The legacy `elevated` boolean still works and maps to `variant="elevated"`. Card colors move to the semantic `$surface`/`$border` theme tokens.
  - ScreenContainer gains shell `variant`s (`default` | `padded` | `list` | `auth`) covering the app's screen shells.
  - New ActionBar: a bordered, shadowed bar pinned to the top or bottom screen edge for primary actions.
  - New TextLink: an inline semantic link for prose (primary color, medium weight, underlined, `accessibilityRole="link"`).

## 0.4.1

### Patch Changes

- ffbabe8: Fix components using hardcoded blue primary ramp instead of theme: Button, Badge, InlineAlert, Spinner, and ProgressBar now use $primary/$onPrimary/$primarySubtle/$primaryEmphasis theme values. Added primarySubtle and primaryEmphasis semantic roles to base and eciperay themes.

## 0.4.0

### Minor Changes

- 52b223a: Add theme-specific Tamagui configs: createTamaguiConfig(theme) factory plus pre-built eciperayTamaguiConfig (Warm Harvest) and memorizeTamaguiConfig (Quiet Dawn). The default tamaguiConfig still uses the brand-neutral baseTheme.

## 0.3.6

### Patch Changes

- 2c916c8: Fix ScreenContainer on web: use minHeight 100% (fills parent) instead of 100vh (viewport), so nested usage doesn't force viewport height

## 0.3.5

### Patch Changes

- c7146ca: Fix ScreenContainer on web: make ScrollView a flex column with minHeight 100vh so it fills the viewport even when the parent is not a flex container

## 0.3.4

### Patch Changes

- fd77175: Fix ScreenContainer collapsing on web: add minHeight 100% to content and flex:1 to ScrollView wrapper

## 0.3.3

### Patch Changes

- 3b1e9f8: Import createAnimations from @tamagui/animations-css/extras to include animated-number hooks

## 0.3.2

### Patch Changes

- a2a20ea: Use @tamagui/animations-css instead of @tamagui/animations-react-native for cross-platform compatibility (the RN driver crashes on web)

## 0.3.1

### Patch Changes

- 76f933b: Add animations configuration to tamaguiConfig (required by Tamagui components that use animations, e.g. Sheet)

## 0.3.0

### Minor Changes

- ba9bd0e: Export all 36 components from the package index. v0.2.0 only exported `Button`; this release exports the full component library (Text, TextField, SearchField, Card, Badge, EmptyState, InlineAlert, Spinner, ProgressBar, Tabs, form inputs, layout/navigation, and specialized components including BlankWord and VerseText).

## 0.2.0

### Minor Changes

- 92c6b43: Initial component library release. Adds the full Phase 1–3 component set (36 components): Text, TextField, SearchField, MultilineField, SelectField, CheckboxField, RadioOptionGroup, ToggleChipGroup, NumberStepper, StarRatingInput, ColorPickerField, ChecklistRow, Button, Card, SectionCard, Badge, EmptyState, InlineAlert, DismissibleBanner, Spinner, ProgressBar, StepDots, Divider, Tabs, ScreenContainer, FormScreenLayout, OptionCard, PrevNextNav, SecretRevealPanel, Avatar, StatCard, BlankWord, VerseText, Dialog, Toast, Switch. Also finalizes the token system: terracotta + teal brand ramps, Warm Harvest (Eciperay) and Quiet Dawn (Memorize) themes, serif font token, and WCAG AA-verified semantic color roles.
