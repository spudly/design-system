/* eslint-disable max-lines -- single cohesive page component (week view, day detail, and nutrition sections driven by one plan state); splitting it would scatter one page across files (#902 T4) */
import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Button } from "../../widgets/actions/Button.js";
import { ButtonRow } from "../../widgets/actions/ButtonRow.js";
import { DetailRow } from "../../views/eciperay/DetailRow.js";
import { ListItem } from "../../widgets/data/ListItem.js";
import { LoadingScope } from "../../contexts/LoadingScope.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { Col } from "../../widgets/layout/Col.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { SectionCard } from "../../widgets/content/SectionCard.js";
import { Text } from "../../widgets/data/Text.js";
import { TextLink } from "../../widgets/actions/TextLink.js";
import { WeekDayColumn, WeekDayColumns } from "../../widgets/data/WeekDayColumn.js";
import { Alert } from "../../widgets/feedback/Alert.js";
import { NumberStepper } from "../../widgets/form/NumberStepper.js";

/**
 * MealPlanDetailPage (#49): Eciperay's meal plan detail screen as
 * a controlled @spudly/ui page component, following the
 * RecipesPage pilot and MealPlansPage. The app keeps all state
 * and business logic — the plan query, mutations, navigation —
 * and drives this view entirely through props: a plan view-model
 * in, destinations and callbacks out. Nothing here imports an app
 * package or fetches anything.
 *
 * Placement: page components live in src/pages and are exported
 * from the package root (#298) — pages are the package's only
 * exports.
 *
 * The screen inventory this mirrors (MealPlanDetailView in
 * spudly/eciperay packages/app), in render order: the plan title,
 * its notes, its date range, a nutrition summary line, the
 * "Nutrition goals" section, the optional weekly-totals band
 * (#414, below), a Shopping list / Edit action row,
 * and the "Entries" section — a flat list of entry rows, NOT the
 * week grid the #44 demo story imagined (the real plan has no
 * day/week structure; MealPlansPage's header records the same
 * finding for the list). Every other plan action lives
 * elsewhere, so it is not in this contract: adding and removing
 * entries happens on the plan form screen, deleting a plan is
 * the list row's action, and cooking a meal is the meal detail
 * screen's. The form screen (MealPlanForm) is a form, not a page
 * view, and stays app-side — out of #49's scope. The actions
 * this screen actually has are the two buttons and the entry
 * rows, plus the goals section's set-goals link — and every one
 * of them navigates, so under #248's navigation rule every one
 * crosses as an href (see the entry contract below).
 *
 * States: the app screen renders a full-screen loading gate
 * while the plan loads, and — deliberately mirrored here, as in
 * RecipeDetailPage — it has no distinct not-found or error UI: a
 * missing plan stays on the gate. So the props are a union:
 * `{ state: "loading" }` renders the skeleton shell (#278,
 * tranche 4 — the gate's composition mirrors the ready layout:
 * title and meta bones, the goals section as a loading
 * SectionCard, the action row's Buttons as inert skeletons
 * inside the loading scope, and the Entries section holding
 * exactly 3 dummy ListItems in their loading state), and
 * `{ state: "ready", ... }` renders the detail. If the app
 * grows a not-found state, the union grows a member.
 *
 * The boundary is pre-composed strings, as in the sibling pages:
 * the app's formatters (its nutrition summary, its quantity
 * lines with their pluralization) stay app-side and their output
 * crosses as strings — each entry's `subtitle`, the plan's
 * `nutritionLabel`, each goal row's `valueLabel`. The
 * `dateRangeLabel` is composed by joining the plan's two date
 * strings with " – ", exactly as the app view renders them today
 * (raw ISO dates; the detail screen does not reformat them, and
 * neither does this view).
 *
 * The goals section's visibility is explicitly controllable
 * (#78): the original contract keyed the section on goal
 * progress or a nutrition summary, but the old app view keyed
 * it on the raw nutrition object, so a plan whose nutrition is
 * present-but-unavailable (no summary from the formatter) with
 * no goal progress rendered the set-goals hint card there and
 * nothing here. `goalsSectionVisibility` ("auto" | "shown" |
 * "hidden", default "auto") lets the app reproduce that case —
 * and suppress the section — without a render-slot hack.
 *
 * The weekly-totals band (#414) is likewise view-modeled data:
 * eciperay computes the plan's weekly nutrition totals and
 * per-day averages from servings eaten (averages over the days
 * that have entries) and passes both as pre-labelled
 * `{ label, valueLabel }` rows in `weeklyTotals` — the numbers
 * and their formatting stay app-side; the band owns only the
 * presentation. It renders as its own "Weekly totals" section
 * beside the goals section, pairing each field's weekly-total
 * row with its daily-average row (the rows pair by matching
 * `label`; an average with no matching total still renders,
 * after the paired fields). The band is optional and
 * backwards-compatible: it renders only when the prop is
 * present with at least one row, and the page renders exactly
 * as before when it is omitted, null, or empty.
 *
 * The nutrition-goals section is view-modeled, NOT slotted —
 * the cook-log audit, applied before the fact: the app's goal
 * progress view is a pure function of its data (per-field
 * actual/goal/band progress, the plan total, a set-goals link).
 * It holds no state, runs no query or mutation, and its one
 * interaction is a navigation, so it crosses the boundary as
 * data plus a destination (`nutritionGoals` + `goalsHref`). A
 * render slot exists for content that cannot be view-modeled
 * without leaking business logic into props (RecipesPage's
 * cook-log form); nothing on this screen qualifies, so — as in
 * MealPlansPage — the contract pins the absence of a slot, and a
 * future app change that puts app-rendered content inside this
 * view adds one consciously.
 *
 * Entries come in two kinds with two different destinations: a
 * meal entry opens the meal detail, a recipe entry opens the
 * recipe detail. Each entry therefore carries its own `id` (the
 * row key), the `targetId` its destination was composed from,
 * and the `href` itself — the host routes by `kind` when
 * composing it, so the view needs no per-kind press callbacks
 * (#248: the rows navigate, so they are links). A plan may
 * contain the same recipe twice, so the target cannot double as
 * the key. A recipe entry whose access was lost renders its
 * "(unavailable)" suffix and does not render as a link,
 * mirroring the app's disabled row; meal entries are never
 * unavailable. An entry-less plan renders the bare "Entries"
 * section, as the app does — there is no empty message on this
 * screen, unlike the list pages' empty states.
 *
 * One deliberate treatment difference from the app view, as in
 * MealPlansPage: entry titles take Text's theme-aware foreground
 * instead of the app's fixed gray10, which is unreadable on a
 * dark theme's card surface; page components stay theme-correct
 * even where the app screen they port is light-only today.
 *
 * No lineHeight is set anywhere in this file (the #162 rule).
 *
 * Inline editing + day view (eciperay #646, tranche 1): the
 * page gains OPTIONAL editing props. When the host passes no
 * editing handlers, rendering is exactly the read-only page
 * above. When it passes them, day sections gain "Add meal" /
 * "Add recipe" actions, meal entries gain "Add recipe" and
 * "Delete meal", recipe entries and meal members gain servings
 * steppers (the DS NumberStepper) and delete actions, and meal
 * entries render their members so their servings can be edited
 * in place. Meal-member edits change the SHARED meal (every
 * plan using it) — the host labels that through the entry's
 * `sharedMealNote`, rendered above the member list. The day
 * view (`focusedDayId` + `onFocusedDayChange`) renders one day
 * with previous/next navigation; it is also the phone
 * presentation, where the week view collapses to one day at a
 * time. All mutations stay host-side: the page reports intents
 * through the callbacks and renders the values it is given.
 *
 * De-styled for #119: the page renders no layout primitives and
 * sets no styling props. The loading state is the skeleton
 * composition described above, the entry rows are the generic
 * ListItem widget in its link form (the page supplies the kind prefix, the entry's
 * href, the unavailable suffix, and the disabled flag as
 * content), the goal rows are DetailRow views, the plan title
 * takes Text's `title` variant, the meta lines take its `hint`
 * variant, and the page's blocks stack in a Col at gap xxl, which
 * owns every section separation.
 */

/** One entry row's view-model. The app formats `subtitle` (its
 * meta line — quantity · member count or servings · nutrition);
 * the view only renders it. */
export type MealPlanDetailPageEntry = {
  /** The entry's own id (the row key). */
  id: string;
  kind: "meal" | "recipe";
  /** The meal or recipe the row opens, by kind — the host
   * composes the entry's `href` from it. Distinct from `id`: a
   * plan can hold the same recipe in two entries. */
  targetId: string;
  /** The entry's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from
   * `targetId`, routed by `kind`. The row renders as a link
   * carrying this href; an unavailable entry's row does not
   * render as a link. */
  href: string;
  title: string;
  subtitle?: string;
  /** Recipe entries whose access was lost: the title gains its
   * "(unavailable)" suffix and the row does not press. Meal
   * entries are never unavailable. */
  isUnavailable?: boolean;
  /** The entry's quantity in the plan (eciperay #646, tranche
   * 1): a number (not part of the pre-composed subtitle)
   * because the quantity stepper edits it when the host passes
   * the quantity handler. */
  quantity?: number;
  /** Recipe entries only: servings cooked for this plan entry;
   * the servings steppers render when these and the servings
   * handler are present. */
  servingsToCook?: number;
  /** Recipe entries only: servings eaten from this plan entry. */
  servingsToEat?: number;
  /** Meal entries only: the meal's recipe members, rendered
   * under the meal's row. Omit to render the meal as a single
   * row exactly as before. */
  members?: MealPlanDetailPageEntryMember[];
  /** Meal entries only: the host's label warning that editing
   * this meal's members edits the shared meal everywhere it
   * is used (eciperay #646, open question 1 — edit in place,
   * clearly labeled). Rendered above the member list when
   * member editing is active. */
  sharedMealNote?: string;
};

/** One member of a meal entry (eciperay #646, tranche 1): a
 * recipe inside the meal, rendered under the meal's row when
 * the host supplies members. Servings cross as numbers (not
 * pre-composed strings) because the editing steppers edit
 * them; the subtitle stays pre-composed like the entry's. */
export type MealPlanDetailPageEntryMember = {
  /** The member's own id (the row key, host-composed — e.g.
   * the client-side entry key pattern `recipe:<id>`). */
  id: string;
  /** The recipe the member opens, when the host routes member
   * rows; omit `href` to render the member as plain text. */
  targetId?: string;
  href?: string;
  title: string;
  subtitle?: string;
  /** Servings of the member cooked for the meal; the member
   * servings stepper renders when this and the servings
   * handler are both present. */
  servingsToCook?: number;
  /** Servings of the member eaten; edited with
   * `servingsToCook` through the same handler. */
  servingsToEat?: number;
  isUnavailable?: boolean;
};

/** One nutrition-goal progress row. The app composes
 * `valueLabel` from the field's numbers and band ("850 / 2,000 ·
 * On track") — the rounding and band wording stay app-side. */
type MealPlanDetailPageGoalRow = {
  label: string;
  valueLabel: string;
};

/** The "Nutrition goals" section's view-model: the per-field
 * progress rows for the goals the user has set. */
export type MealPlanDetailPageNutritionGoals = {
  rows: MealPlanDetailPageGoalRow[];
};

/** One row of the weekly-totals band (#414). Same
 * `{ label, valueLabel }` convention as
 * MealPlanDetailPageGoalRow: the app composes the formatted
 * value label (its rounding and units stay app-side); the band
 * only renders it, distinguishing the row kind through the
 * label it composes ("Calories · Weekly total" vs
 * "Calories · Daily average"). */
export type MealPlanDetailPageWeeklyTotalsRow = {
  label: string;
  valueLabel: string;
};

/** The weekly-totals band's view-model (#414): per nutrition
 * field, the plan's weekly-total row and its per-day-average
 * row. The band pairs the rows per field (matched by `label`,
 * weekly total first), so both lists should carry the same
 * fields in the same order; a field present in only one list
 * renders only its own row. */
export type MealPlanDetailPageWeeklyTotals = {
  totals: MealPlanDetailPageWeeklyTotalsRow[];
  averages: MealPlanDetailPageWeeklyTotalsRow[];
};

/** One day of the week view (#660): the host groups the plan's
 * entries by day and computes the day's totals from servings
 * eaten (the #363/#414 model), passing them as the same
 * pre-labelled `{ label, valueLabel }` rows as the weekly band,
 * plus the day's satiety as its own pre-composed label. The page
 * renders exactly the days supplied — it invents no days and
 * computes no nutrition. */
export type MealPlanDetailPageDay = {
  /** The day's own id (the column key). */
  id: string;
  /** The day's heading, pre-composed by the host (e.g. "Monday"). */
  label: string;
  /** The day's date line, pre-composed; omit to hide it. */
  dateLabel?: string;
  /** The day's entries, in plan order. An empty list renders the
   * column with an empty-state line — a supplied day always gets
   * its column. */
  entries: MealPlanDetailPageEntry[];
  /** The day's totals rows (calories, protein, carbs, fat, …),
   * rendered below the day's entries. */
  dailyTotals: MealPlanDetailPageWeeklyTotalsRow[];
  /** The day's satiety score, pre-composed by the host (how it
   * aggregates the day's entries is the host's decision); omit
   * to hide the satiety line. */
  satietyLabel?: string;
};

/** The week view's view-model (#660): the plan's days,
 * pre-grouped by the host. */
export type MealPlanDetailPageWeekView = {
  days: MealPlanDetailPageDay[];
};

type MealPlanDetailPageReadyProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  state: "ready";
  /** The plan's title. */
  title: string;
  /** The plan's notes; omit or pass null to hide the line. */
  notes?: string | null;
  /** The plan's date range, pre-composed ("2026-10-19 –
   * 2026-10-25"); the app passes it only when the plan has both
   * dates, as the app view renders the line only then. */
  dateRangeLabel?: string;
  /** The plan's nutrition summary, pre-composed by the app's
   * formatter; omit when the plan has no summary. The line
   * renders above the action row, and again inside the goals
   * section as its "Plan total" line — both, as in the app. */
  nutritionLabel?: string;
  /** Goal progress for the plan; null/omitted means the user
   * has no goals set, and the goals section shows its set-goals
   * hint instead of rows. The section itself renders when this
   * or `nutritionLabel` is present, mirroring the app view,
   * which renders nothing when the plan has neither. */
  nutritionGoals?: MealPlanDetailPageNutritionGoals | null;
  /** Optional weekly totals / per-day averages band (#414):
   * the app's computed totals and averages for the plan's
   * nutrition fields, as pre-labelled rows. Omit, pass null, or
   * pass empty row lists to hide the band — the page then
   * renders exactly as it did before the band existed. */
  weeklyTotals?: MealPlanDetailPageWeeklyTotals | null;
  /** Explicit control over the goals section's visibility (#78).
   * `"auto"` (the default) keeps the original rule: the section
   * renders when the plan has goal progress or a nutrition
   * summary. `"shown"` forces the section even with neither —
   * the case the auto rule cannot express: the plan's nutrition
   * data is present but `status: "unavailable"`, so the app's
   * formatter returns no summary, and the plan has no goal
   * progress; the old app view still rendered the section there
   * (keyed on the raw nutrition object), showing the set-goals
   * hint card. `"hidden"` suppresses the section even when the
   * auto rule would render it. */
  goalsSectionVisibility?: "auto" | "shown" | "hidden";
  /** Optional: the goals section's "Set nutrition goals" link
   * renders only when the href is provided (in the app it
   * navigates to the profile's goals). */
  goalsHref?: string;
  /** The primary action's destination: the plan's shopping
   * list (#248: navigation crosses as an href). */
  shoppingListHref: string;
  /** The secondary action's destination: edit the plan (the
   * form screen) (#248). */
  editHref: string;
  /** The plan's entries, in the app's order. */
  entries: MealPlanDetailPageEntry[];
  /** Optional week view (#660): when present with at least one
   * day, the Entries section renders one column per day (with
   * each day's totals below it) instead of the flat entry list.
   * Omit, pass null, or pass an empty day list to render the
   * flat list exactly as before — the host opts in when it can
   * supply grouped days. The weekly-totals band is unaffected. */
  weekView?: MealPlanDetailPageWeekView | null;
  /** Inline editing (eciperay #646, tranche 1) — every prop in
   * this group is optional; omit them all and the page renders
   * read-only exactly as before. Each handler's presence is
   * what renders its affordance. */
  /** Host-reported inline-edit failure, rendered above the
   * Entries section (e.g. a save conflict that could not be
   * rebased). */
  editingError?: string | null;
  /** Add a meal entry to a day: the host opens its picker and
   * creates the entry on that day. Renders the day's
   * "Add meal" button (week and day views). */
  onAddMealToDay?: (day: MealPlanDetailPageDay) => void;
  /** Add a standalone recipe entry to a day (both entry kinds
   * are kept — eciperay #646, open question 2). Renders the
   * day's "Add recipe" button beside "Add meal". */
  onAddRecipeToDay?: (day: MealPlanDetailPageDay) => void;
  /** Add a recipe to a meal entry: the host opens its picker
   * and adds the recipe to the shared meal. */
  onAddRecipeToMeal?: (entry: MealPlanDetailPageEntry) => void;
  /** Delete an entry from the plan: a meal entry's button
   * reads "Delete meal"; a recipe entry's reads
   * "Delete recipe". */
  onDeleteEntry?: (entry: MealPlanDetailPageEntry) => void;
  /** Report a quantity edit for one entry. */
  onEntryQuantityChange?: (entry: MealPlanDetailPageEntry, quantity: number) => void;
  /** Report a servings edit for one recipe entry (cook and
   * eat are edited independently, per #363). */
  onEntryServingsChange?: (
    entry: MealPlanDetailPageEntry,
    servings: { servingsToCook: number; servingsToEat: number },
  ) => void;
  /** Delete one member from a meal entry (edits the shared
   * meal through the host's meals API). */
  onDeleteMember?: (
    entry: MealPlanDetailPageEntry,
    member: MealPlanDetailPageEntryMember,
  ) => void;
  /** Report a servings edit for one meal member (edits the
   * shared meal through the host's meals API). */
  onMemberServingsChange?: (
    entry: MealPlanDetailPageEntry,
    member: MealPlanDetailPageEntryMember,
    servings: { servingsToCook: number; servingsToEat: number },
  ) => void;
  /** Day view (eciperay #646, tranche 1): the id of the one
   * day to render, or null/omitted for the full week/flat
   * rendering. Requires `weekView` days to resolve against. */
  focusedDayId?: string | null;
  /** Report a day-view navigation: a day id focuses that day;
   * null returns to the full rendering. Its presence renders
   * the per-day "View day" buttons and the day view's
   * previous/next navigation. */
  onFocusedDayChange?: (dayId: string | null) => void;
};

export type MealPlanDetailPageProps =
  { state: "loading"; footer?: BigFooterData } | MealPlanDetailPageReadyProps;

/**
 * Full-page meal plan detail view: plan meta, the nutrition
 * goals section, the shopping-list/edit actions, and the flat
 * entry list in a scrolling shell. Controlled — see the file
 * header for the contract and the screen inventory it mirrors.
 */
// The dummy skeleton rows for the loading Entries list (#278):
// exactly 3, from a frozen module-level constant — never
// generated per render (the CheckboxSelectList convention).
const LOADING_ENTRY_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

export function MealPlanDetailPage(props: MealPlanDetailPageProps) {
  if (props.state === "loading") {
    // Loading (#278, tranche 4): the skeleton mirrors the ready
    // layout's composition — the title at its own size, the
    // three meta lines, the goals SectionCard (its title bones
    // through its own loading state; its body lines as bones),
    // the Shopping list / Edit action row kept as inert
    // skeleton Buttons inside the scope, and the Entries
    // SectionCard holding the dummy ListItems. No real plan
    // content exists in this state to leak.
    return (
      <BigFooterShell footer={props.footer}>
        <ScreenContainer>
          <LoadingScope active>
            <Col gap="xxl">
              <TextSkeleton size="2xl" lines={1} />
              <TextSkeleton size="sm" lines={3} />
              <SectionCard title="Nutrition goals" loading>
                <TextSkeleton size="sm" lines={3} />
              </SectionCard>
              <ButtonRow>
                <Button onPress={() => { /* noop */ }}>Shopping list</Button>
                <Button variant="secondary" onPress={() => { /* noop */ }}>
                  Edit
                </Button>
              </ButtonRow>
              <SectionCard title="Entries" loading>
                <Col>
                  {LOADING_ENTRY_KEYS.map((key) => (
                    <ListItem
                      key={key}
                      title="Entry"
                      subtitle="Entry details"
                      onPress={() => { /* noop */ }}
                      loading
                    />
                  ))}
                </Col>
              </SectionCard>
            </Col>
          </LoadingScope>
        </ScreenContainer>
      </BigFooterShell>
    );
  }

  const {
    title,
    notes,
    dateRangeLabel,
    nutritionLabel,
    nutritionGoals,
    weeklyTotals,
    goalsSectionVisibility = "auto",
    goalsHref,
    shoppingListHref,
    editHref,
    entries,
    weekView,
    editingError,
    onAddMealToDay,
    onAddRecipeToDay,
    onAddRecipeToMeal,
    onDeleteEntry,
    onEntryQuantityChange,
    onEntryServingsChange,
    onDeleteMember,
    onMemberServingsChange,
    focusedDayId,
    onFocusedDayChange,
  } = props;

  // One entry row's rendering, shared verbatim by the flat list
  // and the week view's day columns (#660) so navigation and
  // accessibility behaviour are identical in both.
  const renderEntryRow = (entry: MealPlanDetailPageEntry) => (
    <ListItem
      prefix={entry.kind === "meal" ? "Meal · " : "Recipe · "}
      title={entry.title}
      {...(entry.subtitle ? { subtitle: entry.subtitle } : {})}
      {...(entry.kind === "recipe" && entry.isUnavailable
        ? { isDisabled: true, titleSuffix: " (unavailable)" }
        : {})}
      href={entry.href}
    />
  );

  // One meal member's rendering (#646, tranche 1): the member's
  // row, then its servings steppers and delete action when the
  // host passes the member handlers. Member edits go to the
  // shared meal — the entry's `sharedMealNote` labels that
  // above the member list (rendered by renderEntry below).
  const renderMember = (
    entry: MealPlanDetailPageEntry,
    member: MealPlanDetailPageEntryMember,
  ) => (
    <Col key={member.id}>
      {member.href ? (
        <ListItem
          prefix="Recipe · "
          title={member.title}
          {...(member.subtitle ? { subtitle: member.subtitle } : {})}
          {...(member.isUnavailable
            ? { isDisabled: true, titleSuffix: " (unavailable)" }
            : {})}
          href={member.href}
        />
      ) : (
        <>
          <Text>
            {"Recipe · "}
            {member.title}
            {member.isUnavailable ? " (unavailable)" : ""}
          </Text>
          {member.subtitle ? <Text variant="hint">{member.subtitle}</Text> : null}
        </>
      )}
      {onMemberServingsChange && member.servingsToCook !== undefined ? (
        <>
          <NumberStepper
            label={`Servings to cook · ${member.title}`}
            value={member.servingsToCook}
            min={0}
            onChange={(value) => {
              onMemberServingsChange(entry, member, {
                servingsToCook: value,
                servingsToEat: member.servingsToEat ?? member.servingsToCook ?? value,
              });
            }}
          />
          <NumberStepper
            label={`Servings to eat · ${member.title}`}
            value={member.servingsToEat ?? member.servingsToCook}
            min={0}
            onChange={(value) => {
              onMemberServingsChange(entry, member, {
                servingsToCook: member.servingsToCook ?? value,
                servingsToEat: value,
              });
            }}
          />
        </>
      ) : null}
      {onDeleteMember ? (
        <ButtonRow>
          <Button
            variant="secondary"
            tone="danger"
            size="sm"
            accessibilityLabel={`Remove ${member.title} from ${entry.title}`}
            onPress={() => {
              onDeleteMember(entry, member);
            }}
          >
            Delete
          </Button>
        </ButtonRow>
      ) : null}
    </Col>
  );

  // One entry's full rendering (#646, tranche 1): its row, then
  // — only when the host passes the matching handlers — its
  // quantity/servings steppers, its meal members, and its
  // add/delete actions. With no editing handlers this is
  // exactly the read-only row above.
  const renderEntry = (entry: MealPlanDetailPageEntry) => (
    <Col key={entry.id}>
      {renderEntryRow(entry)}
      {onEntryQuantityChange && entry.quantity !== undefined ? (
        <NumberStepper
          label={`Quantity · ${entry.title}`}
          value={entry.quantity}
          min={1}
          onChange={(value) => {
            onEntryQuantityChange(entry, value);
          }}
        />
      ) : null}
      {entry.kind === "recipe" &&
      onEntryServingsChange &&
      entry.servingsToCook !== undefined ? (
        <>
          <NumberStepper
            label={`Servings to cook · ${entry.title}`}
            value={entry.servingsToCook}
            min={0}
            onChange={(value) => {
              onEntryServingsChange(entry, {
                servingsToCook: value,
                servingsToEat: entry.servingsToEat ?? entry.servingsToCook ?? value,
              });
            }}
          />
          <NumberStepper
            label={`Servings to eat · ${entry.title}`}
            value={entry.servingsToEat ?? entry.servingsToCook}
            min={0}
            onChange={(value) => {
              onEntryServingsChange(entry, {
                servingsToCook: entry.servingsToCook ?? value,
                servingsToEat: value,
              });
            }}
          />
        </>
      ) : null}
      {entry.kind === "meal" && entry.members && entry.members.length > 0 ? (
        <>
          {(onMemberServingsChange || onDeleteMember) && entry.sharedMealNote ? (
            <Text variant="hint">{entry.sharedMealNote}</Text>
          ) : null}
          {entry.members.map((member) => renderMember(entry, member))}
        </>
      ) : null}
      {entry.kind === "meal" && onAddRecipeToMeal ? (
        <ButtonRow>
          <Button
            variant="secondary"
            size="sm"
            accessibilityLabel={`Add recipe to ${entry.title}`}
            onPress={() => {
              onAddRecipeToMeal(entry);
            }}
          >
            Add recipe
          </Button>
        </ButtonRow>
      ) : null}
      {onDeleteEntry ? (
        <ButtonRow>
          <Button
            variant="secondary"
            tone="danger"
            size="sm"
            accessibilityLabel={
              entry.kind === "meal" ? `Delete meal ${entry.title}` : `Delete recipe ${entry.title}`
            }
            onPress={() => {
              onDeleteEntry(entry);
            }}
          >
            {entry.kind === "meal" ? "Delete meal" : "Delete recipe"}
          </Button>
        </ButtonRow>
      ) : null}
    </Col>
  );

  // The week view (#660) renders only when the host supplies at
  // least one day; omitted/null/empty renders the flat list.
  const weekDays = weekView && weekView.days.length > 0 ? weekView.days : null;

  // One day's full rendering (#646, tranche 1), shared by the
  // week view's columns and the day view: its entries, its
  // totals strip, then — when the host passes the handlers —
  // its add actions and (outside the day view) its "View day"
  // button.
  const renderDay = (day: MealPlanDetailPageDay, inDayView: boolean) => (
    <WeekDayColumn
      key={day.id}
      label={day.label}
      {...(day.dateLabel ? { dateLabel: day.dateLabel } : {})}
    >
      {day.entries.length > 0 ? (
        <Col>{day.entries.map(renderEntry)}</Col>
      ) : (
        <Text variant="hint">No entries</Text>
      )}
      {day.dailyTotals.map((row) => (
        <DetailRow key={row.label} label={row.label} value={row.valueLabel} />
      ))}
      {day.satietyLabel ? <DetailRow label="Satiety" value={day.satietyLabel} /> : null}
      {onAddMealToDay || onAddRecipeToDay ? (
        <ButtonRow>
          {onAddMealToDay ? (
            <Button
              variant="secondary"
              size="sm"
              accessibilityLabel={`Add meal to ${day.label}`}
              onPress={() => {
                onAddMealToDay(day);
              }}
            >
              Add meal
            </Button>
          ) : null}
          {onAddRecipeToDay ? (
            <Button
              variant="secondary"
              size="sm"
              accessibilityLabel={`Add recipe to ${day.label}`}
              onPress={() => {
                onAddRecipeToDay(day);
              }}
            >
              Add recipe
            </Button>
          ) : null}
        </ButtonRow>
      ) : null}
      {!inDayView && onFocusedDayChange ? (
        <ButtonRow>
          <Button
            variant="secondary"
            size="sm"
            ghost
            accessibilityLabel={`View ${day.label} on its own`}
            onPress={() => {
              onFocusedDayChange(day.id);
            }}
          >
            View day
          </Button>
        </ButtonRow>
      ) : null}
    </WeekDayColumn>
  );

  // The day view (#646, tranche 1): one focused day with
  // previous/next navigation — also the phone presentation.
  // An unknown focused id falls back to the full rendering.
  const focusedDayIndex =
    weekDays && focusedDayId ? weekDays.findIndex((day) => day.id === focusedDayId) : -1;
  const focusedDay = focusedDayIndex >= 0 && weekDays ? weekDays[focusedDayIndex] : null;

  // The app's goals view renders nothing when the plan has
  // neither goal progress nor a nutrition summary — that is the
  // "auto" rule. The explicit visibility control (#78) overrides
  // it in both directions: "shown" covers the present-but-
  // unavailable nutrition case the auto rule cannot express,
  // "hidden" suppresses a section the data would have rendered.
  const autoShowGoals =
    (nutritionGoals !== undefined && nutritionGoals !== null) || !!nutritionLabel;
  const showGoals =
    goalsSectionVisibility === "shown" || (goalsSectionVisibility !== "hidden" && autoShowGoals);

  // The weekly-totals band (#414) renders only when the caller
  // supplies at least one row. Its rows pair per field — each
  // field's weekly total followed by its daily average, matched
  // by label; an average whose field has no total renders after
  // the paired fields. The kind wording is composed into the
  // row label here so the two row kinds stay plainly labelled.
  const weeklyTotalsBand = weeklyTotals
    ? [
        ...weeklyTotals.totals.flatMap((total) => {
          const average = weeklyTotals.averages.find((row) => row.label === total.label);
          return [
            {
              key: `total-${total.label}`,
              label: `${total.label} · Weekly total`,
              valueLabel: total.valueLabel,
            },
            ...(average
              ? [
                  {
                    key: `average-${average.label}`,
                    label: `${average.label} · Daily average`,
                    valueLabel: average.valueLabel,
                  },
                ]
              : []),
          ];
        }),
        ...weeklyTotals.averages
          .filter((average) => !weeklyTotals.totals.some((row) => row.label === average.label))
          .map((average) => ({
            key: `average-${average.label}`,
            label: `${average.label} · Daily average`,
            valueLabel: average.valueLabel,
          })),
      ]
    : [];

  return (
    <BigFooterShell footer={props.footer}>
      <ScreenContainer>
        <Col gap="xxl">
          <Text variant="title">{title}</Text>
          {notes ? <Text variant="hint">{notes}</Text> : null}
          {dateRangeLabel ? <Text variant="hint">{dateRangeLabel}</Text> : null}
          {nutritionLabel ? <Text variant="hint">{nutritionLabel}</Text> : null}
          {showGoals ? (
            <SectionCard title="Nutrition goals">
              {nutritionLabel ? <Text variant="hint">Plan total: {nutritionLabel}</Text> : null}
              {nutritionGoals ? (
                nutritionGoals.rows.map((row) => (
                  <DetailRow key={row.label} label={row.label} value={row.valueLabel} />
                ))
              ) : (
                <Text variant="hint">Set daily nutrition goals to compare this plan.</Text>
              )}
              {goalsHref ? <TextLink href={goalsHref}>Set nutrition goals</TextLink> : null}
            </SectionCard>
          ) : null}
          {weeklyTotalsBand.length > 0 ? (
            <SectionCard title="Weekly totals">
              {weeklyTotalsBand.map((row) => (
                <DetailRow key={row.key} label={row.label} value={row.valueLabel} />
              ))}
            </SectionCard>
          ) : null}
          <ButtonRow>
            <Button href={shoppingListHref}>Shopping list</Button>
            <Button variant="secondary" href={editHref}>
              Edit
            </Button>
          </ButtonRow>
          {editingError ? <Alert severity="error" message={editingError} /> : null}
          <SectionCard title="Entries">
            {focusedDay && weekDays ? (
              <>
                <ButtonRow>
                  <Button
                    variant="secondary"
                    size="sm"
                    accessibilityLabel="Previous day"
                    disabled={focusedDayIndex <= 0}
                    onPress={() => {
                      const previous = weekDays[focusedDayIndex - 1];
                      if (previous) {
                        onFocusedDayChange?.(previous.id);
                      }
                    }}
                  >
                    Previous day
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    accessibilityLabel="Next day"
                    disabled={focusedDayIndex >= weekDays.length - 1}
                    onPress={() => {
                      const next = weekDays[focusedDayIndex + 1];
                      if (next) {
                        onFocusedDayChange?.(next.id);
                      }
                    }}
                  >
                    Next day
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    ghost
                    accessibilityLabel="Show all days"
                    onPress={() => {
                      onFocusedDayChange?.(null);
                    }}
                  >
                    All days
                  </Button>
                </ButtonRow>
                <WeekDayColumns>{renderDay(focusedDay, true)}</WeekDayColumns>
              </>
            ) : weekDays ? (
              <WeekDayColumns>{weekDays.map((day) => renderDay(day, false))}</WeekDayColumns>
            ) : (
              <Col>{entries.map(renderEntry)}</Col>
            )}
          </SectionCard>
        </Col>
      </ScreenContainer>
    </BigFooterShell>
  );
}
