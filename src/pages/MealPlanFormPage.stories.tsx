import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { mealPlanFormFixture } from "./fixtures.js";
import { MealPlanFormPage, type MealPlanFormPageProps } from "./MealPlanFormPage.js";

/**
 * Stories for the real MealPlanFormPage (#125): the meal plan
 * form's view layer, driven by fixture props with the
 * selection, quantity, and servings state held by the story,
 * as the app screen's edit-form hook holds it. Theme pinned
 * to Warm Harvest; the frame matches the other page stories
 * (430×844).
 */
const meta: Meta<typeof MealPlanFormPage> = {
  title: "Pages/Eciperay/MealPlanFormPage",
  component: MealPlanFormPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealPlanFormPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

function useFormProps(overrides?: Partial<MealPlanFormPageProps>): MealPlanFormPageProps {
  const fixture = mealPlanFormFixture;
  const [title, setTitle] = useState(fixture.title);
  const [notes, setNotes] = useState(fixture.notes);
  const [startsOn, setStartsOn] = useState(fixture.startsOn);
  const [endsOn, setEndsOn] = useState(fixture.endsOn);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(fixture.selectedKeys);
  const [quantityByKey, setQuantityByKey] = useState<Record<string, number>>(fixture.quantityByKey);
  const [servingsByRecipeId, setServingsByRecipeId] = useState<Record<string, number>>(
    fixture.servingsByRecipeId,
  );
  return {
    title,
    onTitleChange: setTitle,
    notes,
    onNotesChange: setNotes,
    startsOn,
    onStartsOnChange: setStartsOn,
    endsOn,
    onEndsOnChange: setEndsOn,
    entryOptions: fixture.entryOptions,
    selectedKeys,
    quantityByKey,
    servingsByRecipeId,
    onToggleEntry: (key) => {
      setSelectedKeys((current) =>
        current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
      );
    },
    onQuantityChange: (key, quantity) => {
      setQuantityByKey((current) => ({ ...current, [key]: quantity }));
    },
    onRecipeServingsChange: (recipeId, servings) => {
      setServingsByRecipeId((current) => ({ ...current, [recipeId]: servings }));
    },
    onSubmit: () => undefined,
    ...overrides,
  };
}

function Form(props: Partial<MealPlanFormPageProps>) {
  const formProps = useFormProps(props);
  return <MealPlanFormPage {...formProps} />;
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
      <Form selectedKeys={[]} quantityByKey={{}} servingsByRecipeId={{}} />
    </Viewport>
  ),
};
