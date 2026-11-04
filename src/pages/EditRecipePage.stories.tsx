import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { recipeFormFixture, eciperayFooterFixture } from "./fixtures.js";
import { EditRecipePage } from "./EditRecipePage.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * Stories for the real EditRecipePage shell (#124): the "Edit
 * Recipe" heading and container around RecipeFormPage, driven by
 * fixture props. The real screen always edits the active version,
 * so the story carries the form's content lock — the state the
 * screen actually renders. Theme pinned to Warm Harvest.
 */
const meta: Meta<typeof EditRecipePage> = {
  title: "Pages/Eciperay/EditRecipePage",
  component: EditRecipePage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof EditRecipePage>;

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
    submitLabel: "Save Changes",
    onSubmit: () => undefined,
  };
}

function Shell() {
  const formProps = useFormProps();
  // Footer ownership: the OUTER page owns the one footer in this
  // composition — the nested RecipeFormPage gets no footer prop,
  // so the composed screen renders exactly one footer (and one
  // contentinfo landmark). Hosts composing these pages follow
  // the same rule: supply the footer to the outer page only.
  return (
    <EditRecipePage footer={eciperayFooterFixture}>
      <RecipeFormPage {...formProps} contentLocked />
    </EditRecipePage>
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <Shell />
    </Viewport>
  ),
};
