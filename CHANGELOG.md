# @spudly/ui

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
