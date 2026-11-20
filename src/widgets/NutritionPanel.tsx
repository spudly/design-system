import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { useVoice } from "../voice/index.js";
import { TextSkeleton } from "./TextSkeleton.js";

/**
 * One nutrient on the Nutrition Facts label (#722), keyed to the
 * FDA hierarchy. The widget maps each kind to its voice-owned
 * display name, its bold/primary vs indented sub-nutrient
 * treatment, and its block placement (macronutrient block vs the
 * vitamin/mineral block after the medium bar). Amounts and % Daily
 * Value are app-formatted strings — the app owns the nutrition
 * data and its reference values (plan option A, approved
 * 2026-11-20); the DS is a pure renderer.
 */
export type NutritionFactKind =
  | "totalFat"
  | "saturatedFat"
  | "transFat"
  | "cholesterol"
  | "sodium"
  | "totalCarbohydrate"
  | "dietaryFiber"
  | "totalSugars"
  | "addedSugars"
  | "protein"
  | "netCarbs"
  | "vitaminD"
  | "calcium"
  | "iron"
  | "potassium";

export type NutritionFact = {
  kind: NutritionFactKind;
  /** App-formatted amount with unit ("12g"). */
  amountLabel: string;
  /** App-formatted % Daily Value ("15%"). Omit for nutrients
   * with no %DV (e.g. netCarbs, transFat, totalSugars) — the
   * %DV cell renders empty rather than inventing a value. */
  dailyValueLabel?: string;
};

/**
 * The structured ready-state view-model for the Nutrition Facts
 * label (#722), replacing caller-composed free-form rows: a real
 * label needs a serving block, prominent calories, and the
 * nutrient hierarchy, none of which free rows can express.
 */
export type NutritionFacts = {
  /** App-formatted serving size ("1 cup (240g)"). */
  servingSizeLabel: string;
  /** App-formatted servings per container ("about 2"), when known. */
  servingsPerContainerLabel?: string;
  /** App-formatted calories ("520"); rendered very large/bold. */
  caloriesLabel: string;
  nutrients: NutritionFact[];
};

export type NutritionPanelData =
  | { state: "loading" }
  | {
      state: "unavailable";
      isRefreshing?: boolean;
      onEstimatePress?: () => void;
    }
  | {
      state: "ready";
      facts: NutritionFacts;
      disclaimer: string;
      isRefreshing?: boolean;
      /** Background refetch in flight: Refresh disables alongside
       * an explicit refresh, as in the app. */
      isFetching?: boolean;
      onRefreshPress?: () => void;
    };

export type NutritionPanelProps = {
  /** The nutrition view-model: a loading / unavailable / ready union. */
  nutrition: NutritionPanelData;
  /** Loading state (#278): the panel renders skeletons mirroring
   * the ready layout (header, the bordered label shape with one
   * row per nutrient, disclaimer), regardless of which union
   * state it carries. The view-model's own `loading` state
   * renders the same skeletons. An enclosing composite's
   * LoadingScope can also put the panel into this state without
   * prop-drilling. */
  loading?: boolean;
};

// The label's fixed colors (#722) — a DELIBERATE exception to the
// DS token rule, documented here so it is not later "fixed" into
// theme tokens: a printed Nutrition Facts label is black on white
// in every theme, so the label is built from the neutral scale's
// pure endpoints (literal white / black), NOT the themes' semantic
// surface/text tokens, and it renders identically in light and
// dark mode. The gray ramp's own endpoints (gray1 #fafafa, gray10
// #171717) are tinted neutrals for themed surfaces, not the
// label's pure printed values. Hairlines use the ramp's gray3
// step, the label's thin-rule gray.
const LABEL_SURFACE = "#ffffff";
const LABEL_INK = "#000000";
const LABEL_HAIRLINE = tokens.colors.gray.gray3;

// The graded rules of the FDA label: a very thick bar under the
// serving block, a medium bar above the vitamin/mineral block
// and above the footnote (and under the calories block), and
// hairlines between nutrient rows.
const THICK_BAR_HEIGHT = 12;
const MEDIUM_BAR_HEIGHT = 6;

// The FDA hierarchy, by kind: sub-nutrients render indented
// under their primary nutrient; the vitamin/mineral kinds form
// the second block, after the medium bar. netCarbs is an
// indented sub-row of the carbohydrate group with no %DV.
const SUB_NUTRIENT_KINDS: ReadonlySet<NutritionFactKind> = new Set([
  "saturatedFat",
  "transFat",
  "dietaryFiber",
  "totalSugars",
  "addedSugars",
  "netCarbs",
]);
const MICRO_NUTRIENT_KINDS: ReadonlySet<NutritionFactKind> = new Set([
  "vitaminD",
  "calcium",
  "iron",
  "potassium",
]);

// The loading panel's dummy rows (#278): exactly 3 placeholder
// rows when the ready nutrients are not known (the view-model's
// loading / unavailable states), from a frozen module-level
// constant with stable keys — never generated per render. A
// loading panel over ready data mirrors its own nutrient count.
const LOADING_ROW_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

function LabelBar({ height }: { height: number }) {
  return <View height={height} backgroundColor={LABEL_INK} />;
}

function NutritionFactRow({
  fact,
  name,
  isLast,
}: {
  fact: NutritionFact;
  name: string;
  isLast: boolean;
}) {
  const isSubNutrient = SUB_NUTRIENT_KINDS.has(fact.kind);
  const isPrimary = !isSubNutrient && !MICRO_NUTRIENT_KINDS.has(fact.kind);
  return (
    <XStack
      justifyContent="space-between"
      alignItems="baseline"
      gap="$3"
      paddingVertical="$2"
      {...(isSubNutrient ? { paddingInlineStart: "$5" as const } : {})}
      borderBottomWidth={isLast ? 0 : 1}
      borderBottomColor={LABEL_HAIRLINE}
    >
      {/* Reading order is nutrient name, amount, then %DV — the
        row composes its text in that order, so a screen reader
        walks the label the way the eye does. */}
      <XStack gap="$2" alignItems="baseline" flexShrink={1}>
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={
            isPrimary ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.regular
          }
          color={LABEL_INK}
        >
          {name}
        </Text>
        <Text fontSize={tokens.typography.fontSize.sm} color={LABEL_INK}>
          {fact.amountLabel}
        </Text>
      </XStack>
      <Text
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.bold}
        color={LABEL_INK}
      >
        {fact.dailyValueLabel ?? ""}
      </Text>
    </XStack>
  );
}

/**
 * The bordered FDA-style label itself (#722): strong black
 * border on white, "Nutrition Facts" in large heavy type, the
 * serving block, the very thick bar, very large Calories, the
 * right-aligned % Daily Value column over the nutrient rows
 * (bold primaries, indented sub-nutrients, net carbs directly
 * in the carbohydrate group with no %DV), the vitamin/mineral
 * block after a medium bar, and the standard %DV footnote
 * inside the panel after another medium bar.
 */
function NutritionFactsLabel({ facts }: { facts: NutritionFacts }) {
  const voice = useVoice();
  const labels = voice.nutritionPanel.factLabels;
  const macroNutrients = facts.nutrients.filter((fact) => !MICRO_NUTRIENT_KINDS.has(fact.kind));
  const microNutrients = facts.nutrients.filter((fact) => MICRO_NUTRIENT_KINDS.has(fact.kind));
  return (
    <YStack
      backgroundColor={LABEL_SURFACE}
      borderWidth={2}
      borderColor={LABEL_INK}
      paddingHorizontal="$3"
      paddingVertical="$3"
      gap="$2"
    >
      <Text
        accessibilityRole="header"
        aria-level={3}
        fontSize={tokens.typography.fontSize["4xl"]}
        fontWeight={tokens.typography.fontWeight.bold}
        color={LABEL_INK}
      >
        {voice.nutritionPanel.titleLabel}
      </Text>
      {facts.servingsPerContainerLabel ? (
        <Text fontSize={tokens.typography.fontSize.sm} color={LABEL_INK}>
          {facts.servingsPerContainerLabel}
        </Text>
      ) : null}
      <XStack gap="$2" alignItems="baseline">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.bold}
          color={LABEL_INK}
        >
          {voice.nutritionPanel.servingSizeLabel}
        </Text>
        <Text fontSize={tokens.typography.fontSize.sm} color={LABEL_INK}>
          {facts.servingSizeLabel}
        </Text>
      </XStack>
      <LabelBar height={THICK_BAR_HEIGHT} />
      <XStack justifyContent="space-between" alignItems="baseline" gap="$3">
        <Text
          fontSize={tokens.typography.fontSize.lg}
          fontWeight={tokens.typography.fontWeight.bold}
          color={LABEL_INK}
        >
          {voice.nutritionPanel.caloriesLabel}
        </Text>
        <Text
          fontSize={tokens.typography.fontSize["4xl"]}
          fontWeight={tokens.typography.fontWeight.bold}
          color={LABEL_INK}
        >
          {facts.caloriesLabel}
        </Text>
      </XStack>
      <LabelBar height={MEDIUM_BAR_HEIGHT} />
      <Text
        fontSize={tokens.typography.fontSize.xs}
        fontWeight={tokens.typography.fontWeight.bold}
        color={LABEL_INK}
        textAlign="right"
      >
        {voice.nutritionPanel.dailyValueHeaderLabel}
      </Text>
      <YStack>
        {macroNutrients.map((fact, index) => (
          <NutritionFactRow
            key={fact.kind}
            fact={fact}
            name={labels[fact.kind]}
            isLast={index === macroNutrients.length - 1}
          />
        ))}
      </YStack>
      {microNutrients.length > 0 ? (
        <>
          <LabelBar height={MEDIUM_BAR_HEIGHT} />
          <YStack>
            {microNutrients.map((fact, index) => (
              <NutritionFactRow
                key={fact.kind}
                fact={fact}
                name={labels[fact.kind]}
                isLast={index === microNutrients.length - 1}
              />
            ))}
          </YStack>
        </>
      ) : null}
      <LabelBar height={MEDIUM_BAR_HEIGHT} />
      <Text fontSize={tokens.typography.fontSize.xs} color={LABEL_INK}>
        {voice.nutritionPanel.dailyValueFootnote}
      </Text>
    </YStack>
  );
}

/**
 * The skeleton label (#278 over #722): the bordered panel shape
 * with bones for the title, serving and calories blocks, one
 * label/value row per nutrient (the ready data's own count, or
 * exactly 3 dummy rows when the nutrients are not known yet),
 * and the footnote; the graded bars render as inert gray blocks
 * so the overlay story can prove shape/size fidelity. No real
 * values show.
 */
function NutritionFactsSkeleton({ rowKeys }: { rowKeys: readonly string[] }) {
  return (
    <YStack
      backgroundColor={LABEL_SURFACE}
      borderWidth={2}
      borderColor={LABEL_INK}
      paddingHorizontal="$3"
      paddingVertical="$3"
      gap="$2"
    >
      <TextSkeleton size="4xl" lines={1} />
      <TextSkeleton size="sm" lines={1} />
      <View height={THICK_BAR_HEIGHT} backgroundColor={LABEL_HAIRLINE} />
      <TextSkeleton size="4xl" lines={1} />
      <View height={MEDIUM_BAR_HEIGHT} backgroundColor={LABEL_HAIRLINE} />
      {rowKeys.map((key) => (
        <XStack key={key} justifyContent="space-between" gap="$3" paddingVertical="$2">
          <YStack flex={1}>
            <TextSkeleton size="sm" lines={1} />
          </YStack>
          <View width={48}>
            <TextSkeleton size="sm" lines={1} />
          </View>
        </XStack>
      ))}
      <View height={MEDIUM_BAR_HEIGHT} backgroundColor={LABEL_HAIRLINE} />
      <TextSkeleton size="xs" lines={1} />
    </YStack>
  );
}

/**
 * The nutrition panel (#119, restyled #722): a per-serving
 * nutrition section in three states — a skeleton state mirroring
 * the ready label's shape (#278), an unavailable state with an
 * Estimate action, and the ready state: the section header row
 * (Per Serving + optional Refresh) above a fixed black-on-white
 * FDA-style Nutrition Facts label, with the app's estimate
 * disclaimer below the panel (distinct from the label's own %DV
 * footnote inside it). Extracted from RecipeDetailPage's
 * nutrition section; the panel owns its internal rhythm
 * outright, while the inset belongs to the composing section
 * stack (the panel renders flush, the same rule the canonical
 * SectionHeading follows).
 *
 * FIXED COLORS (#722): the label's black-on-white treatment is a
 * deliberate exception to the DS token rule — see LABEL_SURFACE /
 * LABEL_INK above. Do not "fix" the label into theme semantic
 * tokens: a printed label does not invert in dark mode.
 */
export function NutritionPanel({ nutrition, loading = false }: NutritionPanelProps) {
  const voice = useVoice();
  const showSkeleton = useLoadingScope(loading) || nutrition.state === "loading";
  if (showSkeleton) {
    // Loading (#278): the ready layout's skeleton — the header
    // row (its Refresh action, when the ready data carries one,
    // stays in place as an inert rectangle skeleton inside the
    // loading scope), the bordered label's skeleton, and the
    // disclaimer bone below the panel. The region is marked
    // busy. No real values show.
    const rowKeys =
      nutrition.state === "ready" && nutrition.facts.nutrients.length > 0
        ? nutrition.facts.nutrients.map((fact) => fact.kind)
        : LOADING_ROW_KEYS;
    return (
      <LoadingScope active>
        <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
          <XStack paddingBlockEnd="$3" alignItems="center" justifyContent="space-between" gap="$3">
            <YStack flex={1}>
              <TextSkeleton size="sm" lines={1} />
            </YStack>
            {nutrition.state === "ready" && nutrition.onRefreshPress ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={(nutrition.isRefreshing ?? false) || (nutrition.isFetching ?? false)}
                onPress={nutrition.onRefreshPress}
              >
                {nutrition.isRefreshing ? voice.nutritionPanel.refreshingLabel : voice.nutritionPanel.refreshLabel}
              </Button>
            ) : null}
          </XStack>
          <NutritionFactsSkeleton rowKeys={rowKeys} />
          <YStack paddingBlockStart="$4">
            <TextSkeleton size="xs" lines={1} />
          </YStack>
        </YStack>
      </LoadingScope>
    );
  }
  if (nutrition.state === "unavailable") {
    return (
      <YStack>
        <YStack paddingBlockEnd="$3">
          <Text color="$textMuted">{voice.nutritionPanel.unavailableLabel}</Text>
        </YStack>
        {nutrition.onEstimatePress ? (
          <Button
            variant="primary"
            disabled={nutrition.isRefreshing ?? false}
            onPress={nutrition.onEstimatePress}
          >
            {nutrition.isRefreshing ? voice.nutritionPanel.refreshingLabel : voice.nutritionPanel.estimateLabel}
          </Button>
        ) : null}
      </YStack>
    );
  }
  return (
    <YStack>
      <XStack paddingBlockEnd="$3" alignItems="center" justifyContent="space-between" gap="$3">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.semibold}
          letterSpacing={0.35}
          color={tokens.colors.gray.gray6}
          textTransform="uppercase"
        >
          {voice.nutritionPanel.perServingLabel}
        </Text>
        {nutrition.onRefreshPress ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={(nutrition.isRefreshing ?? false) || (nutrition.isFetching ?? false)}
            onPress={nutrition.onRefreshPress}
          >
            {nutrition.isRefreshing ? voice.nutritionPanel.refreshingLabel : voice.nutritionPanel.refreshLabel}
          </Button>
        ) : null}
      </XStack>
      <NutritionFactsLabel facts={nutrition.facts} />
      <YStack paddingBlockStart="$4">
        <Text fontSize={tokens.typography.fontSize.xs} color="$textMuted">
          {nutrition.disclaimer}
        </Text>
      </YStack>
    </YStack>
  );
}
