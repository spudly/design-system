import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { mealPlanFormFixture, eciperayFooterFixture } from "../shared/fixtures.js";

import {
  MealPlanFormPage,
  type MealPlanFormPageEntryOption,
  type MealPlanFormPageProps,
} from "./MealPlanFormPage.js";

/**
 * Stories for the real MealPlanFormPage (#125): the meal plan
 * form's view layer, driven by fixture props with the
 * selection, quantity, and servings state held by the story,
 * as the app screen's edit-form hook holds it. Theme pinned
 * to Warm Harvest; the frame matches the other page stories
 * (430×844).
 *
 * The entry picker is a search autocomplete (#383): the
 * story stands in for the host's server-side search by
 * filtering the fixture's entry library by the search text
 * (the Default story opens mid-search, with the Taco Night
 * meal result ready to add over the two selected entries).
 */
const meta: Meta<typeof MealPlanFormPage> = {
  title: "Pages/Eciperay/MealPlanFormPage",
  component: MealPlanFormPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof MealPlanFormPage>;

function useFormProps(overrides?: Partial<MealPlanFormPageProps>): MealPlanFormPageProps {
  const fixture = mealPlanFormFixture;
  // A story's props are the form's INITIAL state, not a fixed
  // overlay: the stateful values (title, notes, dates, search,
  // selection, quantities, servings) seed the hook's state, and
  // the returned props are driven by that state plus the
  // derived search — so a story that starts with no selection
  // can still accept a search and add its first entry. Only
  // the stateless props (error, isSearching, isSaving, a
  // caller's onSubmit) ride in `restOverrides`, spread first
  // so the state-driven fields below always win.
  const {
    title: initialTitle,
    notes: initialNotes,
    startsOn: initialStartsOn,
    endsOn: initialEndsOn,
    searchText: initialSearchText,
    selectedEntries: initialSelectedEntries,
    quantityByKey: initialQuantityByKey,
    servingsByRecipeId: initialServingsByRecipeId,
    servingsToEatByRecipeId: initialServingsToEatByRecipeId,
    dayByKey: initialDayByKey,
    ...restOverrides
  } = overrides ?? {};
  const [title, setTitle] = useState(initialTitle ?? fixture.title);
  const [notes, setNotes] = useState(initialNotes ?? fixture.notes);
  const [startsOn, setStartsOn] = useState(initialStartsOn ?? fixture.startsOn);
  const [endsOn, setEndsOn] = useState(initialEndsOn ?? fixture.endsOn);
  const [searchText, setSearchText] = useState(initialSearchText ?? fixture.searchText);
  const [selectedEntries, setSelectedEntries] = useState<MealPlanFormPageEntryOption[]>(
    initialSelectedEntries ?? fixture.selectedEntries,
  );
  const [quantityByKey, setQuantityByKey] = useState<Record<string, number>>(
    initialQuantityByKey ?? fixture.quantityByKey,
  );
  const [servingsByRecipeId, setServingsByRecipeId] = useState<Record<string, number>>(
    initialServingsByRecipeId ?? fixture.servingsByRecipeId,
  );
  const [servingsToEatByRecipeId, setServingsToEatByRecipeId] = useState<Record<string, number>>(
    initialServingsToEatByRecipeId ?? fixture.servingsToEatByRecipeId,
  );
  const [dayByKey, setDayByKey] = useState<Record<string, string>>(
    initialDayByKey ?? fixture.dayByKey,
  );
  const query = searchText.trim().toLowerCase();
  const searchResults = query
    ? fixture.entryOptions.filter((entry) => entry.title.toLowerCase().includes(query))
    : [];
  return {
    ...restOverrides,
    title,
    onTitleChange: setTitle,
    notes,
    onNotesChange: setNotes,
    startsOn,
    onStartsOnChange: setStartsOn,
    endsOn,
    onEndsOnChange: setEndsOn,
    searchText,
    onSearchTextChange: setSearchText,
    searchResults,
    selectedEntries,
    quantityByKey,
    servingsByRecipeId,
    servingsToEatByRecipeId,
    dayByKey,
    onSelectEntry: (key) => {
      const entry = fixture.entryOptions.find((option) => option.key === key);
      if (entry) {
        setSelectedEntries((current) =>
          current.some((option) => option.key === key) ? current : [...current, entry],
        );
      }
    },
    onRemoveEntry: (key) => {
      setSelectedEntries((current) => current.filter((option) => option.key !== key));
    },
    onQuantityChange: (key, quantity) => {
      setQuantityByKey((current) => ({ ...current, [key]: quantity }));
    },
    onRecipeServingsChange: (recipeId, servings) => {
      setServingsByRecipeId((current) => ({ ...current, [recipeId]: servings }));
    },
    onRecipeServingsToEatChange: (recipeId, servings) => {
      setServingsToEatByRecipeId((current) => ({ ...current, [recipeId]: servings }));
    },
    onDayChange: (key, day) => {
      setDayByKey((current) => ({ ...current, [key]: day }));
    },
    onSubmit: restOverrides.onSubmit ?? (() => {}),
  };
}

function Form(props: Partial<MealPlanFormPageProps>) {
  const formProps = useFormProps(props);
  return <MealPlanFormPage footer={eciperayFooterFixture} {...formProps} />;
}

export const Default: Story = {
  render: () => (
    <>
      <Form />
    </>
  ),
};

export const NoSelection: Story = {
  render: () => (
    <>
      <Form
        selectedEntries={[]}
        quantityByKey={{}}
        servingsByRecipeId={{}}
        servingsToEatByRecipeId={{}}
        dayByKey={{}}
        searchText=""
        searchResults={[]}
      />
    </>
  ),
};

/** The loading state (#874): the form's at-rest shape as
 * bones — heading, field stacks, the notes box, the entry
 * picker's box, and the submit button's box — while the plan
 * the form edits is still resolving. */
export const Loading: Story = {
  render: () => (
    <>
      <Form loading />
    </>
  ),
};

export const DetailsOnly: Story = {
  // Details-only mode (eciperay #646, tranche 1): the host
  // omits every entry prop, so the form is title, notes, and
  // dates alone — the create flow's form, whose submit creates
  // an empty plan and lands on the view page to fill it. The
  // submit button is enabled with a title and no entries.
  render: () => (
    <MealPlanFormPage
      footer={eciperayFooterFixture}
      title="New plan"
      onTitleChange={() => {}}
      notes=""
      onNotesChange={() => {}}
      startsOn="2026-10-19"
      onStartsOnChange={() => {}}
      endsOn="2026-10-25"
      onEndsOnChange={() => {}}
      onSubmit={() => {}}
    />
  ),
};
