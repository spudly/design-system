import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { BannerRow } from "./BannerRow.js";
import { BrandLink } from "./BrandLink.js";
import { TextLink } from "./TextLink.js";

const meta: Meta<typeof BannerRow> = {
  title: "Widgets/BannerRow",
  component: BannerRow,
};

export default meta;
type Story = StoryObj<typeof BannerRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={860}>
      <BannerRow>
        <BrandLink label="Eciperay" href="/" />
        <TextLink href="/sign-in">Sign in</TextLink>
      </BannerRow>
    </YStack>
  ),
};
