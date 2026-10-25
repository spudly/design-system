import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { FeedbackPage } from "./FeedbackPage.js";

const meta: Meta<typeof FeedbackPage> = {
  title: "Pages/Eciperay/FeedbackPage",
  component: FeedbackPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof FeedbackPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const Form: Story = {
  render: () => (
    <Viewport>
      <FeedbackPage
        message="The shopping list didn't keep my checks after I closed the app."
        onMessageChange={() => undefined}
        replyEmail="cook@example.com"
        onReplyEmailChange={() => undefined}
        isBug
        onIsBugChange={() => undefined}
        onSubmit={() => undefined}
      />
    </Viewport>
  ),
};

export const Submitted: Story = {
  render: () => (
    <Viewport>
      <FeedbackPage
        message=""
        onMessageChange={() => undefined}
        replyEmail=""
        onReplyEmailChange={() => undefined}
        isBug={false}
        onIsBugChange={() => undefined}
        submitted
        onSubmit={() => undefined}
      />
    </Viewport>
  ),
};
