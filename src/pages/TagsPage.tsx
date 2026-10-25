import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { ColorPickerField } from "../components/ColorPickerField.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { TagPill } from "../components/TagPill.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";

/**
 * TagsPage (#126, B3c): the tag management view — the split
 * view half of Eciperay's `TagsView` (the B2 audit's
 * page-view disposition). The screen keeps the tags query and
 * the create/delete mutations; this view renders the create
 * form and the list, and reports intents.
 *
 * The form is controlled (name + color values with change
 * callbacks), the form idiom. The color palette crosses as a
 * prop: the swatches are app data (the app adapter supplies
 * the default palette today), so the host passes its palette
 * and the DS renders the DS ColorPickerField with it.
 *
 * Rows render the DS TagPill (moved in B2) with a delete
 * action; the row card treatment is the app view's, on DS
 * tokens. While `isLoading`, a spinner replaces the list (the
 * DS Spinner stands in for the app's branded loader — the
 * RecipeFormPage precedent).
 */

export interface TagsPageTag {
  id: string;
  name: string;
  color: string;
}

export interface TagsPageProps {
  tags: TagsPageTag[];
  isLoading?: boolean;
  name: string;
  color: string;
  /** The selectable swatch palette — app data, host-supplied. */
  colorOptions: string[];
  onNameChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isCreating?: boolean;
}

export function TagsPage({
  tags,
  isLoading = false,
  name,
  color,
  colorOptions,
  onNameChange,
  onColorChange,
  onCreate,
  onDelete,
  isCreating = false,
}: TagsPageProps) {
  return (
    <ScreenContainer>
      <Text
        variant="subheading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBottom="$4"
      >
        Tags
      </Text>
      <XStack marginBottom="$6" gap="$2">
        <YStack flex={1}>
          <TextField placeholder="Tag name" value={name} onChangeText={onNameChange} />
        </YStack>
        <ColorPickerField colors={colorOptions} value={color} onChange={onColorChange} />
        <Button
          variant="primary"
          disabled={!name.trim() || isCreating}
          onPress={onCreate}
          accessibilityLabel="Add"
        >
          Add
        </Button>
      </XStack>
      {isLoading ? (
        <Spinner label="Loading tags" />
      ) : (
        tags.map((tag) => (
          <XStack
            key={tag.id}
            marginBottom="$2"
            alignItems="center"
            justifyContent="space-between"
            borderRadius={tokens.radii.md}
            backgroundColor="$surface"
            padding="$3"
            shadowColor={tokens.shadows.sm.shadowColor}
            shadowOffset={tokens.shadows.sm.shadowOffset}
            shadowOpacity={tokens.shadows.sm.shadowOpacity}
            shadowRadius={tokens.shadows.sm.shadowRadius}
          >
            <TagPill name={tag.name} color={tag.color} />
            <XStack
              accessibilityRole="button"
              accessibilityLabel={`Delete tag ${tag.name}`}
              onPress={() => {
                onDelete(tag.id);
              }}
              cursor="web:pointer"
            >
              <Text variant="error">Delete</Text>
            </XStack>
          </XStack>
        ))
      )}
    </ScreenContainer>
  );
}
