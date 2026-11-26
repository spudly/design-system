import { eciperayFooterFixture } from "../shared/fixtures.js";
import type { Meta, StoryObj } from "@storybook/react";
import { FeedbackPage } from "./FeedbackPage.js";

const meta: Meta<typeof FeedbackPage> = {
  title: "Pages/Eciperay/FeedbackPage",
  component: FeedbackPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof FeedbackPage>;

export const Form: Story = {
  render: () => (
    <>
      <FeedbackPage
        footer={eciperayFooterFixture}
        message="The shopping list didn't keep my checks after I closed the app."
        onMessageChange={() => undefined}
        replyEmail="cook@example.com"
        onReplyEmailChange={() => undefined}
        isBug
        onIsBugChange={() => undefined}
        onSubmit={() => undefined}
      />
    </>
  ),
};

export const Submitted: Story = {
  render: () => (
    <>
      <FeedbackPage
        footer={eciperayFooterFixture}
        message=""
        onMessageChange={() => undefined}
        replyEmail=""
        onReplyEmailChange={() => undefined}
        isBug={false}
        onIsBugChange={() => undefined}
        submitted
        onSubmit={() => undefined}
        onResetPress={() => undefined}
      />
    </>
  ),
};

export const FormWithCancel: Story = {
  render: () => (
    <>
      <FeedbackPage
        footer={eciperayFooterFixture}
        message="The shopping list didn't keep my checks after I closed the app."
        onMessageChange={() => undefined}
        replyEmail="cook@example.com"
        onReplyEmailChange={() => undefined}
        isBug
        onIsBugChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
      />
    </>
  ),
};
