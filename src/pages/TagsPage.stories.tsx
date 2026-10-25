import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { tagsFixture } from "./fixtures.js";
import { TagsPage } from "./TagsPage.js";

const meta: Meta<typeof TagsPage> = {
  title: "Pages/Eciperay/TagsPage",
  component: TagsPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof TagsPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const WithTags: Story = {
  render: () => (
    <Viewport>
      <TagsPage
        tags={tagsFixture.tags}
        name="Baking"
        color="#a855f7"
        colorOptions={tagsFixture.colorOptions}
        onNameChange={() => undefined}
        onColorChange={() => undefined}
        onCreate={() => undefined}
        onDelete={() => undefined}
      />
    </Viewport>
  ),
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <TagsPage
        tags={[]}
        isLoading
        name=""
        color={tagsFixture.colorOptions[0] ?? "#6366f1"}
        colorOptions={tagsFixture.colorOptions}
        onNameChange={() => undefined}
        onColorChange={() => undefined}
        onCreate={() => undefined}
        onDelete={() => undefined}
      />
    </Viewport>
  ),
};
