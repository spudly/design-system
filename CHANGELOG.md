# @spudly/ui

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
