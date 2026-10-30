import { Fragment, type ReactNode } from "react";
import { Button } from "../components/Button.js";
import { ButtonStack } from "../components/ButtonStack.js";
import { CenteredText } from "../components/CenteredText.js";
import { ListLoadingState } from "../components/ListLoadingState.js";
import { ListStack } from "../components/ListStack.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
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
 * owns the surrounding states: while `isLoading` the shared
 * ListLoadingState replaces the list (it stands in for the
 * app's branded loader — the RecipeFormPage precedent; the branded
 * loader stays app-side by recorded decision), and an empty
 * list renders the host's empty message.
 *
 * De-styled for #119: the page composes DS components only —
 * the whole screen stacks in SectionStack at its uniform
 * rhythm (the bespoke per-block separations the wrappers
 * carried are gone; the loading and empty states no longer
 * add their own extra top offset either), the title keeps
 * its pinned `heading` treatment (the pageTitleHeadings
 * exception) and the section title its `subheading` variant,
 * the subtitle and empty message render through CenteredText,
 * the three actions stack in ButtonStack, and the host's
 * rows stack in ListStack, which imposes no gap of its own —
 * each row keeps the rhythm it renders with. This page is
 * the pinned exception to the `title` variant (its title is
 * a hero heading, not a screen title).
 */

export type HomePageRecipe = {
  id: string;
};

export type HomePageProps = {
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
  /** Navigation destinations (#248: navigation crosses as hrefs,
   * not press callbacks); the host composes them from its routes. */
  browseHref: string;
  addHref: string;
  sharedWithMeHref: string;
};

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
  browseHref,
  addHref,
  sharedWithMeHref,
}: HomePageProps) {
  return (
    <ScreenContainer>
      <SectionStack>
        <Text variant="heading">{title}</Text>
        <CenteredText muted>{subtitle}</CenteredText>
        <ButtonStack>
          <Button variant="primary" href={browseHref}>
            {browseLabel}
          </Button>
          <Button variant="secondary" href={addHref}>
            {addLabel}
          </Button>
          <Button variant="secondary" href={sharedWithMeHref}>
            {sharedWithMeLabel}
          </Button>
        </ButtonStack>
        <Text variant="subheading">{recipesTitle}</Text>
        {isLoading ? (
          <ListLoadingState label="Loading recipes" />
        ) : recipes.length === 0 ? (
          <CenteredText>{emptyMessage}</CenteredText>
        ) : (
          <ListStack>
            {recipes.map((recipe) => (
              <Fragment key={recipe.id}>{renderRecipeRow(recipe)}</Fragment>
            ))}
          </ListStack>
        )}
      </SectionStack>
    </ScreenContainer>
  );
}
