/**
 * Views (#438 Part 2): page fragments shared between pages —
 * forms included. Like pages, views apply no styling of their
 * own; they compose widget components (src/widgets), which
 * own the styling. Views are INTERNAL to this package — they
 * are not exported from the package root (the #298 pages-only
 * surface stands); pages reach them by relative path, exactly
 * as they reach widgets.
 */
export {
  AccessTokensPanel,
  type AccessTokensPanelProps,
} from "./AccessTokensPanel.js";
export { AccountDataView, type AccountDataViewProps } from "./AccountDataView.js";
export {
  AppTopBar,
  type AppTopBarAction,
  type AppTopBarNavItem,
  type AppTopBarProps,
} from "./AppTopBar.js";
export { CandidateList, type CandidateListProps } from "./CandidateList.js";
export {
  CatalogFiltersBar,
  type CatalogFilterDefinition,
  type CatalogFiltersBarProps,
} from "./CatalogFiltersBar.js";
export { CatalogHeader, type CatalogHeaderProps } from "./CatalogHeader.js";
export { ChangedListBanner, type ChangedListBannerProps } from "./ChangedListBanner.js";
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
} from "./InstallBannerView.js";
export { LazySlot, type LazySlotProps } from "./LazySlot.js";
export { LegalSection, type LegalSectionProps } from "./LegalSection.js";
export {
  NutritionGoalsForm,
  type NutritionGoalsFormProps,
  type NutritionGoalsValues,
} from "./NutritionGoalsForm.js";
export { RatingForm, type RatingFormProps } from "./RatingForm.js";
export {
  RecipeCommentsView,
  type RecipeCommentsViewProps,
} from "./RecipeCommentsView.js";
export {
  RecipeExportPickerView,
  type RecipeExportPickerViewProps,
} from "./RecipeExportPickerView.js";
export { RecipeImageView, type RecipeImageViewProps } from "./RecipeImageView.js";
export {
  RecipeIngredientListView,
  type RecipeIngredientField,
  type RecipeIngredientListViewProps,
  type RecipeIngredientRow,
} from "./RecipeIngredientListView.js";
export {
  RecipeIngredientRowView,
  type RecipeIngredientRowViewProps,
} from "./RecipeIngredientRowView.js";
export {
  RecipeInstructionListView,
  type RecipeInstructionListViewProps,
  type RecipeInstructionRow,
} from "./RecipeInstructionListView.js";
export {
  RecipeInstructionRowView,
  type RecipeInstructionRowViewProps,
} from "./RecipeInstructionRowView.js";
export { RecipePreviewView, type RecipePreviewViewProps } from "./RecipePreviewView.js";
export {
  RecipeSharingView,
  type RecipeSharingViewProps,
  type RecipeSharingConsentSpan,
} from "./RecipeSharingView.js";
export { ResetPasswordForm, type ResetPasswordFormProps } from "./ResetPasswordForm.js";
export { RevertAction, type RevertActionProps } from "./RevertAction.js";
export { ScaledIngredientsView, type ScaledIngredientsViewProps } from "./ScaledIngredientsView.js";
export { SignInForm, type SignInFormProps } from "./SignInForm.js";
export { SignUpForm, type SignUpFormProps, type SignUpLegalNoticeSpan } from "./SignUpForm.js";
export { SubscriptionView, type SubscriptionViewProps } from "./SubscriptionView.js";
export { TransferRecipesView, type TransferRecipesViewProps } from "./TransferRecipesView.js";
