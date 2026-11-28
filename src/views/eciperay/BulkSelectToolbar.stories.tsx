import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { BulkSelectToolbar } from "./BulkSelectToolbar.js";

const meta: Meta<typeof BulkSelectToolbar> = {
  title: "Views/Eciperay/BulkSelectToolbar",
  component: BulkSelectToolbar,
};

export default meta;
type Story = StoryObj<typeof BulkSelectToolbar>;

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [search, setSearch] = useState("");
    return (
      <BulkSelectToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCount={1}
        filteredCount={3}
        onSelectAll={() => { /* noop */ }}
        onClearSelection={() => { /* noop */ }}
      />
    );
  },
};

export const NothingFiltered: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Storybook mounts a story's render function as a component, so hooks here run under component rules; the rule cannot recognize anonymous render functions
    const [search, setSearch] = useState("zzz");
    return (
      <BulkSelectToolbar
        search={search}
        onSearchChange={setSearch}
        selectedCount={0}
        filteredCount={0}
        onSelectAll={() => { /* noop */ }}
        onClearSelection={() => { /* noop */ }}
      />
    );
  },
};
