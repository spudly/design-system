import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { NumberStepper } from "./NumberStepper.js";
import { StepperGroup } from "./StepperGroup.js";

const meta: Meta<typeof StepperGroup> = {
  title: "Components/StepperGroup",
  component: StepperGroup,
};

export default meta;
type Story = StoryObj<typeof StepperGroup>;

function StepperGroupDemo() {
  const [quantity, setQuantity] = useState(2);
  const [servings, setServings] = useState(4);
  return (
    <YStack maxWidth={430}>
      <StepperGroup>
        <NumberStepper label="Quantity · Tuscan chicken" value={quantity} onChange={setQuantity} />
        <NumberStepper label="Servings · Tuscan chicken" value={servings} onChange={setServings} />
      </StepperGroup>
    </YStack>
  );
}

export const Default: Story = {
  render: () => <StepperGroupDemo />,
};
