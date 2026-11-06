/**
 * Views (#438 Part 2): page fragments shared between pages —
 * forms included. Like pages, views apply no styling of their
 * own; they compose widget components (src/components), which
 * own the styling. Views are INTERNAL to this package — they
 * are not exported from the package root (the #298 pages-only
 * surface stands); pages reach them by relative path, exactly
 * as they reach widgets.
 */
export {
  AccessTokensPanel,
  type AccessTokensPanelProps,
  type AccessTokensPanelToken,
} from "./AccessTokensPanel.js";
export { AccountDataView, type AccountDataViewProps } from "./AccountDataView.js";
export { CandidateList, type CandidateListItem, type CandidateListProps } from "./CandidateList.js";
export {
  CatalogFiltersBar,
  type CatalogFilterDefinition,
  type CatalogFiltersBarProps,
  type CatalogRangeFilter,
  type CatalogSelectFilter,
  type CatalogSortFilter,
  type CatalogTextFilter,
} from "./CatalogFiltersBar.js";
export { CatalogHeader, type CatalogHeaderProps } from "./CatalogHeader.js";
export { ChangedListBanner, type ChangedListBannerProps } from "./ChangedListBanner.js";
export { CheckboxField, type CheckboxFieldProps } from "./CheckboxField.js";
export {
  ChunkErrorBoundary,
  type ChunkErrorBoundaryProps,
  type ChunkErrorBoundaryState,
} from "./ChunkErrorBoundary.js";
export { ConfirmActionView, type ConfirmActionViewProps } from "./ConfirmActionView.js";
export { ConsentBannerView, type ConsentBannerViewProps } from "./ConsentBannerView.js";
export {
  FeedbackPreferenceView,
  type FeedbackPreferenceViewProps,
} from "./FeedbackPreferenceView.js";
export { ForgotPasswordForm, type ForgotPasswordFormProps } from "./ForgotPasswordForm.js";
export {
  InstallBannerView,
  type InstallBannerViewProps,
  type InstallBannerViewLink,
} from "./InstallBannerView.js";
export { LazySlot, type LazySlotProps } from "./LazySlot.js";
export { LegalSection, type LegalSectionProps } from "./LegalSection.js";
export { NumberStepper, type NumberStepperProps } from "./NumberStepper.js";
export {
  NutritionGoalsForm,
  type NutritionGoalsFormProps,
  type NutritionGoalsValues,
} from "./NutritionGoalsForm.js";
export {
  RadioOptionGroup,
  type RadioOption,
  type RadioOptionGroupProps,
} from "./RadioOptionGroup.js";
export { RatingForm, type RatingFormProps, type RatingFormValues } from "./RatingForm.js";
export {
  RecipeCommentsView,
  type RecipeCommentsViewProps,
  type RecipeCommentsViewComment,
} from "./RecipeCommentsView.js";
export {
  RecipeExportPickerView,
  type RecipeExportPickerViewProps,
  type RecipeExportPickerViewItem,
} from "./RecipeExportPickerView.js";
export { RecipeSharingView, type RecipeSharingViewProps } from "./RecipeSharingView.js";
export { ResetPasswordForm, type ResetPasswordFormProps } from "./ResetPasswordForm.js";
export { RevertAction, type RevertActionProps } from "./RevertAction.js";
export { ScaledIngredientsView, type ScaledIngredientsViewProps } from "./ScaledIngredientsView.js";
export { SearchField, type SearchFieldProps } from "./SearchField.js";
export { SignInForm, type SignInFormProps } from "./SignInForm.js";
export { SignUpForm, type SignUpFormProps } from "./SignUpForm.js";
export { SubscriptionView, type SubscriptionViewProps } from "./SubscriptionView.js";
export { TextAreaField, type TextAreaFieldProps } from "./TextAreaField.js";
export { TextField, type TextFieldProps } from "./TextField.js";
export { TransferRecipesView, type TransferRecipesViewProps } from "./TransferRecipesView.js";
