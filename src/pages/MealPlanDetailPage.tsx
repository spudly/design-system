import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Button } from "../widgets/Button.js";
import { ButtonRow } from "../widgets/ButtonRow.js";
import { DetailRow } from "../widgets/DetailRow.js";
import { ListRow } from "../widgets/ListRow.js";
import { LoadingScope } from "../contexts/LoadingScope.js";
import { TextSkeleton } from "../widgets/TextSkeleton.js";
import { ListStack } from "../widgets/ListStack.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";

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
 * exactly 3 dummy ListRows in their loading state), and
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
 * De-styled for #119: the page renders no layout primitives and
 * sets no styling props. The loading state is the skeleton
 * composition described above, the entry rows are the generic
 * ListRow widget in its link form (the page supplies the kind prefix, the entry's
 * href, the unavailable suffix, and the disabled flag as
 * content), the goal rows are DetailRow widgets, the plan title
 * takes Text's `title` variant, the meta lines take its `hint`
 * variant, and the page's blocks stack in a SectionStack, which
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
    // SectionCard holding the dummy ListRows. No real plan
    // content exists in this state to leak.
    return (
      <BigFooterShell footer={props.footer}>
        <ScreenContainer>
          <LoadingScope active>
            <SectionStack>
              <TextSkeleton size="2xl" lines={1} />
              <TextSkeleton size="sm" lines={3} />
              <SectionCard title="Nutrition goals" loading>
                <TextSkeleton size="sm" lines={3} />
              </SectionCard>
              <ButtonRow>
                <Button onPress={() => {}}>Shopping list</Button>
                <Button variant="secondary" onPress={() => {}}>
                  Edit
                </Button>
              </ButtonRow>
              <SectionCard title="Entries" loading>
                <ListStack>
                  {LOADING_ENTRY_KEYS.map((key) => (
                    <ListRow
                      key={key}
                      title="Entry"
                      subtitle="Entry details"
                      onPress={() => {}}
                      loading
                    />
                  ))}
                </ListStack>
              </SectionCard>
            </SectionStack>
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
  } = props;

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
        <SectionStack>
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
          <SectionCard title="Entries">
            <ListStack>
              {entries.map((entry) => (
                <ListRow
                  key={entry.id}
                  prefix={entry.kind === "meal" ? "Meal · " : "Recipe · "}
                  title={entry.title}
                  {...(entry.subtitle ? { subtitle: entry.subtitle } : {})}
                  {...(entry.kind === "recipe" && entry.isUnavailable
                    ? { isDisabled: true, titleSuffix: " (unavailable)" }
                    : {})}
                  href={entry.href}
                />
              ))}
            </ListStack>
          </SectionCard>
        </SectionStack>
      </ScreenContainer>
    </BigFooterShell>
  );
}
