import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../../widgets/data/Text.js";

import { FeedbackBubbleView } from "./FeedbackBubbleView.js";
import { StoryFrame } from "./storyFrame.js";

const meta: Meta<typeof FeedbackBubbleView> = {
  title: "Views/Shared/FeedbackBubbleView",
  component: FeedbackBubbleView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof FeedbackBubbleView>;

function BubbleStory({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <StoryFrame variant="phone">
      <FeedbackBubbleView
        open={open}
        onToggle={() => {
          setOpen((current) => !current);
        }}
      >
        <Text>The host&apos;s feedback form renders here.</Text>
      </FeedbackBubbleView>
    </StoryFrame>
  );
}

export const Closed: Story = {
  render: () => <BubbleStory initiallyOpen={false} />,
};

export const Open: Story = {
  render: () => <BubbleStory initiallyOpen={true} />,
};
