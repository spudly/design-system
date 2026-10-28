import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { Tabs } from "../components/Tabs.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";
import { MealPlansPage, type MealPlansPageItem } from "./MealPlansPage.js";

/**
 * MealsHubPage (#125, B3b): the meals hub — the split view
 * half of Eciperay's `MealsHubView` (the B2 audit's page-view
 * disposition; the audit assigns the hub to B3b). The app
 * screen keeps the meals/plans queries, the delete
 * mutations, the active-tab state, and navigation; this view
 * renders both tabs and reports intents.
 *
 * The composition is the app view's, unchanged — including
 * its documented constraint: the hub chrome (the "Meals"
 * heading and the tab bar) is pinned above both tabs, and
 * the plans tab hosts MealPlansPage as its root under that
 * chrome, never nested inside a scrolling container (a
 * same-direction ScrollView inside the hub's scroll content
 * would capture the list region's gestures on Android
 * without scrolling the hub — the nested-shell failure
 * behind #188). The meals tab scrolls in its own
 * ScreenContainer with the chrome inside, as the app view
 * renders it.
 *
 * The boundary is pre-composed strings throughout (the
 * sibling pages' precedent): each meal row's `subtitle`
 * (member count with its pluralization plus the nutrition
 * summary) and each plan's MealPlansPage subtitle (entry
 * count, date range, nutrition) are composed app-side from
 * the app's formatters; the view only renders them. The tab
 * switch is reported as an intent (`onSelectTab`) — the
 * active tab is the screen's state, as today.
 *
 * States mirror the app view's swaps: while `isLoading`, a
 * spinner replaces the active tab's list (the app renders
 * its branded loader there; the DS Spinner stands in — the
 * branded loader stays app-side by recorded decision); an
 * empty meals list renders the DS EmptyState with the app's
 * message. The plans tab's states are MealPlansPage's own.
 */

export type MealsHubPageTab = "meals" | "plans";

export type MealsHubPageMeal = {
  id: string;
  title: string;
  /** Pre-composed meta line ("2 recipes · 1,240 cal"). */
  subtitle: string;
};

export type MealsHubPageProps = {
  activeTab: MealsHubPageTab;
  onSelectTab: (tab: MealsHubPageTab) => void;
  meals: MealsHubPageMeal[];
  plans: MealPlansPageItem[];
  isLoading: boolean;
  onCreateMeal: () => void;
  onCreatePlan: () => void;
  onMealPress: (mealId: string) => void;
  onPlanPress: (planId: string) => void;
  onDeleteMeal: (mealId: string) => void;
  onDeletePlan: (planId: string) => void;
};

function MealRow({
  meal,
  onPress,
  onDelete,
}: {
  meal: MealsHubPageMeal;
  onPress: () => void;
  onDelete: () => void;
}) {
  // Web keyboard support (the MealPlansPage row pattern):
  // Enter and Space on the focused text block invoke the
  // same callback as a press. Web-only props, ignored on
  // native.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <Card variant="elevated" flexDirection="row" alignItems="center" gap="$3" marginBottom="$3">
      <YStack
        flex={1}
        minWidth={0}
        {...platformAccessibilityProps({
          accessibilityRole: "button",
          accessibilityLabel: meal.title,
        })}
        onPress={onPress}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        cursor="web:pointer"
      >
        <Text
          fontSize={tokens.typography.fontSize.md}
          fontWeight={tokens.typography.fontWeight.semibold}
        >
          {meal.title}
        </Text>
        <Text variant="hint" marginTop="$1">
          {meal.subtitle}
        </Text>
      </YStack>
      <TextLink onPress={onDelete}>Delete</TextLink>
    </Card>
  );
}

export function MealsHubPage({
  activeTab,
  onSelectTab,
  meals,
  plans,
  isLoading,
  onCreateMeal,
  onCreatePlan,
  onMealPress,
  onPlanPress,
  onDeleteMeal,
  onDeletePlan,
}: MealsHubPageProps) {
  const hubChrome = (
    <>
      <Text
        variant="heading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBottom="$4"
      >
        Meals
      </Text>
      <Tabs
        tabs={[
          { value: "meals", label: "Meals" },
          { value: "plans", label: "Meal plans" },
        ]}
        value={activeTab}
        onValueChange={(value) => {
          onSelectTab(value as MealsHubPageTab);
        }}
      />
    </>
  );

  if (activeTab === "plans") {
    return (
      <YStack flex={1} backgroundColor={tokens.colors.gray.gray1}>
        <YStack paddingHorizontal="$4" paddingTop="$4" gap="$4">
          {hubChrome}
        </YStack>
        <MealPlansPage
          plans={plans}
          isLoading={isLoading}
          onPlanPress={onPlanPress}
          onCreatePlan={onCreatePlan}
          onPlanDelete={onDeletePlan}
          titleLevel={2}
        />
      </YStack>
    );
  }

  return (
    <ScreenContainer>
      {hubChrome}
      <YStack marginVertical="$4">
        <Button variant="primary" accessibilityLabel="New meal" onPress={onCreateMeal}>
          New meal
        </Button>
      </YStack>
      {isLoading ? (
        <Spinner label="Loading meals" />
      ) : meals.length === 0 ? (
        <EmptyState title="No meals yet." />
      ) : (
        <YStack gap="$2">
          {meals.map((meal) => (
            <MealRow
              key={meal.id}
              meal={meal}
              onPress={() => {
                onMealPress(meal.id);
              }}
              onDelete={() => {
                onDeleteMeal(meal.id);
              }}
            />
          ))}
        </YStack>
      )}
    </ScreenContainer>
  );
}
