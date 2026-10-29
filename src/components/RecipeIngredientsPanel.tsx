import { useState } from "react";
import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { NumberStepper } from "./NumberStepper.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";
import { ToggleChipGroup, type ToggleChipOption } from "./ToggleChipGroup.js";

/**
 * A recipe's ingredients panel: the servings stepper, the scale
 * presets with the custom-scale chip that turns into a number
 * input, the pressable ingredient rows (missing ones dimmed,
 * optional ones noted), and the substitutions block. The two
 * recipe surfaces (RecipeDetailPage and PublicRecipePage) share
 * the ingredients view-model verbatim, so the interaction model
 * is the same on both; each page carried this panel inline
 * before it moved here (#119), and the view-model shape is
 * declared here structurally so either page's object composes
 * it without a second shape to drift. The custom-scale editing
 * state is ephemeral view state and lives inside the panel. The
 * panel carries no outer padding or spacing — the page shell's
 * column insets it, and separation from the sections around it
 * is the parent stack's.
 *
 * The pages rendered the ingredient rows as RN TouchableOpacity;
 * a root-graph component cannot import react-native (the package
 * root must stay importable in plain Node), so the rows render
 * as pressable stacks in the ListRow pattern — button role,
 * focusable, Enter/Space activation on web — with the same row
 * geometry and the same missing-row dimming.
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
const SCALE_OPTIONS: ToggleChipOption[] = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

// The custom scale chip's resting label: beside the presets, one
// more chip that turns into a number input when pressed, as on
// RecipeDetailPage (#73). Once a custom value applies, the chip
// shows that value ("4×") selected instead of this label.
const CUSTOM_SCALE_LABEL = "Custom";

/** A scale value as the custom chip shows it: the number without
 * trailing zeros ("2.50" → "2.5"); non-numeric values pass through. */
function formatScaleValue(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

const MISSING_INGREDIENTS_HINT =
  "Tap an ingredient to mark it missing and see substitutions below.";

export function RecipeIngredientsPanel({ ingredients: view }: RecipeIngredientsPanelProps) {
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);
  // Custom scale editing is ephemeral view state, like the
  // instructions section's active step: whether the custom chip is
  // currently a number input, and the input's uncommitted text.
  const [isCustomScaleEditing, setCustomScaleEditing] = useState(false);
  const [customScaleDraft, setCustomScaleDraft] = useState("");
  const isPresetScale = SCALE_OPTIONS.some((option) => option.value === view.scaleValue);
  const isCustomScaleSelected = !isPresetScale && !isCustomScaleEditing;

  const startCustomScaleEdit = () => {
    setCustomScaleDraft(isPresetScale ? "" : formatScaleValue(view.scaleValue));
    setCustomScaleEditing(true);
  };

  // Web keyboard support (the TextLink/MealPlansPage pattern): the
  // Custom scale chip carries the button role on web, and a div with
  // a role is not keyboard-operable on its own, so Enter and Space
  // start the edit exactly like a press. `tabIndex` and `onKeyDown`
  // are web-only props in Tamagui and are ignored on native, where
  // onPress is the activation path.
  const handleCustomScaleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startCustomScaleEdit();
    }
  };

  // Committing an entry applies it through the same onScaleChange
  // the presets use; an empty, non-numeric, or non-positive entry
  // commits nothing and the chip restores the current scale.
  const commitCustomScale = () => {
    const parsed = Number(customScaleDraft.trim());
    setCustomScaleEditing(false);
    if (Number.isFinite(parsed) && parsed > 0) {
      view.onScaleChange(String(parsed));
    }
  };

  // Web keyboard support for the ingredient rows (the ListRow
  // pattern): a row carries the button role on web, and a view
  // with a role is not keyboard-operable on its own, so Enter and
  // Space toggle the row exactly like a press. Web-only props,
  // ignored on native, where onPress is the activation path.
  const handleRowKeyDown =
    (ingredientId: string) => (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        view.onIngredientPress?.(ingredientId);
      }
    };

  return (
    <YStack>
      {/* Servings + scale controls (#73, as on RecipeDetailPage):
          one compact block, two fixed rows, and every value
          directly enterable. Servings is an inline editable
          stepper; Scale is a single non-wrapping row of
          equal-width preset chips plus a Custom chip that turns
          into a number input when pressed and afterwards shows
          the applied custom value selected. */}
      <YStack gap="$3" marginBlockEnd="$4">
        <NumberStepper
          label="Servings"
          layout="inline"
          value={view.servings}
          min={1}
          onChange={view.onServingsChange}
          editable
        />
        <XStack alignItems="center" gap="$2">
          <Text
            marginInlineEnd="$1"
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.gray.gray8}
          >
            Scale
          </Text>
          <ToggleChipGroup
            options={SCALE_OPTIONS}
            mode="single"
            wrap={false}
            value={view.scaleValue}
            onChange={(value) => {
              setCustomScaleEditing(false);
              view.onScaleChange(value);
            }}
          />
          <View flex={0.25}>
            {isCustomScaleEditing ? (
              <TextField
                accessibilityLabel="Custom scale"
                keyboardType="decimal-pad"
                inputMode="decimal"
                type="number"
                autoFocus
                value={customScaleDraft}
                onChangeText={setCustomScaleDraft}
                onBlur={commitCustomScale}
                onSubmitEditing={commitCustomScale}
              />
            ) : (
              <XStack
                minHeight={44}
                alignItems="center"
                justifyContent="center"
                borderRadius={tokens.radii.full}
                borderWidth={1}
                borderColor={isCustomScaleSelected ? "$primary" : "$textMuted"}
                backgroundColor={isCustomScaleSelected ? "$primary" : "$surface"}
                onPress={startCustomScaleEdit}
                {...platformAccessibilityProps({
                  accessibilityRole: "button",
                  // When a custom scale is selected the chip's visible
                  // text is the multiplier itself; the accessible name
                  // must carry it too, not just "Custom scale".
                  accessibilityLabel: isCustomScaleSelected
                    ? `Custom scale ${formatScaleValue(view.scaleValue)}×`
                    : "Custom scale",
                })}
                tabIndex={0}
                onKeyDown={handleCustomScaleKeyDown}
                aria-pressed={isCustomScaleSelected}
              >
                <Text
                  style={{
                    color: isCustomScaleSelected ? "$onPrimary" : "$color",
                    fontWeight: isCustomScaleSelected
                      ? tokens.typography.fontWeight.semibold
                      : tokens.typography.fontWeight.regular,
                  }}
                >
                  {isCustomScaleSelected
                    ? `${formatScaleValue(view.scaleValue)}×`
                    : CUSTOM_SCALE_LABEL}
                </Text>
              </XStack>
            )}
          </View>
        </XStack>
      </YStack>
      {view.ingredients.map((ingredient) => (
        <XStack
          key={ingredient.id}
          alignItems="center"
          borderBottomWidth={1}
          borderColor={tokens.colors.gray.gray2}
          paddingVertical="$3"
          opacity={ingredient.isMissing ? 0.4 : undefined}
          {...platformAccessibilityProps({ accessibilityRole: "button" })}
          onPress={() => {
            view.onIngredientPress?.(ingredient.id);
          }}
          tabIndex={0}
          onKeyDown={handleRowKeyDown(ingredient.id)}
          cursor="web:pointer"
          aria-pressed={ingredient.isMissing ?? false}
        >
          <Text flex={1}>{ingredient.label}</Text>
          {ingredient.isOptional ? (
            <Text
              fontSize={tokens.typography.fontSize.xs}
              color="$textMuted"
              marginInlineStart="$2"
            >
              optional
            </Text>
          ) : null}
        </XStack>
      ))}
      {hasMissing ? (
        <Text variant="hint" marginBlockStart="$3">
          {MISSING_INGREDIENTS_HINT}
        </Text>
      ) : null}
      {view.isLoadingSubstitutions ? (
        <Text variant="hint" marginBlockStart="$4">
          Finding substitutions…
        </Text>
      ) : null}
      {view.substitutions && view.substitutions.length > 0 ? (
        <YStack
          marginBlockStart="$4"
          borderRadius={tokens.radii.lg}
          backgroundColor="$primarySubtle"
          padding="$4"
        >
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.semibold}
            color="$primaryEmphasis"
            marginBlockEnd="$2"
          >
            Substitutions
          </Text>
          {view.substitutions.map((sub) => (
            <YStack key={sub.ingredient} marginBlockEnd="$2">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                fontWeight={tokens.typography.fontWeight.medium}
              >
                {sub.ingredient}
              </Text>
              <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray7}>
                {sub.suggestions}
              </Text>
            </YStack>
          ))}
        </YStack>
      ) : null}
    </YStack>
  );
}
