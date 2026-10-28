import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";

export type TokenRowProps = {
  /** The token's display name. */
  name: string;
  /** The token's non-secret prefix, rendered in mono with a trailing ellipsis. */
  prefix: string;
  /** Pre-formatted meta line (e.g. "Created Jan 2, 2026 · Last used Mar 4, 2026"). */
  metaLabel: string;
  /** Revoked tokens show a "(Revoked)" marker and no action. */
  revoked?: boolean;
  /** A revoke is in flight: the action reads "Revoking…" and disables. */
  revoking?: boolean;
  /** Without it (or when revoked) the row renders no action. */
  onRevoke?: () => void;
};

/**
 * One personal-access-token row in an account's token list: the name (with
 * a muted "(Revoked)" suffix when revoked), the mono token prefix, and a
 * meta line, with a danger Revoke button on the trailing edge. The row is
 * a pure view — callers format the dates into `metaLabel` and own the
 * revoke mutation; `revoking` only drives the button's label and disabled
 * state.
 */
export function TokenRow({
  name,
  prefix,
  metaLabel,
  revoked = false,
  revoking = false,
  onRevoke,
}: TokenRowProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
      borderBottomWidth={1}
      borderBottomColor={tokens.colors.gray.gray2}
      paddingVertical="$3"
    >
      <YStack flex={1} minWidth={0}>
        <Text
          fontSize={tokens.typography.fontSize.sm}
          fontWeight={tokens.typography.fontWeight.medium}
          color={tokens.colors.gray.gray10}
        >
          {name}
          {revoked ? (
            <Text
              fontSize={tokens.typography.fontSize.xs}
              fontWeight={tokens.typography.fontWeight.regular}
              color={tokens.colors.gray.gray6}
            >
              {" (Revoked)"}
            </Text>
          ) : null}
        </Text>
        <Text
          marginBlockStart={2}
          fontFamily={tokens.typography.fontFamily.mono}
          fontSize={tokens.typography.fontSize.xs}
          color={tokens.colors.gray.gray6}
        >
          {prefix}…
        </Text>
        <Text
          marginBlockStart={2}
          fontSize={tokens.typography.fontSize.xs}
          color={tokens.colors.gray.gray6}
        >
          {metaLabel}
        </Text>
      </YStack>
      {revoked || !onRevoke ? null : (
        <Button
          variant="danger"
          disabled={revoking}
          onPress={() => {
            onRevoke();
          }}
        >
          {revoking ? "Revoking…" : "Revoke"}
        </Button>
      )}
    </XStack>
  );
}
