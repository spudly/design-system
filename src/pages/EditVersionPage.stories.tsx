import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { recipeFormFixture } from "./fixtures.js";
import { EditVersionPage } from "./EditVersionPage.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * Stories for the real EditVersionPage shell (#124): the
 * "Edit Draft (vN)" heading, the imported-draft banner, and the
 * change summary around RecipeFormPage, plus the not-editable
 * state. Driven by fixture props; the Default story carries the
 * version-diff presentation a draft edit actually shows. Theme
 * pinned to Warm Harvest.
 */
const meta: Meta<typeof EditVersionPage> = {
  title: "Pages/Eciperay/EditVersionPage",
  component: EditVersionPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof EditVersionPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function useFormProps(): RecipeFormPageProps {
  const fixture = recipeFormFixture;
  const [title, setTitle] = useState(fixture.title);
  const [description, setDescription] = useState(fixture.description);
  const [servings, setServings] = useState(fixture.servings);
  const [prepTimeMin, setPrepTimeMin] = useState(fixture.prepTimeMin);
  const [cookTimeMin, setCookTimeMin] = useState(fixture.cookTimeMin);
  const [sourceUrl, setSourceUrl] = useState(fixture.sourceUrl);
  const [status, setStatus] = useState(fixture.status);
  const [tagIds, setTagIds] = useState<string[]>(fixture.tagIds);
  const noop = () => undefined;
  return {
    title,
    onTitleChange: setTitle,
    description,
    onDescriptionChange: setDescription,
    servings,
    onServingsChange: setServings,
    prepTimeMin,
    onPrepTimeMinChange: setPrepTimeMin,
    cookTimeMin,
    onCookTimeMinChange: setCookTimeMin,
    sourceUrl,
    onSourceUrlChange: setSourceUrl,
    statusOptions: fixture.statusOptions,
    status,
    onStatusChange: setStatus,
    tagOptions: fixture.tagOptions,
    tagIds,
    onTagIdsChange: setTagIds,
    changedFields: ["title"],
    revertLabels: { title: "Creamy Tuscan Garlic Chicken (original)" },
    onRevertField: noop,
    submitLabel: "Save Draft",
    onSubmit: noop,
  };
}

function Shell() {
  const formProps = useFormProps();
  return (
    <EditVersionPage
      versionNumber={2}
      changeSummary="Reduced sugar and added citrus."
      showImportBanner
      parentVersionNumber={1}
    >
      <RecipeFormPage {...formProps} />
    </EditVersionPage>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <Shell />
    </Viewport>
  ),
};

export const NotEditable: Story = {
  render: () => (
    <Viewport>
      <EditVersionPage versionNumber={1} notEditable onBack={() => undefined} />
    </Viewport>
  ),
};
