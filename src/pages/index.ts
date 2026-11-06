/**
 * Page components (#49): full-page, props-controlled views for the
 * apps' screens. The package root re-exports this barrel and,
 * since #411 amended #298, a minimal set of additions beside it
 * (the brand themes and their types, `createTamaguiConfig`, and
 * `ChunkErrorBoundary`); there are no subpath exports, and no
 * other widgets, icons, tokens, tag colors, or config factories
 * are exported from the package. Page components may import
 * react-native (e.g. FlatList); the old rule that the root entry
 * must stay importable in plain Node is superseded by the
 * pages-only contract.
 */
export {
  RecipesPage,
  type RecipesPageDiscoveryItem,
  type RecipesPageItem,
  type RecipesPageProps,
} from "./RecipesPage.js";
export {
  DiscoverPage,
  type DiscoverPageFilterId,
  type DiscoverPageItem,
  type DiscoverPageProps,
} from "./DiscoverPage.js";
export { MealPlansPage, type MealPlansPageItem, type MealPlansPageProps } from "./MealPlansPage.js";
export {
  RecipeDetailPage,
  type RecipeDetailPageProps,
  type RecipeDetailPageReadyProps,
  type RecipeDetailPageVersion,
  type RecipeDetailPageTag,
  type RecipeDetailPageLifecycle,
  type RecipeDetailPageRatings,
  type RecipeDetailPageCommunityRating,
  type RecipeDetailPageViewerRating,
  type RecipeDetailPageOverviewProps,
  type RecipeDetailPageIngredientsProps,
  type RecipeDetailPageIngredient,
  type RecipeDetailPageSubstitution,
  type RecipeDetailPageInstructionsProps,
  type RecipeDetailPageInstruction,
  type RecipeDetailPageHistoryProps,
  type RecipeDetailPageCookLog,
  type RecipeDetailPageNutritionProps,
  type RecipeDetailPageNutritionRow,
  type RecipeDetailPageSharing,
  type RecipeDetailPageComments,
  type RecipeDetailPageConfirmation,
} from "./RecipeDetailPage.js";
export {
  MealPlanDetailPage,
  type MealPlanDetailPageEntry,
  type MealPlanDetailPageNutritionGoals,
  type MealPlanDetailPageProps,
  type MealPlanDetailPageWeeklyTotals,
  type MealPlanDetailPageWeeklyTotalsRow,
} from "./MealPlanDetailPage.js";
export {
  PublicRecipePage,
  type PublicRecipePageProps,
  type PublicRecipePageReadyProps,
  type PublicRecipePageOverviewProps,
  type PublicRecipePageCtas,
  type PublicRecipePageTag,
  type PublicRecipePageRatings,
  type PublicRecipePageCommunityRating,
  type PublicRecipePageViewerRating,
  type PublicRecipePageIngredientsProps,
  type PublicRecipePageIngredient,
  type PublicRecipePageSubstitution,
  type PublicRecipePageInstructionsProps,
  type PublicRecipePageInstruction,
} from "./PublicRecipePage.js";
export { PublicPageFrame, type PublicPageFrameProps } from "./PublicPageFrame.js";
export {
  TabbedShellPage,
  type TabbedShellPageLinkTab,
  type TabbedShellPageProps,
  type TabbedShellPageTab,
} from "./TabbedShellPage.js";
export {
  MemorizeReviewPage,
  type MemorizeReviewPageProps,
  type MemorizeReviewPageVerse,
} from "./MemorizeReviewPage.js";
export {
  VerseSearchPage,
  type VerseSearchPageItem,
  type VerseSearchPageProps,
} from "./VerseSearchPage.js";
export {
  MyVersesPage,
  type MyVersesPageItem,
  type MyVersesPageProps,
  type MyVersesPageStatus,
} from "./MyVersesPage.js";
export {
  MemorizationSessionPage,
  type MemorizationSessionPageProps,
  type MemorizationSessionPageReadyProps,
  type MemorizationSessionPageWord,
} from "./MemorizationSessionPage.js";
export { MemorizeSettingsPage, type MemorizeSettingsPageProps } from "./MemorizeSettingsPage.js";
export {
  RecipeFormPage,
  type RecipeFormPageProps,
  type RecipeFormPageField,
  type RecipeFormPageOption,
} from "./RecipeFormPage.js";
export { EditRecipePage } from "./EditRecipePage.js";
export { ManualEntryPage } from "./ManualEntryPage.js";
export { EditVersionPage, type EditVersionPageProps } from "./EditVersionPage.js";
export { SignInPage, type SignInPageProps } from "./SignInPage.js";
export { SignUpPage, type SignUpPageProps } from "./SignUpPage.js";
export { ForgotPasswordPage, type ForgotPasswordPageProps } from "./ForgotPasswordPage.js";
export { ResetPasswordPage, type ResetPasswordPageProps } from "./ResetPasswordPage.js";
export {
  ProfilePage,
  type ProfilePageProps,
  type ProfilePageSubscription,
  type ProfilePageAccountData,
  type ProfilePageTransfer,
  type ProfilePageFeedbackPreference,
} from "./ProfilePage.js";
export { ImportTextPage, type ImportTextPageProps } from "./ImportTextPage.js";
export { ImportUrlPage, type ImportUrlPageProps } from "./ImportUrlPage.js";
export { ImportImagePage, type ImportImagePageProps } from "./ImportImagePage.js";
export { ImportReviewPage, type ImportReviewPageProps } from "./ImportReviewPage.js";
export { HomePage, type HomePageProps, type HomePageRecipe } from "./HomePage.js";
export {
  LandingPage,
  type LandingPageProps,
  type LandingPageCta,
  type LandingPageFeature,
} from "./LandingPage.js";
export {
  TagsPage,
  type TagsPageOperationResult,
  type TagsPageProps,
  type TagsPageTag,
} from "./TagsPage.js";
export { FeedbackPage, type FeedbackPageProps } from "./FeedbackPage.js";
export {
  AddRecipeMenuPage,
  type AddRecipeMenuPageProps,
  type AddRecipeMenuPageOption,
} from "./AddRecipeMenuPage.js";
export {
  AiSessionPage,
  type AiSessionPageProps,
  type AiSessionPageConfig,
  type AiSessionPageMessage,
  type AiSessionPageSession,
} from "./AiSessionPage.js";
export {
  MealFormPage,
  type MealFormPageProps,
  type MealFormPageRecipeOption,
} from "./MealFormPage.js";
export {
  MealPlanFormPage,
  type MealPlanFormPageProps,
  type MealPlanFormPageEntryOption,
} from "./MealPlanFormPage.js";
export {
  ShoppingListPage,
  type ShoppingListPageProps,
  type ShoppingListPageLine,
} from "./ShoppingListPage.js";
export {
  MealCookingModePage,
  type MealCookingModePageErrorProps,
  type MealCookingModePageProps,
  type MealCookingModePageReadyProps,
  type MealCookingModePageStep,
} from "./MealCookingModePage.js";
export {
  CookingModePage,
  type CookingModePageProps,
  type CookingModePageStep,
  type CookingModePageIngredients,
} from "./CookingModePage.js";
export { PayPage, type PayPageProps, type PayPageStatus } from "./PayPage.js";
export {
  ConsentPreferencesPage,
  type ConsentPreferencesPageProps,
  type ConsentPreferencesPageChoice,
} from "./ConsentPreferencesPage.js";
export { AuthConfirmationPage, type AuthConfirmationPageProps } from "./AuthConfirmationPage.js";
export {
  RouteErrorPage,
  type RouteErrorPageProps,
  type RouteErrorPageVariant,
} from "./RouteErrorPage.js";
export {
  MealDetailPage,
  type MealDetailPageProps,
  type MealDetailPageMember,
} from "./MealDetailPage.js";
export {
  MealsHubPage,
  type MealsHubPageProps,
  type MealsHubPageMeal,
  type MealsHubPageTab,
} from "./MealsHubPage.js";
export {
  LegalDocumentPage,
  type LegalDocumentPageProps,
  type LegalDocumentSection,
  type LegalDocumentBlock,
  type LegalDocumentSpan,
  type LegalDocumentLink,
} from "./LegalDocumentPage.js";

// BigFooter (#410): the footer data types are part of the public
// page contract — hosts supply one footer object per page through
// each page's `footer` prop. The BigFooter component itself stays
// internal (pages-only surface, #298).
export {
  type BigFooterBrand,
  type BigFooterColumn,
  type BigFooterData,
  type BigFooterLink,
  type BigFooterSocialIcon,
  type BigFooterSocialLink,
  type BigFooterStore,
  type BigFooterStoreLink,
} from "../widgets/BigFooter.js";
