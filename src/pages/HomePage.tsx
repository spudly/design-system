import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Fragment, type ReactNode } from "react";
import { Button } from "../widgets/Button.js";
import { ButtonStack } from "../widgets/ButtonStack.js";
import { Card } from "../widgets/Card.js";
import { CenteredText } from "../widgets/CenteredText.js";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
import { ListStack } from "../widgets/ListStack.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Text } from "../widgets/Text.js";

/**
 * HomePage (#126, B3c): the home view — the split view half
 * of Eciperay's `HomeView` (the B2 audit's page-view
 * disposition). The screen keeps the recently-viewed query,
 * the delete mutation and its confirmation, and navigation;
 * this view renders the chrome and the list states.
 *
 * Loading (#278, tranche 4): the centered-Spinner pattern is
 * deleted — while `loading`, the page keeps its real frame
 * (title, subtitle, and the three navigation actions, which
 * need no data) and the list region renders skeleton rows:
 * exactly 3 dummy rows, each a card holding title and subtitle
 * bones at the loaded rows' text sizes, inside a LoadingScope.
 * The host's rows cannot skeletonize themselves (they cross
 * through the render slot), so the dummy rows are the page's
 * own composition in the rows' card shape.
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
 * owns the surrounding states: while `loading` the list region
 * renders its skeleton rows (see the loading note above), and
 * an empty list renders the host's empty message.
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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  title: string;
  subtitle: string;
  browseLabel: string;
  addLabel: string;
  sharedWithMeLabel: string;
  recipesTitle: string;
  emptyMessage: string;
  recipes: HomePageRecipe[];
  renderRecipeRow: (recipe: HomePageRecipe) => ReactNode;
  loading?: boolean;
  /** Navigation destinations (#248: navigation crosses as hrefs,
   * not press callbacks); the host composes them from its routes. */
  browseHref: string;
  addHref: string;
  sharedWithMeHref: string;
};

// The dummy skeleton rows for the loading list (#278): exactly
// 3, from a frozen module-level constant — never generated per
// render (the CheckboxSelectList convention).
const LOADING_ROW_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

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
  loading = false,
  browseHref,
  addHref,
  sharedWithMeHref,
  footer,
}: HomePageProps) {
  return (
    <BigFooterShell footer={footer}>
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
          {loading ? (
            <LoadingScope active>
              <ListStack>
                {LOADING_ROW_KEYS.map((key) => (
                  <Card key={key}>
                    <TextSkeleton size="md" lines={1} />
                    <TextSkeleton size="sm" lines={1} />
                  </Card>
                ))}
              </ListStack>
            </LoadingScope>
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
    </BigFooterShell>
  );
}
