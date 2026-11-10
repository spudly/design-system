import type { Meta, StoryObj } from "@storybook/react";
import { YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { ScrollRegion } from "./ScrollRegion.js";
import { Text } from "./Text.js";

const meta: Meta<typeof ScrollRegion> = {
  title: "Widgets/ScrollRegion",
  component: ScrollRegion,
};

export default meta;
type Story = StoryObj<typeof ScrollRegion>;

const paragraphs = Array.from({ length: 12 }, (_, index) => (
  <Text key={index}>
    Section {index + 1} — the region between the pinned header and the pinned footer scrolls, while
    both stay put. The region fills the space the shell leaves it and keeps taps landing while the
    keyboard is open.
  </Text>
));

export const Default: Story = {
  render: () => (
    // The pinned frame is the native shape (#547): on native the
    // region scrolls between the pinned header and footer inside
    // the 480px frame. On web the region renders no scroller —
    // the whole composition flows in the document — so the frame
    // grows with the content instead of bounding it.
    <YStack maxWidth={430} height={isWeb ? undefined : 480} backgroundColor="$surface">
      <YStack padding={tokens.spacing[4]}>
        <Text variant="subheading">Pinned header</Text>
      </YStack>
      <ScrollRegion>
        <YStack padding={tokens.spacing[4]} gap={tokens.spacing[3]}>
          {paragraphs}
        </YStack>
      </ScrollRegion>
      <YStack padding={tokens.spacing[4]}>
        <Text variant="hint">Pinned footer</Text>
      </YStack>
    </YStack>
  ),
};
