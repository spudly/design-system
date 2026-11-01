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

/**
 * The page's primary story wires the full inline-edit contract
 * (eciperay#254) the way a host screen would: rows offer Edit, and
 * the story holds the controlled draft, starting with no editor open.
 *
 * The last row is a preset-style tag (#375): the host marks it
 * `canEdit: false, canDelete: false`, so its row renders the
 * badge with no Edit/Delete actions — the server would reject
 * either operation, so the page offers neither. The other rows
 * carry no eligibility flags and stay fully actionable, the
 * pre-#375 behavior.
 */
export const WithTags: Story = {
  render: () => {
    const [tags, setTags] = useState<TagsPageTag[]>([
      ...tagsFixture.tags,
      { id: "tag-preset", name: "Preset", color: "gray", canEdit: false, canDelete: false },
    ]);
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editName, setEditName] = useState(tagsFixture.tags[0]?.name ?? "");
    const [editColor, setEditColor] = useState<TagColorName>(
      tagsFixture.tags[0]?.color ?? "indigo",
    );
    return (
      <Viewport>
        <TagsPage
          tags={tags}
          name="Baking"
          color="purple"
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

/**
 * Save failures (#374): every mutating handler reports failure
 * (returns `false`), so Add, Save (the first tag's editor is
 * open), and Delete on the other rows each surface the page's
 * own dismissible error alert naming the failed operation.
 * The create failure is also seeded via
 * `initialFailedOperation`, so the alert is already on screen
 * in a static capture — the Android visual-regression driver
 * and Chromatic snapshots never press a control, and an
 * unseeded baseline would cover only the editor, not the
 * error surface this story exists to pin.
 */
export const FailingSaves: Story = {
  render: () => {
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
          tags={tagsFixture.tags}
          name="Baking"
          color="purple"
          colorOptions={tagsFixture.colorOptions}
          onNameChange={() => undefined}
          onColorChange={() => undefined}
          onCreate={() => false}
          onDelete={() => false}
          initialFailedOperation="create"
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
          onSaveEdit={() => false}
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
