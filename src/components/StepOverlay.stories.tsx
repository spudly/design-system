import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { StepOverlay } from "./StepOverlay.js";
import { Text } from "./Text.js";

const meta: Meta<typeof StepOverlay> = {
  title: "Components/StepOverlay",
  component: StepOverlay,
};

export default meta;
type Story = StoryObj<typeof StepOverlay>;

const STEPS = [
  "Brown the beef with the taco seasoning, breaking it apart until cooked through, about 8 minutes.",
  "Warm the tortillas in a dry skillet until pliable, about 30 seconds per side.",
  "Fill each tortilla with the beef, fold, and serve with your toppings.",
];

export const Default: Story = {
  render: () => {
    const [stepIndex, setStepIndex] = useState(1);
    const [donePresses, setDonePresses] = useState(0);
    return (
      <YStack maxWidth={430}>
        <YStack height={520} position="relative">
          <StepOverlay
            title="Beef tacos"
            stepLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
            body={STEPS[stepIndex] ?? ""}
            onDone={() => {
              setDonePresses((count) => count + 1);
            }}
          >
            <XStack gap={tokens.spacing[2]} justifyContent="center" paddingBlockEnd="$6">
              {STEPS.map((step, index) => (
                <YStack
                  key={step}
                  width={tokens.spacing[2]}
                  height={tokens.spacing[2]}
                  borderRadius={tokens.radii.full}
                  backgroundColor="$surface"
                  opacity={index === stepIndex ? 1 : 0.35}
                />
              ))}
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Button
                variant="secondary"
                disabled={stepIndex === 0}
                onPress={() => {
                  setStepIndex((index) => Math.max(0, index - 1));
                }}
              >
                Back
              </Button>
              <Button
                disabled={stepIndex === STEPS.length - 1}
                onPress={() => {
                  setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
                }}
              >
                Next step
              </Button>
            </XStack>
          </StepOverlay>
        </YStack>
        {donePresses > 0 ? (
          <Text variant="hint">
            Done activated ({donePresses}) — the host would exit the steps here.
          </Text>
        ) : null}
      </YStack>
    );
  },
};
