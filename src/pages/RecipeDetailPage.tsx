import { useMemo, type ReactNode } from "react";
import type { TagColorName } from "../themes/tagColors.js";
import { ActionChip } from "../components/ActionChip.js";
import { Badge } from "../components/Badge.js";
import { Button } from "../components/Button.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { CandidateList } from "../components/CandidateList.js";
import { CardStack } from "../components/CardStack.js";
import { Center } from "../components/Center.js";
import { ChipRow } from "../components/ChipRow.js";
import { EditableChipGroup } from "../components/EditableChipGroup.js";
import { ListStack } from "../components/ListStack.js";
import { LoadingGate } from "../components/LoadingGate.js";
import { LogEntryCard } from "../components/LogEntryCard.js";
import { MarkableRow } from "../components/MarkableRow.js";
import {
  NutritionPanel,
  type NutritionPanelData,
  type NutritionPanelRow,
} from "../components/NutritionPanel.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { PanelStack } from "../components/PanelStack.js";
import {
  RatingsCard,
  type RatingsCardCommunityRating,
  type RatingsCardRatings,
  type RatingsCardViewerRating,
} from "../components/RatingsCard.js";
import { ScreenShell } from "../components/ScreenShell.js";
import { ScrollRegion } from "../components/ScrollRegion.js";
import { SectionHeading } from "../components/SectionHeading.js";
import { SelectField } from "../components/SelectField.js";
import { Spinner } from "../components/Spinner.js";
import { StatBand } from "../components/StatBand.js";
import { StatCard } from "../components/StatCard.js";
import { StatusMessage } from "../components/StatusMessage.js";
import { StepList } from "../components/StepList.js";
import { SuggestionPanel } from "../components/SuggestionPanel.js";
import { TagList } from "../components/TagList.js";
import { Text } from "../components/Text.js";
import { Thumbnail } from "../components/Thumbnail.js";
import { Toolbar } from "../components/Toolbar.js";
import { type ToggleChipOption } from "../components/ToggleChipGroup.js";
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
 * `@spudly/ui/pages` subpath export, not the package root.
 *
 * Composition mirrors the app's RecipeDetailScreen +
 * RecipeDetailChrome (spudly/eciperay packages/app): a pinned
 * chrome — toolbar (status badge + version picker) — above a
 * single ScrollRegion holding every section in order (overview,
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
 * Ephemeral state stays inside the view's components, mirroring
 * the app components they replace: the instructions section's
 * active step lives in StepList (the app's InstructionsTab holds
 * it in useState), and the scale row's custom-value editing lives
 * in EditableChipGroup. Neither is business state. The version
 * picker is the standard SelectField (#72 — it replaced a custom
 * bottom-sheet widget whose options appeared at the bottom of the
 * screen, unlike every other select in the system); its open/close
 * state is internal to that component, and the data contract is
 * unchanged (version list in, selected id in, change callback out).
 *
 * The #119 de-styling pass (this tranche) rebuilt the page as a
 * composition of design-system components — ScreenShell + Toolbar
 * chrome over a ScrollRegion, PanelStack panels, and the widgets
 * extracted from this page's clusters (RatingsCard, NutritionPanel,
 * CandidateList, LogEntryCard, StepList, MarkableRow,
 * EditableChipGroup, SuggestionPanel, SectionHeading, StatusMessage)
 * — passing data and callbacks only. The pass is a refactor, not a
 * redesign; the treatment normalizations it makes are the
 * design system's canonical ones, each small and deliberate:
 * - The description renders through Text's body variant (theme
 *   foreground ink; it was a fixed gray step).
 * - The overview Delete and the lifecycle Abandon actions adopt
 *   ActionChip's canonical danger pair (danger1 fill / danger8
 *   ink; they rendered danger7 ink and a danger2/danger9 pair).
 * - The print/share chips take ActionChip's square md target
 *   (48px; they were a 48×40 Button with the glyph as a child —
 *   the glyph now crosses as the chip's icon slot, at the same
 *   24px in the same gray8 ink).
 * - The single-version picker's static text takes the hint
 *   treatment (it was xs muted text).
 * - Panel block separations are PanelStack's 16px rhythm: the
 *   servings → scale separation (12px) and the missing-ingredients
 *   hint's offset (12px) normalize to it, as does the last
 *   cook-log entry's trailing separation (a per-entry bottom
 *   padding on top of the panel's own — the panel's padding now
 *   provides it, as parents own separation in this system).
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
 *   client constants (STALE_*_RATING_HINT, now in RatingsCard).
 * - The hero image frame height (256) is layout geometry with no
 *   step on the DS spacing scale, as in the app — it lives in
 *   Thumbnail's hero variant.
 * No lineHeight is set anywhere in this file (the #162 rule).
 */

// ---------------------------------------------------------------------------
// View-model types (DS-owned; the app maps its domain types at the
// boundary, as with RecipesPage's plain-string filter values).
// ---------------------------------------------------------------------------

export type RecipeDetailPageVersion = {
  id: string;
  /** Full picker label, app-formatted ("v3 — Active: summary"). */
  label: string;
  versionNumber: number;
};

export type RecipeDetailPageTag = {
  id: string;
  name: string;
  /**
   * The tag's color: a DS tag color token name, strictly typed (a
   * raw hex is a compile error) — resolved through the active theme
   * for the pill tint and label (#207). The host converts stored
   * tag data to a name through `tagColorNameForHex` first.
   */
  color: TagColorName;
};

export type RecipeDetailPageLifecycle = {
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
};

// The ratings view-model lives with RatingsCard (the widget the
// #119 pass extracted from this page's engagement stack); the
// page's contract names are aliases, so existing consumers of
// the page's types are untouched.
export type RecipeDetailPageCommunityRating = RatingsCardCommunityRating;
export type RecipeDetailPageViewerRating = RatingsCardViewerRating;
export type RecipeDetailPageRatings = RatingsCardRatings;

export type RecipeDetailPageOverviewProps = {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  /** Overview stat band values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  /** Transient feedback line ("Version activated"), app-held. */
  actionMessage?: string | null;
  /** The cooking-mode destination (#248: navigation crosses as
   * an href, not a press callback); the host composes it from
   * the recipe's route. */
  cookingHref: string;
  /** Row action chips; each renders only when its callback is
   * provided (the pilot's rule — the app computes the
   * can-edit/can-edit-draft conditions and passes the callback
   * only when the action applies). */
  onPrintPress?: () => void;
  onSharePress?: () => void;
  /** The edit destinations (#248): each chip renders only when
   * its href is provided (the app computes the
   * can-edit/can-edit-draft conditions and passes the href only
   * when the action applies). */
  editHref?: string;
  editDraftHref?: string;
  onDeletePress?: () => void;
  /** Lifecycle section; renders only when editable or candidates
   * exist, exactly as the app's OverviewActions returns null
   * otherwise. Omit (or pass null) to hide the section. */
  lifecycle?: RecipeDetailPageLifecycle | null;
  onTweakManuallyPress?: () => void;
  /** The tweak-with-AI destination (#248: navigation crosses as
   * an href); the control renders only when the href is
   * provided. */
  tweakAiHref?: string;
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
};

export type RecipeDetailPageIngredient = {
  id: string;
  /** The full scaled line, app-formatted ("1 1/2 lb chicken"). */
  label: string;
  isOptional?: boolean;
  /** Marked missing by the viewer: the row dims and the
   * substitutions flow keys off it. */
  isMissing?: boolean;
};

export type RecipeDetailPageSubstitution = {
  /** The missing ingredient's name. */
  ingredient: string;
  /** App-formatted suggestions line (joined). */
  suggestions: string;
};

export type RecipeDetailPageIngredientsProps = {
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
};

export type RecipeDetailPageInstruction = {
  id: string;
  stepNumber: number;
  body: string;
};

export type RecipeDetailPageInstructionsProps = {
  /** Rendered sorted by stepNumber, as the app's tab sorts them. */
  instructions: RecipeDetailPageInstruction[];
};

export type RecipeDetailPageCookLog = {
  id: string;
  /** App-formatted date label ("Oct 12, 2026"). */
  dateLabel: string;
  starRating?: number | null;
  notes?: string | null;
};

export type RecipeDetailPageHistoryProps = {
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
};

// The nutrition view-model lives with NutritionPanel (the widget
// the #119 pass extracted from this page's nutrition section);
// the page's contract names are aliases, as with the ratings
// types above.
export type RecipeDetailPageNutritionRow = NutritionPanelRow;
export type RecipeDetailPageNutritionProps = NutritionPanelData;

export type RecipeDetailPageReadyProps = {
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
};

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

const COOK_LOG_EMPTY_MESSAGE =
  "No cooks logged yet. Log a cook here or finish a cooking session to record feedback for this version.";
const MISSING_INGREDIENTS_HINT =
  "Tap an ingredient to mark it missing and see substitutions below.";

// ---------------------------------------------------------------------------
// Chrome: status badge + version picker (pinned above the scroll
// region).
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
// before. In the toolbar the field grows to fill the bar (its
// `grow` pattern), so no layout wrapper remains here.
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
    return <Text variant="hint">Version {sorted[0]?.versionNumber ?? 1}</Text>;
  }

  return (
    <SelectField
      label="Version"
      value={selected?.id ?? ""}
      options={sorted.map((version) => ({ value: version.id, label: version.label }))}
      onValueChange={onSelectVersion}
      grow
    />
  );
}

// ---------------------------------------------------------------------------
// Overview section (the page header).
// ---------------------------------------------------------------------------

/**
 * The lifecycle block of the overview: the tweak / status action
 * chips of an editable version, over the activation candidates.
 * Both blocks are design-system compositions (a ChipRow of
 * ActionChips, a CandidateList); their separation — and theirs
 * from the blocks around them — is the overview PanelStack's gap.
 *
 * The tweak controls split on the #248 ruling: "Tweak with AI"
 * navigates, so it is the primary chip's href form; "Tweak
 * manually" is exempt — its primary job is the mutation (create
 * the draft, then open the editor), so it stays a callback and
 * the host does not pre-create drafts.
 */
function LifecycleSection({
  lifecycle,
  onTweakManuallyPress,
  tweakAiHref,
  onMarkPerfectedPress,
  onAbandonPress,
  onActivateCandidatePress,
}: {
  lifecycle: RecipeDetailPageLifecycle;
  onTweakManuallyPress: (() => void) | undefined;
  tweakAiHref: string | undefined;
  onMarkPerfectedPress: (() => void) | undefined;
  onAbandonPress: (() => void) | undefined;
  onActivateCandidatePress: ((versionId: string) => void) | undefined;
}) {
  return (
    <>
      {lifecycle.isEditable ? (
        <ChipRow>
          {onTweakManuallyPress ? (
            <ActionChip
              tone="outline"
              disabled={lifecycle.isTweakPending ?? false}
              onPress={onTweakManuallyPress}
            >
              Tweak manually
            </ActionChip>
          ) : null}
          {tweakAiHref ? (
            <ActionChip tone="primary" href={tweakAiHref}>
              Tweak with AI
            </ActionChip>
          ) : null}
          {onMarkPerfectedPress ? (
            <ActionChip
              tone="success"
              disabled={lifecycle.isStatusChangePending ?? false}
              onPress={onMarkPerfectedPress}
            >
              Mark perfected
            </ActionChip>
          ) : null}
          {onAbandonPress ? (
            <ActionChip
              tone="danger"
              disabled={lifecycle.isStatusChangePending ?? false}
              onPress={onAbandonPress}
            >
              Abandon
            </ActionChip>
          ) : null}
        </ChipRow>
      ) : null}
      {lifecycle.candidates.length > 0 ? (
        <CandidateList
          title="Ready to activate"
          candidates={lifecycle.candidates}
          isActivationPending={lifecycle.isActivationPending ?? false}
          {...(onActivateCandidatePress ? { onActivatePress: onActivateCandidatePress } : {})}
        />
      ) : null}
    </>
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
    cookingHref,
    onPrintPress,
    onSharePress,
    editHref,
    editDraftHref,
    onDeletePress,
    lifecycle,
    tags,
    ratings,
    onViewerRatingChange,
    renderSharingControls,
    renderComments,
  } = overview;

  // The print and share chips carry the icons module's PrintIcon /
  // ShareIcon (#187, reworked after #217) through ActionChip's icon
  // slot: the official Feather printer / share-2 glyphs, inked by
  // the chip in its neutral tone (gray8) at the md glyph size
  // (24px) — not the "🖨" emoji and "↗" text glyph the page
  // originally used, which render in full color at font-dependent
  // sizes. Do not reintroduce text glyphs or hand-drawn icons for
  // these: icons come from src/icons (see that module's header).
  const showLifecycle =
    lifecycle !== undefined &&
    lifecycle !== null &&
    (lifecycle.isEditable || lifecycle.candidates.length > 0);
  const sharingControls = renderSharingControls ? renderSharingControls() : null;
  const comments = renderComments ? renderComments() : null;

  return (
    <PanelStack>
      {imageUrl ? <Thumbnail variant="hero" src={imageUrl} /> : null}
      <CardStack>
        <Text variant="formTitle">{title}</Text>
        <StatusBadge status={status} />
      </CardStack>
      {description ? <Text variant="body">{description}</Text> : null}
      <StatBand>
        <StatCard label="Servings" value={servingsLabel} />
        {prepTimeLabel ? <StatCard label="Prep" value={prepTimeLabel} /> : null}
        {cookTimeLabel ? <StatCard label="Cook" value={cookTimeLabel} /> : null}
      </StatBand>
      <ButtonRow>
        <Button variant="primary" grow href={cookingHref}>
          Start Cooking
        </Button>
        {onPrintPress ? (
          <ActionChip
            size="md"
            icon={PrintIcon}
            accessibilityLabel="Print recipe"
            onPress={onPrintPress}
          />
        ) : null}
        {onSharePress ? (
          <ActionChip
            size="md"
            icon={ShareIcon}
            accessibilityLabel="Share recipe"
            onPress={onSharePress}
          />
        ) : null}
        {editHref ? <ActionChip href={editHref}>Edit</ActionChip> : null}
        {editDraftHref ? <ActionChip href={editDraftHref}>Edit draft</ActionChip> : null}
        {onDeletePress ? (
          <ActionChip tone="danger" onPress={onDeletePress}>
            Delete
          </ActionChip>
        ) : null}
      </ButtonRow>
      {actionMessage ? <StatusMessage>{actionMessage}</StatusMessage> : null}
      {showLifecycle && lifecycle ? (
        <LifecycleSection
          lifecycle={lifecycle}
          onTweakManuallyPress={overview.onTweakManuallyPress}
          tweakAiHref={overview.tweakAiHref}
          onMarkPerfectedPress={overview.onMarkPerfectedPress}
          onAbandonPress={overview.onAbandonPress}
          onActivateCandidatePress={overview.onActivateCandidatePress}
        />
      ) : null}
      {sharingControls}
      {tags.length > 0 ? <TagList tags={tags} /> : null}
      {ratings ? (
        <RatingsCard ratings={ratings} onViewerRatingChange={onViewerRatingChange} />
      ) : null}
      {comments}
    </PanelStack>
  );
}

// ---------------------------------------------------------------------------
// Ingredients section.
// ---------------------------------------------------------------------------

function IngredientsPanel({
  ingredients: view,
}: {
  ingredients: RecipeDetailPageIngredientsProps;
}) {
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);
  return (
    <PanelStack>
      {/* Servings + scale controls (#73): one compact block, two
          fixed rows, and every value directly enterable — stepping
          is no longer the only way to reach a large batch. Servings
          is an inline editable stepper (label beside the stepper,
          the value a number input in a fixed-width box); Scale is
          a single non-wrapping row of equal-width preset chips
          plus a Custom chip that turns into a number input when
          pressed and afterwards shows the applied custom value
          selected (the EditableChipGroup owns that editing state).
          Same props contract as before — the app wiring is
          untouched. */}
      <NumberStepper
        label="Servings"
        layout="inline"
        value={view.servings}
        min={1}
        onChange={view.onServingsChange}
        editable
      />
      <EditableChipGroup
        label="Scale"
        options={SCALE_OPTIONS}
        value={view.scaleValue}
        onChange={view.onScaleChange}
        customLabel={CUSTOM_SCALE_LABEL}
        customAccessibilityLabel="Custom scale"
        formatCustomValue={(value) => `${formatScaleValue(value)}×`}
      />
      <ListStack>
        {view.ingredients.map((ingredient) => (
          <MarkableRow
            key={ingredient.id}
            label={ingredient.label}
            isMarked={ingredient.isMissing ?? false}
            {...(ingredient.isOptional ? { trailingNote: "optional" } : {})}
            {...(view.onIngredientPress
              ? {
                  onPress: () => {
                    view.onIngredientPress?.(ingredient.id);
                  },
                }
              : {})}
          />
        ))}
      </ListStack>
      {hasMissing ? <Text variant="hint">{MISSING_INGREDIENTS_HINT}</Text> : null}
      {view.isLoadingSubstitutions ? <Text variant="hint">Finding substitutions…</Text> : null}
      {view.substitutions && view.substitutions.length > 0 ? (
        <SuggestionPanel
          title="Substitutions"
          entries={view.substitutions.map((sub) => ({
            id: sub.ingredient,
            label: sub.ingredient,
            detail: sub.suggestions,
          }))}
        />
      ) : null}
    </PanelStack>
  );
}

// ---------------------------------------------------------------------------
// Instructions section. The active step is ephemeral view state,
// held by StepList exactly as the app's tab held it (useState,
// first step active by default).
// ---------------------------------------------------------------------------

function InstructionsPanel({ instructions }: { instructions: RecipeDetailPageInstruction[] }) {
  const sorted = useMemo(
    () => [...instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [instructions],
  );
  return (
    <PanelStack>
      <StepList
        steps={sorted.map((step) => ({
          id: step.id,
          label: `Step ${step.stepNumber}`,
          body: step.body,
        }))}
      />
    </PanelStack>
  );
}

// ---------------------------------------------------------------------------
// History section (cook logs + the form slot).
// ---------------------------------------------------------------------------

function HistoryPanel({ history }: { history: RecipeDetailPageHistoryProps }) {
  if (history.isLoading) {
    return (
      <PanelStack>
        <Center vertical={false}>
          <Spinner label="Loading cook history" />
        </Center>
      </PanelStack>
    );
  }

  // Called once per render; non-null content replaces the button.
  const form = history.renderCookLogForm ? history.renderCookLogForm() : null;

  return (
    <PanelStack>
      {form !== null && form !== undefined ? (
        form
      ) : history.onLogCookPress ? (
        <ButtonRow>
          <Button variant="primary" size="sm" onPress={history.onLogCookPress}>
            Log a cook
          </Button>
        </ButtonRow>
      ) : null}
      {history.cookLogs.length === 0 ? (
        <Text variant="hint">{COOK_LOG_EMPTY_MESSAGE}</Text>
      ) : (
        history.cookLogs.map((log, index) => (
          <LogEntryCard
            key={log.id}
            dateLabel={log.dateLabel}
            {...(log.starRating ? { starRating: log.starRating } : {})}
            {...(log.notes ? { notes: log.notes } : {})}
            {...(history.onDeleteCookLogPress
              ? {
                  onDeletePress: () => {
                    history.onDeleteCookLogPress?.(log.id);
                  },
                  deleteAccessibilityLabel: `Delete cook log ${index + 1} from ${log.dateLabel}`,
                }
              : {})}
          />
        ))
      )}
    </PanelStack>
  );
}

// ---------------------------------------------------------------------------
// The page.
// ---------------------------------------------------------------------------

/**
 * Full-page recipe detail view: pinned chrome (status + version
 * toolbar) over all five sections in a single scroll region (#71 —
 * no tabs; the sections render in the order the tabs had).
 * Controlled — see the file header for the contract, the slot
 * design, and the layout decisions.
 */
export function RecipeDetailPage(props: RecipeDetailPageProps) {
  if (props.state === "loading") {
    return <LoadingGate label="Loading recipe" />;
  }

  const { status, versions, selectedVersionId, onSelectVersion } = props;

  return (
    <ScreenShell>
      <Toolbar>
        <StatusBadge status={status} />
        <VersionPicker
          versions={versions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={onSelectVersion}
        />
      </Toolbar>
      <ScrollRegion>
        <OverviewPanel status={status} overview={props.overview} />
        <SectionHeading>Ingredients</SectionHeading>
        <IngredientsPanel ingredients={props.ingredients} />
        <SectionHeading>Instructions</SectionHeading>
        <InstructionsPanel instructions={props.instructions.instructions} />
        <SectionHeading>Cook History</SectionHeading>
        <HistoryPanel history={props.history} />
        <SectionHeading>Nutrition</SectionHeading>
        <NutritionPanel nutrition={props.nutrition} />
      </ScrollRegion>
    </ScreenShell>
  );
}
