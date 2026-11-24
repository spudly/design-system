import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { CatalogRow } from "./CatalogRow.js";
import { SectionHeading } from "../content/SectionHeading.js";
import { Text } from "./Text.js";

const meta: Meta<typeof CatalogRow> = {
  title: "Widgets/Data Display/CatalogRow",
  component: CatalogRow,
};

export default meta;
type Story = StoryObj<typeof CatalogRow>;

export const Default: Story = {
  render: () => (
    <YStack maxWidth={430}>
      <CatalogRow>
        <SectionHeading>Catalog heading</SectionHeading>
      </CatalogRow>
      <CatalogRow>
        <Text>First catalog row content.</Text>
      </CatalogRow>
      <CatalogRow>
        <Text>Second catalog row content.</Text>
      </CatalogRow>
    </YStack>
  ),
};
