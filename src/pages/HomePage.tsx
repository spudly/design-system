import { Fragment, type ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";

/**
 * HomePage (#126, B3c): the home view — the split view half
 * of Eciperay's `HomeView` (the B2 audit's page-view
 * disposition). The screen keeps the recently-viewed query,
 * the delete mutation and its confirmation, and navigation;
 * this view renders the chrome and the list states.
 *
 * The copy crosses as props: the strings are the app's
 * content constants (shared with the web mirror), so the host
 * passes them in rather than the DS baking in app copy.
 *
 * Rows cross through the `renderRecipeRow` slot (proposals on
 * #126): the row component (`RecipeListCard`) is mixed — its
 * cook-log mutation and form-open state stay app-side — and
 * the audit records its deletion for B6, once the Home list
 * renders DS rows directly. Until then the host renders each
 * row; this page keys the rows by the view-model's `id` and
 * owns the surrounding states: while `isLoading` a spinner
 * replaces the list (the DS Spinner stands in for the app's
 * branded loader — the RecipeFormPage precedent; the branded
 * loader stays app-side by recorded decision), and an empty
 * list renders the host's empty message.
 */

export interface HomePageRecipe {
  id: string;
}

export interface HomePageProps {
  title: string;
  subtitle: string;
  browseLabel: string;
  addLabel: string;
  sharedWithMeLabel: string;
  recipesTitle: string;
  emptyMessage: string;
  recipes: HomePageRecipe[];
  renderRecipeRow: (recipe: HomePageRecipe) => ReactNode;
  isLoading?: boolean;
  onBrowsePress: () => void;
  onAddPress: () => void;
  onSharedWithMePress: () => void;
}

export function HomePage({
  title,
  subtitle,
  browseLabel,
  addLabel,
  sharedWithMeLabel,
  recipesTitle,
  emptyMessage,
  recipes,
  renderRecipeRow,
  isLoading = false,
  onBrowsePress,
  onAddPress,
  onSharedWithMePress,
}: HomePageProps) {
  return (
    <ScreenContainer>
      <YStack paddingTop="$2">
        <Text variant="heading" marginBottom="$8">
          {title}
        </Text>
        <Text color="$textMuted" marginBottom="$6" textAlign="center">
          {subtitle}
        </Text>
        <YStack marginBottom="$8" gap="$3">
          <Button variant="primary" onPress={onBrowsePress}>
            {browseLabel}
          </Button>
          <Button variant="secondary" onPress={onAddPress}>
            {addLabel}
          </Button>
          <Button variant="secondary" onPress={onSharedWithMePress}>
            {sharedWithMeLabel}
          </Button>
        </YStack>
        <Text
          variant="subheading"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.bold}
          marginBottom="$4"
        >
          {recipesTitle}
        </Text>
      </YStack>
      <YStack paddingBottom="$8">
        {isLoading ? (
          <YStack marginTop="$8" alignItems="center">
            <Spinner label="Loading recipes" />
          </YStack>
        ) : recipes.length === 0 ? (
          <Text textAlign="center" marginTop="$8">
            {emptyMessage}
          </Text>
        ) : (
          recipes.map((recipe) => <Fragment key={recipe.id}>{renderRecipeRow(recipe)}</Fragment>)
        )}
      </YStack>
    </ScreenContainer>
  );
}
