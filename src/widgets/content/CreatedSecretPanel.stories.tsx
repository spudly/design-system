import type { Meta, StoryObj } from "@storybook/react";

import { CreatedSecretPanel } from "./CreatedSecretPanel.js";

const meta: Meta<typeof CreatedSecretPanel> = {
  title: "Widgets/Content/CreatedSecretPanel",
  component: CreatedSecretPanel,
};

export default meta;
type Story = StoryObj<typeof CreatedSecretPanel>;

export const Default: Story = {
  render: () => (
    <CreatedSecretPanel
      title="Your new token"
      secret="sk-example-secret-value"
      hint="Copy it now — it won't be shown again."
      doneLabel="Done"
      onDismiss={() => { /* noop */ }}
    />
  ),
};
