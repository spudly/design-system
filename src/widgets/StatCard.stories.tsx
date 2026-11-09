import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { StatCard } from "./StatCard.js";

const meta: Meta<typeof StatCard> = {
  title: "Widgets/StatCard",
  component: StatCard,
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    sublabel: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    value: "12",
    label: "verses mastered",
    sublabel: "Keep going — you're building consistency",
  },
};

export const WithoutSublabel: Story = {
  args: { value: "5", label: "day streak" },
};

export const Loading: Story = {
  args: {
    value: "12",
    label: "verses mastered",
    sublabel: "Keep going — you're building consistency",
    loading: true,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430}>
      <StatCard
        value="12"
        label="verses mastered"
        sublabel="Keep going — you're building consistency"
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <StatCard
          value="12"
          label="verses mastered"
          sublabel="Keep going — you're building consistency"
          loading
        />
      </YStack>
    </YStack>
  ),
};
