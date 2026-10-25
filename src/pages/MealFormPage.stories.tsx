import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { mealFormFixture } from "./fixtures.js";
import { MealFormPage, type MealFormPageProps } from "./MealFormPage.js";

/**
 * Stories for the real MealFormPage (#125): the meal form's
 * view layer, driven by fixture props with the selection and
 * servings state held by the story, as the app screen holds
 * it. Theme pinned to Warm Harvest; the frame matches the
 * other page stories (430×844) so Chromatic / Android VR
 * captures stay deterministic.
 */
const meta: Meta<typeof MealFormPage> = {
  title: "Pages/Eciperay/MealFormPage",
  component: MealFormPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealFormPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function useFormProps(overrides?: Partial<MealFormPageProps>): MealFormPageProps {
  const fixture = mealFormFixture;
  const [title, setTitle] = useState(fixture.title);
  const [notes, setNotes] = useState(fixture.notes);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(fixture.selectedRecipeIds);
  const [servingsByRecipeId, setServingsByRecipeId] = useState<Record<string, number>>(
    fixture.servingsByRecipeId,
  );
  return {
    title,
    onTitleChange: setTitle,
    notes,
    onNotesChange: setNotes,
    recipeOptions: fixture.recipeOptions,
    selectedRecipeIds,
    servingsByRecipeId,
    onToggleRecipe: (recipeId) => {
      setSelectedRecipeIds((current) =>
        current.includes(recipeId)
          ? current.filter((id) => id !== recipeId)
          : [...current, recipeId],
      );
    },
    onServingsChange: (recipeId, servings) => {
      setServingsByRecipeId((current) => ({ ...current, [recipeId]: servings }));
    },
    onSubmit: () => undefined,
    ...overrides,
  };
}

function Form(props: Partial<MealFormPageProps>) {
  const formProps = useFormProps(props);
  return <MealFormPage {...formProps} />;
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <Form />
    </Viewport>
  ),
};

export const NoSelection: Story = {
  render: () => (
    <Viewport>
      <Form selectedRecipeIds={[]} servingsByRecipeId={{}} />
    </Viewport>
  ),
};

export const SaveError: Story = {
  render: () => (
    <Viewport>
      <Form error="Could not save the meal. Try again." />
    </Viewport>
  ),
};
