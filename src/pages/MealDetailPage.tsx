import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { Text } from "../components/Text.js";

/**
 * MealDetailPage (#125, B3b): Eciperay's meal detail screen
 * as a controlled @spudly/ui page — the split view half of
 * `MealDetailView` (the B2 audit's page-view disposition;
 * #125's parenthetical placed this page in #49, but no
 * MealDetailPage shipped there — the discrepancy is recorded
 * on #125, and the audit governs). The app screen keeps the
 * meal query and navigation; this view renders a meal
 * view-model and reports presses.
 *
 * The screen inventory this mirrors, in render order: the
 * meal title, its notes, a nutrition summary line, the
 * Cook meal / Edit action row, and the "Recipes" section —
 * one row per member recipe. The boundary is pre-composed
 * strings (the MealPlanDetailPage precedent): the app's
 * nutrition formatter and its servings line stay app-side,
 * and their output crosses as the page-level
 * `nutritionLabel` and each member's `subtitle`.
 *
 * A member whose access was lost renders its "(unavailable)"
 * suffix and does not press — the page renders the suffix
 * from the member's `isUnavailable` flag, mirroring the app
 * view's disabled row (and MealPlanDetailPage's entry rows).
 *
 * One deliberate treatment difference, as in
 * MealPlanDetailPage: member titles take the theme-aware
 * foreground instead of the app's fixed gray10, which is
 * unreadable on a dark theme's card surface.
 */

export type MealDetailPageMember = {
  recipeId: string;
  title: string;
  /** Pre-composed meta line ("6 servings · 640 cal · 42g
   * protein · satiety 74"); the app composes the servings
   * pluralization and the nutrition summary. */
  subtitle: string;
  /** Access to this recipe was lost: the title gains its
   * "(unavailable)" suffix and the row does not press. */
  isUnavailable?: boolean;
};

export type MealDetailPageProps = {
  title: string;
  /** The meal's notes; omit or pass null to hide the line. */
  notes?: string | null;
  /** The meal's nutrition summary, pre-composed by the
   * app's formatter; omit when the meal has no summary. */
  nutritionLabel?: string | null;
  members: MealDetailPageMember[];
  onCook: () => void;
  onEdit: () => void;
  onRecipePress: (recipeId: string) => void;
};

function MemberRow({
  member,
  onRecipePress,
}: {
  member: MealDetailPageMember;
  onRecipePress: (recipeId: string) => void;
}) {
  const isUnavailable = member.isUnavailable ?? false;
  const handlePress = () => {
    onRecipePress(member.recipeId);
  };
  // Web keyboard support (the MealPlanDetailPage entry-row
  // pattern): Enter and Space invoke the same callback as a
  // press; an unavailable row is not a button at all.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePress();
    }
  };
  return (
    <YStack borderBottomWidth={1} borderBottomColor={tokens.colors.gray.gray2}>
      <YStack
        paddingVertical="$3"
        {...(isUnavailable
          ? { accessibilityState: { disabled: true } }
          : {
              accessibilityRole: "button",
              onPress: handlePress,
              tabIndex: 0,
              onKeyDown: handleKeyDown,
              cursor: "web:pointer",
            })}
      >
        <Text
          fontSize={tokens.typography.fontSize.md}
          fontWeight={tokens.typography.fontWeight.medium}
        >
          {member.title}
          {isUnavailable ? " (unavailable)" : ""}
        </Text>
        <Text variant="hint">{member.subtitle}</Text>
      </YStack>
    </YStack>
  );
}

export function MealDetailPage({
  title,
  notes,
  nutritionLabel,
  members,
  onCook,
  onEdit,
  onRecipePress,
}: MealDetailPageProps) {
  return (
    <ScreenContainer>
      <Text
        variant="subheading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBlockEnd="$4"
      >
        {title}
      </Text>
      {notes ? (
        <Text color="$textMuted" marginBlockEnd="$4" fontSize={tokens.typography.fontSize.sm}>
          {notes}
        </Text>
      ) : null}
      {nutritionLabel ? (
        <Text marginBlockEnd="$4" fontSize={tokens.typography.fontSize.sm} color="$textMuted">
          {nutritionLabel}
        </Text>
      ) : null}
      <XStack marginBlockEnd="$6" flexWrap="wrap" gap="$3">
        <Button onPress={onCook}>Cook meal</Button>
        <Button variant="secondary" onPress={onEdit}>
          Edit
        </Button>
      </XStack>
      <SectionCard title="Recipes">
        {members.map((member) => (
          <MemberRow key={member.recipeId} member={member} onRecipePress={onRecipePress} />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
