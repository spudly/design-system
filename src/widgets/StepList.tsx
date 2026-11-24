import { useState } from "react";
import { View, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

type StepListStep = {
  /** Stable key for the step. */
  id: string;
  /** The step's eyebrow label, pre-composed by the caller (e.g. "Step 3"). */
  label: string;
  /** The step's body text. */
  body: string;
  /**
   * The step's own number, when the caller's numbering is not
   * simply its position in the list (e.g. non-contiguous recipe
   * step numbers). The numeral presentation renders this when
   * supplied, falling back to the step's 1-based position.
   */
  number?: number;
};

export type StepListProps = {
  /** The steps, in display order. */
  steps: StepListStep[];
  /**
   * How each step renders: `eyebrow` (default — a card with the
   * caller's pre-composed label over the body, the treatment
   * every existing consumer renders) or `numeral` (#721 — a flat
   * text row: the step's number as an orange numeral and period
   * beside the body, no card; the caller's label is not rendered
   * in this presentation, the numeral is the step's own number
   * when the caller supplies one, else its position in the list).
   */
  presentation?: "eyebrow" | "numeral";
  /** Loading state (#278, moved here from RecipeInstructionsPanel
   * in #747): the list renders one skeleton step card per step
   * (exactly 3 dummy cards when no steps are known yet), each
   * mirroring a step card's geometry — eyebrow bone over a
   * two-line body bone, the card border transparent so no
   * hairline shows in the skeleton state — with no real step
   * text and no pressable cards. An enclosing composite's
   * LoadingScope can also put the list into this state without
   * prop-drilling. */
  loading?: boolean;
};

// The loading list's dummy cards (#278): exactly 3 placeholder
// cards when no steps are known, from a frozen module-level
// constant with stable keys — never generated per render. A
// loading list over known steps mirrors its own step count.
const LOADING_STEP_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

/**
 * A procedure's step cards (#119): one card per step — an
 * eyebrow label over the step's body — with exactly one step
 * active (highlighted in the primary treatment); pressing a
 * card makes it the active step. The active step is ephemeral
 * view state the list owns, first step active by default, as
 * the cooking instructions it was extracted from held it
 * (RecipeDetailPage's instructions; PublicRecipePage's
 * identical steps adopt it with that page's tranche). Content
 * is caller-supplied pre-composed strings, so the list serves
 * any app's procedures — recipes, setup wizards, onboarding.
 *
 * Activation follows the ListItem press pattern: each card
 * carries the button role, is focusable on web, and the button
 * keys (Enter and Space) activate it like a press.
 *
 * The numeral presentation (#721) is opt-in per consumer: the
 * step renders as a FLAT text row — an orange numeral and period
 * beside the body, no card, no border, no filled highlight (the
 * recipe-detail visual direction, fidelity round) — instead of
 * the eyebrow card. Activation (press to make a step active) is
 * unchanged; the active state carries no filled treatment in
 * this presentation.
 */
export function StepList({ steps, presentation = "eyebrow", loading = false }: StepListProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): skeleton step cards in the cards' own
    // geometry (large radius, $4 padding, eyebrow over body),
    // one per step — no step text, no activation, the card
    // borders transparent, and the region marked busy.
    const keys = steps.length > 0 ? steps.map((step) => step.id) : LOADING_STEP_KEYS;
    return (
      <YStack {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
        {keys.map((key) => (
          <YStack key={key} paddingBlockEnd="$3">
            <YStack
              borderRadius={tokens.radii.lg}
              borderWidth={1}
              padding="$4"
              borderColor="transparent"
              backgroundColor="$surface"
            >
              <YStack paddingBlockEnd="$1">
                <View width={56}>
                  <TextSkeleton size="xs" lines={1} />
                </View>
              </YStack>
              <TextSkeleton size="md" lines={2} />
            </YStack>
          </YStack>
        ))}
      </YStack>
    );
  }
  return (
    <>
      {steps.map((step, i) => {
        const isActive = i === activeIndex;
        const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActiveIndex(i);
          }
        };
        if (presentation === "numeral") {
          return (
            <YStack
              key={step.id}
              {...platformAccessibilityProps({
                accessibilityRole: "button",
                accessibilityState: { selected: isActive },
              })}
              onPress={() => {
                setActiveIndex(i);
              }}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              cursor="web:pointer"
              paddingBlockEnd="$3"
            >
              <XStack gap="$3" alignItems="flex-start">
                <Text
                  fontSize={tokens.typography.fontSize["2xl"]}
                  fontWeight={tokens.typography.fontWeight.bold}
                  color="$primary"
                >
                  {step.number ?? i + 1}.
                </Text>
                <Text flex={1} fontSize={tokens.typography.fontSize.md}>
                  {step.body}
                </Text>
              </XStack>
            </YStack>
          );
        }
        return (
          <YStack
            key={step.id}
            {...platformAccessibilityProps({
              accessibilityRole: "button",
              accessibilityState: { selected: isActive },
            })}
            onPress={() => {
              setActiveIndex(i);
            }}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            cursor="web:pointer"
          >
            <YStack paddingBlockEnd="$3">
              <YStack
                borderRadius={tokens.radii.lg}
                borderWidth={1}
                padding="$4"
                borderColor={isActive ? "$primary" : tokens.colors.gray.gray2}
                backgroundColor={isActive ? "$primarySubtle" : "$surface"}
              >
                {
                  <>
                    <YStack paddingBlockEnd="$1">
                      <Text
                        fontSize={tokens.typography.fontSize.xs}
                        fontWeight={tokens.typography.fontWeight.semibold}
                        color={isActive ? "$primary" : "$textMuted"}
                      >
                        {step.label}
                      </Text>
                    </YStack>
                    <Text
                      fontSize={tokens.typography.fontSize.md}
                      {...(isActive ? { color: "$primaryEmphasis" as const } : {})}
                    >
                      {step.body}
                    </Text>
                  </>
                }
              </YStack>
            </YStack>
          </YStack>
        );
      })}
    </>
  );
}
