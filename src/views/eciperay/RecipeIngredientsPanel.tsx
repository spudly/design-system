import { View, isWeb } from "tamagui";
import { Row } from "../../widgets/layout/Row.js";
import { Col } from "../../widgets/layout/Col.js";
import { Spacer } from "../../widgets/layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../../contexts/LoadingScope.js";
import { MarkableRow } from "../../widgets/data/MarkableRow.js";
import { NumberStepper } from "../../widgets/form/NumberStepper.js";
import { platformAccessibilityProps, politeLiveRegionProps } from "../../widgets/accessibility.js";
import { Button } from "../../widgets/actions/Button.js";
import {
  PresetValueSelector,
  type PresetValueOption,
} from "../../widgets/form/PresetValueSelector.js";
import { SuggestionPanel } from "../../widgets/form/SuggestionPanel.js";
import { Text } from "../../widgets/data/Text.js";
import { TextSkeleton } from "../../widgets/feedback/TextSkeleton.js";
import { useVoice } from "../../voice/index.js";

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

type RecipeIngredientsPanelIngredient = {
  id: string;
  label: string;
  isOptional?: boolean;
  /** Dimmed (opacity) rendering; pairs with the missing hint
   * and the substitutions fetch below. */
  isMissing?: boolean;
};

type RecipeIngredientsPanelSubstitution = {
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

// The custom scale slot's resting label comes from the voice
// object (#539 tranche 1e): beside the presets, one more slot
// that turns into a number input when pressed, as on
// RecipeDetailPage (#73). Once a custom value applies, the slot
// shows that value ("4×") selected instead of the voice label.

/** A scale value as the custom slot shows it: the number without
 * trailing zeros ("2.50" → "2.5"); non-numeric values pass through. */
function formatScaleValue(value: string): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

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
    <Col borderRadius={tokens.radii.lg} backgroundColor="$primarySubtle" p="l">
      <View width={110}>
        <TextSkeleton size="sm" lines={1} />
      </View>
      <Spacer y="s" />
      {Array.from({ length: count }, (_, index) => (
        <Col key={index}>
          <TextSkeleton size="sm" lines={1} />
          <TextSkeleton size="sm" lines={1} />
          <Spacer y="s" />
        </Col>
      ))}
    </Col>
  );
}

export function RecipeIngredientsPanel({
  ingredients: view,
  loading = false,
}: RecipeIngredientsPanelProps) {
  const voice = useVoice();
  const panelVoice = voice.recipeIngredientsPanel;
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
        <Col {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
          <Col gap="m">
            <Row middle between gap="m">
              <View width={70}>
                <TextSkeleton size="sm" lines={1} />
              </View>
              <Row middle gap="s">
                <Button
                  variant="secondary"
                  size="md"
                  accessibilityLabel={panelVoice.decreaseServingsLabel}
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
                  accessibilityLabel={panelVoice.increaseServingsLabel}
                  onPress={() => {
                    view.onServingsChange(view.servings + 1);
                  }}
                >
                  +
                </Button>
              </Row>
            </Row>
            <Row middle gap="s">
              <Row style={{ paddingInlineEnd: 4 }}>
                <View width={36}>
                  <TextSkeleton size="sm" lines={1} />
                </View>
              </Row>
              <Row grow shrink gap="s">
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
              </Row>
              <Row grow={0.35}>
                <Button
                  variant="secondary"
                  size="sm"
                  grow
                  onPress={() => {
                    view.onScaleChange(view.scaleValue);
                  }}
                >
                  {panelVoice.customScaleLabel}
                </Button>
              </Row>
            </Row>
          </Col>
          <Spacer y="l" />
          {rows.map((ingredient) => (
            <Row
              key={ingredient.id}
              middle
              borderBottomWidth={1}
              borderBottomColor="transparent"
              py="m"
            >
              <Col grow shrink>
                <TextSkeleton size="md" lines={1} />
              </Col>
              {ingredient.isOptional ? (
                <Col style={{ paddingInlineStart: 8 }}>
                  <View width={44}>
                    <TextSkeleton size="xs" lines={1} />
                  </View>
                </Col>
              ) : null}
            </Row>
          ))}
          {hasMissing && view.onIngredientPress ? (
            <Col>
              <Spacer y="m" />
              <View width="80%">
                <TextSkeleton size="sm" lines={1} />
              </View>
            </Col>
          ) : null}
          {view.loadingSubstitutions || (view.substitutions && view.substitutions.length > 0) ? (
            <Col>
              <Spacer y="l" />
              <SubstitutionsSkeleton entries={view.substitutions?.length ?? 1} />
            </Col>
          ) : null}
        </Col>
      </LoadingScope>
    );
  }

  return (
    <Col>
      {/* Servings + scale controls (#73, as on RecipeDetailPage):
          one compact block, two fixed rows, and every value
          directly enterable. Servings is an inline editable
          stepper; Scale is the PresetValueSelector — a single
          non-wrapping row of equal-width preset buttons plus a
          Custom button that turns into a number input when
          pressed and afterwards shows the applied custom value
          selected. */}
      <Col gap="m">
        <NumberStepper
          label={panelVoice.servingsLabel}
          layout="inline"
          value={view.servings}
          min={1}
          onChange={view.onServingsChange}
          editable
          decreaseAccessibilityLabel={panelVoice.decreaseServingsLabel}
          increaseAccessibilityLabel={panelVoice.increaseServingsLabel}
        />
        <PresetValueSelector
          label={panelVoice.scaleLabel}
          options={SCALE_OPTIONS}
          value={view.scaleValue}
          onChange={view.onScaleChange}
          customLabel={panelVoice.customScaleLabel}
          customAccessibilityLabel={panelVoice.customScaleAccessibilityLabel}
          formatCustomValue={(custom) => `${formatScaleValue(custom)}×`}
        />
      </Col>
      <Spacer y="l" />
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
        <Col>
          <Spacer y="m" />
          <Text variant="hint">{panelVoice.missingIngredientsHint}</Text>
        </Col>
      ) : null}
      {view.loadingSubstitutions ? (
        <Col position="relative">
          <Spacer y="l" />
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
          <Col
            collapsable={false}
            {...politeLiveRegionProps}
            position="absolute"
            width={1}
            height={1}
            overflow="hidden"
            {...(isWeb ? { opacity: 0 } : {})}
          >
            <Text>{panelVoice.findingSubstitutionsLabel}</Text>
          </Col>
          <Col {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
            <SubstitutionsSkeleton entries={1} />
          </Col>
        </Col>
      ) : null}
      {view.substitutions && view.substitutions.length > 0 ? (
        <Col>
          <Spacer y="l" />
          <SuggestionPanel
            title={panelVoice.substitutionsTitle}
            entries={view.substitutions.map((sub) => ({
              id: sub.ingredient,
              label: sub.ingredient,
              detail: sub.suggestions,
            }))}
          />
        </Col>
      ) : null}
    </Col>
  );
}
