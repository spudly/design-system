import { useMemo, useState, type ReactNode } from "react";
import { TouchableOpacity } from "react-native";
import { Image, ScrollView, View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { Spinner } from "../components/Spinner.js";
import { StarRatingInput } from "../components/StarRatingInput.js";
import { StatCard } from "../components/StatCard.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { PresetValueSelector, type PresetValueOption } from "../components/PresetValueSelector.js";
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
 * `@spudly/ui/pages` subpath export, not the package root — this
 * component imports react-native (TouchableOpacity), and the root
 * entry must stay importable in plain Node.
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
 * One piece of ephemeral state stays inside the view, mirroring
 * RecipeDetailPage: the instructions section's active step. It is
 * not business state.
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
   * below is DS-owned (the same map RecipeDetailPage carries).
   * Unknown values fall back to "idea", as the app's status
   * normalizer does. */
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

// Status badge map: the same labels and tones as RecipeDetailPage
// (idea → neutral gray, evolving → info blue, perfected → success
// green, abandoned → danger red, matching the app's badge tints).
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

// The custom scale chip's resting label: beside the presets, one
// more chip that turns into a number input when pressed, as on
// RecipeDetailPage (#73). Once a custom value applies, the chip
// shows that value ("4×") selected instead of this label.
const CUSTOM_SCALE_LABEL = "Custom";

/** A scale value as the custom chip shows it: the number without
 * trailing zeros ("2.50" → "2.5"); non-numeric values pass through. */
function formatScaleValue(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

// Stale-rating hint copy, verbatim from the app's client constants
// (the same constants RecipeDetailPage carries).
const STALE_COMMUNITY_RATING_HINT =
  "Some community ratings were left on earlier recipe versions and count at half weight in the average.";
const STALE_VIEWER_RATING_HINT =
  "Your rating was left on an earlier version of the recipe. Tap a star to update it for the current version.";

const MISSING_INGREDIENTS_HINT =
  "Tap an ingredient to mark it missing and see substitutions below.";

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

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.idea;
  return <Badge tone={badge?.tone ?? "neutral"}>{badge?.label ?? "Idea"}</Badge>;
}

function EyebrowLabel({ children }: { children: string }) {
  return (
    <Text
      marginBlockEnd="$1"
      fontSize={tokens.typography.fontSize.xs}
      fontWeight={tokens.typography.fontWeight.medium}
      letterSpacing={0.3}
      color={tokens.colors.gray.gray6}
      textTransform="uppercase"
    >
      {children}
    </Text>
  );
}

/** A section's heading on the single scrollable page: the
 * sections after the overview header are found by scanning, so
 * each carries its label — the labels the tab bar used to show. */
function SectionHeading({ children }: { children: string }) {
  return (
    <Text
      paddingHorizontal="$4"
      marginBlockStart="$2"
      fontSize={tokens.typography.fontSize.lg}
      fontWeight={tokens.typography.fontWeight.semibold}
      color={tokens.colors.gray.gray10}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// CTA bar (above the sections; variant chosen by auth state).
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
    <YStack paddingHorizontal="$4" paddingTop="$4">
      <Card>
        <XStack flexWrap="wrap" gap="$3">
          {ctas.variant === "signedOut" ? (
            <>
              <Button variant="primary" flex={1} minWidth="40%" onPress={onSignUpPress}>
                {SIGN_UP_LABEL}
              </Button>
              <Button variant="secondary" flex={1} minWidth="40%" onPress={onClonePress}>
                {CLONE_LABEL}
              </Button>
              <Button variant="secondary" flex={1} minWidth="40%" onPress={onGetAppPress}>
                {GET_APP_LABEL}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                flex={1}
                minWidth="40%"
                disabled={ctas.isClonePending ?? false}
                onPress={onClonePress}
              >
                {ctas.isClonePending ? SAVE_COPY_PENDING_LABEL : SAVE_COPY_LABEL}
              </Button>
              <Button variant="secondary" flex={1} minWidth="40%" onPress={onGetAppPress}>
                {GET_APP_LABEL}
              </Button>
            </>
          )}
        </XStack>
      </Card>
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// Overview section (the page header).
// ---------------------------------------------------------------------------

function OverviewPanel({ overview }: { overview: PublicRecipePageOverviewProps }) {
  const {
    imageUrl,
    title,
    description,
    status,
    servingsLabel,
    prepTimeLabel,
    cookTimeLabel,
    tags,
  } = overview;

  return (
    <YStack padding="$4">
      {imageUrl ? (
        <YStack
          marginBlockEnd="$4"
          overflow="hidden"
          borderRadius={tokens.radii.lg}
          backgroundColor={tokens.colors.gray.gray1}
          height={256}
          width="100%"
        >
          <Image src={imageUrl} width="100%" height="100%" objectFit="contain" />
        </YStack>
      ) : null}
      <Text
        fontSize={tokens.typography.fontSize["2xl"]}
        fontWeight={tokens.typography.fontWeight.bold}
        color={tokens.colors.gray.gray10}
        marginBlockEnd="$2"
      >
        {title}
      </Text>
      <YStack marginBlockEnd="$4" alignSelf="flex-start">
        <StatusBadge status={status} />
      </YStack>
      {description ? (
        <Text color={tokens.colors.gray.gray7} marginBlockEnd="$4">
          {description}
        </Text>
      ) : null}
      <XStack
        justifyContent="space-around"
        backgroundColor={tokens.colors.gray.gray1}
        borderRadius={tokens.radii.lg}
        paddingVertical="$4"
        marginBlockEnd="$4"
      >
        <StatCard label="Servings" value={servingsLabel} />
        {prepTimeLabel ? <StatCard label="Prep" value={prepTimeLabel} /> : null}
        {cookTimeLabel ? <StatCard label="Cook" value={cookTimeLabel} /> : null}
      </XStack>
      {tags.length > 0 ? (
        <XStack flexWrap="wrap" gap="$2">
          {tags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </XStack>
      ) : null}
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// Engagement section (ratings card + the comments slot).
// ---------------------------------------------------------------------------

/** The viewer's star input with the app adapter's semantics
 * preserved (as on RecipeDetailPage): pressing the current star
 * clears the rating (null), and a pending rating disables the
 * input behind a non-interactive wrapper. */
function ViewerRatingInput({
  value,
  isPending = false,
  onChange,
}: {
  value: number | null;
  isPending?: boolean;
  onChange: ((stars: number | null) => void) | undefined;
}) {
  const interactive = !isPending && onChange !== undefined;
  return (
    <View
      pointerEvents={interactive ? "auto" : "none"}
      opacity={isPending ? 0.5 : undefined}
      {...platformAccessibilityProps({ accessibilityState: { disabled: isPending } })}
    >
      <StarRatingInput
        value={value ?? 0}
        onChange={(star) => {
          if (!isPending && onChange) {
            onChange(value === star ? null : star);
          }
        }}
      />
    </View>
  );
}

function RatingsCard({
  ratings,
  onViewerRatingChange,
}: {
  ratings: PublicRecipePageRatings;
  onViewerRatingChange: ((stars: number | null) => void) | undefined;
}) {
  return (
    <Card variant="muted" marginBlockEnd="$4">
      <EyebrowLabel>Community rating</EyebrowLabel>
      {ratings.community ? (
        <>
          <XStack marginBlockEnd="$3" alignItems="center" gap="$2">
            <Text color={tokens.colors.warning.warning5}>{ratings.community.stars}</Text>
            <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
              {ratings.community.label}
            </Text>
          </XStack>
          {ratings.community.hasStaleRatings ? (
            <Text
              marginBlockEnd="$3"
              fontSize={tokens.typography.fontSize.xs}
              color={tokens.colors.warning.warning9}
            >
              {STALE_COMMUNITY_RATING_HINT}
            </Text>
          ) : null}
        </>
      ) : (
        <Text
          marginBlockEnd="$3"
          fontSize={tokens.typography.fontSize.sm}
          color={tokens.colors.gray.gray7}
        >
          No community ratings yet
        </Text>
      )}
      {ratings.viewer ? (
        <>
          <EyebrowLabel>Your rating</EyebrowLabel>
          <ViewerRatingInput
            value={ratings.viewer.value}
            isPending={ratings.viewer.isPending ?? false}
            onChange={onViewerRatingChange}
          />
          {ratings.viewer.isStale ? (
            <Text
              marginBlockStart="$2"
              fontSize={tokens.typography.fontSize.xs}
              color={tokens.colors.warning.warning9}
            >
              {STALE_VIEWER_RATING_HINT}
            </Text>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Ingredients section. Mirrors RecipeDetailPage's section (the two
// surfaces share the ingredients view-model verbatim, so the
// interaction model — servings stepper, scale presets + custom
// entry, missing-ingredient rows, substitutions — is the same).
// ---------------------------------------------------------------------------

// Pressable row geometry (plain objects, as in the app's
// IngredientsTab): rows are RN TouchableOpacity so taps register
// without a form control; visual values come from DS tokens.
const ingredientRowStyle = {
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  borderColor: tokens.colors.gray.gray2,
  paddingVertical: tokens.spacing[3],
} as const;

const ingredientRowMissingStyle = { opacity: 0.4 } as const;

function IngredientsPanel({
  ingredients: view,
}: {
  ingredients: PublicRecipePageIngredientsProps;
}) {
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);
  return (
    <YStack padding="$4">
      {/* Servings + scale controls (#73, as on RecipeDetailPage):
          one compact block, two fixed rows, and every value
          directly enterable. Servings is an inline editable
          stepper; Scale is the PresetValueSelector — a single
          non-wrapping row of equal-width preset buttons plus a
          Custom button that turns into a number input when
          pressed and afterwards shows the applied custom value
          selected. */}
      <YStack gap="$3" marginBlockEnd="$4">
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
        <TouchableOpacity
          key={ingredient.id}
          style={[ingredientRowStyle, ingredient.isMissing ? ingredientRowMissingStyle : undefined]}
          onPress={() => {
            view.onIngredientPress?.(ingredient.id);
          }}
        >
          <Text flex={1}>{ingredient.label}</Text>
          {ingredient.isOptional ? (
            <Text
              fontSize={tokens.typography.fontSize.xs}
              color="$textMuted"
              marginInlineStart="$2"
            >
              optional
            </Text>
          ) : null}
        </TouchableOpacity>
      ))}
      {hasMissing ? (
        <Text variant="hint" marginBlockStart="$3">
          {MISSING_INGREDIENTS_HINT}
        </Text>
      ) : null}
      {view.isLoadingSubstitutions ? (
        <Text variant="hint" marginBlockStart="$4">
          Finding substitutions…
        </Text>
      ) : null}
      {view.substitutions && view.substitutions.length > 0 ? (
        <YStack
          marginBlockStart="$4"
          borderRadius={tokens.radii.lg}
          backgroundColor="$primarySubtle"
          padding="$4"
        >
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.semibold}
            color="$primaryEmphasis"
            marginBlockEnd="$2"
          >
            Substitutions
          </Text>
          {view.substitutions.map((sub) => (
            <YStack key={sub.ingredient} marginBlockEnd="$2">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                fontWeight={tokens.typography.fontWeight.medium}
              >
                {sub.ingredient}
              </Text>
              <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray7}>
                {sub.suggestions}
              </Text>
            </YStack>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// Instructions section. The active step is ephemeral view state,
// held here exactly as the app's tab held it (useState, first step
// active by default) — the same treatment as RecipeDetailPage.
// ---------------------------------------------------------------------------

function InstructionsPanel({ instructions }: { instructions: PublicRecipePageInstruction[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sorted = useMemo(
    () => [...instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [instructions],
  );
  return (
    <YStack padding="$4">
      {sorted.map((step, i) => {
        const isActive = i === activeIndex;
        return (
          <TouchableOpacity
            key={step.id}
            onPress={() => {
              setActiveIndex(i);
            }}
          >
            <YStack
              marginBlockEnd="$3"
              borderRadius={tokens.radii.lg}
              borderWidth={1}
              padding="$4"
              borderColor={isActive ? "$primary" : tokens.colors.gray.gray2}
              backgroundColor={isActive ? "$primarySubtle" : "$surface"}
            >
              <Text
                marginBlockEnd="$1"
                fontSize={tokens.typography.fontSize.xs}
                fontWeight={tokens.typography.fontWeight.semibold}
                color={isActive ? "$primary" : "$textMuted"}
              >
                Step {step.stepNumber}
              </Text>
              <Text
                fontSize={tokens.typography.fontSize.md}
                {...(isActive ? { color: "$primaryEmphasis" as const } : {})}
              >
                {step.body}
              </Text>
            </YStack>
          </TouchableOpacity>
        );
      })}
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// Error states (union members with DS-owned copy).
// ---------------------------------------------------------------------------

function ErrorState({ title, message }: { title: string; message: string }) {
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
 * the union's non-ready states (loading spinner shell, not-found
 * card, unavailable card). The host wraps every state in
 * PublicPageFrame. Controlled — see the file header for the
 * contract, the decisions, and the slot design.
 */
export function PublicRecipePage(props: PublicRecipePageProps) {
  if (props.state === "loading") {
    return (
      <YStack flex={1} backgroundColor="$surface" alignItems="center" justifyContent="center">
        <Spinner label="Loading recipe" />
      </YStack>
    );
  }

  if (props.state === "notFound") {
    return <ErrorState title={NOT_FOUND_TITLE} message={NOT_FOUND_MESSAGE} />;
  }

  if (props.state === "unavailable") {
    return <ErrorState title={UNAVAILABLE_TITLE} message={UNAVAILABLE_MESSAGE} />;
  }

  const { ratings, onViewerRatingChange, renderComments } = props;
  // Called once per render; the slot's content renders in the
  // engagement stack under the ratings card.
  const comments = renderComments ? renderComments() : null;

  return (
    <YStack flex={1} backgroundColor="$surface">
      <ScrollView flex={1} keyboardShouldPersistTaps="handled">
        <CtaBar
          ctas={props.ctas}
          onSignUpPress={props.onSignUpPress}
          onClonePress={props.onClonePress}
          onGetAppPress={props.onGetAppPress}
        />
        <OverviewPanel overview={props.overview} />
        <SectionHeading>Ingredients</SectionHeading>
        <IngredientsPanel ingredients={props.ingredients} />
        <SectionHeading>Instructions</SectionHeading>
        <InstructionsPanel instructions={props.instructions.instructions} />
        {ratings || comments ? (
          <YStack paddingHorizontal="$4" paddingBlockEnd="$4">
            {ratings ? (
              <RatingsCard ratings={ratings} onViewerRatingChange={onViewerRatingChange} />
            ) : null}
            {comments}
          </YStack>
        ) : null}
      </ScrollView>
    </YStack>
  );
}
