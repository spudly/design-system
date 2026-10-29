import { Anchor, YStack, isWeb } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { LinkOverlay } from "../components/linkOverlay.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { Tabs } from "../components/Tabs.js";
import { Text } from "../components/Text.js";
import { TextAction } from "../components/TextAction.js";
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
  /** The meal's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * meal id. The row's text block renders as a link carrying
   * this href. */
  href: string;
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
  /** The create destinations (#248: both create actions
   * navigate, so they cross as hrefs, not press callbacks). */
  createMealHref: string;
  createPlanHref: string;
  onDeleteMeal: (mealId: string) => void;
  onDeletePlan: (planId: string) => void;
};

function MealRow({ meal, onDelete }: { meal: MealsHubPageMeal; onDelete: () => void }) {
  // `decorative` marks the visible texts non-accessible for the
  // native link rendering, whose LinkOverlay carries the label as
  // the row's one accessibility stop (see LinkOverlay).
  const renderTextContent = (decorative: boolean) => (
    <>
      <Text
        accessible={decorative ? false : undefined}
        fontSize={tokens.typography.fontSize.md}
        fontWeight={tokens.typography.fontWeight.semibold}
      >
        {meal.title}
      </Text>
      <Text variant="hint" accessible={decorative ? false : undefined}>
        {meal.subtitle}
      </Text>
    </>
  );
  const textContent = renderTextContent(false);
  return (
    <YStack paddingBlockEnd="$3">
      <Card variant="elevated" flexDirection="row" alignItems="center" gap="$3">
        {/* The text block is a real anchor carrying the meal's
          href (the row navigates, #248) — keyboard-operable on
          web by default, which retires the hand-rolled
          focus/keydown press pattern this row used as a button.
          It is pinned to a web flex column (the BackLink lesson:
          a text-based anchor is inline on web and would not hold
          the block's stacked layout). On native the anchor is a
          Text and the stacked texts would flow inline inside it,
          so the block platform-splits (see LinkOverlay): a YStack
          frame with the same structural flex carries the texts,
          and a childless anchor stretched over it carries the
          href. */}
        {isWeb ? (
          <Anchor
            flex={1}
            minWidth={0}
            gap="$1"
            href={meal.href}
            textDecorationLine="none"
            display="web:flex"
            flexDirection="column"
            {...platformAccessibilityProps({
              accessibilityRole: "link",
              accessibilityLabel: meal.title,
            })}
          >
            {textContent}
          </Anchor>
        ) : (
          <YStack flex={1} minWidth={0} gap="$1" position="relative">
            {renderTextContent(true)}
            <LinkOverlay
              href={meal.href}
              accessibilityRole="link"
              accessibilityLabel={meal.title}
            />
          </YStack>
        )}
        {/* Delete is an action, not navigation (#248 ruling):
          it renders through TextAction's button role and stays a
          callback. */}
        <TextAction onPress={onDelete}>Delete</TextAction>
      </Card>
    </YStack>
  );
}

export function MealsHubPage({
  activeTab,
  onSelectTab,
  meals,
  plans,
  isLoading,
  createMealHref,
  createPlanHref,
  onDeleteMeal,
  onDeletePlan,
}: MealsHubPageProps) {
  const hubChrome = (
    <>
      <YStack paddingBottom="$4">
        <Text
          variant="heading"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          Meals
        </Text>
      </YStack>
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
          createHref={createPlanHref}
          onPlanDelete={onDeletePlan}
          titleLevel={2}
        />
      </YStack>
    );
  }

  return (
    <ScreenContainer>
      {hubChrome}
      <YStack paddingVertical="$4">
        <Button variant="primary" accessibilityLabel="New meal" href={createMealHref}>
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
