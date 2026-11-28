import type { Meta, StoryObj } from "@storybook/react";

import { eciperayFooterFixture } from "../shared/fixtures.js";

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
        onMessageChange={() => { /* noop */ }}
        replyEmail="cook@example.com"
        onReplyEmailChange={() => { /* noop */ }}
        isBug
        onIsBugChange={() => { /* noop */ }}
        onSubmit={() => { /* noop */ }}
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
        onMessageChange={() => { /* noop */ }}
        replyEmail=""
        onReplyEmailChange={() => { /* noop */ }}
        isBug={false}
        onIsBugChange={() => { /* noop */ }}
        submitted
        onSubmit={() => { /* noop */ }}
        onResetPress={() => { /* noop */ }}
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
        onMessageChange={() => { /* noop */ }}
        replyEmail="cook@example.com"
        onReplyEmailChange={() => { /* noop */ }}
        isBug
        onIsBugChange={() => { /* noop */ }}
        onSubmit={() => { /* noop */ }}
        onCancel={() => { /* noop */ }}
      />
    </>
  ),
};
