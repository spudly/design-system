import { YStack } from "tamagui";
import { Alert } from "./Alert.js";

export type ListErrorStateProps = {
  /** The error message to announce in the alert. */
  message: string;
};

/**
 * A list's error state (#119): the error alert dropped below the
 * list's header by the state's own top padding — the offset
 * RecipesPage's catalog established for this slot, carried as
 * padding (the parent-side mechanism) rather than a margin.
 * Extracted from the catalog pages for the #119 page de-styling
 * program, so every catalog renders its load failure the same way.
 */
export function ListErrorState({ message }: ListErrorStateProps) {
  return (
    <YStack paddingBlockStart="$8">
      <Alert severity="error">{message}</Alert>
    </YStack>
  );
}
