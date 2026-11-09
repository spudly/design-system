import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { PreviewCard } from "./PreviewCard.js";
import { Text } from "./Text.js";

const meta: Meta<typeof PreviewCard> = {
  title: "Widgets/PreviewCard",
  component: PreviewCard,
};

export default meta;
type Story = StoryObj<typeof PreviewCard>;

export const Default: Story = {
  args: {
    title: "Your recipe",
    children: <Text>Tuscan Chicken — 4 servings, 15 min prep, 30 min cook.</Text>,
    actions: <Button variant="primary">Looks good</Button>,
  },
};

export const NoTitle: Story = {
  args: {
    children: <Text>A preview that names itself needs no title.</Text>,
  },
};

export const NoActions: Story = {
  args: {
    title: "Draft preview",
    children: <Text>The confirm controls live outside this card.</Text>,
  },
};

export const Loading: Story = {
  args: {
    title: "Your recipe",
    children: <Text>Tuscan Chicken — 4 servings, 15 min prep, 30 min cook.</Text>,
    // The action stays while loading, as a rectangle skeleton.
    actions: <Button variant="primary">Looks good</Button>,
    loading: true,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
// The preview text is long enough to wrap to exactly 3 lines at
// this story's width, so the overlay pairs 3 loaded lines with
// the card's 3-line skeleton.
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <PreviewCard title="Your recipe" actions={<Button variant="primary">Looks good</Button>}>
        <Text>
          Tuscan Chicken — 4 servings, 15 min prep, 30 min cook. A creamy garlic sauce with
          sun-dried tomatoes, spinach, and parmesan.
        </Text>
      </PreviewCard>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <PreviewCard
          title="Your recipe"
          actions={<Button variant="primary">Looks good</Button>}
          loading
        >
          <Text>
            Tuscan Chicken — 4 servings, 15 min prep, 30 min cook. A creamy garlic sauce with
            sun-dried tomatoes, spinach, and parmesan.
          </Text>
        </PreviewCard>
      </YStack>
    </YStack>
  ),
};
