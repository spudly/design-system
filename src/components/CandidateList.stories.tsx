import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CandidateList } from "./CandidateList.js";

const meta: Meta<typeof CandidateList> = {
  title: "Components/CandidateList",
  component: CandidateList,
};

export default meta;
type Story = StoryObj<typeof CandidateList>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <CandidateList
        title="Ready to activate"
        candidates={[
          { id: "v4", label: "v4 — Adds the slow-cooker variant" },
          { id: "v5", label: "v5 — Doubles the sauce" },
        ]}
        onActivatePress={() => {}}
      />
    </YStack>
  ),
};

export const Pending: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <CandidateList
        title="Ready to activate"
        candidates={[{ id: "v4", label: "v4 — Adds the slow-cooker variant" }]}
        isActivationPending
        onActivatePress={() => {}}
      />
    </YStack>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <CandidateList
        title="Ready to activate"
        candidates={[{ id: "v4", label: "v4 — Adds the slow-cooker variant" }]}
      />
    </YStack>
  ),
};
