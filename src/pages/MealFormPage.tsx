import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { CheckboxSelectList } from "../components/CheckboxSelectList.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * MealFormPage (#125, B3b): the meal form's view layer — the
 * split view half of Eciperay's `MealFormView` (the B2 audit's
 * page-view disposition: the form view to the DS; the screen
 * keeps the meal query, the form state, building the meal
 * input, and the save mutation).
 *
 * The contract follows the #49 pattern, extended to a form (the
 * RecipeFormPage idiom):
 * - Controlled values, one prop + one change callback per
 *   field: the app screen owns the form state and everything
 *   the audit leaves app-side — validation, submission, the
 *   save mutation. This view validates nothing: the submit
 *   button's disabled state is the one presentation rule the
 *   app view encodes (a title and at least one selected
 *   recipe), and `onSubmit` is a bare intent.
 * - The recipe options are app data (the screen's recipes
 *   query): they cross as { id, label, servings } view-models
 *   and render through the DS CheckboxSelectList. Selection
 *   crosses as a plain id array (the DS multi-select
 *   convention); the app view's Set conversion is the host's
 *   concern, exactly as the audit recorded for the list's B2
 *   move.
 * - Each selected recipe gets a servings stepper in selection
 *   order, falling back to the recipe's own servings when the
 *   host has no override — the fallback is presentation of the
 *   host's data, computed here as in the app view.
 * - The heading is the form's title value (or "Meal" while it
 *   is empty), mirroring the app view's form-layout title.
 *
 * The shell is the DS FormScreenLayout (the centered form
 * column the app screens render today), with the heading
 * composed from Text — the app composes the same two through
 * its adapters.
 */

export interface MealFormPageRecipeOption {
  id: string;
  label: string;
  /** The recipe's own servings — the stepper's value when the
   * host has no override in `servingsByRecipeId`. */
  servings: number;
}

export interface MealFormPageProps {
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  /** The selectable recipes, in the host's order. */
  recipeOptions: MealFormPageRecipeOption[];
  /** Selected recipe ids, in selection order — the steppers
   * render in this order. */
  selectedRecipeIds: string[];
  /** Servings overrides by recipe id. */
  servingsByRecipeId: Record<string, number>;
  onToggleRecipe: (recipeId: string) => void;
  onServingsChange: (recipeId: string, servings: number) => void;
  /** Save in flight: the submit button disables. */
  isSaving?: boolean;
  /** Host-reported save failure, rendered above the submit row. */
  error?: string | null;
  onSubmit: () => void;
}

export function MealFormPage({
  title,
  onTitleChange,
  notes,
  onNotesChange,
  recipeOptions,
  selectedRecipeIds,
  servingsByRecipeId,
  onToggleRecipe,
  onServingsChange,
  isSaving = false,
  error,
  onSubmit,
}: MealFormPageProps) {
  const optionById = new Map(recipeOptions.map((option) => [option.id, option]));

  return (
    <FormScreenLayout>
      <Text variant="heading" fontSize={tokens.typography.fontSize["2xl"]} marginBottom="$6">
        {title.trim() ? title : "Meal"}
      </Text>
      <TextField
        label="Title"
        value={title}
        onChangeText={onTitleChange}
        placeholder="Meal title"
      />
      <TextAreaField
        value={notes}
        onChangeText={onNotesChange}
        placeholder="Notes (optional)"
        numberOfLines={4}
      />
      <Text
        marginBlockEnd="$2"
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.gray.gray8}
      >
        Recipes
      </Text>
      <CheckboxSelectList
        items={recipeOptions.map((recipe) => ({ id: recipe.id, label: recipe.label }))}
        selectedIds={selectedRecipeIds}
        onToggle={onToggleRecipe}
      />
      {selectedRecipeIds.map((recipeId) => {
        const recipe = optionById.get(recipeId);
        if (!recipe) {
          return null;
        }
        return (
          <NumberStepper
            key={recipeId}
            label={`Servings · ${recipe.label}`}
            value={servingsByRecipeId[recipeId] ?? recipe.servings}
            onChange={(value) => {
              onServingsChange(recipeId, value);
            }}
          />
        );
      })}
      {error ? <Text variant="error">{error}</Text> : null}
      <YStack marginBlockStart="$4">
        <Button
          variant="primary"
          accessibilityLabel="Save meal"
          disabled={!title.trim() || selectedRecipeIds.length === 0 || isSaving}
          onPress={onSubmit}
        >
          Save meal
        </Button>
      </YStack>
    </FormScreenLayout>
  );
}
