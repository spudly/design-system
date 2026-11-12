import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { useMemo, type ReactNode } from "react";
import type { TagColorName } from "../themes/tagColors.js";
import { Button } from "../widgets/Button.js";
import { ButtonRow } from "../widgets/ButtonRow.js";
import { CandidateList } from "../views/CandidateList.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { CardStack } from "../widgets/CardStack.js";
import { ListStack } from "../widgets/ListStack.js";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
import { LogEntryCard } from "../widgets/LogEntryCard.js";
import { MarkableRow } from "../widgets/MarkableRow.js";
import {
  NutritionPanel,
  type NutritionPanelData,
  type NutritionPanelRow,
} from "../widgets/NutritionPanel.js";
import { NumberStepper } from "../views/NumberStepper.js";
import { PanelStack } from "../widgets/PanelStack.js";
import { PresetValueSelector, type PresetValueOption } from "../widgets/PresetValueSelector.js";
import {
  RatingsCard,
  type RatingsCardCommunityRating,
  type RatingsCardRatings,
  type RatingsCardViewerRating,
} from "../widgets/RatingsCard.js";
import { ScreenShell } from "../widgets/ScreenShell.js";
import { ScrollRegion } from "../widgets/ScrollRegion.js";
import { SectionHeading } from "../widgets/SectionHeading.js";
import { SelectField } from "../widgets/SelectField.js";
import { StatBand } from "../widgets/StatBand.js";
import { StatCard } from "../widgets/StatCard.js";
import { Badge, type BadgeProps } from "../widgets/Badge.js";
import { StatusMessage } from "../widgets/StatusMessage.js";
import { StepList } from "../widgets/StepList.js";
import { SuggestionPanel } from "../widgets/SuggestionPanel.js";
import { TagList } from "../widgets/TagList.js";
import { Text } from "../widgets/Text.js";
import { Thumbnail } from "../widgets/Thumbnail.js";
import { Toolbar } from "../widgets/Toolbar.js";
import { ConfirmActionView, type ConfirmActionViewProps } from "../views/ConfirmActionView.js";
import { RecipeCommentsView, type RecipeCommentsViewProps } from "../views/RecipeCommentsView.js";
import { RecipeSharingView, type RecipeSharingViewProps } from "../views/RecipeSharingView.js";

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
 * Placement: page components live in src/pages and are exported
 * from the package root (#298) — pages are the package's only
 * exports.
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
 * the skeleton shell (#278, tranche 4 — the centered-Spinner
 * pattern is deleted: the composition mirrors the ready layout's
 * sections in order — hero box bone, title and description
 * bones, the stat band in its loading state, then bone regions
 * under the real Ingredients / Instructions / Cook History /
 * Nutrition headings), and `{ state: "ready", ... }` renders
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
 * #438 Part 3 view-modeled both sections after all, on the
 * ratings pattern below: RecipeSharingView and
 * RecipeCommentsView compose the sections from the shared
 * widgets, with every piece of state the old rationale listed
 * (pending selection, consent flag, drafts, pending flags)
 * crossing as controlled props and every mutation staying
 * behind a callback. The overview's `sharing` and `comments`
 * data props render the views; the two render slots remain as
 * the fallback for hosts that have not migrated. The host's
 * four confirmation dialogs (recipe delete, cook-log delete,
 * version activation, nutrition notice) are view-modeled the
 * same way through ConfirmActionView, carried on the ready
 * props' `recipeDeleteConfirmation`,
 * `cookLogDeleteConfirmation`, `activationConfirmation`, and
 * `nutritionNotice` data props.
 * Ratings, by contrast, ARE view-modeled: the community rating is
 * display data, and the viewer's star input is a controlled input
 * (value in, change out, pending disables it) with the mutation
 * behind the callback — the same shape as RecipesPage's filters.
 *
 * Ephemeral state stays inside the view's components, mirroring
 * the app components they replace: the instructions section's
 * active step lives in StepList (the app's InstructionsTab holds
 * it in useState), and the scale row's custom-value editing lives
 * in PresetValueSelector. Neither is business state. The version
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
 * PresetValueSelector, SuggestionPanel, SectionHeading, StatusMessage)
 * — passing data and callbacks only. The widgets the pass first
 * extracted as this page's local copies shipped as shared
 * components — the deduped set in the #119 dedupe (#320), the
 * five this page's clusters still owned (PanelStack, Toolbar,
 * CandidateList, LogEntryCard, NutritionPanel) in the #119
 * extraction set (#331) — and the page now composes those; the
 * chip components the first extraction leaned on were retired
 * in the dedupe, so the page's chip-shaped actions render as
 * Buttons. The pass is a refactor, not a redesign; the treatment
 * normalizations it makes are the design system's canonical ones,
 * each small and deliberate:
 * - The description renders through Text's body variant (theme
 *   foreground ink; it was a fixed gray step).
 * - The overview Delete and the lifecycle Abandon actions render
 *   as danger-variant Buttons (they rendered danger7 ink and a
 *   danger2/danger9 pair).
 * - The print/share actions take Button's square icon-only md
 *   target (48px; they were a 48×40 Button with the glyph as a
 *   child — the glyph now crosses as the button's icon slot, in
 *   the button's own label ink at its standard glyph size).
 * - The single-version picker's static text takes the hint
 *   treatment (it was xs muted text).
 * - The transient action message renders through StatusMessage,
 *   mounted unconditionally so its polite live region announces
 *   the change (#318); the pass first rendered it as a
 *   conditional static centered line, which never announced.
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

// The sharing / comments view-models live with the views
// (#438 Part 3); the page's contract names are aliases, as
// with the ratings types above.
export type RecipeDetailPageSharing = RecipeSharingViewProps;
export type RecipeDetailPageComments = RecipeCommentsViewProps;
/** A confirmation-dialog view-model (ConfirmActionView's props). */
export type RecipeDetailPageConfirmation = ConfirmActionViewProps;

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
  /** Create-a-draft action (#357): the draft action for a recipe
   * with NO existing draft — the host creates a draft version via
   * mutation, then opens the new draft in the version editor.
   * That is mutation-then-navigate, which Stephen's #248
   * borderline ruling (1) exempts from the href rule (the
   * `onTweakManuallyPress` precedent below: it creates a version,
   * then navigates), so it crosses as a press callback, not an
   * href, and the host does not pre-create drafts. It renders
   * the same "Edit draft" button as `editDraftHref`, only when
   * provided AND there is no `editDraftHref` (an existing draft
   * opens through the href form instead). The host composes
   * visibility — it passes this callback only when the displayed
   * version and status allow a draft to be created. */
  onCreateDraftPress?: () => void;
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
  /**
   * The sharing section as data (#438 Part 3): renders
   * RecipeSharingView at the slot's position. The data prop
   * and the render slot are alternatives — when both are
   * supplied, the data prop wins (it is the migrated form).
   */
  sharing?: RecipeDetailPageSharing | null;
  /**
   * The comments section as data (#438 Part 3): renders
   * RecipeCommentsView at the slot's position, under the
   * ratings card. Same alternative rule as `sharing`.
   */
  comments?: RecipeDetailPageComments | null;
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
  loadingSubstitutions?: boolean;
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
  /** Cook-log query in flight: the panel renders skeleton
   * cook-log cards (#278, tranche 4), as the app's tab returns
   * early on loading. */
  loading?: boolean;
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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  state: "ready";
  /** Recipe status as a plain string; the page maps it to the
   * shared Badge's tone/label below as caller data (the
   * design system owns no status vocabulary). Unknown values
   * fall back to "idea", as the app's status normalizer does. */
  status: string;
  versions: RecipeDetailPageVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
  overview: RecipeDetailPageOverviewProps;
  ingredients: RecipeDetailPageIngredientsProps;
  instructions: RecipeDetailPageInstructionsProps;
  history: RecipeDetailPageHistoryProps;
  nutrition: RecipeDetailPageNutritionProps;
  /**
   * The recipe-delete confirmation (#438 Part 3): renders
   * ConfirmActionView beside the page shell when provided.
   * The host opens it from the overview's Delete intent and
   * owns the mutation; the view-model carries the dialog's
   * open flag, pending flag, and error.
   */
  recipeDeleteConfirmation?: RecipeDetailPageConfirmation | null;
  /** The cook-log-delete confirmation; same contract as `recipeDeleteConfirmation`. */
  cookLogDeleteConfirmation?: RecipeDetailPageConfirmation | null;
  /**
   * The version-activation confirmation (#532): same contract
   * as `recipeDeleteConfirmation`. The host opens it from
   * `onActivateCandidatePress` — recording the pressed version
   * and carrying its label in the title/description — instead
   * of activating immediately; the activation mutation fires
   * from the dialog's `onConfirm`. Activation is
   * non-destructive and reversible, so hosts should pass
   * `confirmTone: "primary"` in the view-model.
   */
  activationConfirmation?: RecipeDetailPageConfirmation | null;
  /**
   * The nutrition-error notice: a single-action
   * ConfirmActionView (no cancel label) the host opens when
   * nutrition cannot be shown for a version.
   */
  nutritionNotice?: RecipeDetailPageConfirmation | null;
};

export type RecipeDetailPageProps =
  { state: "loading"; footer?: BigFooterData } | RecipeDetailPageReadyProps;

// ---------------------------------------------------------------------------
// Constants moved with the page (the pilot's rule for option sets
// and section copy).
// ---------------------------------------------------------------------------

// Status badge map: labels and tones for the app's four statuses
// (idea → neutral gray, evolving → info blue, perfected → success
// green, abandoned → danger red, matching the app's badge tints).
// The vocabulary is this page's caller data — the shared
// Badge takes the tone and the label as its child and owns
// only the rendering (Stephen's #119 dedupe ruling: no
// DS-owned status vocabulary).
const STATUS_BADGES: Record<string, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  idea: { label: "Idea", tone: "neutral" },
  evolving: { label: "Evolving", tone: "info" },
  perfected: { label: "Perfected", tone: "success" },
  abandoned: { label: "Abandoned", tone: "danger" },
};

// Scale multipliers from the app's scaling constants; labels are
// presentation, the servings math stays app-side.
const SCALE_OPTIONS: PresetValueOption[] = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

// The scale selector's custom resting label (#73): beside the
// presets, one more option that turns into a number input when
// pressed, so any scale beyond the presets (4× and up, or a
// fraction like 2.5×) is directly enterable. Once a custom value
// applies, the option shows that value ("4×") selected instead of
// this label.
const CUSTOM_SCALE_LABEL = "Custom";

/** A scale value as the custom option shows it: the number without
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

function RecipeStatusBadge({ status }: { status: string }) {
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
 * The lifecycle block of the overview: the tweak / status actions
 * of an editable version, over the activation candidates. Both
 * blocks are design-system compositions (a ButtonRow of Buttons,
 * a CandidateList); their separation — and theirs from the blocks
 * around them — is the overview PanelStack's gap. The actions
 * were chips in the page's first extraction; the #119 dedupe
 * retired the chip components (buttons everywhere), so they
 * render as small Buttons — "Mark perfected" in the neutral
 * secondary form, as Button carries no success variant.
 *
 * The tweak controls split on the #248 ruling: "Tweak with AI"
 * navigates, so it is the primary button's href form; "Tweak
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
        <ButtonRow>
          {onTweakManuallyPress ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={lifecycle.isTweakPending ?? false}
              onPress={onTweakManuallyPress}
            >
              Tweak manually
            </Button>
          ) : null}
          {tweakAiHref ? (
            <Button variant="primary" size="sm" href={tweakAiHref}>
              Tweak with AI
            </Button>
          ) : null}
          {onMarkPerfectedPress ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={lifecycle.isStatusChangePending ?? false}
              onPress={onMarkPerfectedPress}
            >
              Mark perfected
            </Button>
          ) : null}
          {onAbandonPress ? (
            <Button
              variant="danger"
              size="sm"
              disabled={lifecycle.isStatusChangePending ?? false}
              onPress={onAbandonPress}
            >
              Abandon
            </Button>
          ) : null}
        </ButtonRow>
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

function OverviewPanel({ overview }: { overview: RecipeDetailPageOverviewProps }) {
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
    onCreateDraftPress,
    onDeletePress,
    lifecycle,
    tags,
    ratings,
    onViewerRatingChange,
    renderSharingControls,
    renderComments,
    sharing,
    comments: commentsData,
  } = overview;

  // The print and share buttons name the icons module's "print" /
  // "share" glyphs (#187, reworked after #217; by name since #438
  // Part 4) through Button's icon slot: the official Feather
  // printer / share-2 glyphs, inked in the button's label color at
  // its standard glyph size — not the "🖨" emoji and "↗" text glyph
  // the page originally used, which render in full color at
  // font-dependent sizes. Do not reintroduce text glyphs or
  // hand-drawn icons for these: icons come from src/icons (see
  // that module's header).
  const showLifecycle =
    lifecycle !== undefined &&
    lifecycle !== null &&
    (lifecycle.isEditable || lifecycle.candidates.length > 0);
  // The sections have two sources (#438 Part 3): the data
  // props render the DS views; the render slots are the
  // fallback for hosts that have not migrated. A slot is
  // called once per render, only when provided.
  const sharingSlot = renderSharingControls ? renderSharingControls() : null;
  const commentsSlot = renderComments ? renderComments() : null;
  const sharingControls = sharing ? <RecipeSharingView {...sharing} /> : sharingSlot;
  const comments = commentsData ? <RecipeCommentsView {...commentsData} /> : commentsSlot;

  return (
    <PanelStack>
      {imageUrl ? <Thumbnail variant="hero" src={imageUrl} /> : null}
      <CardStack>
        <Text variant="formTitle">{title}</Text>
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
          <Button
            variant="secondary"
            size="md"
            icon="print"
            accessibilityLabel="Print recipe"
            onPress={onPrintPress}
          />
        ) : null}
        {onSharePress ? (
          <Button
            variant="secondary"
            size="md"
            icon="share"
            accessibilityLabel="Share recipe"
            onPress={onSharePress}
          />
        ) : null}
        {editHref ? (
          <Button variant="secondary" size="sm" href={editHref}>
            Edit
          </Button>
        ) : null}
        {editDraftHref ? (
          <Button variant="secondary" size="sm" href={editDraftHref}>
            Edit draft
          </Button>
        ) : onCreateDraftPress ? (
          <Button variant="secondary" size="sm" onPress={onCreateDraftPress}>
            Edit draft
          </Button>
        ) : null}
        {onDeletePress ? (
          <Button variant="danger" size="sm" onPress={onDeletePress}>
            Delete
          </Button>
        ) : null}
      </ButtonRow>
      {/* StatusMessage renders unconditionally (#318): its polite
          live region must be mounted before the message changes
          for the change to announce, so there is no conditional
          block here — the component renders its empty region when
          there is no message. */}
      <StatusMessage message={actionMessage} />
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
      <SectionHeading>Ingredients</SectionHeading>
      {/* Servings + scale controls (#73): one compact block, two
          fixed rows, and every value directly enterable — stepping
          is no longer the only way to reach a large batch. Servings
          is an inline editable stepper (label beside the stepper,
          the value a number input in a fixed-width box); Scale is
          the PresetValueSelector — a single non-wrapping row of
          equal-width preset buttons plus a Custom option that
          turns into a number input when pressed and afterwards
          shows the applied custom value selected (the selector
          owns that editing state). Same props contract as before —
          the app wiring is untouched. */}
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
      {view.loadingSubstitutions ? <Text variant="hint">Finding substitutions…</Text> : null}
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
      <SectionHeading>Instructions</SectionHeading>
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

// The dummy skeleton cards for the loading cook history (#278):
// exactly 3, from a frozen module-level constant — never
// generated per render (the CheckboxSelectList convention).
const LOADING_COOK_LOG_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

function HistoryPanel({ history }: { history: RecipeDetailPageHistoryProps }) {
  if (history.loading) {
    // Loading (#278, tranche 4): the heading stays and the
    // entries render as exactly 3 dummy LogEntryCards in their
    // loading state (date, rating, and notes bones; the Delete
    // action kept as an inert skeleton Button when the host
    // wires it, as the loaded cards render it).
    return (
      <PanelStack>
        <SectionHeading>Cook History</SectionHeading>
        {LOADING_COOK_LOG_KEYS.map((key, index) => (
          <LogEntryCard
            key={key}
            dateLabel="Cook log"
            starRating={5}
            notes="Cook log notes"
            loading
            {...(history.onDeleteCookLogPress
              ? {
                  onDeletePress: () => {},
                  deleteAccessibilityLabel: `Delete cook log ${index + 1}`,
                }
              : {})}
          />
        ))}
      </PanelStack>
    );
  }

  // Called once per render; non-null content replaces the button.
  const form = history.renderCookLogForm ? history.renderCookLogForm() : null;

  return (
    <PanelStack>
      <SectionHeading>Cook History</SectionHeading>
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
    // Loading (#278, tranche 4): the skeleton composition in
    // the header's States note — the ready layout's sections
    // in order, every content region skeletonized inside the
    // loading scope, no real recipe content.
    return (
      <BigFooterShell footer={props.footer} scrollMode="content">
        <LoadingScope active>
          <ScreenShell>
            <ScrollRegion>
              <PanelStack>
                <BoxSkeleton height={256} />
                <TextSkeleton size="2xl" lines={1} />
                <TextSkeleton size="md" lines={3} />
                <StatBand loading>
                  <StatCard value="" label="" />
                </StatBand>
              </PanelStack>
              <PanelStack>
                <SectionHeading>Ingredients</SectionHeading>
                <TextSkeleton size="md" lines={4} />
              </PanelStack>
              <PanelStack>
                <SectionHeading>Instructions</SectionHeading>
                <BoxSkeleton height={96} />
                <BoxSkeleton height={96} />
              </PanelStack>
              <PanelStack>
                <SectionHeading>Cook History</SectionHeading>
                <TextSkeleton size="md" lines={3} />
              </PanelStack>
              <PanelStack>
                <SectionHeading>Nutrition</SectionHeading>
                <TextSkeleton size="md" lines={3} />
              </PanelStack>
            </ScrollRegion>
          </ScreenShell>
        </LoadingScope>
      </BigFooterShell>
    );
  }

  const { status, versions, selectedVersionId, onSelectVersion } = props;

  return (
    <BigFooterShell footer={props.footer} scrollMode="content">
      <ScreenShell>
        <Toolbar>
          <RecipeStatusBadge status={status} />
          <VersionPicker
            versions={versions}
            selectedVersionId={selectedVersionId}
            onSelectVersion={onSelectVersion}
          />
        </Toolbar>
        <ScrollRegion>
          <OverviewPanel overview={props.overview} />
          <IngredientsPanel ingredients={props.ingredients} />
          <InstructionsPanel instructions={props.instructions.instructions} />
          <HistoryPanel history={props.history} />
          {/* The section headings render inside their panels as the
            PanelStack's first block (the canonical SectionHeading
            carries no padding of its own — the panel's inset is
            the heading's). NutritionPanel is a bare widget, so its
            section stack is composed here. */}
          <PanelStack>
            <SectionHeading>Nutrition</SectionHeading>
            <NutritionPanel nutrition={props.nutrition} />
          </PanelStack>
        </ScrollRegion>
      </ScreenShell>
      {props.recipeDeleteConfirmation ? (
        <ConfirmActionView {...props.recipeDeleteConfirmation} />
      ) : null}
      {props.cookLogDeleteConfirmation ? (
        <ConfirmActionView {...props.cookLogDeleteConfirmation} />
      ) : null}
      {props.activationConfirmation ? (
        <ConfirmActionView {...props.activationConfirmation} />
      ) : null}
      {props.nutritionNotice ? <ConfirmActionView {...props.nutritionNotice} /> : null}
    </BigFooterShell>
  );
}
