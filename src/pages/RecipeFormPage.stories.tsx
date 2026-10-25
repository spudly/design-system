import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, XStack, YStack } from "tamagui";
import { MultilineField } from "../components/MultilineField.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { tokens } from "../tokens/index.js";
import { recipeFormFixture } from "./fixtures.js";
import { RecipeFormPage, type RecipeFormPageProps } from "./RecipeFormPage.js";

/**
 * Stories for the real RecipeFormPage component (#124) — the
 * recipe form's view layer, driven by fixture props in a stateful
 * harness (the page is controlled; the harness plays the app
 * host's part). The three slotted sections render stand-ins
 * composed from DS fields: in the app those slots carry the app's
 * own image field and sortable lists, which stay app-side pending
 * the contract picks proposed on #124 — the stand-ins mirror their
 * layout (preview frame; qty/unit/name rows; numbered step rows)
 * so the page's composition and full height are what the
 * screenshots guard.
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

function ImageSectionStandIn({ revertAction }: { revertAction: ReactNode }) {
  return (
    <YStack gap="$2">
      <XStack alignItems="center" justifyContent="space-between" gap="$2">
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.medium}
          color={tokens.colors.gray.gray8}
        >
          Recipe image
        </Text>
        {revertAction}
      </XStack>
      <YStack
        overflow="hidden"
        borderRadius={tokens.radii.md}
        borderWidth={2}
        borderStyle="dashed"
        borderColor={tokens.colors.gray.gray4}
        backgroundColor={tokens.colors.gray.gray1}
        paddingVertical="$6"
        alignItems="center"
      >
        <Text variant="hint">Choose an image from your library or generate one with AI</Text>
      </YStack>
    </YStack>
  );
}

const ingredientRows = [
  { quantity: "1 1/2", unit: "lb", name: "Chicken breasts" },
  { quantity: "4", unit: "", name: "Garlic cloves" },
  { quantity: "1", unit: "cup", name: "Heavy cream" },
];

function IngredientsSectionStandIn() {
  const [rows, setRows] = useState(ingredientRows);
  return (
    <YStack gap="$2">
      <Text
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.gray.gray8}
      >
        Ingredients
      </Text>
      {rows.map((row, index) => (
        <XStack key={row.name} gap="$2">
          <TextField
            accessibilityLabel={`Quantity ${index + 1}`}
            value={row.quantity}
            onChangeText={(value) => {
              setRows((prev) => prev.map((r, i) => (i === index ? { ...r, quantity: value } : r)));
            }}
          />
          <TextField
            accessibilityLabel={`Name ${index + 1}`}
            value={row.name}
            onChangeText={(value) => {
              setRows((prev) => prev.map((r, i) => (i === index ? { ...r, name: value } : r)));
            }}
          />
        </XStack>
      ))}
    </YStack>
  );
}

const instructionRows = [
  "Season the chicken and sear in a large skillet until golden.",
  "Pour in the cream and simmer gently until the sauce thickens.",
];

function InstructionsSectionStandIn() {
  const [rows, setRows] = useState(instructionRows);
  return (
    <YStack gap="$2">
      <Text
        fontSize={tokens.typography.fontSize.sm}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.gray.gray8}
      >
        Instructions
      </Text>
      {rows.map((row, index) => (
        <MultilineField
          key={index}
          accessibilityLabel={`Step ${index + 1}`}
          numberOfLines={2}
          value={row}
          onChangeText={(value) => {
            setRows((prev) => prev.map((r, i) => (i === index ? value : r)));
          }}
        />
      ))}
    </YStack>
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
  const noop = () => undefined;
  return (
    <RecipeFormPage
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
      renderImageSection={(revertAction) => <ImageSectionStandIn revertAction={revertAction} />}
      renderIngredientsSection={() => <IngredientsSectionStandIn />}
      renderInstructionsSection={() => <InstructionsSectionStandIn />}
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
