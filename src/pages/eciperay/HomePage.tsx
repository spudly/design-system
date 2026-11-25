import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Button } from "../../widgets/actions/Button.js";
import { CenteredText } from "../../widgets/content/CenteredText.js";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { LoadingCardRow } from "../../widgets/feedback/LoadingCardRow.js";
import { Col } from "../../widgets/layout/Col.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { Text } from "../../widgets/data/Text.js";
import { Thumbnail } from "../../widgets/data/Thumbnail.js";
import { RecipeRow, type RecipeRowItem } from "../shared/recipeRow.js";

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
 * The dummy rows are the page's own composition in the shared
 * row's card shape. The list Col imposes no gap of its own and
 * the loaded rows carry the list's rhythm in themselves (each
 * row renders with its $3 bottom separation), so each dummy
 * row's wrapper carries the same $3 bottom padding — without
 * it the skeleton cards stack flush, borders touching, where
 * the loaded list is separated.
 *
 * The copy crosses as props: the strings are the app's
 * content constants (shared with the web mirror), so the host
 * passes them in rather than the DS baking in app copy.
 *
 * Rows (#657): the page renders the shared recipe row itself
 * (recipeRow.tsx — the same row RecipesPage's own section
 * renders), so Home's recently-viewed cards are identical to
 * the browse cards: a link row with the RatingStars log-cook
 * control, no Delete control and no "Log cook" text button.
 * The host supplies only the item data, the hrefs, and the
 * `onLogCookPress` callback (the cook-log mutation itself
 * stays app-side). The page keys the rows by the view-model's
 * `id` and owns the surrounding states: while `loading` the
 * list region renders its skeleton rows (see the loading note
 * above), and an empty list renders the host's empty message.
 *
 * De-styled for #119: the page composes DS components only —
 * the whole screen stacks in a Col at gap xxl at its uniform
 * rhythm (the bespoke per-block separations the wrappers
 * carried are gone; the loading and empty states no longer
 * add their own extra top offset either), the title keeps
 * its pinned `heading` treatment (the pageTitleHeadings
 * exception) and the section title its `subheading` variant,
 * the subtitle and empty message render through CenteredText,
 * the three actions stack in a Col at gap m, and the host's
 * rows stack in a plain Col, which imposes no gap of its own —
 * each row keeps the rhythm it renders with. This page is
 * the pinned exception to the `title` variant (its title is
 * a hero heading, not a screen title).
 */

/** One recently-viewed recipe row's view-model: the shared
 * recipe-row item (see recipeRow.tsx, #657) — aliased here so
 * HomePage's rows and RecipesPage's rows cannot drift. */
export type HomePageRecipe = RecipeRowItem;

export type HomePageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /**
   * Photography-led lead image (#852): a host-supplied image URL
   * rendered as the hero `Thumbnail` above the title, following
   * RecipeDetailPage's pattern. Absent or null, nothing renders
   * in the lead slot and the page stays text-led as before — no
   * placeholder art is baked into the design system (Stephen's
   * approved option 1 for #852).
   */
  leadImageUrl?: string | null;
  /** Accessible name for the lead image; absent, it is decorative. */
  leadImageAccessibilityLabel?: string;
  title: string;
  subtitle: string;
  browseLabel: string;
  addLabel: string;
  sharedWithMeLabel: string;
  recipesTitle: string;
  emptyMessage: string;
  recipes: HomePageRecipe[];
  /** Log-cook callback, with the RecipesPage semantics: pressing
   * a row's stars fires it with the recipe's id; absent, no
   * log-cook control renders. The mutation stays app-side. */
  onLogCookPress?: (recipeId: string) => void;
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
  leadImageUrl,
  leadImageAccessibilityLabel,
  title,
  subtitle,
  browseLabel,
  addLabel,
  sharedWithMeLabel,
  recipesTitle,
  emptyMessage,
  recipes,
  onLogCookPress,
  loading = false,
  browseHref,
  addHref,
  sharedWithMeHref,
  footer,
}: HomePageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <Col gap="xxl">
          {leadImageUrl ? (
            <Thumbnail
              variant="hero"
              src={leadImageUrl}
              {...(leadImageAccessibilityLabel
                ? { accessibilityLabel: leadImageAccessibilityLabel }
                : {})}
            />
          ) : null}
          <Text variant="heading">{title}</Text>
          <CenteredText muted>{subtitle}</CenteredText>
          <Col gap="m">
            <Button variant="primary" href={browseHref}>
              {browseLabel}
            </Button>
            {/* Secondary actions take the accent variant (#852):
                under Warm Harvest that is the brief's sage accent,
                its secondary-action role. */}
            <Button variant="accent" href={addHref}>
              {addLabel}
            </Button>
            <Button variant="accent" href={sharedWithMeHref}>
              {sharedWithMeLabel}
            </Button>
          </Col>
          <Text variant="subheading">{recipesTitle}</Text>
          {loading ? (
            <LoadingScope active>
              <Col>
                {LOADING_ROW_KEYS.map((key) => (
                  <LoadingCardRow key={key} />
                ))}
              </Col>
            </LoadingScope>
          ) : recipes.length === 0 ? (
            <CenteredText>{emptyMessage}</CenteredText>
          ) : (
            <Col>
              {recipes.map((recipe) => (
                <RecipeRow key={recipe.id} item={recipe} onLogCookPress={onLogCookPress} />
              ))}
            </Col>
          )}
        </Col>
      </ScreenContainer>
    </BigFooterShell>
  );
}
