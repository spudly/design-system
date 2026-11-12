import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CandidateList } from "./CandidateList.js";

const meta: Meta<typeof CandidateList> = {
  title: "Views/CandidateList",
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

export const Loading: Story = {
  render: () => (
    <YStack maxWidth={430} padding="$4">
      <CandidateList
        title="Ready to activate"
        candidates={[
          { id: "v4", label: "v4 — Adds the slow-cooker variant" },
          { id: "v5", label: "v5 — Doubles the sauce" },
        ]}
        onActivatePress={() => {}}
        loading
      />
    </YStack>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={430} padding="$4">
      <CandidateList
        title="Ready to activate"
        candidates={[
          { id: "v4", label: "v4 — Adds the slow-cooker variant" },
          { id: "v5", label: "v5 — Doubles the sauce" },
        ]}
        onActivatePress={() => {}}
      />
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
        padding="$4"
      >
        <CandidateList
          title="Ready to activate"
          candidates={[
            { id: "v4", label: "v4 — Adds the slow-cooker variant" },
            { id: "v5", label: "v5 — Doubles the sauce" },
          ]}
          onActivatePress={() => {}}
          loading
        />
      </YStack>
    </YStack>
  ),
};
