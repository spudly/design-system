import type { ReactNode } from "react";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { EqualButtonRow } from "../components/EqualButtonRow.js";
import { LoadingGate } from "../components/LoadingGate.js";
import { MessageCard } from "../components/MessageCard.js";
import { RatingsCard } from "../components/RatingsCard.js";
import { RecipeIngredientsPanel } from "../components/RecipeIngredientsPanel.js";
import { RecipeInstructionsPanel } from "../components/RecipeInstructionsPanel.js";
import { RecipeOverviewPanel } from "../components/RecipeOverviewPanel.js";
import { ScrollShell } from "../components/ScrollShell.js";
import { Text } from "../components/Text.js";
import type {
  RecipeDetailPageCommunityRating,
  RecipeDetailPageIngredient,
  RecipeDetailPageIngredientsProps,
  RecipeDetailPageInstruction,
  RecipeDetailPageInstructionsProps,
  RecipeDetailPageRatings,
  RecipeDetailPageSubstitution,
  RecipeDetailPageTag,
  RecipeDetailPageViewerRating,
} from "./RecipeDetailPage.js";

/**
 * PublicRecipePage (#169): Eciperay's public (signed-out, SEO)
 * recipe surface as a controlled @spudly/ui page component,
 * following the RecipeDetailPage precedent throughout. It is a
 * distinct surface from RecipeDetailPage: an anonymous audience,
 * no account data in the view-model, no version picker, no
 * lifecycle/sharing/cook-history/nutrition sections, and two real
 * error states. The app keeps the route, params and share token,
 * the getPublic query, the slug-canonical redirect, the document
 * head (title/meta/JSON-LD), the clone and rating mutations, and
 * the comments data — and drives this view entirely through
 * props: a view-model per section in, intent callbacks out.
 * Nothing here imports an app package or fetches anything.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root —
 * members of the page family import react-native
 * (TouchableOpacity), and the root entry must stay importable
 * in plain Node.
 *
 * The contract decisions (Stephen, 2026-10-28, on #169):
 * - Single scroll, no tabs: the web surface's Overview /
 *   Ingredients / Instructions tabs are dropped (the
 *   RecipeDetailPage #71 precedent) and the sections stack in tab
 *   order — overview, ingredients, instructions, engagement — so
 *   every section stays in the document on this SEO-first surface.
 * - Engagement is in v1: the ratings view-model is reused from
 *   RecipeDetailPage verbatim, and comments enter through the
 *   renderComments slot, exactly as on the detail page — the
 *   comments section carries its own query, draft/edit state, and
 *   three mutations, so it cannot be view-modeled without leaking
 *   business logic into props.
 * - Error states live inside the props union: `notFound` and
 *   `unavailable` are union members with DS-owned copy (the web
 *   messages verbatim), so the whole route is one component and
 *   the error cards get story coverage. RecipeDetailPage's
 *   no-error-state stance does not bind here — there the app has
 *   no error UI at all, while here the error cards are designed
 *   surface.
 * - The public chrome is a separate DS building block,
 *   PublicPageFrame: the host wraps every state of this page
 *   (loading, errors, ready) in the frame, as the web host wraps
 *   its states in its public layout today.
 *
 * The CTA bar sits above the sections, its variant chosen by the
 * host's auth state: signed-out visitors get sign-up / clone /
 * get-the-app intents; signed-in viewers get the clone mutation's
 * own button (with its pending state) and get-the-app. All three
 * intents are plain callbacks — the host navigates, runs the clone
 * mutation, or opens the install URL. The button copy is DS-owned
 * constants that move with the page, per the copy precedent.
 *
 * Composition (#119): the page composes design-system components
 * and passes data and callbacks only — no styling props, layout
 * primitives, or style objects appear in this file.
 * ScrollShell owns the surface paint, the single scroll region,
 * and the content column's inset and separation rhythm; the four
 * sections are the shared components whose shapes
 * RecipeDetailPage's sections mirror (RecipeOverviewPanel,
 * RecipeIngredientsPanel, RecipeInstructionsPanel, RatingsCard);
 * LoadingGate carries the loading state and MessageCard the two
 * error states. Section separation is the shell column's 16px
 * gap throughout, where the hand-styled page mixed 16px section
 * padding with 8px heading margins — the headings now sit 16px
 * from the sections on both sides — and the headings take Text's
 * subheading variant (xl semibold ink) in place of the
 * hand-styled lg treatment.
 *
 * The sections' ephemeral state stays inside the section
 * components, mirroring RecipeDetailPage: the instructions
 * panel's active step and the ingredients panel's custom-scale
 * editing. None of it is business state.
 *
 * No lineHeight is set anywhere in this file (the #162 rule).
 */

// ---------------------------------------------------------------------------
// View-model types (DS-owned; the app maps its domain types at the
// boundary). The section shapes that are identical to the detail
// page's — ingredients, instructions, ratings, tags — are reused
// from RecipeDetailPage verbatim under this page's names, so the
// two surfaces cannot drift apart on the shapes they share.
// ---------------------------------------------------------------------------

export type PublicRecipePageTag = RecipeDetailPageTag;

export type PublicRecipePageRatings = RecipeDetailPageRatings;
export type PublicRecipePageCommunityRating = RecipeDetailPageCommunityRating;
export type PublicRecipePageViewerRating = RecipeDetailPageViewerRating;

export type PublicRecipePageIngredient = RecipeDetailPageIngredient;
export type PublicRecipePageSubstitution = RecipeDetailPageSubstitution;
export type PublicRecipePageIngredientsProps = RecipeDetailPageIngredientsProps;

export type PublicRecipePageInstruction = RecipeDetailPageInstruction;
export type PublicRecipePageInstructionsProps = RecipeDetailPageInstructionsProps;

export type PublicRecipePageOverviewProps = {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  /** Recipe status as a plain string; the badge label/tone map
   * is DS-owned in RecipeOverviewPanel (the same map
   * RecipeDetailPage carries). Unknown values fall back to
   * "idea", as the app's status normalizer does. */
  status: string;
  /** Overview stat band values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  tags: PublicRecipePageTag[];
};

/** The CTA bar's variant, chosen by the host's auth state. The
 * signed-in variant carries the clone mutation's pending state:
 * its button reads "Saving…" and disables while a clone is in
 * flight. */
export type PublicRecipePageCtas =
  { variant: "signedOut" } | { variant: "signedIn"; isClonePending?: boolean };

export type PublicRecipePageReadyProps = {
  state: "ready";
  overview: PublicRecipePageOverviewProps;
  ctas: PublicRecipePageCtas;
  /** Sign-up intent (signed-out bar): the host navigates. */
  onSignUpPress: () => void;
  /** Clone intent: signed out, the host navigates to sign-up with
   * the clone target; signed in, it runs the clone mutation. */
  onClonePress: () => void;
  /** Get-the-app intent: the host opens the install URL. */
  onGetAppPress: () => void;
  ingredients: PublicRecipePageIngredientsProps;
  instructions: PublicRecipePageInstructionsProps;
  /** Engagement block; omit (or pass null) to hide it. */
  ratings?: PublicRecipePageRatings | null;
  onViewerRatingChange?: (stars: number | null) => void;
  /** Slot: the app's comments section, rendered in the engagement
   * stack under the ratings card — its position on the web
   * surface today. */
  renderComments?: () => ReactNode;
};

export type PublicRecipePageProps =
  | { state: "loading" }
  | { state: "notFound" }
  | { state: "unavailable" }
  | PublicRecipePageReadyProps;

// ---------------------------------------------------------------------------
// Constants moved with the page (the copy precedent: option sets
// and section copy are DS-owned and move with the page — the
// sections' own constants moved with their components in #119).
// ---------------------------------------------------------------------------

// CTA copy, verbatim from the web surface's CTA bar. The signed-in
// clone label is the app's shared SAVE_RECIPE_COPY_LABEL; its
// pending label is the web button's in-flight text.
const SIGN_UP_LABEL = "Sign up free";
const CLONE_LABEL = "Clone this recipe";
const SAVE_COPY_LABEL = "Save a copy";
const SAVE_COPY_PENDING_LABEL = "Saving…";
const GET_APP_LABEL = "Get the mobile app";

// Error copy, verbatim from the web surface's error cards.
const NOT_FOUND_TITLE = "Recipe not found";
const NOT_FOUND_MESSAGE = "This recipe may be private or no longer available.";
const UNAVAILABLE_TITLE = "Recipe unavailable";
const UNAVAILABLE_MESSAGE = "This recipe link is invalid or has expired.";

// ---------------------------------------------------------------------------
// Shared panel pieces.
// ---------------------------------------------------------------------------

/** A section's heading on the single scrollable page: the
 * sections after the overview header are found by scanning, so
 * each carries its label — the labels the tab bar used to show.
 * The subheading variant (xl semibold) carries the treatment
 * (#119). */
function SectionHeading({ children }: { children: string }) {
  return <Text variant="subheading">{children}</Text>;
}

// ---------------------------------------------------------------------------
// CTA bar (above the sections; variant chosen by auth state). The
// bar's card has no outer spacing of its own: the shell column
// insets it and owns its separation from the overview below
// (#119). Its buttons share the card's width through
// EqualButtonRow.
// ---------------------------------------------------------------------------

function CtaBar({
  ctas,
  onSignUpPress,
  onClonePress,
  onGetAppPress,
}: {
  ctas: PublicRecipePageCtas;
  onSignUpPress: () => void;
  onClonePress: () => void;
  onGetAppPress: () => void;
}) {
  return (
    <Card>
      <EqualButtonRow>
        {ctas.variant === "signedOut" ? (
          <>
            <Button key="sign-up" variant="primary" onPress={onSignUpPress}>
              {SIGN_UP_LABEL}
            </Button>
            <Button key="clone" variant="secondary" onPress={onClonePress}>
              {CLONE_LABEL}
            </Button>
            <Button key="get-app" variant="secondary" onPress={onGetAppPress}>
              {GET_APP_LABEL}
            </Button>
          </>
        ) : (
          <>
            <Button
              key="clone"
              variant="primary"
              disabled={ctas.isClonePending ?? false}
              onPress={onClonePress}
            >
              {ctas.isClonePending ? SAVE_COPY_PENDING_LABEL : SAVE_COPY_LABEL}
            </Button>
            <Button key="get-app" variant="secondary" onPress={onGetAppPress}>
              {GET_APP_LABEL}
            </Button>
          </>
        )}
      </EqualButtonRow>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// The page.
// ---------------------------------------------------------------------------

/**
 * Full-page public recipe view: a CTA bar above all four sections
 * in a single scroll view (no tabs — overview, ingredients,
 * instructions, engagement, in the order the tabs had), or one of
 * the union's non-ready states (loading gate, not-found card,
 * unavailable card). The host wraps every state in
 * PublicPageFrame. Controlled — see the file header for the
 * contract, the decisions, and the slot design.
 */
export function PublicRecipePage(props: PublicRecipePageProps) {
  if (props.state === "loading") {
    return <LoadingGate label="Loading recipe" />;
  }

  if (props.state === "notFound") {
    return <MessageCard title={NOT_FOUND_TITLE} message={NOT_FOUND_MESSAGE} />;
  }

  if (props.state === "unavailable") {
    return <MessageCard title={UNAVAILABLE_TITLE} message={UNAVAILABLE_MESSAGE} />;
  }

  const { ratings, onViewerRatingChange, renderComments } = props;
  // Called once per render; the slot's content renders in the
  // engagement stack under the ratings card.
  const comments = renderComments ? renderComments() : null;
  const { overview } = props;

  return (
    <ScrollShell>
      <CtaBar
        ctas={props.ctas}
        onSignUpPress={props.onSignUpPress}
        onClonePress={props.onClonePress}
        onGetAppPress={props.onGetAppPress}
      />
      <RecipeOverviewPanel
        title={overview.title}
        status={overview.status}
        servingsLabel={overview.servingsLabel}
        tags={overview.tags}
        {...(overview.imageUrl !== undefined ? { imageUrl: overview.imageUrl } : {})}
        {...(overview.description !== undefined ? { description: overview.description } : {})}
        {...(overview.prepTimeLabel !== undefined ? { prepTimeLabel: overview.prepTimeLabel } : {})}
        {...(overview.cookTimeLabel !== undefined ? { cookTimeLabel: overview.cookTimeLabel } : {})}
      />
      <SectionHeading>Ingredients</SectionHeading>
      <RecipeIngredientsPanel ingredients={props.ingredients} />
      <SectionHeading>Instructions</SectionHeading>
      <RecipeInstructionsPanel instructions={props.instructions.instructions} />
      {ratings ? (
        <RatingsCard ratings={ratings} onViewerRatingChange={onViewerRatingChange} />
      ) : null}
      {comments}
    </ScrollShell>
  );
}
