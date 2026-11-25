import { Col } from "../layout/Col.js";
import { Spacer } from "../layout/Spacer.js";
import { tokens } from "../../tokens/index.js";
import { Text } from "../data/Text.js";

type ChatTranscriptMessage = {
  /** True for the user's own messages: the bubble aligns to the
   * opposite side and takes the neutral surface; the other
   * party's messages take the primary-subtle surface. */
  own: boolean;
  /** The author label rendered over the message ("You", a name). */
  author: string;
  /** The message body. */
  content: string;
};

export type ChatTranscriptProps = {
  messages: ChatTranscriptMessage[];
};

/**
 * A chat transcript (#119): the message bubbles of a two-party
 * conversation, stacked with a 12px rhythm. Each bubble is
 * inset 32px from the side opposite its author, rounded with
 * the medium radius and padded 12px; the author's label sits
 * over the body with a 4px separation, and the body renders in
 * the small size in muted gray. Own messages take the neutral
 * gray surface, the other party's the primary-subtle surface.
 * The transcript owns all of that treatment; call sites pass
 * only the messages as data — there are no styling props.
 */
export function ChatTranscript({ messages }: ChatTranscriptProps) {
  return (
    <Col gap="m">
      {messages.map((message, index) => (
        <Col
          key={index}
          style={
            message.own
              ? { paddingInlineStart: tokens.spacing[8] }
              : { paddingInlineEnd: tokens.spacing[8] }
          }
        >
          <Col
            borderRadius={tokens.radii.md}
            backgroundColor={message.own ? tokens.colors.gray.gray2 : "$primarySubtle"}
            p="m"
          >
            <Col>
              <Text variant="label">{message.author}</Text>
              <Spacer y="xs" />
            </Col>
            <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
              {message.content}
            </Text>
          </Col>
        </Col>
      ))}
    </Col>
  );
}
