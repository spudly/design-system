import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

export type MessageCardProps = {
  /** The state's heading — the card's centered title line. */
  title: string;
  /** The explanatory line under the heading, in the muted ink. */
  message: string;
};

/**
 * Whole-screen message state (#119): a surface-filled shell that
 * fills its parent's height, centering a card that carries a
 * heading and one explanatory line, both centered — the state a
 * screen shows when there is no content to render (a missing
 * item, an invalid link). The shell's fill and paint, the 16px
 * page padding around the card, the card itself, and the text
 * treatments (the heading variant for the title, the muted gray
 * for the message, the 8px separation between them) are the
 * component's own; the caller supplies only the two strings —
 * the copy is the caller's content, and there are no styling
 * props.
 *
 * The full-screen sibling is LoadingGate: the same surface shell
 * with a centered spinner for the loading state. The shell, the
 * centering, and the fill are one component here because the
 * pieces do not compose to this treatment — a shell plus a
 * centering box plus a card leaves the card at the top of the
 * screen unless the centering layer also fills the shell's
 * height, which is this component's whole job.
 *
 * Extracted from PublicRecipePage's not-found and unavailable
 * states, which hand-rolled the shell as styled stacks in the
 * page — styling a page may not apply itself under #119.
 */
export function MessageCard({ title, message }: MessageCardProps) {
  return (
    <YStack
      flex={1}
      backgroundColor="$surface"
      alignItems="center"
      justifyContent="center"
      padding="$4"
    >
      <Card>
        <YStack alignItems="center" gap="$2">
          <Text variant="heading" textAlign="center">
            {title}
          </Text>
          <Text color={tokens.colors.gray.gray6} textAlign="center">
            {message}
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
}
