import { Anchor, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";

/**
 * MealPlanDetailPage (#49): Eciperay's meal plan detail screen as
 * a controlled @spudly/ui page component, following the
 * RecipesPage pilot and MealPlansPage. The app keeps all state
 * and business logic — the plan query, mutations, navigation —
 * and drives this view entirely through props: a plan view-model
 * in, press callbacks out. Nothing here imports an app package or
 * fetches anything.
 *
 * Placement: page components live in src/pages behind the
 * `@spudly/ui/pages` subpath export, not the package root — see
 * RecipesPage.tsx for why (react-native imports must stay out of
 * the Node-importable root entry).
 *
 * The screen inventory this mirrors (MealPlanDetailView in
 * spudly/eciperay packages/app), in render order: the plan title,
 * its notes, its date range, a nutrition summary line, the
 * "Nutrition goals" section, a Shopping list / Edit action row,
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
 * presses, plus the goals section's set-goals link.
 *
 * States: the app screen renders a full-screen loading gate
 * while the plan loads, and — deliberately mirrored here, as in
 * RecipeDetailPage — it has no distinct not-found or error UI: a
 * missing plan stays on the gate. So the props are a union:
 * `{ state: "loading" }` renders only the spinner shell (the
 * app's gate, including its delayed spinner, stays app-side),
 * and `{ state: "ready", ... }` renders the detail. If the app
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
 * The nutrition-goals section is view-modeled, NOT slotted —
 * the cook-log audit, applied before the fact: the app's goal
 * progress view is a pure function of its data (per-field
 * actual/goal/band progress, the plan total, a set-goals link).
 * It holds no state, runs no query or mutation, and its one
 * interaction is a navigation, so it crosses the boundary
 * as data plus an href (`nutritionGoals` + `goalsHref`, #248). A render slot exists for content that
 * cannot be view-modeled without leaking business logic into
 * props (RecipesPage's cook-log form); nothing on this screen
 * qualifies, so — as in MealPlansPage — the contract pins the
 * absence of a slot, and a future app change that puts
 * app-rendered content inside this view adds one consciously.
 *
 * Entries come in two kinds with two different destinations: a
 * meal row opens the meal detail, a recipe row opens the recipe
 * detail. Each entry therefore carries its own `id` (the row
 * key) plus the `targetId` the host routes on — a plan may
 * contain the same recipe twice, so the target cannot double as
 * the key — and the `href` the host composes from that target
 * (#248: the rows navigate, so they render as links). A recipe
 * entry whose access was lost renders its "(unavailable)"
 * suffix and does not render as a link, mirroring the app's
 * disabled row; meal entries are never unavailable. An entry-less plan renders the bare "Entries"
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
export type MealPlanDetailPageGoalRow = {
  label: string;
  valueLabel: string;
};

/** The "Nutrition goals" section's view-model: the per-field
 * progress rows for the goals the user has set. */
export type MealPlanDetailPageNutritionGoals = {
  rows: MealPlanDetailPageGoalRow[];
};

export type MealPlanDetailPageReadyProps = {
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

export type MealPlanDetailPageProps = { state: "loading" } | MealPlanDetailPageReadyProps;

function GoalRow({ label, valueLabel }: MealPlanDetailPageGoalRow) {
  return (
    <XStack
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$2"
    >
      <Text fontSize={tokens.typography.fontSize.sm} color="$textMuted">
        {label}
      </Text>
      <Text fontSize={tokens.typography.fontSize.sm}>{valueLabel}</Text>
    </XStack>
  );
}

function EntryRow({ entry }: { entry: MealPlanDetailPageEntry }) {
  const isUnavailable = entry.isUnavailable ?? false;
  const rowContent = (
    <>
      <Text
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.medium}
      >
        {entry.kind === "meal" ? "Meal" : "Recipe"} · {entry.title}
        {isUnavailable ? " (unavailable)" : ""}
      </Text>
      {entry.subtitle ? <Text variant="hint">{entry.subtitle}</Text> : null}
    </>
  );
  return (
    <YStack borderBottomWidth={1} borderBottomColor={tokens.colors.gray.gray2}>
      {isUnavailable ? (
        <YStack
          paddingVertical="$3"
          {...platformAccessibilityProps({ accessibilityState: { disabled: true } })}
        >
          {rowContent}
        </YStack>
      ) : (
        // The row navigates, so it renders as a real anchor
        // carrying the entry's href (#248) — keyboard-operable
        // on web by default, which retires the hand-rolled
        // focus/keydown press pattern this row used as a button.
        // The anchor is pinned to a web flex column (the BackLink
        // lesson: a text-based anchor is inline on web and would
        // not hold the row's stacked layout).
        <Anchor
          href={entry.href}
          textDecorationLine="none"
          display="web:flex"
          flexDirection="column"
          paddingVertical="$3"
        >
          {rowContent}
        </Anchor>
      )}
    </YStack>
  );
}

/**
 * Full-page meal plan detail view: plan meta, the nutrition
 * goals section, the shopping-list/edit actions, and the flat
 * entry list in a scrolling shell. Controlled — see the file
 * header for the contract and the screen inventory it mirrors.
 */
export function MealPlanDetailPage(props: MealPlanDetailPageProps) {
  if (props.state === "loading") {
    return (
      <YStack flex={1} backgroundColor="$surface" alignItems="center" justifyContent="center">
        <Spinner label="Loading meal plan" />
      </YStack>
    );
  }

  const {
    title,
    notes,
    dateRangeLabel,
    nutritionLabel,
    nutritionGoals,
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

  return (
    <ScreenContainer>
      <YStack paddingBlockEnd="$4">
        <Text
          variant="heading"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          {title}
        </Text>
      </YStack>
      {notes ? (
        <YStack paddingBlockEnd="$4">
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {notes}
          </Text>
        </YStack>
      ) : null}
      {dateRangeLabel ? (
        <YStack paddingBlockEnd="$4">
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {dateRangeLabel}
          </Text>
        </YStack>
      ) : null}
      {nutritionLabel ? (
        <YStack paddingBlockEnd="$4">
          <Text fontSize={tokens.typography.fontSize.sm} color="$textMuted">
            {nutritionLabel}
          </Text>
        </YStack>
      ) : null}
      {showGoals ? (
        <YStack paddingBottom="$8">
          <SectionCard title="Nutrition goals">
            {nutritionLabel ? (
              <YStack paddingBlockEnd="$3">
                <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
                  Plan total: {nutritionLabel}
                </Text>
              </YStack>
            ) : null}
            {nutritionGoals ? (
              nutritionGoals.rows.map((row) => (
                <GoalRow key={row.label} label={row.label} valueLabel={row.valueLabel} />
              ))
            ) : (
              <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
                Set daily nutrition goals to compare this plan.
              </Text>
            )}
            {goalsHref ? (
              <YStack paddingBlockStart="$3">
                <TextLink href={goalsHref}>Set nutrition goals</TextLink>
              </YStack>
            ) : null}
          </SectionCard>
        </YStack>
      ) : null}
      <XStack paddingBlockEnd="$6" flexWrap="wrap" gap="$3">
        <Button href={shoppingListHref}>Shopping list</Button>
        <Button variant="secondary" href={editHref}>
          Edit
        </Button>
      </XStack>
      <SectionCard title="Entries">
        {entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
