import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { DiscoveryCard } from "./DiscoveryCard.js";

/**
 * Stories for DiscoveryCard (#168): the public catalog's recipe
 * card — thumbnail placeholder (stories never load external
 * images), title, and the app's pre-formatted "By · rating ·
 * satiety" subtitle, all wrapped in the card's real permalink.
 * On web the card is a true anchor (`href` below); the permalink
 * shape mirrors the app's `/recipe/{id}/{slug}`.
 */
const meta: Meta<typeof DiscoveryCard> = {
  title: "Widgets/DiscoveryCard",
  component: DiscoveryCard,
  decorators: [
    (Story) => (
      <View maxWidth={430}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DiscoveryCard>;

export const Default: Story = {
  args: {
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "By Maria · ★ 4.5 · Satiety 60",
    href: "/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken",
  },
};

export const AnonymousAuthor: Story = {
  args: {
    title: "Classic Stuffed Peppers",
    subtitle: "By Anonymous · ★ 5 · Satiety 72",
    href: "/recipe/stuffed-peppers/classic-stuffed-peppers",
  },
};

export const WithoutSubtitle: Story = {
  args: {
    title: "Beef Chili",
    href: "/recipe/beef-chili/beef-chili",
  },
};

export const Loading: Story = {
  args: {
    title: "Creamy Tuscan Garlic Chicken",
    subtitle: "By Maria · ★ 4.5 · Satiety 60",
    href: "/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken",
    loading: true,
  },
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative">
      <DiscoveryCard
        title="Creamy Tuscan Garlic Chicken"
        subtitle="By Maria · ★ 4.5 · Satiety 60"
        href="/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken"
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
        <DiscoveryCard
          title="Creamy Tuscan Garlic Chicken"
          subtitle="By Maria · ★ 4.5 · Satiety 60"
          href="/recipe/tuscan-chicken/creamy-tuscan-garlic-chicken"
          loading
        />
      </YStack>
    </YStack>
  ),
};
