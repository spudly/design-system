import type { Meta, StoryObj } from "@storybook/react";
import { CatalogCardColumn } from "./CatalogCardColumn.js";
import { DiscoveryCard } from "../content/DiscoveryCard.js";

const meta: Meta<typeof CatalogCardColumn> = {
  title: "Widgets/Layout & Structure/CatalogCardColumn",
  component: CatalogCardColumn,
};

export default meta;
type Story = StoryObj<typeof CatalogCardColumn>;

export const Default: Story = {
  render: () => (
    <CatalogCardColumn>
      <DiscoveryCard title="First recipe" subtitle="Recipe details" href="/recipes/1" />
      <DiscoveryCard title="Second recipe" subtitle="Recipe details" href="/recipes/2" />
      <DiscoveryCard title="Third recipe" subtitle="Recipe details" href="/recipes/3" />
    </CatalogCardColumn>
  ),
};
