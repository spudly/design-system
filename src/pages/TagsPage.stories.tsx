import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import type { TagColorName } from "../themes/tagColors.js";
import { tagsFixture } from "./fixtures.js";
import { TagsPage, type TagsPageTag } from "./TagsPage.js";

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
        color="purple"
        colorOptions={tagsFixture.colorOptions}
        onNameChange={() => undefined}
        onColorChange={() => undefined}
        onCreate={() => undefined}
        onDelete={() => undefined}
      />
    </Viewport>
  ),
};

/**
 * Inline rename (eciperay#254): each row offers Edit; starting an
 * edit swaps the row for the name + color form with Save/Cancel.
 * The story holds the draft the way a host screen would.
 */
export const Editing: Story = {
  render: () => {
    const [tags, setTags] = useState<TagsPageTag[]>(tagsFixture.tags);
    const [editingTagId, setEditingTagId] = useState<string | null>(
      tagsFixture.tags[0]?.id ?? null,
    );
    const [editName, setEditName] = useState(tagsFixture.tags[0]?.name ?? "");
    const [editColor, setEditColor] = useState<TagColorName>(
      tagsFixture.tags[0]?.color ?? "indigo",
    );
    return (
      <Viewport>
        <TagsPage
          tags={tags}
          name=""
          color={tagsFixture.colorOptions[0] ?? "indigo"}
          colorOptions={tagsFixture.colorOptions}
          onNameChange={() => undefined}
          onColorChange={() => undefined}
          onCreate={() => undefined}
          onDelete={() => undefined}
          editingTagId={editingTagId}
          editName={editName}
          editColor={editColor}
          onStartEdit={(tag: TagsPageTag) => {
            setEditingTagId(tag.id);
            setEditName(tag.name);
            setEditColor(tag.color);
          }}
          onEditNameChange={setEditName}
          onEditColorChange={setEditColor}
          onSaveEdit={() => {
            setTags((current) =>
              current.map((tag) =>
                tag.id === editingTagId ? { ...tag, name: editName, color: editColor } : tag,
              ),
            );
            setEditingTagId(null);
          }}
          onCancelEdit={() => {
            setEditingTagId(null);
          }}
        />
      </Viewport>
    );
  },
};

export const Loading: Story = {
  render: () => (
    <Viewport>
      <TagsPage
        tags={[]}
        isLoading
        name=""
        color={tagsFixture.colorOptions[0] ?? "indigo"}
        colorOptions={tagsFixture.colorOptions}
        onNameChange={() => undefined}
        onColorChange={() => undefined}
        onCreate={() => undefined}
        onDelete={() => undefined}
      />
    </Viewport>
  ),
};
