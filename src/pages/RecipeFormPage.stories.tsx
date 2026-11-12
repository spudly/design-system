import { useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import type { RecipeIngredientRow } from "../views/RecipeIngredientListView.js";
import type { RecipeInstructionRow } from "../views/RecipeInstructionListView.js";
import { Button } from "../widgets/Button.js";
import { storyImageWide } from "../storyFixtures.js";
import { recipeFormFixture, eciperayFooterFixture } from "./fixtures.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * Stories for the real RecipeFormPage component (#124) — the
 * recipe form's view layer, driven by fixture props in a stateful
 * harness (the page is controlled; the harness plays the app
 * host's part). The image section renders the real
 * RecipeImageView through the page's `image` data prop (the
 * #124 view-half contract, landed in #130), and the two list
 * sections render the real RecipeIngredientListView /
 * RecipeInstructionListView through the `ingredients` /
 * `instructions` data props (#130, tranche T4), with plain
 * Drag stand-ins bound as the drag handles — in the apps the
 * handles are the hosts' drag-container activators, per
 * Stephen's 2026-11-09 boundary on #130.
 *
 * The frame matches the other page stories: a phone viewport
 * (430×844) pinned so screenshots are deterministic. Theme pinned
 * to Warm Harvest, Eciperay's brand.
 */
const meta: Meta<typeof RecipeFormPage> = {
  title: "Pages/Eciperay/RecipeFormPage",
  component: RecipeFormPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof RecipeFormPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

const ingredientRows: RecipeIngredientRow[] = [
  { key: "chicken", quantity: "1 1/2", unit: "lb", name: "Chicken breasts" },
  { key: "garlic", quantity: "4", unit: "", name: "Garlic cloves" },
  { key: "cream", quantity: "1", unit: "cup", name: "Heavy cream" },
];

const instructionRows: RecipeInstructionRow[] = [
  { key: "sear", body: "Season the chicken and sear in a large skillet until golden." },
  { key: "simmer", body: "Pour in the cream and simmer gently until the sauce thickens." },
];

/** The drag-handle stand-in the harness binds into each row:
 * in the apps this node is the drag container's activator. */
function dragHandle(label: string) {
  return (
    <Button variant="secondary" size="sm" accessibilityLabel={label} onPress={() => undefined}>
      Drag
    </Button>
  );
}

type FormOverrides = Partial<
  Pick<
    RecipeFormPageProps,
    | "contentLocked"
    | "changedFields"
    | "revertLabels"
    | "tagsRevertLabel"
    | "ingredientsChangedLabel"
    | "instructionsChangedLabel"
    | "isSubmitting"
    | "submitError"
  >
>;

function FormHarness({
  submitLabel,
  empty = false,
  ...overrides
}: { submitLabel: string; empty?: boolean } & FormOverrides) {
  const fixture = recipeFormFixture;
  const [title, setTitle] = useState(empty ? "" : fixture.title);
  const [description, setDescription] = useState(empty ? "" : fixture.description);
  const [servings, setServings] = useState(empty ? "4" : fixture.servings);
  const [prepTimeMin, setPrepTimeMin] = useState(empty ? "" : fixture.prepTimeMin);
  const [cookTimeMin, setCookTimeMin] = useState(empty ? "" : fixture.cookTimeMin);
  const [sourceUrl, setSourceUrl] = useState(empty ? "" : fixture.sourceUrl);
  const [status, setStatus] = useState(fixture.status);
  const [tagIds, setTagIds] = useState<string[]>(empty ? [] : fixture.tagIds);
  const [imageUri, setImageUri] = useState<string | null>(empty ? null : storyImageWide);
  const [ingredients, setIngredients] = useState<RecipeIngredientRow[]>(empty ? [] : ingredientRows);
  // Monotonic key counters for added rows: deriving a key from the
  // current row count would reuse a removed row's key on a later add.
  const addedIngredientCount = useRef(0);
  const addedInstructionCount = useRef(0);
  const [instructions, setInstructions] = useState<RecipeInstructionRow[]>(
    empty ? [] : instructionRows,
  );
  const noop = () => undefined;
  return (
    <RecipeFormPage
      footer={eciperayFooterFixture}
      title={title}
      onTitleChange={setTitle}
      description={description}
      onDescriptionChange={setDescription}
      servings={servings}
      onServingsChange={setServings}
      prepTimeMin={prepTimeMin}
      onPrepTimeMinChange={setPrepTimeMin}
      cookTimeMin={cookTimeMin}
      onCookTimeMinChange={setCookTimeMin}
      sourceUrl={sourceUrl}
      onSourceUrlChange={setSourceUrl}
      statusOptions={fixture.statusOptions}
      status={status}
      onStatusChange={setStatus}
      tagOptions={fixture.tagOptions}
      tagIds={tagIds}
      onTagIdsChange={setTagIds}
      onGenerateDescription={noop}
      onRevertField={noop}
      onRevertTags={noop}
      onRevertIngredients={noop}
      onRevertInstructions={noop}
      image={{
        imagePreviewUri: imageUri,
        onPickImageRequest: noop,
        onTakePhotoRequest: noop,
        onGenerateImageRequest: noop,
        onRemoveImage: () => {
          setImageUri(null);
        },
      }}
      ingredients={{
        rows: ingredients,
        onFieldChange: (key, field, value) => {
          setIngredients((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
        },
        onRemove: (key) => {
          setIngredients((prev) => prev.filter((r) => r.key !== key));
        },
        onAdd: () => {
          setIngredients((prev) => [
            ...prev,
            { key: `added-${(addedIngredientCount.current += 1)}`, quantity: "", unit: "", name: "" },
          ]);
        },
        renderDragHandle: (_row, index) => dragHandle(`Reorder ingredient ${index + 1}`),
      }}
      instructions={{
        rows: instructions,
        onBodyChange: (key, value) => {
          setInstructions((prev) => prev.map((r) => (r.key === key ? { ...r, body: value } : r)));
        },
        onRemove: (key) => {
          setInstructions((prev) => prev.filter((r) => r.key !== key));
        },
        onAdd: () => {
          setInstructions((prev) => [...prev, { key: `added-${(addedInstructionCount.current += 1)}`, body: "" }]);
        },
        renderDragHandle: (_row, index) => dragHandle(`Reorder step ${index + 1}`),
      }}
      submitLabel={submitLabel}
      onSubmit={noop}
      {...overrides}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Viewport>
      <FormHarness submitLabel="Create Recipe" />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <FormHarness submitLabel="Create Recipe" empty />
    </Viewport>
  ),
};

/** The active version's lock: list slots are replaced by the lock
 * notice; scalars and tags stay editable. */
export const ContentLocked: Story = {
  render: () => (
    <Viewport>
      <FormHarness submitLabel="Save Changes" contentLocked />
    </Viewport>
  ),
};

/** The version-diff presentation: changed scalars get the warning
 * wash and a revert affordance; changed lists get their banners. */
export const VersionDiff: Story = {
  render: () => (
    <Viewport>
      <FormHarness
        submitLabel="Save Draft"
        changedFields={["title", "servings", "image"]}
        revertLabels={{
          title: "Creamy Tuscan Garlic Chicken (original)",
          servings: "6",
          image: "the parent version's image",
        }}
        tagsRevertLabel="Dinner, Chicken"
        ingredientsChangedLabel="Ingredients changed from parent version (6 ingredients)"
        instructionsChangedLabel="Instructions changed from parent version (4 steps)"
      />
    </Viewport>
  ),
};
