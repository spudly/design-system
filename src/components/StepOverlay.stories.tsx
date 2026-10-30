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

const noop = () => {};

export const Default: Story = {
  render: () => {
    const [donePresses, setDonePresses] = useState(0);
    return (
      <YStack maxWidth={430}>
        <YStack height={520} position="relative">
          <StepOverlay
            title="Beef tacos"
            stepLabel="Step 2 of 5"
            body="Warm the tortillas in a dry skillet until pliable, about 30 seconds per side."
            onDone={() => {
              setDonePresses((count) => count + 1);
            }}
          >
            <XStack gap={tokens.spacing[2]} justifyContent="center" paddingBlockEnd="$6">
              <YStack
                width={tokens.spacing[2]}
                height={tokens.spacing[2]}
                borderRadius={tokens.radii.full}
                backgroundColor="$surface"
                opacity={0.35}
              />
              <YStack
                width={tokens.spacing[2]}
                height={tokens.spacing[2]}
                borderRadius={tokens.radii.full}
                backgroundColor="$surface"
              />
              <YStack
                width={tokens.spacing[2]}
                height={tokens.spacing[2]}
                borderRadius={tokens.radii.full}
                backgroundColor="$surface"
                opacity={0.35}
              />
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Button variant="secondary" onPress={noop}>
                Back
              </Button>
              <Button onPress={noop}>Next step</Button>
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
