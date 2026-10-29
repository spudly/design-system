import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Text } from "./Text.js";

/** One transcript entry: who said it, and what they said. The
 * host resolves its own message model to these two roles. */
export type MessageListMessage = {
  role: "user" | "assistant";
  content: string;
};

export type MessageListProps = {
  messages: MessageListMessage[];
  /** Author label over the user's bubbles (e.g. "You"). */
  userLabel: string;
  /** Author label over the assistant's bubbles (e.g. "Plan"). */
  assistantLabel: string;
};

/**
 * A conversation transcript: one bubble per message, the
 * user's bubbles indented from the start edge and inked with
 * the neutral well, the assistant's indented from the end
 * edge on the primary wash, each bubble headed by its author
 * label (the `label` eyebrow treatment). The bubble geometry,
 * the role treatments, and the list rhythm are the
 * component's own; the caller supplies the messages and the
 * two author labels as content. Extracted for the #119 page
 * de-styling program from the AI session transcript, whose
 * bubbles were hand-styled per message in the page.
 */
export function MessageList({ messages, userLabel, assistantLabel }: MessageListProps) {
  return (
    <YStack gap="$3">
      {messages.map((message, index) => {
        const own = message.role === "user";
        return (
          <YStack
            key={index}
            paddingStart={own ? "$8" : undefined}
            paddingEnd={own ? undefined : "$8"}
          >
            <YStack
              borderRadius={tokens.radii.md}
              backgroundColor={own ? tokens.colors.gray.gray2 : "$primarySubtle"}
              padding="$3"
            >
              <YStack paddingBottom="$1">
                <Text variant="label">{own ? userLabel : assistantLabel}</Text>
              </YStack>
              <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
                {message.content}
              </Text>
            </YStack>
          </YStack>
        );
      })}
    </YStack>
  );
}
