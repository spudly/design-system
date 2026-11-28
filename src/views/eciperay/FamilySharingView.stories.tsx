import type { Meta, StoryObj } from "@storybook/react";

import { StoryFrame } from "../shared/storyFrame.js";

import { FamilySharingView, type FamilySharingGrant } from "./FamilySharingView.js";

const meta: Meta<typeof FamilySharingView> = {
  title: "Views/Eciperay/FamilySharingView",
  component: FamilySharingView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof FamilySharingView>;

const grants: FamilySharingGrant[] = [
  {
    recipientUserId: "user-1",
    recipientEmail: "alex@example.com",
    recipientDisplayName: "Alex Cook",
    createdAt: "2026-10-02T12:00:00.000Z",
  },
  {
    recipientUserId: "user-2",
    recipientEmail: "sam@example.com",
    recipientDisplayName: null,
    createdAt: "2026-09-14T12:00:00.000Z",
  },
];

const actions = {
  onEmailChange: () => { /* noop */ },
  onAdd: () => { /* noop */ },
  onRemove: () => { /* noop */ },
};

export const WithGrants: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FamilySharingView grants={grants} email="" {...actions} />
    </StoryFrame>
  ),
};

export const Empty: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FamilySharingView grants={[]} email="family@example.com" {...actions} />
    </StoryFrame>
  ),
};

export const LoadingList: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FamilySharingView grants={[]} email="" loading {...actions} />
    </StoryFrame>
  ),
};

export const WithError: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <FamilySharingView
        grants={grants}
        email=""
        {...actions}
        error="That email does not match an Eciperay account."
      />
    </StoryFrame>
  ),
};
