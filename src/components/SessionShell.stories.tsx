import type { Meta, StoryObj } from "@storybook/react";
import { SessionShell } from "./SessionShell.js";
import { Text } from "./Text.js";

const meta: Meta<typeof SessionShell> = {
  title: "Components/SessionShell",
  component: SessionShell,
};

export default meta;
type Story = StoryObj<typeof SessionShell>;

export const Fixed: Story = {
  args: {
    children: (
      <>
        <Text variant="formTitle">Session title</Text>
        <Text variant="hint">The start state is a fixed column on the recessed background.</Text>
      </>
    ),
  },
};

export const Scrollable: Story = {
  args: {
    scrollable: true,
    children: (
      <>
        <Text variant="formTitle">Session title</Text>
        {Array.from({ length: 12 }, (_, i) => (
          <Text key={i}>Transcript block {i + 1} — the running session scrolls.</Text>
        ))}
      </>
    ),
  },
};
