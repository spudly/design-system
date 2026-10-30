import { OptionCard } from "../components/OptionCard.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * AddRecipeMenuPage (#126, B3c): the add-recipe menu — the
 * split view half of Eciperay's `AddRecipeMenuView` (the B2
 * audit's page-view disposition). The options are app data
 * (labels, descriptions, and destinations are the app's route
 * table), so they cross as view-models; each option navigates,
 * so its destination crosses as an href (#248's navigation
 * rule) and the option card renders as a link.
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. The title takes Text's `title`
 * variant: the hand-styled title set the heading variant
 * plus xl/bold overrides, and the overrides are exactly
 * what #119 bans in pages, so — as MealPlanDetailPage's
 * title did in tranche 2 — the size and weight are owned by
 * the `title` variant (xl bold) instead; rendering and the
 * #263 level-1 heading semantics are unchanged. The options
 * render through OptionCard's href form unchanged (the
 * #248 stage-2 remodel), and the section rhythm is
 * ScreenContainer's own.
 */

export type AddRecipeMenuPageOption = {
  label: string;
  description: string;
  /** The option's destination, composed by the host from its
   * route table (#248). */
  href: string;
};

export type AddRecipeMenuPageProps = {
  options: AddRecipeMenuPageOption[];
};

export function AddRecipeMenuPage({ options }: AddRecipeMenuPageProps) {
  return (
    <ScreenContainer variant="padded">
      <Text variant="title">Add Recipe</Text>
      {options.map((option) => (
        <OptionCard
          key={option.href}
          title={option.label}
          description={option.description}
          href={option.href}
        />
      ))}
    </ScreenContainer>
  );
}
