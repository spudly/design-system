import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import {
  AutocompletePicker,
  type AutocompletePickerResult,
  type AutocompletePickerSelectedItem,
} from "./AutocompletePicker.js";

const meta: Meta<typeof AutocompletePicker> = {
  title: "Widgets/AutocompletePicker",
  component: AutocompletePicker,
};

export default meta;
type Story = StoryObj<typeof AutocompletePicker>;

/**
 * The simulated library the demo searches — story-local data
 * standing in for the host's server-side search: the demo
 * filters it by the search text, as a host's endpoint would.
 */
const LIBRARY: AutocompletePickerResult[] = [
  { id: "tuscan-chicken", label: "Creamy Tuscan Garlic Chicken", detail: "4 servings" },
  { id: "stuffed-peppers", label: "Classic Stuffed Peppers", detail: "6 servings" },
  { id: "arroz-con-pollo", label: "Arroz con Pollo", detail: "8 servings" },
  { id: "fudgy-brownies", label: "Fudgy Brownies", detail: "12 servings" },
];

function PickerDemo({
  initialSearchText = "",
  initialSelectedIds = ["tuscan-chicken"],
  isSearching = false,
  searchError,
}: {
  initialSearchText?: string;
  initialSelectedIds?: string[];
  isSearching?: boolean;
  searchError?: string;
}) {
  const [searchText, setSearchText] = useState(initialSearchText);
  const [selectedItems, setSelectedItems] = useState<AutocompletePickerSelectedItem[]>(
    LIBRARY.filter((item) => initialSelectedIds.includes(item.id)).map((item) => ({
      id: item.id,
      label: item.label,
    })),
  );
  const query = searchText.trim().toLowerCase();
  // A failed search (searchError set) loads no results at
  // all — that is exactly the state #393 is about.
  const searchResults = searchError
    ? []
    : query
      ? LIBRARY.filter((item) => item.label.toLowerCase().includes(query))
      : [];
  return (
    <YStack maxWidth={430}>
      <AutocompletePicker
        searchText={searchText}
        onSearchTextChange={setSearchText}
        searchResults={searchResults}
        isSearching={isSearching}
        searchError={searchError}
        onSelectResult={(id) => {
          const result = LIBRARY.find((item) => item.id === id);
          if (result) {
            setSelectedItems((current) => [...current, { id: result.id, label: result.label }]);
          }
        }}
        selectedItems={selectedItems}
        onRemoveSelectedItem={(id) => {
          setSelectedItems((current) => current.filter((item) => item.id !== id));
        }}
        placeholder="Search recipes…"
        searchAccessibilityLabel="Search recipes"
      />
    </YStack>
  );
}

export const WithResults: Story = {
  render: () => <PickerDemo initialSearchText="peppers" />,
};

export const NoSelection: Story = {
  render: () => <PickerDemo initialSelectedIds={[]} />,
};

export const Searching: Story = {
  render: () => <PickerDemo initialSearchText="chicken" isSearching />,
};

export const NoResults: Story = {
  render: () => <PickerDemo initialSearchText="sushi" />,
};

/**
 * The search FAILED (#393): the picker shows the error —
 * never "No results found." — because the search did not
 * actually match nothing; it never completed.
 */
export const SearchError: Story = {
  render: () => (
    <PickerDemo
      initialSearchText="chicken"
      initialSelectedIds={[]}
      searchError="Could not load recipes: network error."
    />
  ),
};
