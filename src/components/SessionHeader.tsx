import { YStack } from "tamagui";
import { Text } from "./Text.js";

export type SessionHeaderProps = {
  /** The session's title (the flow's name, host-supplied). */
  title: string;
  /**
   * The muted line under the title: the session's intro in
   * its start state, or its current phase label once running.
   * Omit it for a title-only header.
   */
  subtitle?: string;
};

/**
 * A session screen's header: the title in the form-flow title
 * treatment (Text's `formTitle`) with its subtitle — intro or
 * phase label — in the muted hint treatment, at the header's
 * own tight separation. Extracted for the #119 page
 * de-styling program from the AI session page, whose two
 * states opened with identical hand-spaced title blocks.
 */
export function SessionHeader({ title, subtitle }: SessionHeaderProps) {
  return (
    <YStack gap="$2">
      <Text variant="formTitle">{title}</Text>
      {subtitle ? <Text variant="hint">{subtitle}</Text> : null}
    </YStack>
  );
}
