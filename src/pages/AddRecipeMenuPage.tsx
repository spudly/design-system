import { tokens } from "../tokens/index.js";
import { OptionCard } from "../components/OptionCard.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * AddRecipeMenuPage (#126, B3c): the add-recipe menu — the
 * split view half of Eciperay's `AddRecipeMenuView` (the B2
 * audit's page-view disposition). The options are app data
 * (labels, descriptions, and navigation targets are the app's
 * route table), so they cross as view-models and the
 * selection crosses back as the target string; navigation
 * stays app-side.
 */

export type AddRecipeMenuPageOption = {
  label: string;
  description: string;
  target: string;
};

export type AddRecipeMenuPageProps = {
  options: AddRecipeMenuPageOption[];
  onSelect?: (target: string) => void;
};

export function AddRecipeMenuPage({ options, onSelect }: AddRecipeMenuPageProps) {
  return (
    <ScreenContainer variant="padded">
      <Text
        variant="subheading"
        fontSize={tokens.typography.fontSize.xl}
        fontWeight={tokens.typography.fontWeight.bold}
        marginBottom="$4"
      >
        Add Recipe
      </Text>
      {options.map((option) => (
        <OptionCard
          key={option.target}
          title={option.label}
          description={option.description}
          onPress={() => {
            onSelect?.(option.target);
          }}
        />
      ))}
    </ScreenContainer>
  );
}
