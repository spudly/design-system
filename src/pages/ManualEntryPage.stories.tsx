import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { recipeFormFixture } from "./fixtures.js";
import { ManualEntryPage } from "./ManualEntryPage.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * Stories for the real ManualEntryPage shell (#124): the
 * "Manual Entry" heading and container around RecipeFormPage,
 * driven by fixture props — the create flow's starting state
 * (blank fields, the default serving count, no tags). Theme
 * pinned to Warm Harvest.
 */
const meta: Meta<typeof ManualEntryPage> = {
  title: "Pages/Eciperay/ManualEntryPage",
  component: ManualEntryPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ManualEntryPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function useFormProps(): RecipeFormPageProps {
  const fixture = recipeFormFixture;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("4");
  const [prepTimeMin, setPrepTimeMin] = useState("");
  const [cookTimeMin, setCookTimeMin] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState("idea");
  const [tagIds, setTagIds] = useState<string[]>([]);
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
    onGenerateDescription: () => undefined,
    submitLabel: "Create Recipe",
    onSubmit: () => undefined,
  };
}

function Shell() {
  const formProps = useFormProps();
  return (
    <ManualEntryPage>
      <RecipeFormPage {...formProps} />
    </ManualEntryPage>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <Shell />
    </Viewport>
  ),
};
