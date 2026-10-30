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

const LONG_STEPS = [
  "Season the chicken on both sides with salt, pepper, and the Italian seasoning, pressing the seasoning into the surface so it adheres during searing.",
  "Sear the chicken in a hot pan with a little olive oil until deeply golden, about 5 minutes per side, working in batches if the pan is crowded so the pieces brown instead of steam. Set the chicken aside on a warm plate, then add the garlic and sun-dried tomatoes to the same pan and cook until fragrant, about 1 minute. Pour in the cream and scrape up every browned bit from the bottom of the pan — that is where the flavor lives — then let the sauce come to a gentle simmer and reduce until it coats the back of a spoon, 4 to 5 minutes. Stir in the spinach a handful at a time, letting each handful wilt before adding the next, and season the sauce to taste. Return the chicken and any accumulated juices to the pan, spoon the sauce over the tops, cover, and simmer on low until the chicken is cooked through and the sauce has thickened around it, another 5 to 7 minutes. Rest for a few minutes off the heat before serving so the sauce settles and the chicken stays juicy.",
  "Spoon the chicken and sauce over pasta or rice and serve.",
];

function Demo({
  steps,
  initialStep,
  frameHeight,
}: {
  steps: string[];
  initialStep: number;
  frameHeight: number;
}) {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [donePresses, setDonePresses] = useState(0);
  // Done closes the overlay for real, as a host would: the
  // focus-restore half of the shell's contract (focus returns
  // to the control that opened it) is only exercisable when
  // the overlay actually unmounts, so the demo unmounts it
  // and offers a reopen control below the frame.
  const [open, setOpen] = useState(true);
  return (
    <YStack maxWidth={430}>
      <YStack height={frameHeight} position="relative">
        {open ? (
          <StepOverlay
            title="Beef tacos"
            stepLabel={`Step ${stepIndex + 1} of ${steps.length}`}
            body={steps[stepIndex] ?? ""}
            onDone={() => {
              setDonePresses((count) => count + 1);
              setOpen(false);
            }}
          >
            <XStack gap={tokens.spacing[2]} justifyContent="center" paddingBlockEnd="$6">
              {steps.map((step, index) => (
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
                disabled={stepIndex === steps.length - 1}
                onPress={() => {
                  setStepIndex((index) => Math.min(steps.length - 1, index + 1));
                }}
              >
                Next step
              </Button>
            </XStack>
          </StepOverlay>
        ) : null}
      </YStack>
      {open ? null : (
        <YStack paddingBlockStart="$3">
          <Button
            onPress={() => {
              setOpen(true);
            }}
          >
            Reopen the overlay
          </Button>
        </YStack>
      )}
      {donePresses > 0 ? (
        <Text variant="hint">
          Done activated ({donePresses}) — the host would exit the steps here.
        </Text>
      ) : null}
    </YStack>
  );
}

export const Default: Story = {
  render: () => <Demo steps={STEPS} initialStep={1} frameHeight={520} />,
};

/**
 * The tall-body case (#332): a long step body in a short frame.
 * The body and the caller's navigation scroll together inside
 * the shell's bounded region — scroll to reach the dots and the
 * Back / Next row — while the Done pill stays pinned at the top
 * right. On open, keyboard focus lands on the overlay itself
 * (the shell manages focus: it is a modal dialog named for its
 * title), and Tab moves through the controls inside it.
 */
export const LongBody: Story = {
  render: () => <Demo steps={LONG_STEPS} initialStep={1} frameHeight={360} />,
};
