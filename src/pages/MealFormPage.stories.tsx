import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { mealFormFixture, eciperayFooterFixture } from "./fixtures.js";
import {
  MealFormPage,
  type MealFormPageIngredient,
  type MealFormPageProps,
  type MealFormPageRecipeOption,
} from "./MealFormPage.js";

/**
 * Stories for the real MealFormPage (#125): the meal form's
 * view layer, driven by fixture props with the selection and
 * servings state held by the story, as the app screen holds
 * it. Theme pinned to Warm Harvest; the frame matches the
 * other page stories (430×844) so Chromatic / Android VR
 * captures stay deterministic.
 *
 * The recipe picker is a search autocomplete (#383): the
 * story stands in for the host's server-side search by
 * filtering the fixture's recipe library by the search text
 * (the Default story opens mid-search, with the stuffed
 * peppers result ready to add over the two selected recipes).
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
  // A story's props are the form's INITIAL state, not a fixed
  // overlay: the stateful values (title, notes, search,
  // selection, servings) seed the hook's state, and the
  // returned props are driven by that state plus the derived
  // search — so a story that starts with no selection can
  // still accept a search and add its first recipe. Only the
  // stateless props (error, isSearching, isSaving, a caller's
  // onSubmit) ride in `restOverrides`, spread first so the
  // state-driven fields below always win.
  const {
    title: initialTitle,
    notes: initialNotes,
    searchText: initialSearchText,
    selectedRecipes: initialSelectedRecipes,
    servingsByRecipeId: initialServingsByRecipeId,
    ingredients: initialIngredients,
    ...restOverrides
  } = overrides ?? {};
  const [title, setTitle] = useState(initialTitle ?? fixture.title);
  const [notes, setNotes] = useState(initialNotes ?? fixture.notes);
  const [searchText, setSearchText] = useState(initialSearchText ?? fixture.searchText);
  const [selectedRecipes, setSelectedRecipes] = useState<MealFormPageRecipeOption[]>(
    initialSelectedRecipes ?? fixture.selectedRecipes,
  );
  const [servingsByRecipeId, setServingsByRecipeId] = useState<Record<string, number>>(
    initialServingsByRecipeId ?? fixture.servingsByRecipeId,
  );
  const [ingredients, setIngredients] = useState<MealFormPageIngredient[]>(
    initialIngredients ?? [],
  );
  const query = searchText.trim().toLowerCase();
  const searchResults = query
    ? fixture.recipeOptions.filter((recipe) => recipe.label.toLowerCase().includes(query))
    : [];
  return {
    ...restOverrides,
    title,
    onTitleChange: setTitle,
    notes,
    onNotesChange: setNotes,
    searchText,
    onSearchTextChange: setSearchText,
    searchResults,
    selectedRecipes,
    servingsByRecipeId,
    onSelectRecipe: (recipeId) => {
      const recipe = fixture.recipeOptions.find((option) => option.id === recipeId);
      if (recipe) {
        setSelectedRecipes((current) =>
          current.some((option) => option.id === recipeId) ? current : [...current, recipe],
        );
      }
    },
    onRemoveRecipe: (recipeId) => {
      setSelectedRecipes((current) => current.filter((option) => option.id !== recipeId));
    },
    onServingsChange: (recipeId, servings) => {
      setServingsByRecipeId((current) => ({ ...current, [recipeId]: servings }));
    },
    // Direct ingredients (#440): the section renders only for
    // stories that opt in by passing initial ingredients — the
    // harness wires the callbacks only then, mirroring a host
    // that has adopted the section.
    ...(initialIngredients
      ? {
          ingredients,
          onAddIngredient: () => {
            setIngredients((current) => [
              ...current,
              {
                id: `ing-new-${current.length + 1}`,
                name: "",
                quantity: "",
                unit: "",
                servings: "",
              },
            ]);
          },
          onRemoveIngredient: (ingredientId: string) => {
            setIngredients((current) => current.filter((entry) => entry.id !== ingredientId));
          },
          onIngredientChange: (ingredientId: string, patch: Partial<MealFormPageIngredient>) => {
            setIngredients((current) =>
              current.map((entry) => (entry.id === ingredientId ? { ...entry, ...patch } : entry)),
            );
          },
        }
      : {}),
    onSubmit: restOverrides.onSubmit ?? (() => undefined),
  };
}

function Form(props: Partial<MealFormPageProps>) {
  const formProps = useFormProps(props);
  return <MealFormPage footer={eciperayFooterFixture} {...formProps} />;
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
      <Form selectedRecipes={[]} servingsByRecipeId={{}} searchText="" searchResults={[]} />
    </Viewport>
  ),
};

export const WithDirectIngredients: Story = {
  render: () => (
    <Viewport>
      <Form
        selectedRecipes={[]}
        servingsByRecipeId={{}}
        searchText=""
        searchResults={[]}
        ingredients={mealFormFixture.ingredients}
      />
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
