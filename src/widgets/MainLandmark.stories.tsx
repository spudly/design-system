import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { MainLandmark } from "./MainLandmark.js";
import { Text } from "./Text.js";

const meta: Meta<typeof MainLandmark> = {
  title: "Widgets/MainLandmark",
  component: MainLandmark,
};

export default meta;
type Story = StoryObj<typeof MainLandmark>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} height={320} backgroundColor="$surface">
      <MainLandmark>
        <YStack padding="$4" gap="$3">
          <Text variant="subheading">Primary content</Text>
          <Text>
            This column is the page&apos;s main landmark on web: screen-reader users can navigate
            straight to it. The footer a page renders through its shell stays outside the landmark,
            after it in flow.
          </Text>
        </YStack>
      </MainLandmark>
    </YStack>
  ),
};
