import type { Meta, StoryObj } from "@storybook/react";
import { CatalogListColumn } from "./CatalogListColumn.js";
import { CatalogRow } from "../data/CatalogRow.js";
import { Text } from "../data/Text.js";

const meta: Meta<typeof CatalogListColumn> = {
  title: "Widgets/Layout & Structure/CatalogListColumn",
  component: CatalogListColumn,
};

export default meta;
type Story = StoryObj<typeof CatalogListColumn>;

export const Default: Story = {
  render: () => (
    <CatalogListColumn>
      <CatalogRow>
        <Text>First catalog row.</Text>
      </CatalogRow>
      <CatalogRow>
        <Text>Second catalog row.</Text>
      </CatalogRow>
      <Text>Last row, carrying no separation of its own.</Text>
    </CatalogListColumn>
  ),
};
