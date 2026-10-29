import type { ReactNode } from "react";
import { YStack } from "tamagui";

export type StepperGroupProps = {
  /** The steppers belonging to one selected item. */
  children: ReactNode;
};

/**
 * The steppers belonging to one selected item (#119): a
 * flush stack — deliberately no gap of its own — so an item's
 * quantity and servings steppers stay glued together as one
 * block while the parent layout's separation sets the items
 * apart (the meal plan form's per-entry stepper groups). The
 * group is the item's own composition; separation BETWEEN
 * groups is the parent's, never the group's.
 */
export function StepperGroup({ children }: StepperGroupProps) {
  return <YStack>{children}</YStack>;
}
