import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Card } from "./Card.js";
import { Text } from "./Text.js";

export type MessageCardProps = {
  /** The message's heading (e.g. "Recipe not found"). */
  title: string;
  /** The message's explanatory line. */
  message: string;
};

/**
 * A full-screen message state: a centered card carrying a
 * heading and one explanatory line on a surface-filled shell —
 * the state a page shows when there is no content to render (a
 * missing resource, an invalid link). PublicRecipePage rendered
 * this card inline for both of its error states before it moved
 * here (#119); the shell fills and paints the screen, the card
 * centers, and the copy is the caller's, so any page's
 * whole-screen notice composes the same way.
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
