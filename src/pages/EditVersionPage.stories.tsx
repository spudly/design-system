import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { recipeFormFixture } from "./fixtures.js";
import { EditVersionPage } from "./EditVersionPage.js";
import type { RecipeFormPageProps } from "./RecipeFormPage.js";

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
      {...formProps}
      versionNumber={2}
      changeSummary="Reduced sugar and added citrus."
      showImportBanner
      parentVersionNumber={1}
    />
  );
}

/** Static form props for the not-editable story: that state never
 * renders the form, so the values are inert fixture data. */
function staticFormProps(): RecipeFormPageProps {
  const fixture = recipeFormFixture;
  const noop = () => undefined;
  return {
    title: fixture.title,
    onTitleChange: noop,
    description: fixture.description,
    onDescriptionChange: noop,
    servings: fixture.servings,
    onServingsChange: noop,
    prepTimeMin: fixture.prepTimeMin,
    onPrepTimeMinChange: noop,
    cookTimeMin: fixture.cookTimeMin,
    onCookTimeMinChange: noop,
    sourceUrl: fixture.sourceUrl,
    onSourceUrlChange: noop,
    statusOptions: fixture.statusOptions,
    status: fixture.status,
    onStatusChange: noop,
    tagOptions: fixture.tagOptions,
    tagIds: fixture.tagIds,
    onTagIdsChange: noop,
    submitLabel: "Save Draft",
    onSubmit: noop,
  };
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
      <EditVersionPage
        {...staticFormProps()}
        versionNumber={1}
        notEditable
        onBack={() => undefined}
      />
    </Viewport>
  ),
};
