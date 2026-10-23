import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { EmptyState } from "../components/EmptyState.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";

/**
 * MealPlansPage (#49): Eciperay's meal plan list as a controlled
 * @spudly/ui page component. The app keeps all state and business
 * logic — queries, mutations, navigation — and drives this view
 * entirely through props: plan view-models in, press callbacks out.
 * Nothing here imports an app package or fetches anything.
 *
 * Which screen this is: the app's meal-planning surfaces are the
 * Meals hub (a tabbed screen: "Meals" | "Meal plans"), a single
 * plan's detail (MealPlanDetail), and the plan form — three
 * separate screens. This component is the plan LIST: the hub's
 * "Meal plans" tab content as a standalone page, and the primary
 * meal-plans destination (the analog of RecipesPage's list in the
 * pilot). The hub's chrome — its "Meals" title and the tab bar —
 * stays app-side: the tab switch selects between two different
 * pages, so it is navigation, not part of this view. MealPlanDetail
 * is a sibling #49 item, not part of this component.
 *
 * It is NOT the week grid the #44 demo story imagined: that demo
 * was a made-up composition, and the real app has no day/week
 * structure to model — a plan's entries are a flat list inside its
 * detail screen, there is no week navigation anywhere, and adding
 * or removing entries happens on the plan form screen. #49 builds
 * the real screens, so this view mirrors the real list.
 *
 * The composition mirrors the app's hub rows (MealsHubView, plans
 * tab) exactly: a scrolling shell, the "New meal plan" action above
 * the list, one elevated card per plan (title + meta line, no
 * thumbnail — these rows never rendered one), and a per-row Delete
 * when the app provides the callback. One treatment deliberately
 * diverges from the app rows: the plan title takes Text's
 * theme-aware foreground instead of the app's fixed gray10 — on a
 * dark theme's card surface that fixed near-black is unreadable
 * (~1.2:1), and page components must stay theme-correct even where
 * the app screen they port is light-only today. Two deliberate differences
 * from RecipesPage, both dictated by the app screen being ported:
 * - No FlatList: the app fetches the whole plan list at once and
 *   renders it unpaginated in a scroll view, so there is no
 *   bounded-list structure to carry — #188's failure shape came
 *   from a virtualized list inside a fixed shell, and this screen
 *   has neither. The shell scrolls, like the app's ScreenScroll.
 * - Loading replaces the content (spinner in place of the list):
 *   the app swaps its content for a loading indicator, and unlike
 *   RecipesPage there are no filter inputs whose focus a tree swap
 *   would drop, so the swap is faithful here.
 *
 * The app formats each row's `subtitle` (its meta line — entry
 * count with pluralization, the plan's date range, its nutrition
 * summary): pluralization and the nutrition formatter are the
 * app's, so the string crosses the boundary pre-composed, exactly
 * as RecipesPage's subtitle does.
 *
 * No render slot, by audit (the cook-log lesson, applied before
 * the fact): the app's list view renders no app-owned content
 * inside itself — no forms, pickers, or inline editors live in
 * these rows; creating goes to the plan form screen, deleting is
 * a bare mutation intent, and entry editing happens on the form
 * screen too. Every action here is therefore a pure intent
 * callback, which is the honest contract for this view. If a
 * future app change puts app-rendered content inside a plan row,
 * that change adds a slot to this contract (the
 * `renderRecipeAccessory` precedent) rather than a callback that
 * pretends to render.
 */

/** One meal plan row's view-model. The app formats `subtitle` (its
 * meta line — entry count · date range · nutrition); the view only
 * renders it. */
export interface MealPlansPageItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface MealPlansPageProps {
  /** Meal plans to render, in the app's order. */
  plans: MealPlansPageItem[];
  /** Load in flight: the spinner renders in place of the list,
   * mirroring the app's content swap (see the header). */
  isLoading: boolean;
  onPlanPress: (planId: string) => void;
  /** Optional: the "New meal plan" action renders only when the
   * callback is provided. */
  onCreatePlan?: () => void;
  /** Optional row action, mirroring the app row's Delete. The
   * button renders only when the callback is provided. */
  onPlanDelete?: (planId: string) => void;
}

function MealPlanRow({
  item,
  onPress,
  onDeletePress,
}: {
  item: MealPlansPageItem;
  onPress: () => void;
  onDeletePress?: () => void;
}) {
  // Web keyboard support (the TextLink pattern): a div carrying the
  // button role is not keyboard-operable on its own, so it is made
  // focusable and the button activation keys — Enter and Space —
  // invoke the same callback as a press. `tabIndex` and `onKeyDown`
  // are web-only props in Tamagui and are ignored on native, where
  // onPress is the activation path.
  const handleKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };
  return (
    <Card variant="elevated" flexDirection="row" alignItems="center" gap="$3" marginBottom="$3">
      {/* The pressable text block is a Tamagui view, not a React
          Native Pressable/TouchableOpacity: those map
          accessibilityRole="button" to a native <button> element on
          web, whose UA styles center the row's text. A Tamagui
          pressable renders a div carrying the role (the OptionCard
          pattern) and keeps the layout. flex/minWidth are structural
          only: the block expands and may shrink within the row. */}
      <YStack
        flex={1}
        minWidth={0}
        accessibilityRole="button"
        onPress={onPress}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        cursor="web:pointer"
      >
        <Text
          fontSize={tokens.typography.fontSize.md}
          fontWeight={tokens.typography.fontWeight.semibold}
        >
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text variant="hint" marginTop="$1">
            {item.subtitle}
          </Text>
        ) : null}
      </YStack>
      {onDeletePress ? (
        <XStack marginInlineStart="$3" alignItems="center">
          <Button
            variant="secondary"
            size="sm"
            backgroundColor={tokens.colors.danger.danger1}
            color={tokens.colors.danger.danger8}
            onPress={onDeletePress}
          >
            Delete
          </Button>
        </XStack>
      ) : null}
    </Card>
  );
}

/**
 * Full-page Meal plans view: the heading, the create action, and
 * the plan list in a scrolling shell. Controlled — see the file
 * header for the contract and the screen inventory it mirrors.
 */
export function MealPlansPage({
  plans,
  isLoading,
  onPlanPress,
  onCreatePlan,
  onPlanDelete,
}: MealPlansPageProps) {
  return (
    <ScreenContainer>
      <Text variant="heading">Meal plans</Text>
      {onCreatePlan ? (
        <Button alignSelf="stretch" onPress={onCreatePlan}>
          New meal plan
        </Button>
      ) : null}
      {isLoading ? (
        <YStack marginBlockStart="$8" alignItems="center">
          <Spinner label="Loading" />
        </YStack>
      ) : plans.length === 0 ? (
        <EmptyState title="No meal plans yet." />
      ) : (
        <YStack gap="$2">
          {plans.map((plan) => (
            <MealPlanRow
              key={plan.id}
              item={plan}
              onPress={() => {
                onPlanPress(plan.id);
              }}
              {...(onPlanDelete
                ? {
                    onDeletePress: () => {
                      onPlanDelete(plan.id);
                    },
                  }
                : {})}
            />
          ))}
        </YStack>
      )}
    </ScreenContainer>
  );
}
