import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { ChatTranscript } from "./ChatTranscript.js";

const meta: Meta<typeof ChatTranscript> = {
  title: "Widgets/Content/ChatTranscript",
  component: ChatTranscript,
};

export default meta;
type Story = StoryObj<typeof ChatTranscript>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <ChatTranscript
        messages={[
          { own: false, author: "Plan", content: "Here is a first draft of your week." },
          { own: true, author: "You", content: "Swap Tuesday's dinner for something quicker." },
          { own: false, author: "Plan", content: "Done — Tuesday is now a 20-minute meal." },
        ]}
      />
    </YStack>
  ),
};
