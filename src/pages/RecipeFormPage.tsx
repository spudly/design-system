import type { ReactNode } from "react";
import { ScrollView, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { Alert } from "../components/Alert.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";
import { TextField } from "../components/TextField.js";
import { ToggleChipGroup } from "../components/ToggleChipGroup.js";

/**
 * RecipeFormPage (#124, B3a): the recipe form's view layer — the
 * split view half of Eciperay's `RecipeForm` (the B2 audit's mixed
 * disposition: form view to the DS, the rest stays app-side). The
 * three screens that compose it — create (ManualEntry), edit recipe
 * (EditRecipe), edit draft version (EditVersion) — render it through
 * the shell pages in this folder (ManualEntryPage, EditRecipePage,
 * EditVersionPage), the same shell/body split the app screens have.
 *
 * The contract follows the #49 pattern, extended to a form:
 * - Controlled scalar values, one prop + one change callback per
 *   field (the RecipesPage filter idiom): the app host owns the
 *   form state, and with it everything the audit leaves app-side —
 *   parent-version diffing, the AI description/image calls, image
 *   upload, field validation, and submission. This view validates
 *   nothing and submits nothing: `onSubmit` is a bare intent, and
 *   the host builds the recipe input from its own state.
 * - Option data is app data: status options and tag options cross
 *   as { value, label } view-models (the app owns the status set
 *   and the tags query); the chips themselves are the DS
 *   ToggleChipGroup. Tag loading crosses as `isLoadingTags` — the
 *   view renders the DS Spinner where the app renders its branded
 *   loader (the branded loader stays app-side by recorded decision).
 * - Version-diff presentation is view-model data: the host computes
 *   which fields changed (`changedFields`), the pre-formatted
 *   revert hint for each (`revertLabels`), and the changed-list
 *   banner lines; the view renders the DS fields' `changed` wash
 *   and the revert affordances, and reports revert intents through
 *   `onRevertField` / `onRevertTags` / `onRevertIngredients` /
 *   `onRevertInstructions`. Diffing itself never enters the view.
 * - Three sections are render slots, pending the contract picks
 *   proposed on #124: the image field (its picker invocation is
 *   native-only), and the sortable ingredient / instruction lists
 *   (built app-side on a drag library with no web equivalent).
 *   `renderImageSection` receives the image field's revert
 *   affordance as its argument — the app field renders that node in
 *   its header row, exactly where the app form puts it today; the
 *   list slots take no argument (the #49 `renderComments` shape).
 *   While `contentLocked` is set, the list slots are not rendered
 *   at all and the lock notice renders in their place — the app's
 *   behavior on the active version.
 *
 * Documented deviations from the app form's current rendering:
 * - The "Generate with AI" buttons use the DS ghost Button
 *   treatment as designed; the app form's instance-level border /
 *   background overrides on those buttons do not cross.
 * - The app form's label rows were bespoke text; here every label
 *   row is the same composition, and the scalar fields render
 *   through the DS TextField / TextAreaField chrome (with the
 *   `changed` variant carrying the diff wash — see TextField).
 */

export type RecipeFormPageField =
  "title" | "description" | "servings" | "prepTimeMin" | "cookTimeMin" | "sourceUrl" | "image";

export interface RecipeFormPageOption {
  value: string;
  label: string;
}

export interface RecipeFormPageProps {
  /** Controlled field values (text — the host parses numerics). */
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  servings: string;
  onServingsChange: (value: string) => void;
  prepTimeMin: string;
  onPrepTimeMinChange: (value: string) => void;
  cookTimeMin: string;
  onCookTimeMinChange: (value: string) => void;
  sourceUrl: string;
  onSourceUrlChange: (value: string) => void;

  /** Status picker: the option set is app data (statuses + labels). */
  statusOptions: RecipeFormPageOption[];
  status: string;
  onStatusChange: (value: string) => void;

  /** Tag picker: options come from the host's tags query. */
  tagOptions: RecipeFormPageOption[];
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
  /** Tags query in flight: a spinner renders in place of the chips. */
  isLoadingTags?: boolean;

  /** Version-diff presentation (host-computed; see the header). A
   * field listed here gets the `changed` wash and, when its revert
   * label and the callback are provided, its revert affordance. */
  changedFields?: readonly RecipeFormPageField[];
  /** Pre-formatted parent-value hint per field, rendered after
   * "Revert to: " (the host formats parent values its own way). */
  revertLabels?: Partial<Record<RecipeFormPageField, string>>;
  onRevertField?: (field: RecipeFormPageField) => void;
  /** Tags-changed revert hint (parent tag names, host-formatted);
   * its presence renders the tags row's revert affordance. */
  tagsRevertLabel?: string;
  onRevertTags?: () => void;
  /** Changed-list banner lines (host-formatted, parent summary
   * included); presence renders the banner above its list slot. */
  ingredientsChangedLabel?: string;
  onRevertIngredients?: () => void;
  instructionsChangedLabel?: string;
  onRevertInstructions?: () => void;

  /** AI description generation: the call and its state stay
   * app-side; the button renders only when the callback is given. */
  onGenerateDescription?: () => void;
  isGeneratingDescription?: boolean;
  descriptionError?: string | null;

  /** Active-version lock: the list slots are replaced by the lock
   * notice; scalars and tags stay editable (the app's behavior). */
  contentLocked?: boolean;

  /** Slot: the app's image field. Receives the image revert
   * affordance (or null) for its header row — see the header. */
  renderImageSection?: (revertAction: ReactNode) => ReactNode;
  /** Slot: the app's sortable ingredient list. */
  renderIngredientsSection?: () => ReactNode;
  /** Slot: the app's sortable instruction list. */
  renderInstructionsSection?: () => ReactNode;

  /** Submit row: a bare intent out; the label is the host's
   * ("Create Recipe" / "Save Changes" / "Save Draft"). */
  submitLabel: string;
  /** Save in flight: the button disables and shows
   * `submittingLabel`. */
  isSubmitting?: boolean;
  submittingLabel?: string;
  /** Host-reported save failure, rendered above the submit row. */
  submitError?: string | null;
  onSubmit: () => void;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize={tokens.typography.fontSize.sm}
      fontWeight={tokens.typography.fontWeight.medium}
      color={tokens.colors.gray.gray8}
    >
      {children}
    </Text>
  );
}

function LabelRow({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <XStack marginBlockEnd="$1" alignItems="center" justifyContent="space-between" gap="$3">
      <FieldLabel>{label}</FieldLabel>
      {action ?? null}
    </XStack>
  );
}

/** The version-diff revert affordance: small warning-tone text,
 * pressable (the app's RevertButton treatment). Web keyboard support
 * follows the MealPlansPage row pattern — Enter and Space invoke
 * the same callback as a press. */
function RevertAction({ label, onPress }: { label: string; onPress: () => void }) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <YStack
      accessibilityRole="button"
      onPress={onPress}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      cursor="web:pointer"
    >
      <Text
        fontSize={tokens.typography.fontSize.xs}
        fontWeight={tokens.typography.fontWeight.medium}
        color={tokens.colors.warning.warning9}
        opacity={0.8}
      >
        {`Revert to: ${label}`}
      </Text>
    </YStack>
  );
}

/** The changed-list banner: warning wash row with the host's
 * summary line and an underlined Revert action (the app form's
 * treatment for a list that differs from the parent version). */
function ChangedListBanner({ label, onRevert }: { label: string; onRevert?: () => void }) {
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if ((event.key === "Enter" || event.key === " ") && onRevert) {
      event.preventDefault();
      onRevert();
    }
  };
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$2"
      borderRadius={tokens.radii.md}
      backgroundColor={tokens.colors.warning.warning1}
      paddingHorizontal="$3"
      paddingVertical="$2"
    >
      <Text
        flex={1}
        fontSize={tokens.typography.fontSize.sm}
        color={tokens.colors.warning.warning10}
      >
        {label}
      </Text>
      {onRevert ? (
        <YStack
          accessibilityRole="button"
          onPress={onRevert}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          cursor="web:pointer"
        >
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.medium}
            color={tokens.colors.warning.warning10}
            textDecorationLine="underline"
          >
            Revert
          </Text>
        </YStack>
      ) : null}
    </XStack>
  );
}

export function RecipeFormPage(props: RecipeFormPageProps) {
  const {
    title,
    onTitleChange,
    description,
    onDescriptionChange,
    servings,
    onServingsChange,
    prepTimeMin,
    onPrepTimeMinChange,
    cookTimeMin,
    onCookTimeMinChange,
    sourceUrl,
    onSourceUrlChange,
    statusOptions,
    status,
    onStatusChange,
    tagOptions,
    tagIds,
    onTagIdsChange,
    isLoadingTags = false,
    changedFields = [],
    revertLabels = {},
    onRevertField,
    tagsRevertLabel,
    onRevertTags,
    ingredientsChangedLabel,
    onRevertIngredients,
    instructionsChangedLabel,
    onRevertInstructions,
    onGenerateDescription,
    isGeneratingDescription = false,
    descriptionError,
    contentLocked = false,
    renderImageSection,
    renderIngredientsSection,
    renderInstructionsSection,
    submitLabel,
    isSubmitting = false,
    submittingLabel = "Saving…",
    submitError,
    onSubmit,
  } = props;

  const isChanged = (field: RecipeFormPageField) => changedFields.includes(field);
  const revertAction = (field: RecipeFormPageField): ReactNode => {
    const label = revertLabels[field];
    if (!isChanged(field) || !label || !onRevertField) {
      return null;
    }
    return (
      <RevertAction
        label={label}
        onPress={() => {
          onRevertField(field);
        }}
      />
    );
  };

  const toggleTag = (value: string) => {
    onTagIdsChange(
      tagIds.includes(value) ? tagIds.filter((id) => id !== value) : [...tagIds, value],
    );
  };

  return (
    <ScrollView flex={1} keyboardShouldPersistTaps="handled">
      <YStack gap="$4" paddingBlockEnd="$8">
        <YStack>
          <LabelRow label="Title" action={revertAction("title")} />
          <TextField
            accessibilityLabel="Title"
            changed={isChanged("title")}
            value={title}
            onChangeText={onTitleChange}
          />
        </YStack>

        <YStack>
          <LabelRow label="Status" />
          <ToggleChipGroup
            mode="single"
            options={statusOptions}
            value={status}
            onChange={onStatusChange}
          />
        </YStack>

        <YStack>
          <XStack marginBlockEnd="$1" alignItems="center" justifyContent="space-between" gap="$3">
            <FieldLabel>Description</FieldLabel>
            <XStack alignItems="center" gap="$2">
              {revertAction("description")}
              {onGenerateDescription ? (
                <Button
                  variant="ghost"
                  size="sm"
                  accessibilityLabel="Generate description with AI"
                  disabled={!title.trim() || isGeneratingDescription}
                  onPress={onGenerateDescription}
                >
                  {isGeneratingDescription ? "Generating…" : "Generate with AI"}
                </Button>
              ) : null}
            </XStack>
          </XStack>
          <TextAreaField
            accessibilityLabel="Description"
            changed={isChanged("description")}
            numberOfLines={3}
            value={description}
            onChangeText={onDescriptionChange}
          />
          {descriptionError ? (
            <Text variant="error" marginBlockStart="$2">
              {descriptionError}
            </Text>
          ) : null}
        </YStack>

        <XStack gap="$3">
          <YStack flex={1}>
            <LabelRow label="Servings" action={revertAction("servings")} />
            <TextField
              accessibilityLabel="Servings"
              changed={isChanged("servings")}
              keyboardType="number-pad"
              value={servings}
              onChangeText={onServingsChange}
            />
          </YStack>
          <YStack flex={1}>
            <LabelRow label="Prep (min)" action={revertAction("prepTimeMin")} />
            <TextField
              accessibilityLabel="Prep (min)"
              changed={isChanged("prepTimeMin")}
              keyboardType="number-pad"
              value={prepTimeMin}
              onChangeText={onPrepTimeMinChange}
            />
          </YStack>
          <YStack flex={1}>
            <LabelRow label="Cook (min)" action={revertAction("cookTimeMin")} />
            <TextField
              accessibilityLabel="Cook (min)"
              changed={isChanged("cookTimeMin")}
              keyboardType="number-pad"
              value={cookTimeMin}
              onChangeText={onCookTimeMinChange}
            />
          </YStack>
        </XStack>

        {renderImageSection ? renderImageSection(revertAction("image")) : null}

        <YStack>
          <LabelRow label="Source URL" action={revertAction("sourceUrl")} />
          <TextField
            accessibilityLabel="Source URL"
            changed={isChanged("sourceUrl")}
            value={sourceUrl}
            onChangeText={onSourceUrlChange}
          />
        </YStack>

        <YStack>
          <XStack marginBlockEnd="$2" alignItems="center" justifyContent="space-between" gap="$2">
            <FieldLabel>Tags</FieldLabel>
            {tagsRevertLabel && onRevertTags ? (
              <RevertAction label={tagsRevertLabel} onPress={onRevertTags} />
            ) : null}
          </XStack>
          {isLoadingTags ? (
            <Spinner label="Loading tags" />
          ) : (
            <ToggleChipGroup
              mode="multiple"
              options={tagOptions}
              values={tagIds}
              onChange={toggleTag}
            />
          )}
        </YStack>

        {contentLocked ? (
          <Alert severity="warning">
            Ingredients and instructions are locked on the active version. Create a draft to change
            them.
          </Alert>
        ) : null}

        {ingredientsChangedLabel && !contentLocked ? (
          <ChangedListBanner
            label={ingredientsChangedLabel}
            {...(onRevertIngredients ? { onRevert: onRevertIngredients } : {})}
          />
        ) : null}
        {contentLocked ? null : renderIngredientsSection ? renderIngredientsSection() : null}

        {instructionsChangedLabel && !contentLocked ? (
          <ChangedListBanner
            label={instructionsChangedLabel}
            {...(onRevertInstructions ? { onRevert: onRevertInstructions } : {})}
          />
        ) : null}
        {contentLocked ? null : renderInstructionsSection ? renderInstructionsSection() : null}

        {submitError ? <Text variant="error">{submitError}</Text> : null}
        <Button alignSelf="stretch" disabled={isSubmitting} onPress={onSubmit}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </YStack>
    </ScrollView>
  );
}
