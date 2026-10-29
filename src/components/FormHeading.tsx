import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type FormHeadingProps = {
  /** The heading text (the form's title). */
  children: string;
};

/**
 * A form screen's heading (#119): the form's title in Text's
 * `formTitle` treatment (2xl bold, a level-1 heading), with
 * the 24px of air below it that form screens give their title
 * before the layout's own separation — the identical block the
 * meal forms and the import pages each hand-rolled as a padded
 * wrapper around a sized heading. The separation belongs to
 * the heading block, so no page wraps its title to set it.
 */
export function FormHeading({ children }: FormHeadingProps) {
  return (
    <YStack paddingBottom={tokens.spacing[6]}>
      <Text variant="formTitle">{children}</Text>
    </YStack>
  );
}
