import { YStack } from "tamagui";
import { Button } from "./Button.js";
import { SectionCard } from "./SectionCard.js";
import { Text } from "./Text.js";
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

export function NutritionGoalsForm({
  goals,
  onChange,
  saving = false,
  error,
  onSave,
}: NutritionGoalsFormProps) {
  const patch = (partial: Partial<NutritionGoalsValues>) => {
    onChange({ ...goals, ...partial });
  };

  return (
    <SectionCard title="Daily nutrition goals">
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
      {error ? <Text variant="error">{error}</Text> : null}
      <YStack marginTop="$3">
        <Button variant="primary" disabled={saving} onPress={onSave}>
          Save goals
        </Button>
      </YStack>
    </SectionCard>
  );
}
