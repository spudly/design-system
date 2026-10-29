import { useState } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

export type StepListStep = {
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
 */
export function StepList({ steps }: StepListProps) {
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
            })}
            aria-pressed={isActive}
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
              </YStack>
            </YStack>
          </YStack>
        );
      })}
    </>
  );
}
