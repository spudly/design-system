/**
 * Page components (#49): full-page, props-controlled views for the
 * apps' screens. The package root re-exports this barrel and,
 * since #411 amended #298, a minimal set of additions beside it
 * (the brand themes and their types, and `createTamaguiConfig`);
 * there are no subpath exports, and no
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
  type RecipesPageCookLogForm,
  type RecipesPageCookLogFormValues,
} from "./eciperay/RecipesPage.js";
export {
  MealPlansPage,
  type MealPlansPageItem,
  type MealPlansPageProps,
} from "./eciperay/MealPlansPage.js";
export {
  RecipeDetailPage,
  type RecipeDetailPageProps,
  type RecipeDetailPageReadyProps,
  type RecipeDetailPageOwnerReadyProps,
  type RecipeDetailPageGuestReadyProps,
  type RecipeDetailPageGuestOverviewProps,
  type RecipeDetailPageCtas,
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
  type RecipeDetailPageNutritionFact,
  type RecipeDetailPageNutritionFactKind,
  type RecipeDetailPageSharing,
  type RecipeDetailPageSharingConsentSpan,
  type RecipeDetailPageComments,
  type RecipeDetailPageConfirmation,
  type RecipeDetailPageCookLogForm,
  type RecipeDetailPageCookLogFormValues,
} from "./eciperay/RecipeDetailPage.js";
export {
  MealPlanDetailPage,
  type MealPlanDetailPageDay,
  type MealPlanDetailPageEntry,
  type MealPlanDetailPageNutritionGoals,
  type MealPlanDetailPageProps,
  type MealPlanDetailPageWeekView,
  type MealPlanDetailPageWeeklyTotals,
  type MealPlanDetailPageWeeklyTotalsRow,
} from "./eciperay/MealPlanDetailPage.js";
export {
  TabbedShellPage,
  type TabbedShellPageLinkTab,
  type TabbedShellPageProps,
  type TabbedShellPageTab,
} from "./memorize/TabbedShellPage.js";
export {
  AppShellPage,
  type AppShellPageAction,
  type AppShellPageNavItem,
  type AppShellPageProps,
  type AppShellPageSearch,
} from "./eciperay/AppShellPage.js";
export {
  MemorizeReviewPage,
  type MemorizeReviewPageProps,
  type MemorizeReviewPageVerse,
} from "./memorize/MemorizeReviewPage.js";
export {
  VerseSearchPage,
  type VerseSearchPageItem,
  type VerseSearchPageProps,
} from "./memorize/VerseSearchPage.js";
export {
  MyVersesPage,
  type MyVersesPageItem,
  type MyVersesPageProps,
  type MyVersesPageStatus,
} from "./memorize/MyVersesPage.js";
export {
  MemorizationSessionPage,
  type MemorizationSessionPageProps,
  type MemorizationSessionPageReadyProps,
  type MemorizationSessionPageWord,
} from "./memorize/MemorizationSessionPage.js";
export {
  MemorizeSettingsPage,
  type MemorizeSettingsPageProps,
} from "./memorize/MemorizeSettingsPage.js";
export {
  RecipeFormPage,
  type RecipeFormPageProps,
  type RecipeFormPageField,
  type RecipeFormPageOption,
} from "./eciperay/RecipeFormPage.js";
export { EditRecipePage } from "./eciperay/EditRecipePage.js";
export { ManualEntryPage } from "./eciperay/ManualEntryPage.js";
export { EditVersionPage, type EditVersionPageProps } from "./eciperay/EditVersionPage.js";
export { SignInPage, type SignInPageProps } from "./eciperay/SignInPage.js";
export { SignUpPage, type SignUpPageProps } from "./eciperay/SignUpPage.js";
export { ForgotPasswordPage, type ForgotPasswordPageProps } from "./eciperay/ForgotPasswordPage.js";
export { ResetPasswordPage, type ResetPasswordPageProps } from "./eciperay/ResetPasswordPage.js";
export {
  ProfilePage,
  type ProfilePageProps,
  type ProfilePageSubscription,
  type ProfilePageAccountData,
  type ProfilePageTransfer,
  type ProfilePageFeedbackPreference,
  type ProfilePageAuthorDisplay,
  type ProfilePageFamilySharing,
  type ProfilePageShowLess,
  type ProfilePageLegalLink,
} from "./eciperay/ProfilePage.js";
export { ImportTextPage, type ImportTextPageProps } from "./eciperay/ImportTextPage.js";
export { ImportUrlPage, type ImportUrlPageProps } from "./eciperay/ImportUrlPage.js";
export { ImportImagePage, type ImportImagePageProps } from "./eciperay/ImportImagePage.js";
export { ImportReviewPage, type ImportReviewPageProps } from "./eciperay/ImportReviewPage.js";
export { HomePage, type HomePageProps, type HomePageRecipe } from "./eciperay/HomePage.js";
export {
  LandingPage,
  type LandingPageProps,
  type LandingPageCta,
  type LandingPageFeature,
} from "./eciperay/LandingPage.js";
export {
  TagsPage,
  type TagsPageOperationResult,
  type TagsPageProps,
  type TagsPageTag,
} from "./eciperay/TagsPage.js";
export { FeedbackPage, type FeedbackPageProps } from "./eciperay/FeedbackPage.js";
export {
  AddRecipeMenuPage,
  type AddRecipeMenuPageProps,
  type AddRecipeMenuPageOption,
} from "./eciperay/AddRecipeMenuPage.js";
export {
  AiSessionPage,
  type AiSessionPageProps,
  type AiSessionPageConfig,
  type AiSessionPageMessage,
  type AiSessionPageSession,
} from "./eciperay/AiSessionPage.js";
export {
  MealFormPage,
  type MealFormPageProps,
  type MealFormPageRecipeOption,
} from "./eciperay/MealFormPage.js";
export {
  MealPlanFormPage,
  type MealPlanFormPageProps,
  type MealPlanFormPageEntryOption,
} from "./eciperay/MealPlanFormPage.js";
export {
  ShoppingListPage,
  type ShoppingListPageProps,
  type ShoppingListPageLine,
} from "./eciperay/ShoppingListPage.js";
export {
  MealCookingModePage,
  type MealCookingModePageErrorProps,
  type MealCookingModePageProps,
  type MealCookingModePageReadyProps,
  type MealCookingModePageStep,
} from "./eciperay/MealCookingModePage.js";
export {
  CookingModePage,
  type CookingModePageProps,
  type CookingModePageStep,
  type CookingModePageIngredients,
} from "./eciperay/CookingModePage.js";
export { PayPage, type PayPageProps, type PayPageStatus } from "./eciperay/PayPage.js";
export {
  ConsentPreferencesPage,
  type ConsentPreferencesPageProps,
  type ConsentPreferencesPageChoice,
} from "./eciperay/ConsentPreferencesPage.js";
export {
  AuthConfirmationPage,
  type AuthConfirmationPageProps,
} from "./eciperay/AuthConfirmationPage.js";
export {
  RouteErrorPage,
  type RouteErrorPageProps,
  type RouteErrorPageVariant,
} from "./eciperay/RouteErrorPage.js";
export {
  MealDetailPage,
  type MealDetailPageProps,
  type MealDetailPageMember,
} from "./eciperay/MealDetailPage.js";
export {
  MealsHubPage,
  type MealsHubPageProps,
  type MealsHubPageMeal,
  type MealsHubPageTab,
} from "./eciperay/MealsHubPage.js";
export {
  LegalDocumentPage,
  type LegalDocumentPageProps,
  type LegalDocumentSection,
  type LegalDocumentBlock,
  type LegalDocumentSpan,
  type LegalDocumentLink,
} from "./eciperay/LegalDocumentPage.js";

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
  type BigFooterShellHeader,
} from "../widgets/content/BigFooter.js";
