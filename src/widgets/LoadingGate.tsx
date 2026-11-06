import { YStack } from "tamagui";
import { Spinner } from "./Spinner.js";

export type LoadingGateProps = {
  /** Accessible label for the spinner, naming what is loading
   * (e.g. "Loading meal plan"). */
  label: string;
};

/**
 * Full-screen loading gate: a surface-filled shell with a centered
 * spinner — the state a detail page shows while its content loads,
 * before any of the page's own structure exists. MealPlanDetailPage
 * renders it today; RecipeDetailPage and PublicRecipePage render
 * the identical gate inline and adopt this component as their #119
 * de-styling tranches land.
 */
export function LoadingGate({ label }: LoadingGateProps) {
  return (
    <YStack flex={1} backgroundColor="$surface" alignItems="center" justifyContent="center">
      <Spinner label={label} />
    </YStack>
  );
}
