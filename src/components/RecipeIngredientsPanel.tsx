import { YStack } from "tamagui";
import { MarkableRow } from "./MarkableRow.js";
import { NumberStepper } from "./NumberStepper.js";
import { PresetValueSelector, type PresetValueOption } from "./PresetValueSelector.js";
import { SuggestionPanel } from "./SuggestionPanel.js";
import { Text } from "./Text.js";

/**
 * A recipe's ingredients panel: the servings stepper, the scale
 * selector, the pressable ingredient rows (missing ones dimmed,
 * optional ones noted), and the substitutions block. The two
 * recipe surfaces (RecipeDetailPage and PublicRecipePage) share
 * the ingredients view-model verbatim, so the interaction model
 * is the same on both; each page carried this panel inline
 * before it moved here (#119), and the view-model shape is
 * declared here structurally so either page's object composes
 * it without a second shape to drift. The panel carries no
 * outer padding or spacing — the page shell's column insets it,
 * and separation from the sections around it is the parent
 * stack's.
 *
 * The panel is a composition of the shared pieces (#119
 * dedupe): the scale control is the PresetValueSelector (the
 * Button-based preset-or-custom selector that replaced the
 * retired chip group — it owns the custom-value editing state),
 * each ingredient row is a MarkableRow (it owns the pressable
 * row pattern — button role, focusable, Enter/Space activation
 * on web — and the marked dimming), and the substitutions block
 * is the SuggestionPanel. What stays here is only the recipe
 * section's own wiring: the option set, the copy, and the
 * view-model mapping.
 */

export type RecipeIngredientsPanelIngredient = {
  id: string;
  label: string;
  isOptional?: boolean;
  /** Dimmed (opacity) rendering; pairs with the missing hint
   * and the substitutions fetch below. */
  isMissing?: boolean;
};

export type RecipeIngredientsPanelSubstitution = {
  ingredient: string;
  suggestions: string;
};

export type RecipeIngredientsPanelView = {
  servings: number;
  onServingsChange: (servings: number) => void;
  /** Scale as a string multiplier ("1" default; presets 0.5–3 or
   * a custom value the app applied). */
  scaleValue: string;
  onScaleChange: (value: string) => void;
  ingredients: RecipeIngredientsPanelIngredient[];
  /** Toggles the missing marking on rows and drives the
   * substitutions fetch below. */
  onIngredientPress?: ((ingredientId: string) => void) | undefined;
  isLoadingSubstitutions?: boolean;
  substitutions?: RecipeIngredientsPanelSubstitution[];
};

export type RecipeIngredientsPanelProps = {
  ingredients: RecipeIngredientsPanelView;
};

// Scale multipliers from the app's scaling constants (shared with
// RecipeDetailPage's ingredients section); labels are
// presentation, the servings math stays app-side.
const SCALE_OPTIONS: PresetValueOption[] = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

// The custom scale slot's resting label: beside the presets, one
// more slot that turns into a number input when pressed, as on
// RecipeDetailPage (#73). Once a custom value applies, the slot
// shows that value ("4×") selected instead of this label.
const CUSTOM_SCALE_LABEL = "Custom";

/** A scale value as the custom slot shows it: the number without
 * trailing zeros ("2.50" → "2.5"); non-numeric values pass through. */
function formatScaleValue(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

const MISSING_INGREDIENTS_HINT =
  "Tap an ingredient to mark it missing and see substitutions below.";

export function RecipeIngredientsPanel({ ingredients: view }: RecipeIngredientsPanelProps) {
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);

  return (
    <YStack>
      {/* Servings + scale controls (#73, as on RecipeDetailPage):
          one compact block, two fixed rows, and every value
          directly enterable. Servings is an inline editable
          stepper; Scale is the PresetValueSelector — a single
          non-wrapping row of equal-width preset buttons plus a
          Custom button that turns into a number input when
          pressed and afterwards shows the applied custom value
          selected. */}
      <YStack gap="$3" paddingBlockEnd="$4">
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
      </YStack>
      {view.ingredients.map((ingredient) => (
        <MarkableRow
          key={ingredient.id}
          label={ingredient.label}
          {...(ingredient.isOptional ? { trailingNote: "optional" } : {})}
          isMarked={ingredient.isMissing ?? false}
          {...(view.onIngredientPress
            ? {
                onPress: () => {
                  view.onIngredientPress?.(ingredient.id);
                },
              }
            : {})}
        />
      ))}
      {hasMissing ? (
        <YStack paddingBlockStart="$3">
          <Text variant="hint">{MISSING_INGREDIENTS_HINT}</Text>
        </YStack>
      ) : null}
      {view.isLoadingSubstitutions ? (
        <YStack paddingBlockStart="$4">
          <Text variant="hint">Finding substitutions…</Text>
        </YStack>
      ) : null}
      {view.substitutions && view.substitutions.length > 0 ? (
        <YStack paddingBlockStart="$4">
          <SuggestionPanel
            title="Substitutions"
            entries={view.substitutions.map((sub) => ({
              id: sub.ingredient,
              label: sub.ingredient,
              detail: sub.suggestions,
            }))}
          />
        </YStack>
      ) : null}
    </YStack>
  );
}
