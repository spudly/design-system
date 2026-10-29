import { useMemo, useState } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Text } from "./Text.js";

/**
 * A recipe's instructions panel: the step cards in step-number
 * order, the tapped card highlighted as the active step. The two
 * recipe surfaces (RecipeDetailPage and PublicRecipePage) render
 * this section identically; each page carried it inline before
 * it moved here (#119), and the step shape is declared here
 * structurally so either page's array composes it without a
 * second shape to drift. The active step is ephemeral view
 * state, held here exactly as the app's tab held it (useState,
 * first step active by default). The panel carries no outer
 * padding or spacing — the page shell's column insets it, and
 * separation from the sections around it is the parent stack's.
 *
 * The pages wrapped each card in an RN TouchableOpacity; a
 * root-graph component cannot import react-native (the package
 * root must stay importable in plain Node), so each card is
 * itself the pressable, in the ListRow pattern — button role,
 * focusable, Enter/Space activation on web.
 */

export type RecipeInstructionsPanelStep = {
  id: string;
  stepNumber: number;
  body: string;
};

export type RecipeInstructionsPanelProps = {
  instructions: RecipeInstructionsPanelStep[];
};

export function RecipeInstructionsPanel({ instructions }: RecipeInstructionsPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sorted = useMemo(
    () => [...instructions].sort((a, b) => a.stepNumber - b.stepNumber),
    [instructions],
  );
  // Web keyboard support (the ListRow pattern): a card carries
  // the button role on web, and a view with a role is not
  // keyboard-operable on its own, so Enter and Space activate it
  // exactly like a press. Web-only props, ignored on native.
  const handleCardKeyDown =
    (index: number) => (event: { key: string; preventDefault: () => void }) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveIndex(index);
      }
    };
  return (
    <YStack>
      {sorted.map((step, i) => {
        const isActive = i === activeIndex;
        return (
          <YStack
            key={step.id}
            marginBlockEnd="$3"
            borderRadius={tokens.radii.lg}
            borderWidth={1}
            padding="$4"
            borderColor={isActive ? "$primary" : tokens.colors.gray.gray2}
            backgroundColor={isActive ? "$primarySubtle" : "$surface"}
            {...platformAccessibilityProps({ accessibilityRole: "button" })}
            onPress={() => {
              setActiveIndex(i);
            }}
            tabIndex={0}
            onKeyDown={handleCardKeyDown(i)}
            cursor="web:pointer"
            aria-pressed={isActive}
          >
            <Text
              marginBlockEnd="$1"
              fontSize={tokens.typography.fontSize.xs}
              fontWeight={tokens.typography.fontWeight.semibold}
              color={isActive ? "$primary" : "$textMuted"}
            >
              Step {step.stepNumber}
            </Text>
            <Text
              fontSize={tokens.typography.fontSize.md}
              {...(isActive ? { color: "$primaryEmphasis" as const } : {})}
            >
              {step.body}
            </Text>
          </YStack>
        );
      })}
    </YStack>
  );
}
