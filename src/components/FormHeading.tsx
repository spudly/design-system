import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

export type FormHeadingProps = {
  /** The heading text (the form's title). */
  children: string;
  /**
   * The optional muted line under the title — a form's intro
   * or a session's current phase label — in Text's `hint`
   * treatment at the heading's own tight separation. Omit it
   * for a title-only heading.
   */
  subtitle?: string;
};

/**
 * A form screen's heading (#119): the form's title in Text's
 * `formTitle` treatment (2xl bold, a level-1 heading), with
 * the 24px of air below it that form screens give their title
 * before the layout's own separation — the identical block the
 * meal forms and the import pages each hand-rolled as a padded
 * wrapper around a sized heading. The separation belongs to
 * the heading block, so no page wraps its title to set it.
 *
 * The optional `subtitle` absorbs the import tranche's
 * SessionHeader (#119 dedupe): its title-plus-hint block was
 * this same heading with a muted line under the title, so the
 * one component carries both shapes and SessionHeader is not
 * shipped.
 */
export function FormHeading({ children, subtitle }: FormHeadingProps) {
  return (
    <YStack paddingBottom={tokens.spacing[6]}>
      <YStack gap="$2">
        <Text variant="formTitle">{children}</Text>
        {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
      </YStack>
    </YStack>
  );
}
