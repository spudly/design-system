import { useMemo, useState, type ReactNode } from "react";
import { TouchableOpacity } from "react-native";
import { Image, ScrollView, View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import type { TagColorName } from "../themes/tagColors.js";
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { SelectField } from "../components/SelectField.js";
import { Spinner } from "../components/Spinner.js";
import { StarRatingInput } from "../components/StarRatingInput.js";
import { StatCard } from "../components/StatCard.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { ToggleChipGroup, type ToggleChipOption } from "../components/ToggleChipGroup.js";
import { PrintIcon } from "../icons/PrintIcon.js";
import { ShareIcon } from "../icons/ShareIcon.js";

/**
 * RecipeDetailPage (#49): Eciperay's recipe detail screen as a
 * controlled @spudly/ui page component, following the RecipesPage
 * pilot. The app keeps all state and business logic — the recipe,
 * versions, and cook-log queries, every mutation (status, version
 * activation, sharing, ratings, comments), navigation, printing —
 * and drives this view entirely through props: a view-model per
 * section in, intent callbacks out. Nothing here imports an app
 * package or fetches anything.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root — this
 * component imports react-native (TouchableOpacity), and the root
 * entry must stay importable in plain Node.
 *
 * Composition mirrors the app's RecipeDetailScreen +
 * RecipeDetailChrome (spudly/eciperay packages/app): a pinned
 * chrome — toolbar (status badge + version picker) — above a
 * single ScrollView holding every section in order (overview,
 * ingredients, instructions, cook history, nutrition), each under
 * its own heading. The page originally split the sections across
 * a tab layout; #71 replaced the tabs with this single scrollable
 * page, so the per-tab view-models became section view-models and
 * the tab state (activeTab / onTabChange) left the contract.
 *
 * States: the app screen renders a full-screen loading gate while
 * the recipe loads, and — deliberately mirrored here — it has no
 * distinct not-found or error UI: a missing recipe stays on the
 * gate. So the props are a union: `{ state: "loading" }` renders
 * only the spinner shell (the app's gate, including its delayed
 * spinner, stays app-side), and `{ state: "ready", ... }` renders
 * the chrome and panels. If the app grows a not-found state, the
 * union grows a member.
 *
 * Slots — app-rendered content inside the view (the
 * renderRecipeAccessory precedent from RecipesPage): three parts of
 * this screen are self-contained app panels whose state and
 * mutations cannot be view-modeled without leaking business logic
 * into props, so each enters through a documented render slot and
 * the app renders its existing component at the same position it
 * occupies today:
 * - `renderCookLogForm` (history section): the cook-log form. When it
 *   returns non-null content, the content replaces the view's
 *   "Log a cook" button — the same button-hides-while-open
 *   semantics as the accessory slot. The cook-log ENTRIES are
 *   display data and are view-modeled as props; only the form is
 *   slotted.
 * - `renderSharingControls` (overview): the sharing/visibility
 *   panel — it carries its own pending-selection state, a
 *   publishing-consent flow, share-token state, and two mutations.
 * - `renderComments` (overview, engagement stack): the comments
 *   section — its own query, compose/edit draft state, and three
 *   mutations, auth-gated.
 * Ratings, by contrast, ARE view-modeled: the community rating is
 * display data, and the viewer's star input is a controlled input
 * (value in, change out, pending disables it) with the mutation
 * behind the callback — the same shape as RecipesPage's filters.
 *
 * One piece of ephemeral state stays inside the view, mirroring
 * the app component it replaces: the instructions section's
 * active step (the app's InstructionsTab holds it in useState).
 * It is not business state. The version picker is the standard
 * SelectField (#72 — it replaced a custom bottom-sheet widget
 * whose options appeared at the bottom of the screen, unlike
 * every other select in the system); its open/close state is
 * internal to that component, and the data contract is unchanged
 * (version list in, selected id in, change callback out).
 *
 * Documented deviations from the app's current rendering, all
 * presentation-only:
 * - The instructions section's active card wash: the app composes
 *   the semantic primary at 5% alpha over RN primitives (its tab
 *   renders without a Tamagui provider in tests); the view uses
 *   `$primarySubtle` — the same treatment the app itself uses for
 *   its other primary-tinted panels (activation candidates,
 *   substitutions).
 * - Stale-rating hints: the app renders an alert icon whose
 *   accessibility label is the hint; the view renders the hint as
 *   visible hint text. The copy moved verbatim from the app's
 *   client constants (STALE_*_RATING_HINT).
 * - The hero image frame height (256) is layout geometry with no
 *   step on the DS spacing scale, as in the app.
 * No lineHeight is set anywhere in this file (the #162 rule).
 */

// ---------------------------------------------------------------------------
// View-model types (DS-owned; the app maps its domain types at the
// boundary, as with RecipesPage's plain-string filter values).
// ---------------------------------------------------------------------------

export interface RecipeDetailPageVersion {
  id: string;
  /** Full picker label, app-formatted ("v3 — Active: summary"). */
  label: string;
  versionNumber: number;
}

export interface RecipeDetailPageTag {
  id: string;
  name: string;
  /**
   * The tag's color: a DS tag color token name, strictly typed (a
   * raw hex is a compile error) — resolved through the active theme
   * for the pill tint and label (#207). The host converts stored
   * tag data to a name through `tagColorNameForHex` first.
   */
  color: TagColorName;
}

export interface RecipeDetailPageLifecycle {
  /** The displayed version's status allows tweaking/perfecting/abandoning. */
  isEditable: boolean;
  /** Tweak-manually mutation in flight: its button disables. */
  isTweakPending?: boolean;
  /** Status mutation in flight: Mark perfected / Abandon disable. */
  isStatusChangePending?: boolean;
  /** Activation mutation in flight: Activate buttons disable. */
  isActivationPending?: boolean;
  /** Candidate versions awaiting activation, app-formatted labels. */
  candidates: { id: string; label: string }[];
}

export interface RecipeDetailPageCommunityRating {
  /** Pre-rendered star string ("★★★★★"), app-formatted from the average. */
  stars: string;
  /** App-formatted label ("4.6 (9)"). */
  label: string;
  hasStaleRatings?: boolean;
}

export interface RecipeDetailPageViewerRating {
  /** The viewer's stars, or null when they have not rated. */
  value: number | null;
  isStale?: boolean;
  /** Rating mutation in flight: the input disables. */
  isPending?: boolean;
}

export interface RecipeDetailPageRatings {
  /** Null renders the "No community ratings yet" line. */
  community: RecipeDetailPageCommunityRating | null;
  /** Null (signed out) hides the "Your rating" input entirely. */
  viewer: RecipeDetailPageViewerRating | null;
}

export interface RecipeDetailPageOverviewProps {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  /** Overview stat band values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  /** Transient feedback line ("Version activated"), app-held. */
  actionMessage?: string | null;
  onStartCooking: () => void;
  /** Row action chips; each renders only when its callback is
   * provided (the pilot's rule — the app computes the
   * can-edit/can-edit-draft conditions and passes the callback
   * only when the action applies). */
  onPrintPress?: () => void;
  onSharePress?: () => void;
  onEditPress?: () => void;
  onEditDraftPress?: () => void;
  onDeletePress?: () => void;
  /** Lifecycle section; renders only when editable or candidates
   * exist, exactly as the app's OverviewActions returns null
   * otherwise. Omit (or pass null) to hide the section. */
  lifecycle?: RecipeDetailPageLifecycle | null;
  onTweakManuallyPress?: () => void;
  onTweakAiPress?: () => void;
  onMarkPerfectedPress?: () => void;
  onAbandonPress?: () => void;
  onActivateCandidatePress?: (versionId: string) => void;
  tags: RecipeDetailPageTag[];
  /** Engagement ratings card; omit to hide it. */
  ratings?: RecipeDetailPageRatings | null;
  onViewerRatingChange?: (stars: number | null) => void;
  /** Slot: the app's sharing/visibility panel, rendered after the
   * lifecycle section and before the tags — its position today. */
  renderSharingControls?: () => ReactNode;
  /** Slot: the app's comments section, rendered in the engagement
   * stack under the ratings card. */
  renderComments?: () => ReactNode;
}

export interface RecipeDetailPageIngredient {
  id: string;
  /** The full scaled line, app-formatted ("1 1/2 lb chicken"). */
  label: string;
  isOptional?: boolean;
  /** Marked missing by the viewer: the row dims and the
   * substitutions flow keys off it. */
  isMissing?: boolean;
}

export interface RecipeDetailPageSubstitution {
  /** The missing ingredient's name. */
  ingredient: string;
  /** App-formatted suggestions line (joined). */
  suggestions: string;
}

export interface RecipeDetailPageIngredientsProps {
  servings: number;
  onServingsChange: (servings: number) => void;
  /** Selected scale multiplier as a plain string: one of the
   * presets ("0.5" | "1" | "2" | "3") or any other positive number
   * the user typed into the custom scale field ("4", "2.5"); the
   * option set below moved with the section. The app maps the
   * value back to servings — the servings computation stays
   * app-side. */
  scaleValue: string;
  onScaleChange: (value: string) => void;
  ingredients: RecipeDetailPageIngredient[];
  onIngredientPress?: (ingredientId: string) => void;
  /** Substitutions lookup in flight ("Finding substitutions…"). */
  isLoadingSubstitutions?: boolean;
  substitutions?: RecipeDetailPageSubstitution[];
}

export interface RecipeDetailPageInstruction {
  id: string;
  stepNumber: number;
  body: string;
}

export interface RecipeDetailPageInstructionsProps {
  /** Rendered sorted by stepNumber, as the app's tab sorts them. */
  instructions: RecipeDetailPageInstruction[];
}

export interface RecipeDetailPageCookLog {
  id: string;
  /** App-formatted date label ("Oct 12, 2026"). */
  dateLabel: string;
  starRating?: number | null;
  notes?: string | null;
}

export interface RecipeDetailPageHistoryProps {
  /** Cook-log query in flight: the panel renders only a spinner,
   * as the app's tab returns early on loading. */
  isLoading?: boolean;
  cookLogs: RecipeDetailPageCookLog[];
  /** Renders the "Log a cook" button; hidden while the form slot
   * renders content. */
  onLogCookPress?: () => void;
  /** Optional per-entry Delete action (eciperay#266): each cook-log
   * entry renders a Delete button only when this callback is
   * provided, reporting the entry's id. Confirmation, the delete
   * mutation, and error surfacing stay app-side, as with
   * MealPlansPage's `onPlanDelete` — the view only reports the
   * intent. Omit it for a read-only history. */
  onDeleteCookLogPress?: (cookLogId: string) => void;
  /** Slot: the app's cook-log form. Called once per render; when
   * it returns non-null, the form replaces the "Log a cook"
   * button. Form, state, and mutation stay app-side. */
  renderCookLogForm?: () => ReactNode;
}

export interface RecipeDetailPageNutritionRow {
  label: string;
  /** App-formatted value with unit ("520 kcal"). */
  valueLabel: string;
}

export type RecipeDetailPageNutritionProps =
  | { state: "loading" }
  | {
      state: "unavailable";
      isRefreshing?: boolean;
      onEstimatePress?: () => void;
    }
  | {
      state: "ready";
      rows: RecipeDetailPageNutritionRow[];
      disclaimer: string;
      isRefreshing?: boolean;
      /** Background refetch in flight: Refresh disables alongside
       * an explicit refresh, as in the app. */
      isFetching?: boolean;
      onRefreshPress?: () => void;
    };

export interface RecipeDetailPageReadyProps {
  state: "ready";
  /** Recipe status as a plain string; the badge label/tone map
   * below is DS-owned. Unknown values fall back to "idea", as the
   * app's status normalizer does. */
  status: string;
  versions: RecipeDetailPageVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
  overview: RecipeDetailPageOverviewProps;
  ingredients: RecipeDetailPageIngredientsProps;
  instructions: RecipeDetailPageInstructionsProps;
  history: RecipeDetailPageHistoryProps;
  nutrition: RecipeDetailPageNutritionProps;
}

export type RecipeDetailPageProps = { state: "loading" } | RecipeDetailPageReadyProps;

// ---------------------------------------------------------------------------
// Constants moved with the page (the pilot's rule for option sets
// and section copy).
// ---------------------------------------------------------------------------

// Status badge map: labels and tones for the app's four statuses
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

// Scale multipliers from the app's scaling constants; labels are
// presentation, the servings math stays app-side.
const SCALE_OPTIONS: ToggleChipOption[] = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

// The custom scale chip's resting label (#73): beside the presets,
// one more chip that turns into a number input when pressed, so any
// scale beyond the presets (4× and up, or a fraction like 2.5×) is
// directly enterable. Once a custom value applies, the chip shows
// that value ("4×") selected instead of this label.
const CUSTOM_SCALE_LABEL = "Custom";

/** A scale value as the custom chip shows it: the number without
 * trailing zeros ("2.50" → "2.5"); non-numeric values pass through. */
function formatScaleValue(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

// Stale-rating hint copy, verbatim from the app's client constants.
const STALE_COMMUNITY_RATING_HINT =
  "Some community ratings were left on earlier recipe versions and count at half weight in the average.";
const STALE_VIEWER_RATING_HINT =
  "Your rating was left on an earlier version of the recipe. Tap a star to update it for the current version.";

const COOK_LOG_EMPTY_MESSAGE =
  "No cooks logged yet. Log a cook here or finish a cooking session to record feedback for this version.";
const MISSING_INGREDIENTS_HINT =
  "Tap an ingredient to mark it missing and see substitutions below.";

// ---------------------------------------------------------------------------
// Chrome: status badge + version picker (pinned above the scroll view).
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.idea;
  return <Badge tone={badge?.tone ?? "neutral"}>{badge?.label ?? "Idea"}</Badge>;
}

// The version picker is the standard SelectField (#72): the same
// version list, current selection, and change callback the custom
// bottom-sheet widget took, rendered by the control every other
// select in the system uses. With at most one version there is
// nothing to select, so the picker collapses to static text, as
// before.
function VersionPicker({
  versions,
  selectedVersionId,
  onSelectVersion,
}: {
  versions: RecipeDetailPageVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
}) {
  const sorted = useMemo(
    () => [...versions].sort((a, b) => b.versionNumber - a.versionNumber),
    [versions],
  );
  const selected = sorted.find((v) => v.id === selectedVersionId) ?? sorted[0];

  if (sorted.length <= 1) {
    return (
      <Text fontSize={tokens.typography.fontSize.xs} color="$textMuted">
        Version {sorted[0]?.versionNumber ?? 1}
      </Text>
    );
  }

  return (
    <View flex={1} minWidth={200}>
      <SelectField
        label="Version"
        value={selected?.id ?? ""}
        options={sorted.map((version) => ({ value: version.id, label: version.label }))}
        onValueChange={onSelectVersion}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Shared panel pieces.
// ---------------------------------------------------------------------------

/** The overview's neutral action chips (print/share/edit): a
 * gray-100 fill with a gray-700 label, as in the app. */
const neutralChipProps = {
  variant: "secondary",
  backgroundColor: tokens.colors.gray.gray2,
  color: tokens.colors.gray.gray8,
} as const;

/**
 * The print and share chips render the icons module's PrintIcon /
 * ShareIcon (#187, reworked after #217): the official Feather
 * printer / share-2 glyphs in the chip's own ink color (gray8, the
 * neutral chips' label color) at Feather's fixed 24px geometry —
 * not the "🖨" emoji and "↗" text glyph the page originally
 * used, which render in full color at font-dependent sizes,
 * clashing with the neutral chips and drifting between platforms.
 * Do not reintroduce text glyphs or hand-drawn icons for these:
 * icons come from src/icons (see that module's header).
 */

/** The lifecycle/sharing outline action look: transparent fill,
 * hairline border, gray label (the app's OutlineActionButton). */
function OutlineActionButton({
  label,
  disabled = false,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      backgroundColor="transparent"
      borderWidth={1}
      borderColor="$borderColor"
      color={tokens.colors.gray.gray7}
      disabled={disabled}
      onPress={onPress}
    >
      {label}
    </Button>
  );
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

// ---------------------------------------------------------------------------
// Overview section (the page header).
// ---------------------------------------------------------------------------

function LifecycleSection({
  lifecycle,
  onTweakManuallyPress,
  onTweakAiPress,
  onMarkPerfectedPress,
  onAbandonPress,
  onActivateCandidatePress,
}: {
  lifecycle: RecipeDetailPageLifecycle;
  onTweakManuallyPress: (() => void) | undefined;
  onTweakAiPress: (() => void) | undefined;
  onMarkPerfectedPress: (() => void) | undefined;
  onAbandonPress: (() => void) | undefined;
  onActivateCandidatePress: ((versionId: string) => void) | undefined;
}) {
  return (
    <>
      {lifecycle.isEditable ? (
        <XStack marginBlockEnd="$4" flexWrap="wrap" gap="$2">
          {onTweakManuallyPress ? (
            <OutlineActionButton
              label="Tweak manually"
              disabled={lifecycle.isTweakPending ?? false}
              onPress={onTweakManuallyPress}
            />
          ) : null}
          {onTweakAiPress ? (
            <Button
              variant="ghost"
              size="sm"
              borderWidth={1}
              borderColor="$primary"
              backgroundColor="$primarySubtle"
              color="$primaryEmphasis"
              onPress={onTweakAiPress}
            >
              Tweak with AI
            </Button>
          ) : null}
          {onMarkPerfectedPress ? (
            <Button
              variant="secondary"
              size="sm"
              backgroundColor={tokens.colors.success.success2}
              color={tokens.colors.success.success9}
              disabled={lifecycle.isStatusChangePending ?? false}
              onPress={onMarkPerfectedPress}
            >
              Mark perfected
            </Button>
          ) : null}
          {onAbandonPress ? (
            <Button
              variant="secondary"
              size="sm"
              backgroundColor={tokens.colors.danger.danger2}
              color={tokens.colors.danger.danger9}
              disabled={lifecycle.isStatusChangePending ?? false}
              onPress={onAbandonPress}
            >
              Abandon
            </Button>
          ) : null}
        </XStack>
      ) : null}
      {lifecycle.candidates.length > 0 ? (
        <YStack marginBlockEnd="$4" gap="$2">
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.gray.gray10}
          >
            Ready to activate
          </Text>
          {lifecycle.candidates.map((version) => (
            <YStack
              key={version.id}
              borderRadius={tokens.radii.md}
              borderWidth={1}
              borderColor={tokens.colors.terracotta.terracotta3}
              backgroundColor="$primarySubtle"
              padding="$3"
            >
              <Text
                marginBlockEnd="$2"
                fontSize={tokens.typography.fontSize.sm}
                color={tokens.colors.gray.gray9}
              >
                {version.label}
              </Text>
              {onActivateCandidatePress ? (
                <Button
                  variant="primary"
                  size="sm"
                  alignSelf="flex-start"
                  disabled={lifecycle.isActivationPending ?? false}
                  onPress={() => {
                    onActivateCandidatePress(version.id);
                  }}
                >
                  Activate
                </Button>
              ) : null}
            </YStack>
          ))}
        </YStack>
      ) : null}
    </>
  );
}

/** The viewer's star input with the app adapter's semantics
 * preserved: pressing the current star clears the rating (null),
 * and a pending rating disables the input behind a
 * non-interactive wrapper. */
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
      accessibilityState={{ disabled: isPending }}
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
  ratings: RecipeDetailPageRatings;
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

function OverviewPanel({
  status,
  overview,
}: {
  status: string;
  overview: RecipeDetailPageOverviewProps;
}) {
  const {
    imageUrl,
    title,
    description,
    servingsLabel,
    prepTimeLabel,
    cookTimeLabel,
    actionMessage,
    onStartCooking,
    onPrintPress,
    onSharePress,
    onEditPress,
    onEditDraftPress,
    onDeletePress,
    lifecycle,
    tags,
    ratings,
    onViewerRatingChange,
    renderSharingControls,
    renderComments,
  } = overview;

  const showLifecycle =
    lifecycle !== undefined &&
    lifecycle !== null &&
    (lifecycle.isEditable || lifecycle.candidates.length > 0);
  const sharingControls = renderSharingControls ? renderSharingControls() : null;
  const comments = renderComments ? renderComments() : null;

  return (
    <>
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
        <XStack marginBlockEnd="$4" flexWrap="wrap" gap="$3">
          <Button variant="primary" flex={1} minWidth="40%" onPress={onStartCooking}>
            Start Cooking
          </Button>
          {onPrintPress ? (
            <Button
              {...neutralChipProps}
              width="$12"
              paddingHorizontal={0}
              onPress={onPrintPress}
              accessibilityLabel="Print recipe"
            >
              <PrintIcon color={tokens.colors.gray.gray8} />
            </Button>
          ) : null}
          {onSharePress ? (
            <Button
              {...neutralChipProps}
              width="$12"
              paddingHorizontal={0}
              onPress={onSharePress}
              accessibilityLabel="Share recipe"
            >
              <ShareIcon color={tokens.colors.gray.gray8} />
            </Button>
          ) : null}
          {onEditPress ? (
            <Button {...neutralChipProps} onPress={onEditPress}>
              Edit
            </Button>
          ) : null}
          {onEditDraftPress ? (
            <Button {...neutralChipProps} onPress={onEditDraftPress}>
              Edit draft
            </Button>
          ) : null}
          {onDeletePress ? (
            <Button
              variant="secondary"
              backgroundColor={tokens.colors.danger.danger1}
              color={tokens.colors.danger.danger7}
              onPress={onDeletePress}
            >
              Delete
            </Button>
          ) : null}
        </XStack>
        {actionMessage ? (
          <Text
            accessibilityRole="text"
            marginBlockEnd="$4"
            textAlign="center"
            fontSize={tokens.typography.fontSize.sm}
            color={tokens.colors.gray.gray7}
          >
            {actionMessage}
          </Text>
        ) : null}
        {showLifecycle && lifecycle ? (
          <LifecycleSection
            lifecycle={lifecycle}
            onTweakManuallyPress={overview.onTweakManuallyPress}
            onTweakAiPress={overview.onTweakAiPress}
            onMarkPerfectedPress={overview.onMarkPerfectedPress}
            onAbandonPress={overview.onAbandonPress}
            onActivateCandidatePress={overview.onActivateCandidatePress}
          />
        ) : null}
        {sharingControls}
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
      {ratings || comments ? (
        <YStack paddingHorizontal="$4" paddingBlockEnd="$4">
          {ratings ? (
            <RatingsCard ratings={ratings} onViewerRatingChange={onViewerRatingChange} />
          ) : null}
          {comments}
        </YStack>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Ingredients section.
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
  ingredients: RecipeDetailPageIngredientsProps;
}) {
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);
  // Custom scale editing is ephemeral view state, like the
  // instructions section's active step: whether the custom chip is
  // currently a number input, and the input's uncommitted text.
  const [isCustomScaleEditing, setCustomScaleEditing] = useState(false);
  const [customScaleDraft, setCustomScaleDraft] = useState("");
  const isPresetScale = SCALE_OPTIONS.some((option) => option.value === view.scaleValue);
  const isCustomScaleSelected = !isPresetScale && !isCustomScaleEditing;

  const startCustomScaleEdit = () => {
    setCustomScaleDraft(isPresetScale ? "" : formatScaleValue(view.scaleValue));
    setCustomScaleEditing(true);
  };

  // Committing an entry applies it through the same onScaleChange
  // the presets use; an empty, non-numeric, or non-positive entry
  // commits nothing and the chip restores the current scale.
  const commitCustomScale = () => {
    const parsed = Number(customScaleDraft.trim());
    setCustomScaleEditing(false);
    if (Number.isFinite(parsed) && parsed > 0) {
      view.onScaleChange(String(parsed));
    }
  };

  return (
    <YStack padding="$4">
      {/* Servings + scale controls (#73): one compact block, two fixed
          rows, and every value directly enterable — stepping is no
          longer the only way to reach a large batch. Servings is an
          inline editable stepper (label beside the stepper, the
          value a number input in a fixed-width box); Scale is a
          single non-wrapping row of equal-width preset chips plus a
          Custom chip that turns into a number input when pressed
          and afterwards shows the applied custom value selected.
          Same props contract as before — the app wiring is
          untouched. */}
      <YStack gap="$3" marginBlockEnd="$4">
        <NumberStepper
          label="Servings"
          layout="inline"
          value={view.servings}
          min={1}
          onChange={view.onServingsChange}
          editable
        />
        <XStack alignItems="center" gap="$2">
          <Text
            marginInlineEnd="$1"
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.gray.gray8}
          >
            Scale
          </Text>
          <ToggleChipGroup
            options={SCALE_OPTIONS}
            mode="single"
            wrap={false}
            value={view.scaleValue}
            onChange={(value) => {
              setCustomScaleEditing(false);
              view.onScaleChange(value);
            }}
          />
          <View flex={0.25}>
            {isCustomScaleEditing ? (
              <TextField
                accessibilityLabel="Custom scale"
                keyboardType="decimal-pad"
                inputMode="decimal"
                type="number"
                autoFocus
                value={customScaleDraft}
                onChangeText={setCustomScaleDraft}
                onBlur={commitCustomScale}
                onSubmitEditing={commitCustomScale}
              />
            ) : (
              <XStack
                minHeight={44}
                alignItems="center"
                justifyContent="center"
                borderRadius={tokens.radii.full}
                borderWidth={1}
                borderColor={isCustomScaleSelected ? "$primary" : "$textMuted"}
                backgroundColor={isCustomScaleSelected ? "$primary" : "$surface"}
                onPress={startCustomScaleEdit}
                accessibilityRole="button"
                accessibilityLabel="Custom scale"
                aria-pressed={isCustomScaleSelected}
              >
                <Text
                  style={{
                    color: isCustomScaleSelected ? "$onPrimary" : "$color",
                    fontWeight: isCustomScaleSelected
                      ? tokens.typography.fontWeight.semibold
                      : tokens.typography.fontWeight.regular,
                  }}
                >
                  {isCustomScaleSelected
                    ? `${formatScaleValue(view.scaleValue)}×`
                    : CUSTOM_SCALE_LABEL}
                </Text>
              </XStack>
            )}
          </View>
        </XStack>
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
// active by default).
// ---------------------------------------------------------------------------

function InstructionsPanel({ instructions }: { instructions: RecipeDetailPageInstruction[] }) {
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
// History section (cook logs + the form slot).
// ---------------------------------------------------------------------------

function HistoryPanel({ history }: { history: RecipeDetailPageHistoryProps }) {
  if (history.isLoading) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$4">
        <Spinner label="Loading cook history" />
      </YStack>
    );
  }

  // Called once per render; non-null content replaces the button.
  const form = history.renderCookLogForm ? history.renderCookLogForm() : null;

  return (
    <YStack padding="$4">
      {form !== null && form !== undefined ? (
        <YStack marginBlockEnd="$4">{form}</YStack>
      ) : history.onLogCookPress ? (
        <Button
          variant="primary"
          size="sm"
          alignSelf="flex-start"
          marginBlockEnd="$4"
          onPress={history.onLogCookPress}
        >
          Log a cook
        </Button>
      ) : null}
      {history.cookLogs.length === 0 ? (
        <Text variant="hint">{COOK_LOG_EMPTY_MESSAGE}</Text>
      ) : (
        history.cookLogs.map((log, index) => (
          <YStack
            key={log.id}
            marginBlockEnd="$4"
            borderRadius={tokens.radii.md}
            borderWidth={1}
            borderColor={tokens.colors.gray.gray2}
            backgroundColor={tokens.colors.gray.gray1}
            padding="$4"
          >
            <XStack marginBlockEnd="$1" alignItems="center" justifyContent="space-between" gap="$2">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                fontWeight={tokens.typography.fontWeight.medium}
                color={tokens.colors.gray.gray10}
              >
                {log.dateLabel}
              </Text>
              {log.starRating ? (
                <Text
                  accessibilityLabel={`${log.starRating} stars`}
                  color={tokens.colors.gray.gray10}
                >
                  {"★".repeat(log.starRating)}
                </Text>
              ) : null}
            </XStack>
            {log.notes ? (
              <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray8}>
                {log.notes}
              </Text>
            ) : null}
            {history.onDeleteCookLogPress ? (
              <XStack marginBlockStart="$2">
                <Button
                  variant="secondary"
                  size="sm"
                  backgroundColor={tokens.colors.danger.danger1}
                  color={tokens.colors.danger.danger8}
                  accessibilityLabel={`Delete cook log ${index + 1} from ${log.dateLabel}`}
                  onPress={() => {
                    history.onDeleteCookLogPress?.(log.id);
                  }}
                >
                  Delete
                </Button>
              </XStack>
            ) : null}
          </YStack>
        ))
      )}
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// Nutrition section.
// ---------------------------------------------------------------------------

function NutritionRow({ label, valueLabel }: RecipeDetailPageNutritionRow) {
  return (
    <XStack
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$3"
    >
      <Text fontSize={tokens.typography.fontSize.md} color={tokens.colors.gray.gray8}>
        {label}
      </Text>
      <Text
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.semibold}
        color={tokens.colors.gray.gray10}
      >
        {valueLabel}
      </Text>
    </XStack>
  );
}

function NutritionPanel({ nutrition }: { nutrition: RecipeDetailPageNutritionProps }) {
  if (nutrition.state === "loading") {
    return (
      <Text color="$textMuted" padding="$4">
        Estimating nutrition…
      </Text>
    );
  }
  if (nutrition.state === "unavailable") {
    return (
      <YStack padding="$4">
        <Text color="$textMuted" marginBlockEnd="$3">
          Nutrition is not available yet.
        </Text>
        {nutrition.onEstimatePress ? (
          <Button
            variant="secondary"
            backgroundColor={tokens.colors.gray.gray10}
            color={tokens.colors.gray.gray1}
            disabled={nutrition.isRefreshing ?? false}
            onPress={nutrition.onEstimatePress}
          >
            {nutrition.isRefreshing ? "Refreshing…" : "Estimate nutrition"}
          </Button>
        ) : null}
      </YStack>
    );
  }
  return (
    <YStack padding="$4">
      <XStack marginBlockEnd="$3" alignItems="center" justifyContent="space-between" gap="$3">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          letterSpacing={0.35}
          color={tokens.colors.gray.gray6}
          textTransform="uppercase"
        >
          Per Serving
        </Text>
        {nutrition.onRefreshPress ? (
          <Button
            variant="secondary"
            size="sm"
            backgroundColor={tokens.colors.gray.gray2}
            color={tokens.colors.gray.gray9}
            disabled={(nutrition.isRefreshing ?? false) || (nutrition.isFetching ?? false)}
            onPress={nutrition.onRefreshPress}
          >
            {nutrition.isRefreshing ? "Refreshing…" : "Refresh"}
          </Button>
        ) : null}
      </XStack>
      {nutrition.rows.map((row) => (
        <NutritionRow key={row.label} label={row.label} valueLabel={row.valueLabel} />
      ))}
      <Text fontSize={tokens.typography.fontSize.xs} color="$textMuted" marginBlockStart="$4">
        {nutrition.disclaimer}
      </Text>
    </YStack>
  );
}

// ---------------------------------------------------------------------------
// The page.
// ---------------------------------------------------------------------------

/** A section's heading on the single scrollable page (#71): the
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

/**
 * Full-page recipe detail view: pinned chrome (status + version
 * toolbar) over all five sections in a single scroll view (#71 —
 * no tabs; the sections render in the order the tabs had).
 * Controlled — see the file header for the contract, the slot
 * design, and the layout decisions.
 */
export function RecipeDetailPage(props: RecipeDetailPageProps) {
  if (props.state === "loading") {
    return (
      <YStack flex={1} backgroundColor="$surface" alignItems="center" justifyContent="center">
        <Spinner label="Loading recipe" />
      </YStack>
    );
  }

  const { status, versions, selectedVersionId, onSelectVersion } = props;

  return (
    <YStack flex={1} backgroundColor="$surface">
      <XStack
        flexWrap="wrap"
        alignItems="center"
        gap="$2"
        borderBottomWidth={1}
        borderColor={tokens.colors.gray.gray2}
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <StatusBadge status={status} />
        <VersionPicker
          versions={versions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={onSelectVersion}
        />
      </XStack>
      <ScrollView flex={1} keyboardShouldPersistTaps="handled">
        <OverviewPanel status={status} overview={props.overview} />
        <SectionHeading>Ingredients</SectionHeading>
        <IngredientsPanel ingredients={props.ingredients} />
        <SectionHeading>Instructions</SectionHeading>
        <InstructionsPanel instructions={props.instructions.instructions} />
        <SectionHeading>Cook History</SectionHeading>
        <HistoryPanel history={props.history} />
        <SectionHeading>Nutrition</SectionHeading>
        <NutritionPanel nutrition={props.nutrition} />
      </ScrollView>
    </YStack>
  );
}
