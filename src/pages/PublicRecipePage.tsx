import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useMemo,
  type ReactElement,
  type ReactNode,
} from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { LoadingGate } from "../components/LoadingGate.js";
import { MarkableRow } from "../components/MarkableRow.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { PresetValueSelector, type PresetValueOption } from "../components/PresetValueSelector.js";
import { RatingsCard } from "../components/RatingsCard.js";
import { ScrollShell } from "../components/ScrollShell.js";
import { SectionHeading } from "../components/SectionHeading.js";
import { StatBand } from "../components/StatBand.js";
import { StatCard } from "../components/StatCard.js";
import { StatusBadge } from "../components/StatusBadge.js";
import { StepList } from "../components/StepList.js";
import { SuggestionPanel } from "../components/SuggestionPanel.js";
import { TagList } from "../components/TagList.js";
import { Text } from "../components/Text.js";
import { Thumbnail } from "../components/Thumbnail.js";
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
 * three recipe sections are composed in this file from the
 * shared primitives — the overview from Thumbnail, StatusBadge,
 * StatBand/StatCard and TagList; the ingredients from
 * NumberStepper, PresetValueSelector, MarkableRow and
 * SuggestionPanel; the instructions from StepList — the same
 * pieces RecipeDetailPage's in-file sections compose, so the two
 * surfaces render one interaction model. Under the #119 program
 * rule (2026-10-29) a tranche page adds no library components:
 * the sections live here as page-local compositions, and their
 * extraction into shared components shared with RecipeDetailPage
 * belongs to a separate component-only change. Section
 * separation is the shell column's 16px gap throughout, where
 * the hand-styled page mixed 16px section padding with 8px
 * heading margins — the headings now sit 16px from the sections
 * on both sides — and the section headings are the shared
 * SectionHeading (Text's subheading variant, xl semibold ink)
 * in place of the hand-styled lg treatment.
 *
 * The sections' ephemeral state stays inside the shared pieces
 * that own it, mirroring RecipeDetailPage: StepList holds the
 * active step, PresetValueSelector the custom-scale editing.
 * None of it is business state.
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
  /** Recipe status as a plain string; the overview section
   * resolves it to the badge's tone and label through the
   * page's STATUS_BADGES map (the same map RecipeDetailPage
   * carries) and renders the shared StatusBadge from the pair —
   * status words are the surface's data, not a design-system
   * vocabulary (#119 dedupe). Unknown values fall back to
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

// Scale multipliers from the app's scaling constants (shared with
// RecipeDetailPage's ingredients section); labels are
// presentation, the servings math stays app-side.
const SCALE_OPTIONS: PresetValueOption[] = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

// The custom scale slot's resting label: beside the presets, one
// more slot that turns into a number input when pressed, as on
// RecipeDetailPage (#73). Once a custom value applies, the slot
// shows that value ("4×") selected instead of this label.
const CUSTOM_SCALE_LABEL = "Custom";

/** A scale value as the custom slot shows it: the number without
 * trailing zeros ("2.50" → "2.5"); non-numeric values pass through. */
function formatScaleValue(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

const MISSING_INGREDIENTS_HINT =
  "Tap an ingredient to mark it missing and see substitutions below.";

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
                (item as ReactElement).key != null
                  ? (item as ReactElement).key
                  : `button-${index}`,
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
// The three recipe sections, composed in-file from the shared
// primitives (see the header's composition note). Each carries
// no outer padding or spacing — the shell column insets it and
// owns separation from its neighbours; a section's own blocks
// separate with padding wrappers, the recipe pages' settled form.
// ---------------------------------------------------------------------------

/** The overview header block: hero image, title, status badge,
 * description, the servings/prep/cook stat band, and the tag
 * row. */
function OverviewSection({ overview }: { overview: PublicRecipePageOverviewProps }) {
  const {
    imageUrl,
    title,
    description,
    servingsLabel,
    prepTimeLabel,
    cookTimeLabel,
    tags,
  } = overview;
  const statusBadge = STATUS_BADGES[overview.status] ?? STATUS_BADGES.idea;

  return (
    <YStack>
      {imageUrl ? (
        <YStack paddingBlockEnd="$4">
          <Thumbnail src={imageUrl} />
        </YStack>
      ) : null}
      <YStack paddingBlockEnd="$2">
        <Text
          fontSize={tokens.typography.fontSize["2xl"]}
          fontWeight={tokens.typography.fontWeight.bold}
          color={tokens.colors.gray.gray10}
        >
          {title}
        </Text>
      </YStack>
      <YStack paddingBlockEnd="$4" alignSelf="flex-start">
        <StatusBadge
          tone={statusBadge?.tone ?? "neutral"}
          label={statusBadge?.label ?? "Idea"}
        />
      </YStack>
      {description ? (
        <YStack paddingBlockEnd="$4">
          <Text color={tokens.colors.gray.gray7}>{description}</Text>
        </YStack>
      ) : null}
      <YStack paddingBlockEnd="$4">
        <StatBand>
          <StatCard label="Servings" value={servingsLabel} />
          {prepTimeLabel ? <StatCard label="Prep" value={prepTimeLabel} /> : null}
          {cookTimeLabel ? <StatCard label="Cook" value={cookTimeLabel} /> : null}
        </StatBand>
      </YStack>
      {tags.length > 0 ? <TagList tags={tags} /> : null}
    </YStack>
  );
}

/** The ingredients section: the servings stepper and scale
 * selector (#73, as on RecipeDetailPage), the pressable
 * ingredient rows (missing ones dimmed by MarkableRow, optional
 * ones noted), and the substitutions block. */
function IngredientsSection({
  ingredients: view,
}: {
  ingredients: PublicRecipePageIngredientsProps;
}) {
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);

  return (
    <YStack>
      {/* Servings + scale controls: one compact block, two fixed
          rows, and every value directly enterable. Servings is an
          inline editable stepper; Scale is the
          PresetValueSelector — a single non-wrapping row of
          equal-width preset buttons plus a Custom button that
          turns into a number input when pressed and afterwards
          shows the applied custom value selected. */}
      <YStack gap="$3" paddingBlockEnd="$4">
        <NumberStepper
          label="Servings"
          layout="inline"
          value={view.servings}
          min={1}
          onChange={view.onServingsChange}
          editable
        />
        <PresetValueSelector
          label="Scale"
          options={SCALE_OPTIONS}
          value={view.scaleValue}
          onChange={view.onScaleChange}
          customLabel={CUSTOM_SCALE_LABEL}
          customAccessibilityLabel="Custom scale"
          formatCustomValue={(custom) => `${formatScaleValue(custom)}×`}
        />
      </YStack>
      {view.ingredients.map((ingredient) => (
        <MarkableRow
          key={ingredient.id}
          label={ingredient.label}
          {...(ingredient.isOptional ? { trailingNote: "optional" } : {})}
          isMarked={ingredient.isMissing ?? false}
          {...(view.onIngredientPress
            ? {
                onPress: () => {
                  view.onIngredientPress?.(ingredient.id);
                },
              }
            : {})}
        />
      ))}
      {hasMissing ? (
        <YStack paddingBlockStart="$3">
          <Text variant="hint">{MISSING_INGREDIENTS_HINT}</Text>
        </YStack>
      ) : null}
      {view.isLoadingSubstitutions ? (
        <YStack paddingBlockStart="$4">
          <Text variant="hint">Finding substitutions…</Text>
        </YStack>
      ) : null}
      {view.substitutions && view.substitutions.length > 0 ? (
        <YStack paddingBlockStart="$4">
          <SuggestionPanel
            title="Substitutions"
            entries={view.substitutions.map((sub) => ({
              id: sub.ingredient,
              label: sub.ingredient,
              detail: sub.suggestions,
            }))}
          />
        </YStack>
      ) : null}
    </YStack>
  );
}

/** The instructions section: the step cards in step-number order
 * through the shared StepList (it owns the card treatment and
 * the active-step state); each step's "Step N" eyebrow label is
 * composed here — StepList takes pre-composed labels because
 * labels are caller content. */
function InstructionsSection({
  instructions,
}: {
  instructions: PublicRecipePageInstruction[];
}) {
  const sorted = useMemo(
    () => [...instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [instructions],
  );
  return (
    <StepList
      steps={sorted.map((step) => ({
        id: step.id,
        label: `Step ${step.stepNumber}`,
        body: step.body,
      }))}
    />
  );
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
