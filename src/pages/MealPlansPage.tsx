import { Button } from "../components/Button.js";
import { Column } from "../components/Column.js";
import { EmptyState } from "../components/EmptyState.js";
import { CardRow } from "../components/CardRow.js";
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
 *
 * De-styled for #119: the page renders no layout primitives and
 * sets no styling props. The plan row is the generic CardRow
 * widget (its card layout, pressable area, and action treatment
 * live there; the page supplies the plan content and the Delete
 * action), the list stacks in a Column, and the loading block
 * centers its spinner in a Column.
 */

/** One meal plan row's view-model. The app formats `subtitle` (its
 * meta line — entry count · date range · nutrition); the view only
 * renders it. */
export type MealPlansPageItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export type MealPlansPageProps = {
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
  /** Heading level for the "Meal plans" title on web (1 by default,
   * the standalone page title). Hosts that render this page under
   * their own page title — MealsHubPage's plans tab — pass 2 so the
   * composed screen keeps exactly one level-1 heading (#263). The
   * title's styling is unchanged; native ignores the level. */
  titleLevel?: 1 | 2;
};

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
  titleLevel,
}: MealPlansPageProps) {
  return (
    <ScreenContainer>
      <Text variant="heading" aria-level={titleLevel}>
        Meal plans
      </Text>
      {onCreatePlan ? <Button onPress={onCreatePlan}>New meal plan</Button> : null}
      {isLoading ? (
        <Column spaceBefore="2xl" align="center">
          <Spinner label="Loading" />
        </Column>
      ) : plans.length === 0 ? (
        <EmptyState title="No meal plans yet." />
      ) : (
        <Column spacing="sm">
          {plans.map((plan) => (
            <CardRow
              key={plan.id}
              title={plan.title}
              {...(plan.subtitle ? { subtitle: plan.subtitle } : {})}
              onPress={() => {
                onPlanPress(plan.id);
              }}
              actionLabel="Delete"
              actionTone="danger"
              {...(onPlanDelete
                ? {
                    onActionPress: () => {
                      onPlanDelete(plan.id);
                    },
                  }
                : {})}
            />
          ))}
        </Column>
      )}
    </ScreenContainer>
  );
}
