import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { SearchControls } from "./SearchControls.js";
import { SearchField } from "./SearchField.js";

const meta: Meta<typeof SearchControls> = {
  title: "Components/SearchControls",
  component: SearchControls,
};

export default meta;
type Story = StoryObj<typeof SearchControls>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <SearchControls>
        <SearchField grow value="" onChangeText={() => {}} placeholder="e.g. Ether 12:27" />
        <Button>Search</Button>
      </SearchControls>
    </YStack>
  ),
};
