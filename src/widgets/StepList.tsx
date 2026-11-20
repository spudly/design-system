import { useState } from "react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

type StepListStep = {
  /** Stable key for the step. */
  id: string;
  /** The step's eyebrow label, pre-composed by the caller (e.g. "Step 3"). */
  label: string;
  /** The step's body text. */
  body: string;
};

export type StepListProps = {
  /** The steps, in display order. */
  steps: StepListStep[];
  /**
   * How each step is headed: `eyebrow` (default — the caller's
   * pre-composed label over the body, the treatment every
   * existing consumer renders) or `numeral` (#721 — the step's
   * number as a large accent numeral beside the body, the
   * recipe-detail visual direction's instructions treatment;
   * the caller's label is not rendered in this presentation,
   * the numeral is the step's position in the list).
   */
  presentation?: "eyebrow" | "numeral";
};

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
 * Activation follows the ListRow press pattern: each card
 * carries the button role, is focusable on web, and the button
 * keys (Enter and Space) activate it like a press.
 *
 * The numeral presentation (#721) is opt-in per consumer: the
 * card's eyebrow is replaced by the step's number as a large
 * accent numeral beside the body (the recipe-detail visual
 * direction). The card, its active treatment, and activation
 * are unchanged — only the heading treatment differs.
 */
export function StepList({ steps, presentation = "eyebrow" }: StepListProps) {
  const [activeIndex, setActiveIndex] = useState(0);
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
                {presentation === "numeral" ? (
                  <XStack gap="$3" alignItems="flex-start">
                    <Text
                      fontSize={tokens.typography.fontSize["2xl"]}
                      fontWeight={tokens.typography.fontWeight.bold}
                      color="$primary"
                    >
                      {i + 1}
                    </Text>
                    <Text
                      flex={1}
                      fontSize={tokens.typography.fontSize.md}
                      {...(isActive ? { color: "$primaryEmphasis" as const } : {})}
                    >
                      {step.body}
                    </Text>
                  </XStack>
                ) : (
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
                )}
              </YStack>
            </YStack>
          </YStack>
        );
      })}
    </>
  );
}
