import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import type { TagColorName } from "../../themes/tagColors.js";
import { CheckboxField } from "./CheckboxField.js";
import { FormHeading } from "../content/FormHeading.js";
import { NumberStepper } from "./NumberStepper.js";
import {
  AutocompletePicker,
  type AutocompletePickerResult,
  type AutocompletePickerSelectedItem,
} from "./AutocompletePicker.js";
import { CheckboxSelectList } from "./CheckboxSelectList.js";
import { ColorPickerField } from "./ColorPickerField.js";
import { PasswordField } from "./PasswordField.js";
import { PresetValueSelector } from "./PresetValueSelector.js";
import { RadioOptionGroup } from "./RadioOptionGroup.js";
import { SearchField } from "./SearchField.js";
import { SelectField } from "./SelectField.js";
import { Slider } from "./Slider.js";
import { StarRatingInput } from "./StarRatingInput.js";
import { Switch } from "./Switch.js";
import { TextAreaField } from "./TextAreaField.js";
import { TextField } from "./TextField.js";
import { Col } from "../layout/Col.js";

/**
 * Composite story (#711): every form widget rendered together in one
 * realistic form layout, so cross-widget inconsistencies — field
 * heights, label spacing, focus rings, disabled coverage — are
 * visible at a glance instead of hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 *
 * Disabled coverage: every control in this form accepts a
 * `disabled` prop (#801), and the Disabled story below disables
 * all of them.
 */
const meta: Meta = {
  title: "Widgets/Form/Composite: Full Form",
};

export default meta;
type Story = StoryObj;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "evolving", label: "Evolving" },
  { value: "final", label: "Final" },
];

const IMPORT_OPTIONS = [
  { value: "url", label: "From URL", description: "Import a recipe from a web link." },
  { value: "text", label: "From text", description: "Paste recipe text to parse." },
  { value: "manual", label: "Manual entry", description: "Type the recipe yourself." },
];

const TAG_ITEMS = [
  { id: "weeknight", label: "Weeknight" },
  { id: "kid-friendly", label: "Kid-friendly" },
  { id: "freezer", label: "Freezer-friendly" },
];

const SCALE_OPTIONS = [
  { value: "0.5", label: "½×" },
  { value: "1", label: "1×" },
  { value: "2", label: "2×" },
  { value: "3", label: "3×" },
];

const TAG_COLORS: TagColorName[] = ["orange", "green", "indigo", "amber", "pink", "teal"];

const LIBRARY: AutocompletePickerResult[] = [
  { id: "tuscan-chicken", label: "Creamy Tuscan Garlic Chicken", detail: "4 servings" },
  { id: "stuffed-peppers", label: "Classic Stuffed Peppers", detail: "6 servings" },
  { id: "arroz-con-pollo", label: "Arroz con Pollo", detail: "8 servings" },
  { id: "fudgy-brownies", label: "Fudgy Brownies", detail: "12 servings" },
];

type CompositeMode = "empty" | "filled" | "errors" | "disabled";

function FullForm({ mode }: { mode: CompositeMode }) {
  const filled = mode === "filled";
  const errors = mode === "errors";
  const disabled = mode === "disabled";

  const [name, setName] = useState(filled ? "Creamy Tuscan Garlic Chicken" : "");
  const [password, setPassword] = useState(filled ? "correct horse battery staple" : "");
  const [notes, setNotes] = useState(filled ? "Double the garlic; kids asked for seconds." : "");
  const [search, setSearch] = useState(filled ? "pasta" : "");
  const [status, setStatus] = useState(filled ? "evolving" : "");
  const [importMethod, setImportMethod] = useState(filled ? "url" : "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(filled ? ["weeknight"] : []);
  const [notify, setNotify] = useState(filled);
  const [pinned, setPinned] = useState(false);
  const [servings, setServings] = useState(4);
  const [spice, setSpice] = useState(filled ? 6 : 3);
  const [rating, setRating] = useState(filled ? 4 : 0);
  const [tagColor, setTagColor] = useState<TagColorName | undefined>(filled ? "orange" : undefined);
  const [scale, setScale] = useState("1");
  const [pickerSearch, setPickerSearch] = useState("");
  const [picked, setPicked] = useState<AutocompletePickerSelectedItem[]>(
    filled ? [{ id: "tuscan-chicken", label: "Creamy Tuscan Garlic Chicken" }] : [],
  );

  const query = pickerSearch.trim().toLowerCase();
  const searchResults = query
    ? LIBRARY.filter((item) => item.label.toLowerCase().includes(query))
    : [];

  return (
    <YStack maxWidth={430}>
      <Col gap="m">
        <FormHeading subtitle="Every form widget, one layout">Recipe details</FormHeading>
        <TextField
          label="Recipe name"
          placeholder="e.g. Weeknight pasta"
          value={name}
          onChangeText={setName}
          disabled={disabled}
          {...(errors ? { error: "Name is required." } : {})}
        />
        <PasswordField
          label="Account password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
          showPasswordLabel="Show password"
          hidePasswordLabel="Hide password"
          disabled={disabled}
          {...(errors ? { error: "Password is required." } : {})}
        />
        <TextAreaField
          label="Recipe notes"
          placeholder="Anything worth remembering next time…"
          value={notes}
          onChangeText={setNotes}
          disabled={disabled}
          {...(errors ? { error: "Please add a note." } : {})}
        />
        <SearchField
          label="Search recipes"
          placeholder="Search recipes…"
          value={search}
          onChangeText={setSearch}
          disabled={disabled}
          {...(errors ? { error: "Enter a search term." } : {})}
        />
        <SelectField
          label="Recipe status"
          options={STATUS_OPTIONS}
          value={status}
          onValueChange={setStatus}
          disabled={disabled}
          {...(errors ? { error: "Please choose a status." } : {})}
        />
        <AutocompletePicker
          searchText={pickerSearch}
          onSearchTextChange={setPickerSearch}
          searchResults={searchResults}
          isSearching={false}
          {...(errors ? { error: "Pick at least one recipe." } : {})}
          onSelectResult={(id) => {
            const result = LIBRARY.find((item) => item.id === id);
            if (result) {
              setPicked((current) => [...current, { id: result.id, label: result.label }]);
            }
          }}
          selectedItems={picked}
          disabled={disabled}
          onRemoveSelectedItem={(id) => {
            setPicked((current) => current.filter((item) => item.id !== id));
          }}
        />
        <RadioOptionGroup
          label="Add recipe"
          options={IMPORT_OPTIONS}
          value={importMethod}
          onValueChange={setImportMethod}
          disabled={disabled}
          {...(errors ? { error: "Please choose an import method." } : {})}
        />
        <CheckboxSelectList
          items={TAG_ITEMS}
          selectedIds={selectedTagIds}
          disabled={disabled}
          {...(errors ? { error: "Pick at least one tag." } : {})}
          onToggle={(id) => {
            setSelectedTagIds((previous) =>
              previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
            );
          }}
        />
        <ColorPickerField
          disabled={disabled}
          label="Tag color"
          colors={TAG_COLORS}
          {...(tagColor !== undefined ? { value: tagColor } : {})}
          onChange={setTagColor}
          {...(errors ? { error: "Pick a color for this tag." } : {})}
        />
        <PresetValueSelector
          label="Scale"
          options={SCALE_OPTIONS}
          value={scale}
          onChange={setScale}
          customLabel="Custom"
          customAccessibilityLabel="Custom scale"
          formatCustomValue={(custom) => `${custom}×`}
          disabled={disabled}
          {...(errors ? { error: "Choose a scale." } : {})}
        />
        <NumberStepper
          label="Servings"
          value={servings}
          min={1}
          max={12}
          onChange={setServings}
          disabled={disabled}
          {...(errors ? { error: "Servings must be at least 1." } : {})}
        />
        <Slider
          label="Spice level"
          min={1}
          max={10}
          value={spice}
          onValueChange={setSpice}
          disabled={disabled}
          {...(errors ? { error: "Choose a spice level." } : {})}
        />
        <StarRatingInput
          label="Rate this recipe"
          value={rating}
          onChange={setRating}
          disabled={disabled}
          {...(errors ? { error: "Please rate this recipe." } : {})}
        />
        <CheckboxField
          label="Email me new recipes"
          description="One digest a week, no spam."
          checked={notify}
          onCheckedChange={setNotify}
          disabled={disabled}
          {...(errors ? { error: "Choose whether to get the digest." } : {})}
        />
        <Switch
          label="Pin to favorites"
          description="Keep this recipe at the top of your list."
          checked={pinned}
          onCheckedChange={setPinned}
          disabled={disabled}
          {...(errors ? { error: "Choose whether to pin this recipe." } : {})}
        />
      </Col>
    </YStack>
  );
}

/** Every form control in its default, empty state. */
export const Empty: Story = {
  render: () => <FullForm mode="empty" />,
};

/** The same form fully populated, as a returning user would see it. */
export const Filled: Story = {
  render: () => <FullForm mode="filled" />,
};

/** Every control in its error form (#804): each renders its error through the shared Alert treatment. */
export const WithErrors: Story = {
  render: () => <FullForm mode="errors" />,
};

/** Disabled treatment across every control in the form (#801). */
export const Disabled: Story = {
  render: () => <FullForm mode="disabled" />,
};
