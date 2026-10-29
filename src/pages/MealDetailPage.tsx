import { Anchor, XStack, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Button } from "../components/Button.js";
import { LinkOverlay } from "../components/linkOverlay.js";
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
  /** The recipe's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * recipe id. The row renders as a link carrying this href;
   * an unavailable member's row does not render as a link. */
  href: string;
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
  /** The cooking-mode destination (#248: navigation crosses as
   * an href, not a press callback). */
  cookHref: string;
  /** The edit destination (#248). */
  editHref: string;
};

function MemberRow({ member }: { member: MealDetailPageMember }) {
  const isUnavailable = member.isUnavailable ?? false;
  // `decorative` marks the visible texts non-accessible for the
  // native link rendering, whose LinkOverlay carries the composed
  // label as the row's one accessibility stop (see LinkOverlay).
  const renderRowContent = (decorative: boolean) => (
    <>
      <Text
        accessible={decorative ? false : undefined}
        importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.medium}
      >
        {member.title}
        {isUnavailable ? " (unavailable)" : ""}
      </Text>
      <Text
        variant="hint"
        accessible={decorative ? false : undefined}
        importantForAccessibility={decorative ? "no-hide-descendants" : undefined}
      >
        {member.subtitle}
      </Text>
    </>
  );
  const rowContent = renderRowContent(false);
  return (
    <YStack borderBottomWidth={1} borderBottomColor={tokens.colors.gray.gray2}>
      {isUnavailable ? (
        <YStack
          paddingVertical="$3"
          {...platformAccessibilityProps({ accessibilityState: { disabled: true } })}
        >
          {rowContent}
        </YStack>
      ) : isWeb ? (
        // The row navigates, so it renders as a real anchor
        // carrying the member's href (#248) — keyboard-operable
        // on web by default, which retires the hand-rolled
        // focus/keydown press pattern this row used as a button.
        // The anchor is pinned to a web flex column (the BackLink
        // lesson: a text-based anchor is inline on web and would
        // not hold the row's stacked layout).
        <Anchor
          href={member.href}
          textDecorationLine="none"
          display="web:flex"
          flexDirection="column"
          paddingVertical="$3"
        >
          {rowContent}
        </Anchor>
      ) : (
        // Native: the anchor is a Text, so the stacked row content
        // would flow inline inside it (see LinkOverlay). The row
        // renders in the same YStack frame as the unavailable
        // branch, with a childless anchor stretched over it
        // carrying the href; the overlay's label composes the
        // title and subtitle the way RecipesPage's row labels do.
        <YStack paddingVertical="$3" position="relative">
          {renderRowContent(true)}
          <LinkOverlay
            href={member.href}
            accessibilityRole="link"
            accessibilityLabel={`${member.title}, ${member.subtitle}`}
          />
        </YStack>
      )}
    </YStack>
  );
}

export function MealDetailPage({
  title,
  notes,
  nutritionLabel,
  members,
  cookHref,
  editHref,
}: MealDetailPageProps) {
  return (
    <ScreenContainer>
      <YStack paddingBlockEnd="$4">
        <Text
          variant="heading"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          {title}
        </Text>
      </YStack>
      {notes ? (
        <YStack paddingBlockEnd="$4">
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {notes}
          </Text>
        </YStack>
      ) : null}
      {nutritionLabel ? (
        <YStack paddingBlockEnd="$4">
          <Text fontSize={tokens.typography.fontSize.sm} color="$textMuted">
            {nutritionLabel}
          </Text>
        </YStack>
      ) : null}
      <XStack paddingBlockEnd="$6" flexWrap="wrap" gap="$3">
        <Button href={cookHref}>Cook meal</Button>
        <Button variant="secondary" href={editHref}>
          Edit
        </Button>
      </XStack>
      <SectionCard title="Recipes">
        {members.map((member) => (
          <MemberRow key={member.recipeId} member={member} />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
