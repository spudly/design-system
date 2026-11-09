import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { Button } from "./Button.js";
import { LoadingScope, useLoadingScope } from "./LoadingScope.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

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
  /** Loading state (#278): the row renders text skeletons in
   * place of its name, prefix, and meta lines; its revoke
   * action stays in place as an inert rectangle skeleton
   * inside the loading scope. An enclosing composite's
   * LoadingScope can also put the row into this state without
   * prop-drilling. */
  loading?: boolean;
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
  loading = false,
}: TokenRowProps) {
  const showSkeleton = useLoadingScope(loading);
  // The revoke slot is one slot in both states: while loading
  // it renders inside the loading scope, where the Button
  // renders as an inert rectangle skeleton at its normal
  // geometry (Stephen on #551) instead of dropping out.
  const revokeAction =
    revoked || !onRevoke ? null : (
      <Button
        variant="danger"
        disabled={revoking}
        onPress={() => {
          onRevoke();
        }}
      >
        {revoking ? "Revoking…" : "Revoke"}
      </Button>
    );
  if (showSkeleton) {
    // Loading (#278): the same hairline row, with text skeletons
    // standing in for the name, prefix, and meta lines — the
    // revoke action as a rectangle skeleton, and the region
    // marked busy.
    return (
      <LoadingScope active>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$3"
          borderBottomWidth={1}
          borderBottomColor={tokens.colors.gray.gray2}
          paddingVertical="$3"
          {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
        >
          <YStack flex={1} minWidth={0}>
            <TextSkeleton lines={3} />
          </YStack>
          {revokeAction}
        </XStack>
      </LoadingScope>
    );
  }
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
        <YStack paddingBlockStart={2}>
          <Text
            fontFamily={tokens.typography.fontFamily.mono}
            fontSize={tokens.typography.fontSize.xs}
            color={tokens.colors.gray.gray6}
          >
            {prefix}…
          </Text>
        </YStack>
        <YStack paddingBlockStart={2}>
          <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.gray.gray6}>
            {metaLabel}
          </Text>
        </YStack>
      </YStack>
      {revokeAction}
    </XStack>
  );
}
