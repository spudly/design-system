import type { Meta, StoryObj } from "@storybook/react";
import { MessageList } from "./MessageList.js";

const meta: Meta<typeof MessageList> = {
  title: "Components/MessageList",
  component: MessageList,
};

export default meta;
type Story = StoryObj<typeof MessageList>;

export const Default: Story = {
  args: {
    userLabel: "You",
    assistantLabel: "Plan",
    messages: [
      { role: "user", content: "A weeknight chicken dinner for four, ready in 45 minutes." },
      {
        role: "assistant",
        content: "Planning a one-pan Tuscan chicken with a side of garlic green beans.",
      },
      { role: "user", content: "Make it dairy-free." },
      {
        role: "assistant",
        content: "Swapping the cream for coconut milk and skipping the parmesan finish.",
      },
    ],
  },
};

export const AssistantOnly: Story = {
  args: {
    userLabel: "You",
    assistantLabel: "Plan",
    messages: [{ role: "assistant", content: "Here is the plan so far." }],
  },
};

export const Empty: Story = {
  args: {
    userLabel: "You",
    assistantLabel: "Plan",
    messages: [],
  },
};
