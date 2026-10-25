import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BulkSelectToolbar } from "./BulkSelectToolbar.js";

const meta: Meta<typeof BulkSelectToolbar> = {
  title: "Components/BulkSelectToolbar",
  component: BulkSelectToolbar,
};

export default meta;
type Story = StoryObj<typeof BulkSelectToolbar>;

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <BulkSelectToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCount={1}
        filteredCount={3}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      />
    );
  },
};

export const NothingFiltered: Story = {
  render: () => {
    const [search, setSearch] = useState("zzz");
    return (
      <BulkSelectToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCount={0}
        filteredCount={0}
        onSelectAll={() => {}}
        onClearSelection={() => {}}
      />
    );
  },
};
