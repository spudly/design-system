import type { Meta, StoryObj } from "@storybook/react";
import { ShowLessView, type ShowLessEntry } from "./ShowLessView.js";
import { StoryFrame } from "../shared/storyFrame.js";

const meta: Meta<typeof ShowLessView> = {
  title: "Views/Eciperay/ShowLessView",
  component: ShowLessView,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ShowLessView>;

const entries: ShowLessEntry[] = [
  { sourceRecipeId: "recipe-1", title: "Spicy Tuna Casserole" },
  { sourceRecipeId: "recipe-2", title: "Liver and Onions" },
];

const actions = {
  onUndo: () => undefined,
};

export const WithEntries: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <ShowLessView entries={entries} {...actions} />
    </StoryFrame>
  ),
};

export const Empty: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <ShowLessView entries={[]} {...actions} />
    </StoryFrame>
  ),
};

export const LoadingList: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <ShowLessView entries={[]} isLoading {...actions} />
    </StoryFrame>
  ),
};

export const LoadFailed: Story = {
  render: () => (
    <StoryFrame variant="panel">
      <ShowLessView entries={[]} loadFailed {...actions} />
    </StoryFrame>
  ),
};
