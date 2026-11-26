/**
 * Views (#438 Part 2): page fragments shared between pages —
 * forms included. Like pages, views apply no styling of their
 * own; they compose widget components (src/widgets), which
 * own the styling. Views are INTERNAL to this package — they
 * are not exported from the package root (the #298 pages-only
 * surface stands); pages reach them by relative path, exactly
 * as they reach widgets.
 */
export { AccessTokensPanel, type AccessTokensPanelProps } from "./eciperay/AccessTokensPanel.js";
export {
  AuthorDisplayView,
  type AuthorDisplaySettings,
  type AuthorDisplayViewProps,
} from "./eciperay/AuthorDisplayView.js";
export {
  FamilySharingView,
  familySharingGrantLabel,
  type FamilySharingGrant,
  type FamilySharingViewProps,
} from "./eciperay/FamilySharingView.js";
export {
  ShowLessView,
  type ShowLessEntry,
  type ShowLessViewProps,
} from "./eciperay/ShowLessView.js";
export { AccountDataView, type AccountDataViewProps } from "./eciperay/AccountDataView.js";
export {
  CatalogFiltersBar,
  type CatalogFilterDefinition,
  type CatalogFiltersBarProps,
} from "./eciperay/CatalogFiltersBar.js";
export { BulkSelectToolbar, type BulkSelectToolbarProps } from "./eciperay/BulkSelectToolbar.js";
export { CatalogHeader, type CatalogHeaderProps } from "./eciperay/CatalogHeader.js";
export {
  ChunkErrorBoundary,
  type ChunkErrorBoundaryProps,
  type ChunkErrorBoundaryState,
} from "./shared/ChunkErrorBoundary.js";
export { CommentItem, type CommentItemProps } from "./eciperay/CommentItem.js";
export { ConfirmActionView, type ConfirmActionViewProps } from "./eciperay/ConfirmActionView.js";
export { ConsentBannerView, type ConsentBannerViewProps } from "./shared/ConsentBannerView.js";
export { DetailRow, type DetailRowProps } from "./eciperay/DetailRow.js";
export { EmptyState, type EmptyStateProps } from "./shared/EmptyState.js";
export {
  FeedbackPreferenceView,
  type FeedbackPreferenceViewProps,
} from "./eciperay/FeedbackPreferenceView.js";
export { ForgotPasswordForm, type ForgotPasswordFormProps } from "./eciperay/ForgotPasswordForm.js";
export { InstallBannerView, type InstallBannerViewProps } from "./shared/InstallBannerView.js";
export { LazySlot, type LazySlotProps } from "./shared/LazySlot.js";
export { LogEntryCard, type LogEntryCardProps } from "./eciperay/LogEntryCard.js";
export {
  NutritionGoalsForm,
  type NutritionGoalsFormProps,
  type NutritionGoalsValues,
} from "./eciperay/NutritionGoalsForm.js";
export { RecipeOverviewPanel, type RecipeOverviewPanelProps } from "./eciperay/RecipeOverviewPanel.js";
export {
  RecipeIngredientsPanel,
  type RecipeIngredientsPanelProps,
  type RecipeIngredientsPanelView,
} from "./eciperay/RecipeIngredientsPanel.js";
export { RecipeCommentsView, type RecipeCommentsViewProps } from "./eciperay/RecipeCommentsView.js";
export {
  RecipeExportPickerView,
  type RecipeExportPickerViewProps,
} from "./eciperay/RecipeExportPickerView.js";
export { RecipeImageView, type RecipeImageViewProps } from "./eciperay/RecipeImageView.js";
export {
  RecipeIngredientListView,
  type RecipeIngredientField,
  type RecipeIngredientListViewProps,
  type RecipeIngredientRow,
} from "./eciperay/RecipeIngredientListView.js";
export {
  RecipeIngredientRowView,
  type RecipeIngredientRowViewProps,
} from "./eciperay/RecipeIngredientRowView.js";
export {
  RecipeInstructionListView,
  type RecipeInstructionListViewProps,
  type RecipeInstructionRow,
} from "./eciperay/RecipeInstructionListView.js";
export {
  RecipeInstructionRowView,
  type RecipeInstructionRowViewProps,
} from "./eciperay/RecipeInstructionRowView.js";
export { RecipePreviewView, type RecipePreviewViewProps } from "./eciperay/RecipePreviewView.js";
export {
  RecipeSharingView,
  type RecipeSharingViewProps,
  type RecipeSharingConsentSpan,
} from "./eciperay/RecipeSharingView.js";
export { ResetPasswordForm, type ResetPasswordFormProps } from "./eciperay/ResetPasswordForm.js";
export { RevertAction, type RevertActionProps } from "./eciperay/RevertAction.js";
export { ScaledIngredientsView, type ScaledIngredientsViewProps } from "./eciperay/ScaledIngredientsView.js";
export { SignInForm, type SignInFormProps } from "./eciperay/SignInForm.js";
export { SignUpForm, type SignUpFormProps, type SignUpLegalNoticeSpan } from "./eciperay/SignUpForm.js";
export { StatusMessage, type StatusMessageProps } from "./shared/StatusMessage.js";
export { SubscriptionView, type SubscriptionViewProps } from "./eciperay/SubscriptionView.js";
export { TransferRecipesView, type TransferRecipesViewProps } from "./eciperay/TransferRecipesView.js";
