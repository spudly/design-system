import { useLoadingScope } from "../../contexts/LoadingScope.js";
import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Alert } from "../../widgets/feedback/Alert.js";
import { BoxSkeleton } from "../../widgets/feedback/BoxSkeleton.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { Center } from "../../widgets/layout/Center.js";
import { AutocompletePicker } from "../../widgets/form/AutocompletePicker.js";
import { Button } from "../../widgets/actions/Button.js";
import { FormHeading } from "../../widgets/content/FormHeading.js";
import { Col } from "../../widgets/layout/Col.js";
import { FormScreenLayout } from "../../widgets/layout/FormScreenLayout.js";
import { LabeledGroup } from "../../widgets/form/LabeledGroup.js";
import { NumberStepper } from "../../widgets/form/NumberStepper.js";
import { TextAreaField } from "../../widgets/form/TextAreaField.js";
import { TextField } from "../../widgets/form/TextField.js";

/**
 * MealPlanFormPage (#125, B3b): the meal plan form's view
 * layer — the split view half of Eciperay's `MealPlanFormView`
 * (the B2 audit's page-view disposition: the form view to the
 * DS; the screen keeps the plan/meals/recipes queries, the
 * form state in its edit-form hook, building the plan input,
 * and the save mutation).
 *
 * The contract is MealFormPage's, with the plan's two extra
 * shapes:
 * - The date range crosses as the two raw date strings the
 *   screen edits (`startsOn` / `endsOn`, "YYYY-MM-DD" values).
 *   The fields render as date fields (`type="date"`, so web
 *   gets a real date input with the same YYYY-MM-DD value
 *   contract; eciperay#334). On native, where `type` has no
 *   date-picker equivalent, the fields stay text entry with
 *   `keyboardType="numbers-and-punctuation"`: on iOS that is
 *   the digits-and-punctuation pad; on Android no RN
 *   keyboardType offers a digits-and-hyphen pad (`numeric`
 *   and `phone-pad` omit the hyphen and would break the
 *   format), so Android falls back to the default keyboard,
 *   whose available characters are set by the user's IME
 *   rather than guaranteed here. Parsing and
 *   validation stay app-side, as in the app view.
 * - The searchable entries are meals and recipes in one list.
 *   Each entry crosses as a view-model carrying its host-
 *   composed selection `key` (the app keys entries
 *   `meal:<id>` / `recipe:<id>` — the key format is the host's
 *   form-state shape, so it is composed there, not here), its
 *   `kind`, and its title; the picker label's kind prefix
 *   ("Meal · " / "Recipe · ") is presentation, composed here
 *   (the MealPlanDetailPage entry-row precedent).
 * - The entry picker is a search autocomplete (#383, the
 *   MealFormPage contract): NOT a checkbox list of every meal
 *   and recipe. The host runs the server-side search — the
 *   search text crosses out through `onSearchTextChange`, the
 *   results and the in-flight flag cross back in as
 *   `searchResults` / `isSearching`, and picking a result
 *   reports its key through `onSelectEntry`. The selected
 *   entries cross as their own view-models
 *   (`selectedEntries`), SEPARATELY from the search results,
 *   and render as the picker's removable list (removal
 *   reports through `onRemoveEntry`). A selected meal gets a
 *   quantity stepper; a selected recipe gets quantity and
 *   servings steppers, the servings value falling back to
 *   the recipe's own servings when the host has no override.
 * - Each selected entry can also carry a day (#673): the
 *   day crosses as the raw date string the screen edits
 *   (`dayByKey`, "YYYY-MM-DD" values, or "" for no day),
 *   keyed by the entry's selection key. The per-entry day
 *   field renders only when the host supplies
 *   `onDayChange` — hosts that omit the day props render
 *   exactly as before. The field gets the same treatment
 *   as `startsOn` / `endsOn` above (`type="date"`, so web
 *   gets a real date input with the same YYYY-MM-DD value
 *   contract; on native it stays text entry with
 *   `keyboardType="numbers-and-punctuation"`). No defaulting
 *   a missing day to `startsOn`, no validation, and no
 *   clamping to the plan range is baked in here — the host
 *   owns the value and its semantics.
 *
 * Details-only mode (eciperay #646, tranche 1): the entries
 * section is OPTIONAL. A host that omits the entry props
 * (`onSelectEntry` is the marker) gets a details-only form —
 * title, notes, and dates — whose submit rule is the title
 * alone; entries are then added and edited on the plan's view
 * page (MealPlanDetailPage's inline editing). The create flow
 * uses this mode: it creates an empty plan and lands on the
 * view page to fill it. Hosts that still pass the entry props
 * render the picker and steppers exactly as before.
 *
 * Submission is a bare intent (`onSubmit`); the disabled rule
 * is the app view's one presentation rule (a title and at
 * least one selected entry). The page applies no styling
 * itself (#119): the heading is a FormHeading, the entry
 * picker is a LabeledGroup (the label over the picker, the
 * group carrying the label as its name), each selected
 * entry's steppers are a Col at gap m, and the submit button
 * is the column's last direct child (its separation from the
 * last field is the layout's own gap); the page composes DS
 * components and passes data and callbacks only.
 *
 * Loading (#874, following the #278 pattern): while
 * `loading`, the page renders bones in the form's at-rest
 * shape — the heading line, each field's label-and-input
 * stack (the notes area as one tall box), the entry picker's
 * box when the entries section would render, and the submit
 * button's box — and no controls render, so a host can mount
 * the form before the plan it edits resolves instead of
 * gating the screen on a spinner.
 */

export type MealPlanFormPageEntryOption = {
  /** The host-composed selection key (`meal:<id>` /
   * `recipe:<id>` in the app's form state). */
  key: string;
  kind: "meal" | "recipe";
  title: string;
  /** Recipes only: the id the servings callback reports. */
  recipeId?: string;
  /** Recipes only: the recipe's own servings — the stepper's
   * value when the host has no override. */
  servings?: number;
};

export type MealPlanFormPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  startsOn: string;
  onStartsOnChange: (value: string) => void;
  endsOn: string;
  onEndsOnChange: (value: string) => void;
  /** The entry search text, held by the host, which runs
   * the server-side search it drives. Optional (details-only
   * mode, #646 tranche 1): omit with the other entry props. */
  searchText?: string;
  onSearchTextChange?: (value: string) => void;
  /** Results of the host's search for `searchText`, in the
   * host's order. A selected entry need not appear here. */
  searchResults?: MealPlanFormPageEntryOption[];
  /** The host's search is in flight: the picker shows its
   * searching state instead of the (stale) results. */
  isSearching?: boolean;
  /** The host's entry search failed. Threaded to the
   * picker (#393): while set, the picker shows this error
   * instead of "No meals or recipes found." — a failed
   * search must not read as no matches. Distinct from
   * `error` (save failures): pass search failures here. */
  searchError?: string | null | undefined;
  /** The selected entries' view-models, in selection order —
   * the removable list and the steppers render in this
   * order. */
  selectedEntries?: MealPlanFormPageEntryOption[];
  /** Quantity overrides by entry key (default 1). */
  quantityByKey?: Record<string, number>;
  /** Servings overrides by recipe id. */
  servingsByRecipeId?: Record<string, number>;
  /** Servings-to-eat overrides by recipe id (#659). Optional:
   * hosts that have not adopted the eat control omit it and
   * the eat stepper falls back only to the recipe's own
   * servings — the host's blank/divergent follow-cook logic
   * is NOT baked in here. */
  servingsToEatByRecipeId?: Record<string, number>;
  /** Add the search result with this key to the selection.
   * Its presence is the marker that renders the entries
   * section; omit it (with the other entry props) for the
   * details-only form (#646, tranche 1). */
  onSelectEntry?: (key: string) => void;
  /** Remove the selected entry with this key. */
  onRemoveEntry?: (key: string) => void;
  onQuantityChange?: (key: string, quantity: number) => void;
  onRecipeServingsChange?: (recipeId: string, servings: number) => void;
  /** Report a servings-to-eat edit for one plan recipe entry,
   * independently of `onRecipeServingsChange` (#659). */
  onRecipeServingsToEatChange?: (recipeId: string, servings: number) => void;
  /** Day overrides by entry key (#673): "YYYY-MM-DD" values,
   * or "" for no day. Optional: hosts that have not adopted
   * the day control omit it (and `onDayChange`) and no day
   * fields render. */
  dayByKey?: Record<string, string>;
  /** Report a day edit for one selected entry (#673). Its
   * presence is what makes the per-entry day fields render. */
  onDayChange?: (key: string, day: string) => void;
  /** Save in flight: the submit button disables. */
  isSaving?: boolean;
  /** Loading state (#874): renders the skeleton shape
   * described in the file header; no controls render in this
   * state. */
  loading?: boolean;
  /** Host-reported save failure, rendered above the submit row. */
  error?: string | null;
  onSubmit: () => void;
};

/** The picker's label for an entry: the kind prefix is
 * presentation, composed here (the entry-row precedent). */
function entryLabel(entry: MealPlanFormPageEntryOption): string {
  return `${entry.kind === "meal" ? "Meal" : "Recipe"} · ${entry.title}`;
}

/** One labeled field's skeleton (#874): the label bone sits
 * centered in the field Label's own line box
 * (SIZABLE_TEXT_LINE_BOX, 27) over the input's box (44, a
 * TextField input's minimum height) — the NutritionGoalsForm
 * field-skeleton measurement, so the bones hold the loaded
 * field's height instead of sliding off it. */
function FieldSkeleton() {
  return (
    <Col gap="xs">
      <Center width="35%" height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
        <TextSkeleton size="sm" lines={1} />
      </Center>
      <BoxSkeleton height={44} />
    </Col>
  );
}

export function MealPlanFormPage({
  title,
  onTitleChange,
  notes,
  onNotesChange,
  startsOn,
  onStartsOnChange,
  endsOn,
  onEndsOnChange,
  searchText = "",
  onSearchTextChange,
  searchResults = [],
  isSearching = false,
  searchError,
  selectedEntries = [],
  quantityByKey = {},
  servingsByRecipeId = {},
  servingsToEatByRecipeId,
  onSelectEntry,
  onRemoveEntry,
  onQuantityChange,
  onRecipeServingsChange,
  onRecipeServingsToEatChange,
  dayByKey,
  onDayChange,
  isSaving = false,
  loading = false,
  error,
  onSubmit,
  footer,
}: MealPlanFormPageProps) {
  const showSkeleton = useLoadingScope(loading);
  // Details-only mode (#646, tranche 1): no entry handler, no
  // entries section — and the submit rule drops its
  // at-least-one-entry clause.
  const showEntries = onSelectEntry !== undefined;
  if (showSkeleton) {
    return (
      <BigFooterShell footer={footer}>
        <FormScreenLayout>
          {/* The form's at-rest shape as bones (#874): the
              heading line, the title / starts-on / ends-on
              fields' label-and-input stacks, the notes area as
              one tall box (its 4-line TextArea), the entry
              picker's box when the entries section would
              render, and the submit button's box last. */}
          <TextSkeleton size="lg" lines={1} />
          <FieldSkeleton />
          <BoxSkeleton height={112} />
          <FieldSkeleton />
          <FieldSkeleton />
          {showEntries ? <BoxSkeleton height={44} /> : null}
          <BoxSkeleton height={48} />
        </FormScreenLayout>
      </BigFooterShell>
    );
  }
  return (
    <BigFooterShell footer={footer}>
      <FormScreenLayout>
        <FormHeading>{title.trim() ? title : "Meal plan"}</FormHeading>
        <TextField
          label="Title"
          value={title}
          onChangeText={onTitleChange}
          placeholder="Plan title"
        />
        <TextAreaField
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Notes (optional)"
          numberOfLines={4}
        />
        <TextField
          label="Starts on"
          type="date"
          keyboardType="numbers-and-punctuation"
          value={startsOn}
          onChangeText={onStartsOnChange}
          placeholder="YYYY-MM-DD"
        />
        <TextField
          label="Ends on"
          type="date"
          keyboardType="numbers-and-punctuation"
          value={endsOn}
          onChangeText={onEndsOnChange}
          placeholder="YYYY-MM-DD"
        />
        {showEntries ? (
          <>
        <LabeledGroup label="Meals & recipes">
          <AutocompletePicker
            searchText={searchText}
            onSearchTextChange={(value) => {
              onSearchTextChange?.(value);
            }}
            searchResults={searchResults.map((entry) => ({
              id: entry.key,
              label: entryLabel(entry),
              ...(entry.servings !== undefined ? { detail: `${entry.servings} servings` } : {}),
            }))}
            isSearching={isSearching}
            searchError={searchError}
            onSelectResult={(key) => {
              onSelectEntry?.(key);
            }}
            selectedItems={selectedEntries.map((entry) => ({
              id: entry.key,
              label: entryLabel(entry),
            }))}
            onRemoveSelectedItem={(key) => {
              onRemoveEntry?.(key);
            }}
            placeholder="Search meals & recipes…"
            searchAccessibilityLabel="Search meals and recipes"
            noResultsMessage="No meals or recipes found."
          />
        </LabeledGroup>
        {selectedEntries.map((option) => {
          const key = option.key;
          const quantityStepper = (
            <NumberStepper
              label={`Quantity · ${option.title}`}
              value={quantityByKey[key] ?? 1}
              min={1}
              onChange={(value) => {
                onQuantityChange?.(key, value);
              }}
            />
          );
          const dayField = onDayChange ? (
            <TextField
              label={`Day · ${option.title}`}
              type="date"
              keyboardType="numbers-and-punctuation"
              value={dayByKey?.[key] ?? ""}
              onChangeText={(value) => {
                onDayChange(key, value);
              }}
              placeholder="YYYY-MM-DD"
            />
          ) : null;
          if (option.kind === "meal" || !option.recipeId) {
            return (
              <Col gap="m" key={key}>
                {quantityStepper}
                {dayField}
              </Col>
            );
          }
          const recipeId = option.recipeId;
          return (
            <Col gap="m" key={key}>
              {quantityStepper}
              <NumberStepper
                label={`Servings to cook · ${option.title}`}
                value={servingsByRecipeId[recipeId] ?? option.servings ?? 1}
                min={1}
                onChange={(value) => {
                  onRecipeServingsChange?.(recipeId, value);
                }}
              />
              <NumberStepper
                label={`Servings to eat · ${option.title}`}
                value={servingsToEatByRecipeId?.[recipeId] ?? option.servings ?? 1}
                min={1}
                onChange={(value) => {
                  onRecipeServingsToEatChange?.(recipeId, value);
                }}
              />
              {dayField}
            </Col>
          );
        })}
          </>
        ) : null}
        {error ? <Alert severity="error" message={error} /> : null}
        <Button
          variant="primary"
          accessibilityLabel="Save plan"
          disabled={!title.trim() || (showEntries && selectedEntries.length === 0) || isSaving}
          onPress={onSubmit}
        >
          Save plan
        </Button>
      </FormScreenLayout>
    </BigFooterShell>
  );
}
