import { Button } from "../components/Button.js";
import { CheckboxSelectList } from "../components/CheckboxSelectList.js";
import { FormHeading } from "../components/FormHeading.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { FormSubmit } from "../components/FormSubmit.js";
import { FieldStack } from "../components/FieldStack.js";
import { LabeledGroup } from "../components/LabeledGroup.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { Text } from "../components/Text.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { TextField } from "../components/TextField.js";

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
 * - The selectable entries are meals and recipes in one list.
 *   Each option crosses as a view-model carrying its host-
 *   composed selection `key` (the app keys entries
 *   `meal:<id>` / `recipe:<id>` — the key format is the host's
 *   form-state shape, so it is composed there, not here), its
 *   `kind`, and its title; the checkbox label's kind prefix
 *   ("Meal · " / "Recipe · ") is presentation, composed here
 *   (the MealPlanDetailPage entry-row precedent). A selected
 *   meal gets a quantity stepper; a selected recipe gets
 *   quantity and servings steppers, the servings value falling
 *   back to the recipe's own servings when the host has no
 *   override.
 *
 * Submission is a bare intent (`onSubmit`); the disabled rule
 * is the app view's one presentation rule (a title and at
 * least one selected entry). The page applies no styling
 * itself (#119): the heading is a FormHeading, the entry list
 * is a LabeledGroup (the label over the select list, the
 * group carrying the label as its name), each selected
 * entry's steppers are a FieldStack, and the submit button
 * sits in a FormSubmit (the submit row's separation from the
 * last field is the row's own); the page composes DS
 * components and passes data and callbacks only.
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
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  startsOn: string;
  onStartsOnChange: (value: string) => void;
  endsOn: string;
  onEndsOnChange: (value: string) => void;
  /** The selectable meals and recipes, in the host's order. */
  entryOptions: MealPlanFormPageEntryOption[];
  /** Selected entry keys, in selection order — the steppers
   * render in this order. */
  selectedKeys: string[];
  /** Quantity overrides by entry key (default 1). */
  quantityByKey: Record<string, number>;
  /** Servings overrides by recipe id. */
  servingsByRecipeId: Record<string, number>;
  onToggleEntry: (key: string) => void;
  onQuantityChange: (key: string, quantity: number) => void;
  onRecipeServingsChange: (recipeId: string, servings: number) => void;
  /** Save in flight: the submit button disables. */
  isSaving?: boolean;
  /** Host-reported save failure, rendered above the submit row. */
  error?: string | null;
  onSubmit: () => void;
};

export function MealPlanFormPage({
  title,
  onTitleChange,
  notes,
  onNotesChange,
  startsOn,
  onStartsOnChange,
  endsOn,
  onEndsOnChange,
  entryOptions,
  selectedKeys,
  quantityByKey,
  servingsByRecipeId,
  onToggleEntry,
  onQuantityChange,
  onRecipeServingsChange,
  isSaving = false,
  error,
  onSubmit,
}: MealPlanFormPageProps) {
  const optionByKey = new Map(entryOptions.map((option) => [option.key, option]));

  return (
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
      <LabeledGroup label="Meals & recipes">
        <CheckboxSelectList
          items={entryOptions.map((entry) => ({
            id: entry.key,
            label: `${entry.kind === "meal" ? "Meal" : "Recipe"} · ${entry.title}`,
          }))}
          selectedIds={selectedKeys}
          onToggle={onToggleEntry}
        />
      </LabeledGroup>
      {selectedKeys.map((key) => {
        const option = optionByKey.get(key);
        if (!option) {
          return null;
        }
        const quantityStepper = (
          <NumberStepper
            label={`Quantity · ${option.title}`}
            value={quantityByKey[key] ?? 1}
            min={1}
            onChange={(value) => {
              onQuantityChange(key, value);
            }}
          />
        );
        if (option.kind === "meal" || !option.recipeId) {
          return <FieldStack key={key}>{quantityStepper}</FieldStack>;
        }
        const recipeId = option.recipeId;
        return (
          <FieldStack key={key}>
            {quantityStepper}
            <NumberStepper
              label={`Servings · ${option.title}`}
              value={servingsByRecipeId[recipeId] ?? option.servings ?? 1}
              min={1}
              onChange={(value) => {
                onRecipeServingsChange(recipeId, value);
              }}
            />
          </FieldStack>
        );
      })}
      {error ? <Text variant="error">{error}</Text> : null}
      <FormSubmit>
        <Button
          variant="primary"
          accessibilityLabel="Save plan"
          disabled={!title.trim() || selectedKeys.length === 0 || isSaving}
          onPress={onSubmit}
        >
          Save plan
        </Button>
      </FormSubmit>
    </FormScreenLayout>
  );
}
