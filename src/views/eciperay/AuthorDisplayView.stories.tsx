import type { Meta, StoryObj } from "@storybook/react";

import { StoryFrame } from "../shared/storyFrame.js";

import { AuthorDisplayView } from "./AuthorDisplayView.js";

const meta: Meta<typeof AuthorDisplayView> = {
  title: "Views/Eciperay/AuthorDisplayView",
  component: AuthorDisplayView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof AuthorDisplayView>;

const actions = {
  onChange: () => { /* noop */ },
  onSave: () => { /* noop */ },
};

export const Named: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <AuthorDisplayView
        settings={{ displayName: "Jamie Cook", showOnPublicRecipes: true }}
        {...actions}
      />
    </StoryFrame>
  ),
};

export const Hidden: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <AuthorDisplayView
        settings={{ displayName: "", showOnPublicRecipes: false }}
        {...actions}
      />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <AuthorDisplayView
        settings={{ displayName: "Jamie Cook", showOnPublicRecipes: true }}
        {...actions}
        error="Could not save your author display settings."
      />
    </StoryFrame>
  ),
};
