import { Alert } from "../widgets/Alert.js";
import { YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { Center } from "../widgets/Center.js";
import { Button } from "../widgets/Button.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "../widgets/TextSkeleton.js";
import { TextField } from "./TextField.js";

/**
 * NutritionGoalsForm (#126, B3c): the daily nutrition goals
 * section of the profile screen — the split view half of
 * Eciperay's `NutritionGoalsFormView` (the B2 audit's
 * page-view (section) disposition). The app screen keeps the
 * goals query, the form state as a whole, and the save
 * mutation; this section renders the fields and reports
 * whole-goals changes.
 *
 * The values cross as the goals view-model (numbers or null),
 * and each field's text parse/format is presentation that
 * lives in the view, exactly as in the app view: an empty or
 * non-numeric field crosses back as null. The section
 * validates nothing — the host owns the save.
 */

export type NutritionGoalsValues = {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  satietyScore: number | null;
};

export type NutritionGoalsFormProps = {
  goals: NutritionGoalsValues;
  onChange: (goals: NutritionGoalsValues) => void;
  saving?: boolean;
  error?: string | null;
  onSave: () => void;
  /** Loading state (#278): the section title skeletonizes
   * through the SectionCard, each of the five goal fields
   * renders as a label text skeleton at its own (sm) size over
   * a field-height box skeleton in the field's slot instead of
   * the live TextField, the Save action stays rendered inside
   * the card's loading scope so the Button renders as a
   * rectangle skeleton at its normal geometry, and the error
   * is hidden — no real goal values show. An enclosing
   * composite's LoadingScope can also put the form into this
   * state without prop-drilling. */
  loading?: boolean;
};

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function formatGoalValue(value: number | null): string {
  return value === null ? "" : String(value);
}

function GoalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <TextField
      label={label}
      value={formatGoalValue(value)}
      onChangeText={(text) => {
        onChange(parseOptionalNumber(text));
      }}
      placeholder="Optional"
    />
  );
}

// The loading form's field keys (#278): the five goal fields in
// display order, from a frozen module-level constant — never
// generated per render. Each skeleton field mirrors a
// TextField's own stack: the label's gap ($1) over the input,
// whose minimum height is 44. The label bone sits centered in
// the field Label's own line box (SIZABLE_TEXT_LINE_BOX, 27) —
// a TextSkeleton sm line box (16) in its place leaves each
// field 11px short, and the five fields accumulate the drift,
// so the bones slide off the loaded form (Stephen on #579).
const LOADING_GOAL_FIELD_KEYS = ["calories", "protein", "carbs", "fat", "satiety"] as const;

function GoalFieldSkeleton() {
  return (
    <YStack gap="$1">
      <Center width="35%" height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
        <TextSkeleton size="sm" lines={1} />
      </Center>
      <BoxSkeleton height={44} />
    </YStack>
  );
}

export function NutritionGoalsForm({
  goals,
  onChange,
  saving = false,
  error,
  onSave,
  loading = false,
}: NutritionGoalsFormProps) {
  const showSkeleton = useLoadingScope(loading);
  const patch = (partial: Partial<NutritionGoalsValues>) => {
    onChange({ ...goals, ...partial });
  };

  return (
    <SectionCard title="Daily nutrition goals" loading={showSkeleton}>
      {showSkeleton ? (
        LOADING_GOAL_FIELD_KEYS.map((key) => <GoalFieldSkeleton key={key} />)
      ) : (
        <>
          <GoalField
            label="Calories"
            value={goals.calories}
            onChange={(calories) => {
              patch({ calories });
            }}
          />
          <GoalField
            label="Protein (g)"
            value={goals.proteinG}
            onChange={(proteinG) => {
              patch({ proteinG });
            }}
          />
          <GoalField
            label="Carbs (g)"
            value={goals.carbsG}
            onChange={(carbsG) => {
              patch({ carbsG });
            }}
          />
          <GoalField
            label="Fat (g)"
            value={goals.fatG}
            onChange={(fatG) => {
              patch({ fatG });
            }}
          />
          <GoalField
            label="Satiety score"
            value={goals.satietyScore}
            onChange={(satietyScore) => {
              patch({ satietyScore });
            }}
          />
        </>
      )}
      {error && !showSkeleton ? <Alert severity="error" message={error} /> : null}
      <YStack paddingTop="$3">
        <Button variant="primary" disabled={saving} onPress={onSave}>
          Save goals
        </Button>
      </YStack>
    </SectionCard>
  );
}
