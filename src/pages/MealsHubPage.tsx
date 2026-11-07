import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Button } from "../widgets/Button.js";
import { CardStack } from "../widgets/CardStack.js";
import { EmptyState } from "../widgets/EmptyState.js";
import { ListLoadingState } from "../widgets/ListLoadingState.js";
import { PinnedHeaderShell } from "../widgets/PinnedHeaderShell.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Tabs } from "../widgets/Tabs.js";
import { Text } from "../widgets/Text.js";
import { TextActionCardRow } from "../widgets/TextActionCardRow.js";
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
 * States mirror the app view's swaps: while `loading`, the
 * shared ListLoadingState replaces the active tab's list (the
 * app renders its branded loader there; ListLoadingState
 * stands in — the
 * branded loader stays app-side by recorded decision); an
 * empty meals list renders the DS EmptyState with the app's
 * message. The plans tab's states are MealPlansPage's own.
 *
 * Footer ownership (#410, adjusted on PR #413 review): the
 * hub owns the footer on BOTH tabs. On the plans tab the
 * BigFooterShell encloses the PinnedHeaderShell (header plus
 * MealPlansPage) so the shell's viewport minimum spans the
 * full pinned layout, and MealPlansPage is rendered without a
 * footer prop — its list keeps its bounded scroll region
 * inside the hub's shell.
 *
 * De-styled for #119: the page composes DS components only.
 * The chrome is a SectionStack (the "Meals" title in Text's
 * `title` variant over the tab bar); on the meals tab the
 * whole screen stacks in SectionStack inside the
 * ScreenContainer, and each meal renders through the generic
 * TextActionCardRow — its text block the meal's link, its
 * trailing Delete the #248 action (a ghost Button, #464) — stacked in
 * CardStack, so row separation is the stack's 8px card rhythm
 * (the plans tab's own rhythm) instead of a per-row bottom
 * padding. On the plans tab the pinned chrome and the
 * self-scrolling MealPlansPage compose through
 * PinnedHeaderShell, which owns the shell's background and
 * header inset.
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
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  activeTab: MealsHubPageTab;
  onSelectTab: (tab: MealsHubPageTab) => void;
  meals: MealsHubPageMeal[];
  plans: MealPlansPageItem[];
  loading: boolean;
  /** The create destinations (#248: both create actions
   * navigate, so they cross as hrefs, not press callbacks). */
  createMealHref: string;
  createPlanHref: string;
  onDeleteMeal: (mealId: string) => void;
  onDeletePlan: (planId: string) => void;
};

export function MealsHubPage({
  activeTab,
  onSelectTab,
  meals,
  plans,
  loading,
  createMealHref,
  createPlanHref,
  onDeleteMeal,
  onDeletePlan,
  footer,
}: MealsHubPageProps) {
  const hubChrome = (
    <>
      <Text variant="title">Meals</Text>
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
    // Footer ownership sits at the hub level on this tab
    // (CodeRabbit review, PR #413): the footer shell encloses
    // BOTH the pinned header and the plans content, so its
    // viewport-height minimum is measured against the full
    // pinned layout. When MealPlansPage owned the shell inside
    // PinnedHeaderShell instead, the shell started below the
    // header and its 100dvh minimum pushed the footer's bottom
    // edge about one header height below the viewport bottom
    // on a short plan list. MealPlansPage therefore receives
    // NO footer here: with no footer data its own shell is just
    // the growing column, and its ScreenContainer keeps the
    // bounded scroll region under the header inside the hub's
    // shell — exactly one footer renders on this tab.
    return (
      <BigFooterShell footer={footer}>
        <PinnedHeaderShell header={<SectionStack>{hubChrome}</SectionStack>}>
          <MealPlansPage
            plans={plans}
            loading={loading}
            createHref={createPlanHref}
            onPlanDelete={onDeletePlan}
            titleLevel={2}
          />
        </PinnedHeaderShell>
      </BigFooterShell>
    );
  }

  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <SectionStack>
          {hubChrome}
          <Button variant="primary" accessibilityLabel="New meal" href={createMealHref}>
            New meal
          </Button>
          {loading ? (
            <ListLoadingState label="Loading meals" />
          ) : meals.length === 0 ? (
            <EmptyState title="No meals yet." />
          ) : (
            <CardStack>
              {meals.map((meal) => (
                <TextActionCardRow
                  key={meal.id}
                  title={meal.title}
                  subtitle={meal.subtitle}
                  href={meal.href}
                  actionLabel="Delete"
                  onActionPress={() => {
                    onDeleteMeal(meal.id);
                  }}
                />
              ))}
            </CardStack>
          )}
        </SectionStack>
      </ScreenContainer>
    </BigFooterShell>
  );
}
