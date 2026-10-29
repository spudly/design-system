import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
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
      <YStack paddingBottom="$4">
        <Text
          variant="heading"
          fontSize={tokens.typography.fontSize.xl}
          fontWeight={tokens.typography.fontWeight.bold}
        >
          Add Recipe
        </Text>
      </YStack>
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
