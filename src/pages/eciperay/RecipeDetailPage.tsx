import { useMemo, type ReactNode } from "react";

import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { isWeb } from "../../widgets/platform.js";
import type { TagColorName } from "../../themes/tagColors.js";
import { Button } from "../../widgets/actions/Button.js";
import { CenteredText } from "../../widgets/content/CenteredText.js";
import { tokens } from "../../tokens/index.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { CandidateList } from "../../widgets/data/CandidateList.js";
import { BoxSkeleton } from "../../widgets/feedback/BoxSkeleton.js";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { LogEntryCard } from "../../views/eciperay/LogEntryCard.js";
import { MarkableRow } from "../../widgets/data/MarkableRow.js";
import {
  NutritionPanel,
  type NutritionFact,
  type NutritionFactKind,
  type NutritionPanelData,
} from "../../widgets/data/NutritionPanel.js";
import { NumberStepper } from "../../widgets/form/NumberStepper.js";
import { Card } from "../../widgets/layout/Card.js";
import { Col } from "../../widgets/layout/Col.js";
import {
  PresetValueSelector,
  type PresetValueOption,
} from "../../widgets/form/PresetValueSelector.js";
import {
  RatingsCard,
  type RatingsCardCommunityRating,
  type RatingsCardRatings,
  type RatingsCardViewerRating,
} from "../../widgets/data/RatingsCard.js";
import { ScrollRegion } from "../../widgets/layout/ScrollRegion.js";
import { MainLandmark } from "../../widgets/layout/MainLandmark.js";
import { ScrollShell } from "../../widgets/layout/ScrollShell.js";
import { SectionHeading } from "../../widgets/content/SectionHeading.js";
import { MessageCard } from "../../widgets/content/MessageCard.js";
import { SelectField } from "../../widgets/form/SelectField.js";
import { SkeletonBone } from "../../widgets/feedback/SkeletonClock.js";
import { Badge } from "../../widgets/data/Badge.js";
import { MetadataBadge } from "../../widgets/data/MetadataBadge.js";
import { StatusMessage } from "../../views/shared/StatusMessage.js";
import { StepList } from "../../widgets/data/StepList.js";
import { SuggestionPanel } from "../../widgets/form/SuggestionPanel.js";
import { TagList } from "../../widgets/data/TagList.js";
import { Text } from "../../widgets/data/Text.js";
import { Thumbnail } from "../../widgets/data/Thumbnail.js";
import { Toolbar } from "../../widgets/actions/Toolbar.js";
import {
  ConfirmActionView,
  type ConfirmActionViewProps,
} from "../../views/eciperay/ConfirmActionView.js";
import {
  RecipeCommentsView,
  type RecipeCommentsViewProps,
} from "../../views/eciperay/RecipeCommentsView.js";
import { RecipeIngredientsPanel } from "../../views/eciperay/RecipeIngredientsPanel.js";
import { RecipeOverviewPanel } from "../../views/eciperay/RecipeOverviewPanel.js";
import { RatingForm } from "../../widgets/form/RatingForm.js";
import {
  RecipeSharingView,
  type RecipeSharingConsentSpan,
  type RecipeSharingViewProps,
} from "../../views/eciperay/RecipeSharingView.js";
import { STATUS_BADGES } from "../shared/recipeStatusBadges.js";

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
 * RecipeDetailChrome (spudly/eciperay packages/app): a single
 * ScrollRegion holding every section in order. The #721 fidelity
 * round (Stephen, 2026-11-20) fixed the order to the visual
 * direction's in-image flow — hero, metadata pill, serif title,
 * description, Ingredients, Instructions, Start Cooking, tip
 * line — with everything else (status badge + version
 * picker, servings/scale controls, action rows, substitutions,
 * cook history, nutrition) below Start Cooking, each section
 * under its own heading. The page originally split the sections across
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
 * bones, a pill bone for the metadata badge, then bone regions
 * under the real Ingredients / Instructions / Cook History /
 * Nutrition headings), and `{ state: "ready", ... }` renders
 * the chrome and panels.
 *
 * One auth-aware page (#757): PublicRecipePage merged into this
 * page — there is no longer a separate public surface. The union
 * also carries the public surface's two error states,
 * `notFound` and `unavailable`, as members with DS-owned copy
 * (the web messages verbatim, in the constants below), and the
 * ready member splits on the `viewer` discriminator: the owner
 * form (this page's original contract — status, versions,
 * lifecycle, history, nutrition) and the guest form (the public
 * page's ready contract — a CTA bar over the shared overview /
 * ingredients / instructions panels, ratings, and comments,
 * inside MainLandmark + ScrollShell). The host picks the form
 * from its auth state: the owner viewing their recipe gets the
 * owner form; a signed-in non-owner or a signed-out visitor
 * gets the guest form. The guest form's sections are the shared
 * library panels (RecipeOverviewPanel, RecipeIngredientsPanel,
 * StepList), as on the retired public page, so the two forms
 * render one interaction model where they overlap.
 *
 * The cook-log form (#687): the history section's form is
 * rendered by the page itself — the DS RatingForm (the
 * generalized cook-log form, #176) driven by the history
 * data + submit callbacks (`history.cookLogForm`). While the
 * form data is present, the form replaces the view's
 * "Log a cook" button — the same button-hides-while-open
 * semantics the old render slot had. The cook-log ENTRIES
 * are display data and are view-modeled as props.
 * #438 Part 3 view-modeled the sharing and comments sections
 * on the ratings pattern below: RecipeSharingView and
 * RecipeCommentsView compose the sections from the shared
 * widgets, with every piece of state (pending selection,
 * consent flag, drafts, pending flags) crossing as controlled
 * props and every mutation staying behind a callback. The
 * overview's `sharing` and `comments` data props render the
 * views; their former render slots were removed in #682 — the
 * data props are the only paths. The host's
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
 * chrome over a ScrollRegion, panel Cols, and the widgets
 * extracted from this page's clusters (RatingsCard, NutritionPanel,
 * CandidateList, LogEntryCard, StepList, MarkableRow,
 * PresetValueSelector, SuggestionPanel, SectionHeading, StatusMessage)
 * — passing data and callbacks only. The widgets the pass first
 * extracted as this page's local copies shipped as shared
 * components — the deduped set in the #119 dedupe (#320), the
 * five this page's clusters still owned (PanelStack, Toolbar,
 * CandidateList, LogEntryCard, NutritionPanel) in the #119
 * extraction set (#331) — and the page now composes those
 * (PanelStack as a panel Col since #746); the
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
 * - Panel block separations are the panel Col's 16px rhythm: the
 *   servings → scale separation (12px) and the missing-ingredients
 *   hint's offset (12px) normalize to it, as does the last
 *   cook-log entry's trailing separation (a per-entry bottom
 *   padding on top of the panel's own — the panel's padding now
 *   provides it, as parents own separation in this system).
 *
 * Documented deviations from the app's current rendering, all
 * presentation-only:
 * - The instructions section's steps render flat in the numeral
 *   presentation (#721 fidelity round): no active card wash at
 *   all — an orange numeral and period beside the body text.
 * - Stale-rating hints: the app renders an alert icon whose
 *   accessibility label is the hint; the view renders the hint as
 *   visible hint text. The copy moved verbatim from the app's
 *   client constants (STALE_*_RATING_HINT, now in RatingsCard).
 * - The hero image frame's shape is the image's own aspect
 *   ratio (#721), measured and clamped inside Thumbnail's hero
 *   variant; the loading skeleton's hero bone holds the same
 *   fallback 4:3 shape.
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
export type RecipeDetailPageSharingConsentSpan = RecipeSharingConsentSpan;
export type RecipeDetailPageComments = RecipeCommentsViewProps;
/** A confirmation-dialog view-model (ConfirmActionView's props). */
export type RecipeDetailPageConfirmation = ConfirmActionViewProps;

export type RecipeDetailPageOverviewProps = {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  /** Overview metadata values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  /** The recipe's category, app-formatted ("Herb & Garlic"):
   * the first part of the metadata pill under the hero (#721).
   * Optional — the pill joins whichever parts are present. */
  categoryLabel?: string;
  /** Total time, app-formatted ("45 min"): the metadata pill's
   * second part (#721). The app formats it from its own data —
   * the DS never sums the prep/cook label strings. */
  totalTimeLabel?: string;
  /** A short cooking hint, app-supplied ("Tip: Let it rest for
   * juicier meat"): rendered as the italic line under the Start
   * Cooking action (#721). Omit for no line. */
  cookingTipLabel?: string;
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
  /**
   * The sharing section as data (#438 Part 3): renders
   * RecipeSharingView after the lifecycle section and before
   * the tags.
   */
  sharing?: RecipeDetailPageSharing | null;
  /**
   * The comments section as data (#438 Part 3): renders
   * RecipeCommentsView in the engagement stack, under the
   * ratings card.
   */
  comments?: RecipeDetailPageComments | null;
};

export type RecipeDetailPageIngredient = {
  id: string;
  /** The full scaled line, app-formatted ("1 1/2 lb chicken"). */
  label: string;
  isOptional?: boolean;
  /** Marked missing by the viewer: the row's checkbox checks
   * (its text never dims, #721 fidelity round) and the
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
  /** The cook-log form as data (#687): when present, the page
   * renders the DS RatingForm (light variant) in place of the
   * "Log a cook" button. The form's rating/notes state stays
   * inside the form; only the submit view-model, the skip
   * intent, and the pending flag cross the boundary — the
   * mutation itself stays app-side. */
  cookLogForm?: RecipeDetailPageCookLogForm | null;
};

/** The cook-log form's submit view-model (#687). */
export type RecipeDetailPageCookLogFormValues = {
  rating: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
};

export type RecipeDetailPageCookLogForm = {
  onSubmit: (values: RecipeDetailPageCookLogFormValues) => void;
  onSkip: () => void;
  isPending: boolean;
  /** Defaults to the voice object's ratingForm title (#539). */
  title?: string;
  /** Defaults to the voice object's ratingForm notesPlaceholder (#539). */
  notesPlaceholder?: string;
  /** Defaults to the voice object's ratingForm secondaryLabel (#539). */
  secondaryLabel?: string;
};

// The nutrition view-model lives with NutritionPanel (the widget
// the #119 pass extracted from this page's nutrition section);
// the page's contract names are aliases, as with the ratings
// types above.
export type RecipeDetailPageNutritionFact = NutritionFact;
export type RecipeDetailPageNutritionFactKind = NutritionFactKind;
export type RecipeDetailPageNutritionProps = NutritionPanelData;

export type RecipeDetailPageOwnerReadyProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  state: "ready";
  /**
   * The viewer discriminator (#757): the ready union splits on
   * it — the owner form (this type) and the guest form
   * (RecipeDetailPageGuestReadyProps). Optional here so existing
   * hosts, fixtures, and stories compile unchanged: absent
   * means the owner is viewing their own recipe.
   */
  viewer?: "owner";
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

// ---------------------------------------------------------------------------
// Guest form (#757): the retired PublicRecipePage's ready contract,
// absorbed as this page's second ready form. A guest — a signed-in
// non-owner or a signed-out visitor — sees the public treatment:
// a CTA bar over the shared overview / ingredients / instructions
// panels, then the engagement stack (ratings, comments). No
// account data in the view-model, no version picker, no
// lifecycle/sharing/cook-history/nutrition sections. The section
// shapes are this page's own (ingredients, instructions, ratings,
// comments), shared by both forms so they cannot drift apart.
// ---------------------------------------------------------------------------

export type RecipeDetailPageGuestOverviewProps = {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  /** Overview stat band values, app-formatted ("4", "15m", "30m"). */
  servingsLabel: string;
  prepTimeLabel?: string;
  cookTimeLabel?: string;
  tags: RecipeDetailPageTag[];
};

/** The CTA bar's variant, chosen by the host's auth state. The
 * signed-in variant carries the clone mutation's pending state:
 * its button reads "Saving…" and disables while a clone is in
 * flight. */
export type RecipeDetailPageCtas =
  { variant: "signedOut" } | { variant: "signedIn"; isClonePending?: boolean };

export type RecipeDetailPageGuestReadyProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  state: "ready";
  /** The guest form's viewer: a signed-in non-owner, or a
   * signed-out visitor. The CTA bar's variant follows it. */
  viewer: "signedIn" | "signedOut";
  overview: RecipeDetailPageGuestOverviewProps;
  ctas: RecipeDetailPageCtas;
  /** Sign-up intent (signed-out bar): the host navigates. */
  onSignUpPress: () => void;
  /** Clone intent: signed out, the host navigates to sign-up with
   * the clone target; signed in, it runs the clone mutation. */
  onClonePress: () => void;
  /** Get-the-app intent: the host opens the install URL. */
  onGetAppPress: () => void;
  ingredients: RecipeDetailPageIngredientsProps;
  instructions: RecipeDetailPageInstructionsProps;
  /** Engagement block; omit (or pass null) to hide it. */
  ratings?: RecipeDetailPageRatings | null;
  onViewerRatingChange?: (stars: number | null) => void;
  /**
   * The comments section as data (#130 T7): renders
   * RecipeCommentsView in the engagement stack, under the
   * ratings card.
   */
  comments?: RecipeDetailPageComments | null;
};

/** The ready union (#757): the owner form and the guest form,
 * discriminated by `viewer` (absent = owner). */
export type RecipeDetailPageReadyProps =
  RecipeDetailPageOwnerReadyProps | RecipeDetailPageGuestReadyProps;

export type RecipeDetailPageProps =
  | { state: "loading"; footer?: BigFooterData }
  | { state: "notFound"; footer?: BigFooterData }
  | { state: "unavailable"; footer?: BigFooterData }
  | RecipeDetailPageReadyProps;

// ---------------------------------------------------------------------------
// Constants moved with the page (the pilot's rule for option sets
// and section copy).
// ---------------------------------------------------------------------------

// The status badge map (labels and tones for the app's four
// statuses) lives in ./recipeStatusBadges.ts (#587 phase 3
// tranche 5) — the vocabulary is the page's caller data, not
// something the shared Badge owns (Stephen's #119 dedupe
// ruling). It was shared with PublicRecipePage until #757
// merged that page into this one; the guest form renders no
// status badge (the public surface never carried one).

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

// Guest-mode copy (#757, carried from the retired public page —
// the copy precedent: section copy is DS-owned and moves with
// the page). CTA copy, verbatim from the web surface's CTA bar.
// The signed-in clone label is the app's shared
// SAVE_RECIPE_COPY_LABEL; its pending label is the web button's
// in-flight text.
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
 * around them — is the overview panel Col's gap. The actions
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
  const { imageUrl, title, description, servingsLabel, categoryLabel, totalTimeLabel } = overview;

  return (
    <Col gap="l" p="l">
      {imageUrl ? <Thumbnail variant="hero" src={imageUrl} /> : null}
      <MetadataBadge
        parts={[
          categoryLabel,
          totalTimeLabel,
          servingsLabel ? `Serves ${servingsLabel}` : undefined,
        ]}
      />
      <Text variant="display">{title}</Text>
      {description ? <Text variant="body">{description}</Text> : null}
    </Col>
  );
}

/**
 * The Start Cooking block (#721 fidelity round, Stephen's
 * ruling): the in-image flow ends with the Start Cooking pill —
 * fully rounded, burnt orange (the theme primary sampled at
 * #B13F13), full width — and the tip line centered underneath
 * it, italic in the muted-green accent ink. Everything that is
 * not in the visual direction image renders below this block
 * (see DetailsPanel).
 */
function StartCookingPanel({ overview }: { overview: RecipeDetailPageOverviewProps }) {
  const { cookingHref, cookingTipLabel } = overview;
  return (
    <Col gap="l" p="l">
      <ButtonRow>
        <Button variant="primary" grow borderRadius={tokens.radii.full} href={cookingHref}>
          Start Cooking
        </Button>
      </ButtonRow>
      {cookingTipLabel ? (
        <CenteredText variant="hint" fontStyle="italic" color="$accent">
          {cookingTipLabel}
        </CenteredText>
      ) : null}
    </Col>
  );
}

/**
 * Everything below Start Cooking (#721 fidelity round, Stephen's
 * ruling: anything not in the visual direction image moves below
 * the Start Cooking button): the status badge +
 * version selector, the servings stepper and scale pills, the
 * print/share/edit/delete and tweak action rows, the
 * substitutions panel, and the overview's remaining sections
 * (sharing, tags, ratings, comments) in their established order.
 */
function DetailsPanel({
  overview,
  ingredients: view,
  status,
  versions,
  selectedVersionId,
  onSelectVersion,
}: {
  overview: RecipeDetailPageOverviewProps;
  ingredients: RecipeDetailPageIngredientsProps;
  status: string;
  versions: RecipeDetailPageVersion[];
  selectedVersionId: string;
  onSelectVersion: (versionId: string) => void;
}) {
  const {
    actionMessage,
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
  // The sections render from their data props (#438 Part 3).
  const sharingControls = sharing ? <RecipeSharingView {...sharing} /> : null;
  const comments = commentsData ? <RecipeCommentsView {...commentsData} /> : null;
  // The secondary action row renders only when at least one of
  // its actions applies — Start Cooking has its own panel now
  // (#721), so this row can legitimately be empty.
  const hasSecondaryActions =
    onPrintPress !== undefined ||
    onSharePress !== undefined ||
    editHref !== undefined ||
    editDraftHref !== undefined ||
    onCreateDraftPress !== undefined ||
    onDeletePress !== undefined;

  return (
    <Col gap="l" p="l">
      <Toolbar>
        <RecipeStatusBadge status={status} />
        <VersionPicker
          versions={versions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={onSelectVersion}
        />
      </Toolbar>
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
      {hasSecondaryActions ? (
        <ButtonRow>
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
      ) : null}
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
      {sharingControls}
      {tags.length > 0 ? <TagList tags={tags} /> : null}
      {ratings ? (
        <RatingsCard ratings={ratings} onViewerRatingChange={onViewerRatingChange} />
      ) : null}
      {comments}
    </Col>
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
    <Col gap="l" p="l">
      <SectionHeading icon="list">Ingredients</SectionHeading>
      <Col>
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
      </Col>
      {hasMissing ? <Text variant="hint">{MISSING_INGREDIENTS_HINT}</Text> : null}
    </Col>
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
    <Col gap="l" p="l">
      <SectionHeading>Instructions</SectionHeading>
      <StepList
        presentation="numeral"
        steps={sorted.map((step) => ({
          id: step.id,
          label: `Step ${step.stepNumber}`,
          body: step.body,
          number: step.stepNumber,
        }))}
      />
    </Col>
  );
}

// ---------------------------------------------------------------------------
// History section (cook logs + the form slot).
// ---------------------------------------------------------------------------

// The dummy skeleton cards for the loading cook history (#278):
// exactly 3, from a frozen module-level constant — never
// generated per render (the CheckboxSelectList convention).
const LOADING_COOK_LOG_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

function HistoryPanel({
  history,
  selectedVersionId,
}: {
  history: RecipeDetailPageHistoryProps;
  selectedVersionId: string;
}) {
  if (history.loading) {
    // Loading (#278, tranche 4): the heading stays and the
    // entries render as exactly 3 dummy LogEntryCards in their
    // loading state (date, rating, and notes bones; the Delete
    // action kept as an inert skeleton Button when the host
    // wires it, as the loaded cards render it).
    return (
      <Col gap="l" p="l">
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
      </Col>
    );
  }

  // The form renders from data while the host has it open;
  // its presence replaces the button (#687). The form is keyed
  // to the selected version: RatingForm keeps its draft in
  // local state, so a version change remounts it — a draft
  // entered for one version can never be submitted through
  // another version's onSubmit (CodeRabbit review on #691).
  const form = history.cookLogForm ? (
    <RatingForm
      key={selectedVersionId}
      variant="light"
      onSubmit={history.cookLogForm.onSubmit}
      onSkip={history.cookLogForm.onSkip}
      isPending={history.cookLogForm.isPending}
      title={history.cookLogForm.title}
      notesPlaceholder={history.cookLogForm.notesPlaceholder}
      secondaryLabel={history.cookLogForm.secondaryLabel}
    />
  ) : null;

  return (
    <Col gap="l" p="l">
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
    </Col>
  );
}

// ---------------------------------------------------------------------------
// Guest-mode sections (#757): the retired public page's sections,
// absorbed as file-local components of the guest branch. The CTA
// bar sits above the sections, its variant chosen by the host's
// auth state: signed-out visitors get sign-up / clone /
// get-the-app intents; signed-in viewers get the clone mutation's
// own button (with its pending state) and get-the-app. All three
// intents are plain callbacks — the host navigates, runs the
// clone mutation, or opens the install URL.
// ---------------------------------------------------------------------------

// The bar's card has no outer spacing of its own: the shell
// column insets it and owns its separation from the overview
// below (#119). Inside the card, ButtonRow (`equal`) owns the
// buttons' treatment: they share the card's width equally —
// flex 1 with a 40% minimum, wrapping instead of shrinking — so
// no caller sizes a button itself. The bar passes the row the
// variant's buttons as one fragment; the row flattens and
// sizes them.
function CtaBar({
  ctas,
  onSignUpPress,
  onClonePress,
  onGetAppPress,
}: {
  ctas: RecipeDetailPageCtas;
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
  return (
    <Card>
      <ButtonRow equal>{buttons}</ButtonRow>
    </Card>
  );
}

// The three guest recipe sections are the shared library panels
// (RecipeOverviewPanel, RecipeIngredientsPanel and StepList
// carry the sections' rendering); these wrappers only wire the
// guest view-models into them.

/** The guest overview header block: the shared
 * RecipeOverviewPanel, fed the guest overview view-model. The
 * guest form renders no status badge (#735: recipe status is
 * removed entirely). */
function OverviewSection({ overview }: { overview: RecipeDetailPageGuestOverviewProps }) {
  return (
    <RecipeOverviewPanel
      {...(overview.imageUrl !== undefined ? { imageUrl: overview.imageUrl } : {})}
      title={overview.title}
      {...(overview.description !== undefined ? { description: overview.description } : {})}
      servingsLabel={overview.servingsLabel}
      {...(overview.prepTimeLabel !== undefined ? { prepTimeLabel: overview.prepTimeLabel } : {})}
      {...(overview.cookTimeLabel !== undefined ? { cookTimeLabel: overview.cookTimeLabel } : {})}
      tags={overview.tags}
    />
  );
}

/** The guest ingredients section: the shared
 * RecipeIngredientsPanel (the servings stepper and scale
 * selector, the pressable ingredient rows, and the substitutions
 * block), fed the page's ingredients view-model — one shape
 * shared by both forms. */
function IngredientsSection({ ingredients }: { ingredients: RecipeDetailPageIngredientsProps }) {
  return <RecipeIngredientsPanel ingredients={ingredients} />;
}

/** The guest instructions section: the shared StepList (the
 * step cards in step-number order, the tapped card highlighted
 * as the active step), fed the page's instruction list sorted
 * by step number with each step's "Step N" eyebrow label
 * composed here — labels are caller-voiced copy (#747: the
 * panel that used to do this wiring was removed, its loading
 * skeleton moved into StepList). */
function InstructionsSection({ instructions }: { instructions: RecipeDetailPageInstruction[] }) {
  const sorted = [...instructions].sort((a, b) => a.stepNumber - b.stepNumber);
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

/** The guest-form discriminant: the ready union's guest member
 * is the one whose viewer is a signed-in or signed-out guest
 * (the owner member's viewer is "owner" or absent). A guard
 * function because the optional owner discriminant defeats
 * inline negative narrowing. */
function isGuestReadyProps(
  props: RecipeDetailPageReadyProps,
): props is RecipeDetailPageGuestReadyProps {
  return props.viewer === "signedIn" || props.viewer === "signedOut";
}

/** The page's fixed-shell frame, inlined from the retired
 * ScreenShell (#741 — this page was its only page consumer):
 * a full-height, surface-filled column for the states that pin
 * their own chrome above a ScrollRegion (the loading skeleton
 * and the owner form). Platform split (#547, Stephen's
 * page-scroll model): on native the frame's `flex: 1` (Col's
 * grow shrink) fills the bounded frame BigFooterShell's
 * "content" mode provides; on web the document scrolls the
 * whole page, so the frame renders as a plain growing surface
 * column (grow only) — `flex: 1`'s zero basis collapsed it
 * inside BigFooterShell's unbounded space-between column,
 * leaving the footer at the viewport's bottom edge while the
 * content overflowed past it (PR #556's audit). */
function RecipeDetailFrame({ children }: { children: ReactNode }) {
  if (isWeb) {
    return (
      <Col grow backgroundColor="$surface">
        {children}
      </Col>
    );
  }
  return (
    <Col grow shrink backgroundColor="$surface">
      {children}
    </Col>
  );
}

// ---------------------------------------------------------------------------
// The page.
// ---------------------------------------------------------------------------

/**
 * Full-page recipe detail view: all sections in a single scroll
 * region (#71 — no tabs), in the #721 fidelity round's order
 * (the visual direction's in-image flow first, everything else
 * below Start Cooking). The guest form renders its sections in
 * one ScrollShell inside the main landmark, and the two
 * whole-screen message states (notFound / unavailable) render
 * the shared MessageCard inside the landmark — every state
 * renders its own BigFooter through BigFooterShell.
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
          <RecipeDetailFrame>
            <Toolbar>
              <BoxSkeleton width={96} height={24} />
              <BoxSkeleton width={180} height={40} />
            </Toolbar>
            <ScrollRegion>
              <Col gap="l" p="l">
                <BoxSkeleton aspectRatio={4 / 3} />
                <TextSkeleton size="2xl" lines={1} />
                <TextSkeleton size="md" lines={3} />
                <SkeletonBone
                  width={200}
                  height={14 + tokens.spacing[1] * 2 + 2}
                  borderRadius={tokens.radii.full}
                />
              </Col>
              <Col gap="l" p="l">
                <SectionHeading>Ingredients</SectionHeading>
                <TextSkeleton size="md" lines={4} />
              </Col>
              <Col gap="l" p="l">
                <SectionHeading>Instructions</SectionHeading>
                <BoxSkeleton height={96} />
                <BoxSkeleton height={96} />
              </Col>
              <Col gap="l" p="l">
                <SectionHeading>Cook History</SectionHeading>
                <TextSkeleton size="md" lines={3} />
              </Col>
              <Col gap="l" p="l">
                <SectionHeading>Nutrition</SectionHeading>
                <TextSkeleton size="md" lines={3} />
              </Col>
            </ScrollRegion>
          </RecipeDetailFrame>
        </LoadingScope>
      </BigFooterShell>
    );
  }

  if (props.state === "notFound") {
    return (
      <BigFooterShell footer={props.footer} scrollMode="content">
        <MainLandmark>
          <MessageCard title={NOT_FOUND_TITLE} message={NOT_FOUND_MESSAGE} />
        </MainLandmark>
      </BigFooterShell>
    );
  }

  if (props.state === "unavailable") {
    return (
      <BigFooterShell footer={props.footer} scrollMode="content">
        <MainLandmark>
          <MessageCard title={UNAVAILABLE_TITLE} message={UNAVAILABLE_MESSAGE} />
        </MainLandmark>
      </BigFooterShell>
    );
  }

  if (isGuestReadyProps(props)) {
    // Guest form (#757): the public surface's ready composition,
    // verbatim — a CTA bar above all four sections in a single
    // scroll (no tabs — overview, ingredients, instructions,
    // engagement, in the order the public tabs had), inside the
    // page's main landmark (#366/#473).
    const { ratings, onViewerRatingChange, comments: commentsData } = props;
    const comments = commentsData ? <RecipeCommentsView {...commentsData} /> : null;

    return (
      <BigFooterShell footer={props.footer} scrollMode="content">
        <MainLandmark>
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
        </MainLandmark>
      </BigFooterShell>
    );
  }

  const { status, versions, selectedVersionId, onSelectVersion } = props;

  return (
    <BigFooterShell footer={props.footer} scrollMode="content">
      <RecipeDetailFrame>
        <ScrollRegion>
          <OverviewPanel overview={props.overview} />
          <IngredientsPanel ingredients={props.ingredients} />
          <InstructionsPanel instructions={props.instructions.instructions} />
          <StartCookingPanel overview={props.overview} />
          <DetailsPanel
            overview={props.overview}
            ingredients={props.ingredients}
            status={status}
            versions={versions}
            selectedVersionId={selectedVersionId}
            onSelectVersion={onSelectVersion}
          />
          <HistoryPanel history={props.history} selectedVersionId={selectedVersionId} />
          {/* The section headings render inside their panels as the
            panel Col's first block (the canonical SectionHeading
            carries no padding of its own — the panel's inset is
            the heading's). NutritionPanel is a bare widget, so its
            section stack is composed here. */}
          <Col gap="l" p="l">
            <SectionHeading>Nutrition</SectionHeading>
            <NutritionPanel nutrition={props.nutrition} />
          </Col>
        </ScrollRegion>
      </RecipeDetailFrame>
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
