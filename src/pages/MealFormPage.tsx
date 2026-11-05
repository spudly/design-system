import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import { Alert } from "../components/Alert.js";
import { AutocompletePicker } from "../components/AutocompletePicker.js";
import { Button } from "../components/Button.js";
import { FieldStack } from "../components/FieldStack.js";
import { FormHeading } from "../components/FormHeading.js";
import { FormScreenLayout } from "../components/FormScreenLayout.js";
import { FormSubmit } from "../components/FormSubmit.js";
import { LabeledGroup } from "../components/LabeledGroup.js";
import { NumberStepper } from "../components/NumberStepper.js";
import { Text } from "../components/Text.js";
import { TextAreaField } from "../components/TextAreaField.js";
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
 * - The recipe picker is a search autocomplete (#383, Stephen's
 *   directive from eciperay#359): NOT a checkbox list of the
 *   whole library. The host runs the server-side search — the
 *   search text crosses out through `onSearchTextChange`, the
 *   results and the in-flight flag cross back in as
 *   `searchResults` / `isSearching`, and picking a result
 *   reports through `onSelectRecipe`. The picker is the DS
 *   AutocompletePicker, which also renders the selected
 *   recipes as a removable list (removal reports through
 *   `onRemoveRecipe`) and stays available to add more after
 *   each selection.
 * - Selected recipes cross as their own view-models
 *   (`selectedRecipes`), SEPARATELY from the search results:
 *   under a server-side search a selected recipe need not be
 *   in the current results at all, so the servings steppers
 *   below read the recipe's own servings from the selection,
 *   never from a results lookup.
 * - Each selected recipe gets a servings stepper in selection
 *   order, falling back to the recipe's own servings when the
 *   host has no override — the fallback is presentation of the
 *   host's data, computed here as in the app view.
 * - The heading is the form's title value (or "Meal" while it
 *   is empty), mirroring the app view's form-layout title.
 *
 * The shell is the DS FormScreenLayout (the centered form
 * column the app screens render today), with the heading
 * composed through FormHeading — the app composes the same
 * two through its adapters. The page applies no styling
 * itself (#119): the picker is a LabeledGroup (the label over
 * the picker, the group carrying the label as its name) and
 * the submit button sits in a FormSubmit (the submit row's
 * separation from the last field is the row's own); the page
 * composes DS components and passes data and callbacks only.
 */

export type MealFormPageRecipeOption = {
  id: string;
  label: string;
  /** The recipe's own servings — the stepper's value when the
   * host has no override in `servingsByRecipeId`. */
  servings: number;
};

export type MealFormPageIngredient = {
  id: string;
  /** The ingredient's name, as entered. */
  name: string;
  /** Free-text quantity ("2", "1/2"), as entered — the host
   * validates and parses it (#440: quantity/unit cross as
   * free-text strings matching the host's meal-ingredient
   * shape; unit and nutrition knowledge stays host-side). */
  quantity: string;
  /** Free-text unit ("cups", "tbsp"), as entered. */
  unit: string;
  /** Free-text entry servings, as entered — the servings this
   * entry's quantity covers (the eciperay #363 entry-level
   * servings correction). */
  servings: string;
};

/** A partial edit to one ingredient entry, reported through
 * `onIngredientChange` — the fields the user changed. */
export type MealFormPageIngredientPatch = Partial<Omit<MealFormPageIngredient, "id">>;

export type MealFormPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  /** The recipe search text, held by the host, which runs
   * the server-side search it drives. */
  searchText: string;
  onSearchTextChange: (value: string) => void;
  /** Results of the host's search for `searchText`, in the
   * host's order. A selected recipe need not appear here. */
  searchResults: MealFormPageRecipeOption[];
  /** The host's search is in flight: the picker shows its
   * searching state instead of the (stale) results. */
  isSearching?: boolean;
  /** The host's recipe search failed. Threaded to the
   * picker (#393): while set, the picker shows this error
   * instead of "No recipes found." — a failed search must
   * not read as no matches. Distinct from `error` (save
   * failures): pass search failures here. */
  searchError?: string | null | undefined;
  /** The selected recipes' view-models, in selection order —
   * the removable list and the steppers render in this
   * order. */
  selectedRecipes: MealFormPageRecipeOption[];
  /** Servings overrides by recipe id. */
  servingsByRecipeId: Record<string, number>;
  /** Add the search result with this id to the selection. */
  onSelectRecipe: (recipeId: string) => void;
  /** Remove the selected recipe with this id. */
  onRemoveRecipe: (recipeId: string) => void;
  onServingsChange: (recipeId: string, servings: number) => void;
  /** The meal's direct ingredients (#440), in entry order —
   * ingredients entered on the meal itself, not through a
   * selected recipe. The section renders only when the host
   * opts in by passing `onAddIngredient`; hosts that have not
   * adopted direct ingredients see the form exactly as before. */
  ingredients?: MealFormPageIngredient[];
  /** Append a new, empty direct-ingredient entry. Passing this
   * callback opts the form into the ingredients section. */
  onAddIngredient?: () => void;
  /** Remove the direct-ingredient entry with this id. */
  onRemoveIngredient?: (ingredientId: string) => void;
  /** Report an edit to one direct-ingredient entry. */
  onIngredientChange?: (ingredientId: string, patch: MealFormPageIngredientPatch) => void;
  /** Save in flight: the submit button disables. */
  isSaving?: boolean;
  /** Host-reported save failure, rendered above the submit row. */
  error?: string | null;
  onSubmit: () => void;
};

export function MealFormPage({
  title,
  onTitleChange,
  notes,
  onNotesChange,
  searchText,
  onSearchTextChange,
  searchResults,
  isSearching = false,
  searchError,
  selectedRecipes,
  servingsByRecipeId,
  onSelectRecipe,
  onRemoveRecipe,
  onServingsChange,
  ingredients = [],
  onAddIngredient,
  onRemoveIngredient,
  onIngredientChange,
  isSaving = false,
  error,
  onSubmit,
  footer,
}: MealFormPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <FormScreenLayout>
        <FormHeading>{title.trim() ? title : "Meal"}</FormHeading>
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
        <LabeledGroup label="Recipes">
          <AutocompletePicker
            searchText={searchText}
            onSearchTextChange={onSearchTextChange}
            searchResults={searchResults.map((recipe) => ({
              id: recipe.id,
              label: recipe.label,
              detail: `${recipe.servings} servings`,
            }))}
            isSearching={isSearching}
            searchError={searchError}
            onSelectResult={onSelectRecipe}
            selectedItems={selectedRecipes.map((recipe) => ({
              id: recipe.id,
              label: recipe.label,
            }))}
            onRemoveSelectedItem={onRemoveRecipe}
            placeholder="Search recipes…"
            searchAccessibilityLabel="Search recipes"
            noResultsMessage="No recipes found."
          />
        </LabeledGroup>
        {selectedRecipes.map((recipe) => (
          <NumberStepper
            key={recipe.id}
            label={`Servings · ${recipe.label}`}
            value={servingsByRecipeId[recipe.id] ?? recipe.servings}
            min={1}
            onChange={(value) => {
              onServingsChange(recipe.id, value);
            }}
          />
        ))}
        {onAddIngredient ? (
          <LabeledGroup label="Ingredients">
            <FieldStack>
              {ingredients.map((ingredient, index) => {
                const entryLabel = ingredient.name.trim() || `Ingredient ${index + 1}`;
                return (
                  <FieldStack key={ingredient.id}>
                    <Text variant="subheading">{entryLabel}</Text>
                    <TextField
                      label="Name"
                      value={ingredient.name}
                      onChangeText={(value) => {
                        onIngredientChange?.(ingredient.id, { name: value });
                      }}
                      placeholder="Ingredient name"
                    />
                    <TextField
                      label="Quantity"
                      value={ingredient.quantity}
                      onChangeText={(value) => {
                        onIngredientChange?.(ingredient.id, { quantity: value });
                      }}
                      placeholder="Quantity"
                    />
                    <TextField
                      label="Unit"
                      value={ingredient.unit}
                      onChangeText={(value) => {
                        onIngredientChange?.(ingredient.id, { unit: value });
                      }}
                      placeholder="Unit (e.g. cups)"
                    />
                    <TextField
                      label="Servings"
                      value={ingredient.servings}
                      onChangeText={(value) => {
                        onIngredientChange?.(ingredient.id, { servings: value });
                      }}
                      placeholder="Servings this entry covers"
                    />
                    {onRemoveIngredient ? (
                      <Button
                        variant="secondary"
                        accessibilityLabel={`Remove ${entryLabel}`}
                        onPress={() => {
                          onRemoveIngredient(ingredient.id);
                        }}
                      >
                        Remove ingredient
                      </Button>
                    ) : null}
                  </FieldStack>
                );
              })}
              <Button
                variant="secondary"
                accessibilityLabel="Add ingredient"
                onPress={onAddIngredient}
              >
                Add ingredient
              </Button>
            </FieldStack>
          </LabeledGroup>
        ) : null}
        {error ? <Alert severity="error" message={error} /> : null}
        <FormSubmit>
          <Button
            variant="primary"
            accessibilityLabel="Save meal"
            disabled={
              !title.trim() ||
              (selectedRecipes.length === 0 && ingredients.length === 0) ||
              isSaving
            }
            onPress={onSubmit}
          >
            Save meal
          </Button>
        </FormSubmit>
      </FormScreenLayout>
    </BigFooterShell>
  );
}
