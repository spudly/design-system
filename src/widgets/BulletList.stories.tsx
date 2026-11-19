import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { BulletList } from "./BulletList.js";

const meta: Meta<typeof BulletList> = {
  title: "Widgets/BulletList",
  component: BulletList,
};

export default meta;
type Story = StoryObj<typeof BulletList>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={640}>
      <BulletList
        items={[
          "Your email address, so we can sign you in.",
          "The recipes you save to your account.",
        ]}
      />
    </YStack>
  ),
};
