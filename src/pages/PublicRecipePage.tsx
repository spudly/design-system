import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { LoadingGate } from "../components/LoadingGate.js";
import { RatingsCard } from "../components/RatingsCard.js";
import { RecipeIngredientsPanel } from "../components/RecipeIngredientsPanel.js";
import { RecipeInstructionsPanel } from "../components/RecipeInstructionsPanel.js";
import { RecipeOverviewPanel } from "../components/RecipeOverviewPanel.js";
import { ScrollShell } from "../components/ScrollShell.js";
import { SectionHeading } from "../components/SectionHeading.js";
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
 * and passes data and callbacks only. ScrollShell owns the
 * surface paint, the single scroll region, and the content
 * column's inset and separation rhythm; RatingsCard carries the
 * engagement section and LoadingGate the loading state. The
 * three recipe sections are the shared library panels —
 * RecipeOverviewPanel, RecipeIngredientsPanel and
 * RecipeInstructionsPanel — extracted in the component-only
 * change (#331) after this tranche first composed them in-file
 * under the #119 program rule (2026-10-29) that a tranche page
 * adds no library components; the same panels serve
 * RecipeDetailPage's sections, so the two surfaces render one
 * interaction model. What stays page-side is only the wiring:
 * the status badge's tone/label pair resolved from the page's
 * own STATUS_BADGES map, and the section view-models passed
 * through. Section separation is the shell column's 16px gap
 * throughout, where the hand-styled page mixed 16px section
 * padding with 8px heading margins — the headings now sit 16px
 * from the sections on both sides — and the section headings
 * are the shared SectionHeading (Text's subheading variant,
 * xl semibold ink) in place of the hand-styled lg treatment.
 *
 * The sections' ephemeral state stays inside the shared pieces
 * that own it, mirroring RecipeDetailPage: the instructions
 * panel's StepList holds the active step, the ingredients
 * panel's PresetValueSelector the custom-scale editing. None
 * of it is business state.
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
  /** Recipe status as a plain string; the page resolves it to
   * the badge's tone and label through its STATUS_BADGES map
   * (the same map RecipeDetailPage carries) and passes the pair
   * into RecipeOverviewPanel — status words are the surface's
   * data, not a design-system vocabulary (#119 dedupe). Unknown
   * values fall back to "idea", as the app's status normalizer
   * does. */
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
// and section copy are DS-owned and move with the page).
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

// Status badge map: labels and tones for the app's four statuses
// (idea → neutral gray, evolving → info blue, perfected → success
// green, abandoned → danger red, matching the app's badge tints) —
// the same map RecipeDetailPage carries. The page owns the map:
// status words are the surface's data, not a vocabulary the
// shared components own (#119 dedupe).
const STATUS_BADGES: Record<
  string,
  { label: string; tone: "neutral" | "info" | "success" | "danger" }
> = {
  idea: { label: "Idea", tone: "neutral" },
  evolving: { label: "Evolving", tone: "info" },
  perfected: { label: "Perfected", tone: "success" },
  abandoned: { label: "Abandoned", tone: "danger" },
};

// The scale option set, the custom-scale label and the missing-
// ingredients hint moved with the ingredients section into
// RecipeIngredientsPanel (#331); the servings math stays app-side.

// ---------------------------------------------------------------------------
// CTA bar (above the sections; variant chosen by auth state). The
// bar's card has no outer spacing of its own: the shell column
// insets it and owns its separation from the overview below
// (#119). Its buttons share the card's width equally — flex 1
// with a 40% minimum, wrapping instead of shrinking — sized here
// in the bar, so no caller sizes a button itself (the treatment
// ButtonRow's natural-width row is the sibling of).
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
  const buttons =
    ctas.variant === "signedOut" ? (
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
    );
  // Flatten the variant's fragment into the row's items, then
  // size each button: flex 1 with a 40% minimum width, so
  // buttons sharing a line split its width equally and share its
  // height, and a button alone on a wrapped line fills that line.
  const items: ReactNode[] = [];
  Children.forEach(buttons, (child) => {
    if (isValidElement(child) && child.type === Fragment) {
      Children.forEach(
        (child as ReactElement<{ children?: ReactNode }>).props.children,
        (inner) => {
          if (inner === null || inner === undefined || typeof inner === "boolean") return;
          items.push(inner);
        },
      );
    }
  });
  return (
    <Card>
      <XStack gap={tokens.spacing[3]} flexWrap="wrap">
        {items.map((item, index) =>
          isValidElement(item) ? (
            cloneElement(item as ReactElement<{ flex?: number; minWidth?: string }>, {
              flex: 1,
              minWidth: "40%",
              key:
                (item as ReactElement).key != null ? (item as ReactElement).key : `button-${index}`,
            })
          ) : (
            <Fragment key={`button-${index}`}>{item}</Fragment>
          ),
        )}
      </XStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// The three recipe sections are the shared library panels (see
// the header's composition note): RecipeOverviewPanel,
// RecipeIngredientsPanel and RecipeInstructionsPanel carry the
// sections' rendering; this file only wires the page's
// view-models into them. The overview's one piece of page-side
// wiring is the status resolution below — the panel takes the
// badge's tone/label pair, and the map that produces it is the
// page's own.
// ---------------------------------------------------------------------------

/** The overview header block: the shared RecipeOverviewPanel,
 * fed the page's overview view-model with its status resolved
 * to the badge's tone/label pair through STATUS_BADGES. */
function OverviewSection({ overview }: { overview: PublicRecipePageOverviewProps }) {
  const statusBadge = STATUS_BADGES[overview.status] ?? STATUS_BADGES.idea;

  return (
    <RecipeOverviewPanel
      {...(overview.imageUrl !== undefined ? { imageUrl: overview.imageUrl } : {})}
      title={overview.title}
      {...(overview.description !== undefined ? { description: overview.description } : {})}
      statusTone={statusBadge?.tone ?? "neutral"}
      statusLabel={statusBadge?.label ?? "Idea"}
      servingsLabel={overview.servingsLabel}
      {...(overview.prepTimeLabel !== undefined ? { prepTimeLabel: overview.prepTimeLabel } : {})}
      {...(overview.cookTimeLabel !== undefined ? { cookTimeLabel: overview.cookTimeLabel } : {})}
      tags={overview.tags}
    />
  );
}

/** The ingredients section: the shared RecipeIngredientsPanel
 * (the servings stepper and scale selector, the pressable
 * ingredient rows, and the substitutions block), fed the page's
 * ingredients view-model — the shape is RecipeDetailPage's,
 * reused by alias, and the panel's view is the same shape. */
function IngredientsSection({ ingredients }: { ingredients: PublicRecipePageIngredientsProps }) {
  return <RecipeIngredientsPanel ingredients={ingredients} />;
}

/** The instructions section: the shared
 * RecipeInstructionsPanel (the step cards in step-number order,
 * the tapped card highlighted as the active step), fed the
 * page's instruction list. */
function InstructionsSection({ instructions }: { instructions: PublicRecipePageInstruction[] }) {
  return <RecipeInstructionsPanel instructions={instructions} />;
}

// ---------------------------------------------------------------------------
// The whole-screen message state (notFound / unavailable): a
// centered card carrying a heading and one explanatory line on
// the surface-filled shell — the state the page shows when there
// is no content to render. Composed in-file from the shell stack,
// Card and Text; the copy is the state's own constants above.
// ---------------------------------------------------------------------------

function MessageState({ title, message }: { title: string; message: string }) {
  return (
    <YStack
      flex={1}
      backgroundColor="$surface"
      alignItems="center"
      justifyContent="center"
      padding="$4"
    >
      <Card>
        <YStack alignItems="center" gap="$2">
          <Text variant="heading" textAlign="center">
            {title}
          </Text>
          <Text color={tokens.colors.gray.gray6} textAlign="center">
            {message}
          </Text>
        </YStack>
      </Card>
    </YStack>
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
    return <MessageState title={NOT_FOUND_TITLE} message={NOT_FOUND_MESSAGE} />;
  }

  if (props.state === "unavailable") {
    return <MessageState title={UNAVAILABLE_TITLE} message={UNAVAILABLE_MESSAGE} />;
  }

  const { ratings, onViewerRatingChange, renderComments } = props;
  // Called once per render; the slot's content renders in the
  // engagement stack under the ratings card.
  const comments = renderComments ? renderComments() : null;

  return (
    <ScrollShell>
      <CtaBar
        ctas={props.ctas}
        onSignUpPress={props.onSignUpPress}
        onClonePress={props.onClonePress}
        onGetAppPress={props.onGetAppPress}
      />
      <OverviewSection overview={props.overview} />
      <SectionHeading>Ingredients</SectionHeading>
      <IngredientsSection ingredients={props.ingredients} />
      <SectionHeading>Instructions</SectionHeading>
      <InstructionsSection instructions={props.instructions.instructions} />
      {ratings ? (
        <RatingsCard ratings={ratings} onViewerRatingChange={onViewerRatingChange} />
      ) : null}
      {comments}
    </ScrollShell>
  );
}
