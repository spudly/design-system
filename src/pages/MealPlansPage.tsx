import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Button } from "../widgets/Button.js";
import { CardStack } from "../widgets/CardStack.js";
import { EmptyState } from "../widgets/EmptyState.js";
import { CardRow } from "../widgets/CardRow.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { Text } from "../widgets/Text.js";

/**
 * MealPlansPage (#49): Eciperay's meal plan list as a controlled
 * @spudly/ui page component. The app keeps all state and business
 * logic — queries, mutations, navigation — and drives this view
 * entirely through props: plan view-models in, destinations and
 * callbacks out. Nothing here imports an app package or fetches
 * anything.
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
 * - Loading skeletonizes the list region (#278, tranche 4):
 *   the centered-Spinner pattern is deleted — the heading and
 *   the create action stay rendered (they need no data) and the
 *   list renders exactly 3 dummy CardRows in their loading
 *   state, Delete kept as an inert skeleton Button when the
 *   host wires it, exactly as the loaded rows render it.
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
 * screen too. The controls split on #248's navigation rule: the
 * plan rows and the create action navigate, so they cross as
 * hrefs (each plan carries its own; the create action takes
 * `createHref`), and Delete — a mutation, not a navigation —
 * stays a bare intent callback, which is the honest contract for
 * this view. If a future app change puts app-rendered content
 * inside a plan row, that change adds a slot to this contract
 * (the `renderRecipeAccessory` precedent) rather than a callback
 * that pretends to render.
 *
 * De-styled for #119: the page renders no layout primitives and
 * sets no styling props. The plan row is the generic CardRow
 * widget in its link form (its card layout, link area, and action
 * treatment live there; the page supplies the plan content, the
 * plan's href, and the Delete action), and the list stacks in a
 * CardStack.
 */

/** One meal plan row's view-model. The app formats `subtitle` (its
 * meta line — entry count · date range · nutrition); the view only
 * renders it. */
export type MealPlansPageItem = {
  id: string;
  /** The plan's destination (#248's navigation rule: the row
   * navigates, so it is a link): the host composes it from the
   * plan id. The row renders as a link carrying this href. */
  href: string;
  title: string;
  subtitle?: string;
};

export type MealPlansPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** Meal plans to render, in the app's order. */
  plans: MealPlansPageItem[];
  /** Load in flight: the list region renders skeleton rows
   * (see the header's loading note). */
  loading: boolean;
  /** Optional: the "New meal plan" action renders only when the
   * href is provided (#248: it navigates, so it is a link). */
  createHref?: string;
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
// The dummy skeleton rows for the loading list (#278): exactly
// 3, from a frozen module-level constant — never generated per
// render (the CheckboxSelectList convention).
const LOADING_PLAN_KEYS = ["loading-1", "loading-2", "loading-3"] as const;

export function MealPlansPage({
  plans,
  loading,
  createHref,
  onPlanDelete,
  titleLevel,
  footer,
}: MealPlansPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        <Text variant="heading" aria-level={titleLevel}>
          Meal plans
        </Text>
        {createHref ? <Button href={createHref}>New meal plan</Button> : null}
        {loading ? (
          <CardStack>
            {LOADING_PLAN_KEYS.map((key) => (
              <CardRow
                key={key}
                title="Meal plan"
                subtitle="Meal plan details"
                onPress={() => {}}
                loading
                {...(onPlanDelete
                  ? {
                      actionLabel: "Delete",
                      actionTone: "danger" as const,
                      onActionPress: () => {},
                    }
                  : {})}
              />
            ))}
          </CardStack>
        ) : plans.length === 0 ? (
          <EmptyState title="No meal plans yet." />
        ) : (
          <CardStack>
            {plans.map((plan) => (
              <CardRow
                key={plan.id}
                title={plan.title}
                {...(plan.subtitle ? { subtitle: plan.subtitle } : {})}
                href={plan.href}
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
          </CardStack>
        )}
      </ScreenContainer>
    </BigFooterShell>
  );
}
