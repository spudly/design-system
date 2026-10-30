import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Badge } from "./Badge.js";
import { SelectField } from "./SelectField.js";
import { Toolbar } from "./Toolbar.js";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Toolbar",
  component: Toolbar,
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <Toolbar>
        <Badge tone="info">Evolving</Badge>
        <SelectField
          label="Version"
          value="v3"
          options={[
            { value: "v3", label: "v3 — Active" },
            { value: "v2", label: "v2" },
            { value: "v1", label: "v1" },
          ]}
          onValueChange={() => {}}
          grow
        />
      </Toolbar>
    </YStack>
  ),
};
