import { View, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { MarkableRow } from "./MarkableRow.js";
import { NumberStepper } from "../views/NumberStepper.js";
import { platformAccessibilityProps, politeLiveRegionProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { PresetValueSelector, type PresetValueOption } from "./PresetValueSelector.js";
import { SuggestionPanel } from "./SuggestionPanel.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

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
  loadingSubstitutions?: boolean;
  substitutions?: RecipeIngredientsPanelSubstitution[];
};

export type RecipeIngredientsPanelProps = {
  ingredients: RecipeIngredientsPanelView;
  /** Loading state (#278): the panel renders skeletons mirroring
   * its layout — the servings stepper and scale selector as
   * inert skeleton Buttons at their own geometry inside the
   * loading scope, one skeleton row per ingredient (exactly 3
   * dummy rows when no ingredients are known yet), and the
   * substitutions block as a skeleton panel — with no real
   * labels, values, or live controls. An enclosing composite's
   * LoadingScope can also put the panel into this state without
   * prop-drilling. */
  loading?: boolean;
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

// The loading panel's dummy rows (#278): exactly 3 placeholder
// ingredients when none are known, from a frozen module-level
// constant — never generated per render. A loading panel over
// known ingredients mirrors its own rows instead.
const LOADING_INGREDIENTS: RecipeIngredientsPanelIngredient[] = [
  { id: "loading-1", label: "" },
  { id: "loading-2", label: "" },
  { id: "loading-3", label: "" },
];

/** The substitutions block's skeleton (#278): the SuggestionPanel's
 * own frame (primary tint, large radius, $4 padding) holding a
 * title bone and one label/detail bone pair per entry — used both
 * for the panel's loading state and, with one entry, for the
 * substitutions fetch state that used to render a plain
 * "Finding substitutions…" line. */
function SubstitutionsSkeleton({ entries }: { entries: number }) {
  const count = Math.max(1, entries);
  return (
    <YStack borderRadius={tokens.radii.lg} backgroundColor="$primarySubtle" padding="$4">
      <YStack paddingBlockEnd="$2">
        <View width={110}>
          <TextSkeleton size="sm" lines={1} />
        </View>
      </YStack>
      {Array.from({ length: count }, (_, index) => (
        <YStack key={index} paddingBlockEnd="$2">
          <TextSkeleton size="sm" lines={1} />
          <TextSkeleton size="sm" lines={1} />
        </YStack>
      ))}
    </YStack>
  );
}

export function RecipeIngredientsPanel({
  ingredients: view,
  loading = false,
}: RecipeIngredientsPanelProps) {
  const showSkeleton = useLoadingScope(loading);
  const hasMissing = view.ingredients.some((ingredient) => ingredient.isMissing);

  if (showSkeleton) {
    // Loading (#278): the panel's layout as skeletons — the two
    // control rows keep their geometry with their Buttons
    // rendered inside the loading scope (the stepper's −/+ and
    // the scale presets/Custom render as inert rectangle
    // skeletons at their normal size; the stepper's value and
    // both row labels are text bones at their sizes), one
    // skeleton row per ingredient in the MarkableRow geometry
    // (its hairline transparent, its optional note a bone in its
    // slot), and the substitutions area as the skeleton panel
    // when substitutions are present or loading. No real
    // ingredient labels, no live controls, region marked busy.
    const rows = view.ingredients.length > 0 ? view.ingredients : LOADING_INGREDIENTS;
    return (
      <LoadingScope active>
        <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
          <YStack gap="$3" paddingBlockEnd="$4">
            <XStack alignItems="center" justifyContent="space-between" gap={tokens.spacing[3]}>
              <View width={70}>
                <TextSkeleton size="sm" lines={1} />
              </View>
              <XStack alignItems="center" gap={tokens.spacing[2]}>
                <Button
                  variant="secondary"
                  size="md"
                  accessibilityLabel="Decrease Servings"
                  onPress={() => {
                    view.onServingsChange(view.servings - 1);
                  }}
                >
                  −
                </Button>
                <View width={tokens.spacing[16]}>
                  <TextSkeleton size="md" lines={1} />
                </View>
                <Button
                  variant="secondary"
                  size="md"
                  accessibilityLabel="Increase Servings"
                  onPress={() => {
                    view.onServingsChange(view.servings + 1);
                  }}
                >
                  +
                </Button>
              </XStack>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <XStack paddingInlineEnd="$1">
                <View width={36}>
                  <TextSkeleton size="sm" lines={1} />
                </View>
              </XStack>
              <XStack flex={1} gap="$2">
                {SCALE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant="secondary"
                    size="sm"
                    grow
                    flexBasis={0}
                    flexShrink={1}
                    selected={view.scaleValue === option.value}
                    onPress={() => {
                      view.onScaleChange(option.value);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </XStack>
              <XStack flex={0.35}>
                <Button
                  variant="secondary"
                  size="sm"
                  grow
                  onPress={() => {
                    view.onScaleChange(view.scaleValue);
                  }}
                >
                  {CUSTOM_SCALE_LABEL}
                </Button>
              </XStack>
            </XStack>
          </YStack>
          {rows.map((ingredient) => (
            <XStack
              key={ingredient.id}
              alignItems="center"
              borderBottomWidth={1}
              borderBottomColor="transparent"
              paddingVertical="$3"
            >
              <YStack flex={1}>
                <TextSkeleton size="md" lines={1} />
              </YStack>
              {ingredient.isOptional ? (
                <YStack paddingInlineStart="$2">
                  <View width={44}>
                    <TextSkeleton size="xs" lines={1} />
                  </View>
                </YStack>
              ) : null}
            </XStack>
          ))}
          {hasMissing && view.onIngredientPress ? (
            <YStack paddingBlockStart="$3">
              <View width="80%">
                <TextSkeleton size="sm" lines={1} />
              </View>
            </YStack>
          ) : null}
          {view.loadingSubstitutions || (view.substitutions && view.substitutions.length > 0) ? (
            <YStack paddingBlockStart="$4">
              <SubstitutionsSkeleton entries={view.substitutions?.length ?? 1} />
            </YStack>
          ) : null}
        </YStack>
      </LoadingScope>
    );
  }

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
      {hasMissing && view.onIngredientPress ? (
        <YStack paddingBlockStart="$3">
          <Text variant="hint">{MISSING_INGREDIENTS_HINT}</Text>
        </YStack>
      ) : null}
      {view.loadingSubstitutions ? (
        <YStack paddingBlockStart="$4" position="relative">
          {/* Screen-reader-only progress status (the
              AutocompletePicker StatusMessage pattern): the
              skeleton bones are hidden from assistive tech, so
              without this a screen-reader user cannot tell the
              substitutions fetch started. This polite live region
              announces the fetch and sits OUTSIDE the busy region
              below — assistive tech may defer changes inside an
              aria-busy element, which would suppress the
              announcement; busy marks only the substitutions
              skeleton content. Nothing renders visibly. */}
          <YStack
            collapsable={false}
            {...politeLiveRegionProps}
            position="absolute"
            width={1}
            height={1}
            overflow="hidden"
            {...(isWeb ? { opacity: 0 } : {})}
          >
            <Text>Finding substitutions…</Text>
          </YStack>
          <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
            <SubstitutionsSkeleton entries={1} />
          </YStack>
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
