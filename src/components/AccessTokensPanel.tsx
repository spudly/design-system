import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { Button } from "./Button.js";
import { Alert } from "./Alert.js";
import { SectionCard } from "./SectionCard.js";
import { Text } from "./Text.js";
import { TextField } from "./TextField.js";
import { TokenRow } from "./TokenRow.js";

/**
 * AccessTokensPanel (#126, B3c): the API access tokens section
 * of the profile screen — the split view half of Eciperay's
 * `AccessTokensView` (the B2 audit's page-view (section)
 * disposition). The app container keeps the token and
 * entitlement queries and the create/revoke mutations; this
 * section renders display state and reports intents.
 *
 * The security rule for the profile cluster (issue #126):
 * token handling is business logic and stays app-side. What
 * crosses is display state only — token rows are view-models
 * whose dates the host pre-formats into `metaLabel` (the B2
 * TokenRow precedent), and the created secret crosses as a
 * string the host holds and dismisses; the create/revoke
 * calls themselves never enter the DS.
 *
 * The created-secret panel is this section's own (proposals
 * on #126, option A): it replicates the app view's amber
 * warning treatment with a selectable mono secret, unchanged.
 * Adopting the DS SecretRevealPanel instead (audit gap 8,
 * option B) changes the interaction to a Copy button and
 * needs the app to wire a clipboard — Stephen's pick, not
 * made here.
 */

export type AccessTokensPanelToken = {
  id: string;
  name: string;
  /** The token's non-secret prefix (rendered mono, with an ellipsis). */
  prefix: string;
  /** Pre-formatted meta line ("Created Jan 2, 2026 · Last used …"). */
  metaLabel: string;
  revoked?: boolean;
};

export type AccessTokensPanelProps = {
  tokens: AccessTokensPanelToken[];
  isLoading?: boolean;
  tokenName: string;
  onTokenNameChange: (value: string) => void;
  onCreate: () => void;
  isCreating?: boolean;
  createdSecret: string | null;
  onDismissSecret: () => void;
  revokingId?: string | null;
  onRevoke: (id: string) => void;
  error?: string | null;
  /**
   * When set, the create form is replaced by this explainer
   * (the plan cannot create tokens). The token list and revoke
   * actions stay available. Null/absent shows the form.
   */
  planNotice?: string | null;
};

export function AccessTokensPanel({
  tokens: accessTokens,
  isLoading = false,
  tokenName,
  onTokenNameChange,
  onCreate,
  isCreating = false,
  createdSecret,
  onDismissSecret,
  revokingId,
  onRevoke,
  error,
  planNotice,
}: AccessTokensPanelProps) {
  return (
    <SectionCard title="API access tokens">
      <Alert severity="info">
        Personal access tokens let apps and scripts use the Eciperay API — including the MCP server
        — without signing in each time. Treat them like passwords.
      </Alert>
      {createdSecret ? (
        <YStack paddingTop="$4" paddingBottom="$4">
          <YStack
            borderRadius={tokens.radii.md}
            borderWidth={1}
            borderColor={tokens.colors.warning.warning4}
            backgroundColor={tokens.colors.warning.warning1}
            padding="$4"
          >
            <YStack paddingBottom="$2">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                fontWeight={tokens.typography.fontWeight.semibold}
                color={tokens.colors.warning.warning10}
              >
                Copy your new token now — you won&apos;t see it again.
              </Text>
            </YStack>
            <YStack paddingBottom="$1">
              <YStack borderRadius={tokens.radii.sm} backgroundColor="$surface" padding="$3">
                <Text
                  userSelect="text"
                  color={tokens.colors.gray.gray10}
                  style={{
                    fontFamily: tokens.typography.fontFamily.mono,
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                >
                  {createdSecret}
                </Text>
              </YStack>
            </YStack>
            <YStack paddingBottom="$3">
              <Text fontSize={tokens.typography.fontSize.xs} color={tokens.colors.warning.warning9}>
                Long-press the token to copy it.
              </Text>
            </YStack>
            <XStack gap="$2">
              <Button variant="secondary" onPress={onDismissSecret}>
                Done
              </Button>
            </XStack>
          </YStack>
        </YStack>
      ) : null}
      {planNotice ? (
        <Alert severity="info">{planNotice}</Alert>
      ) : (
        <YStack paddingBottom="$4">
          <TextField
            label="Token name"
            value={tokenName}
            onChangeText={onTokenNameChange}
            placeholder="e.g. Claude Desktop"
          />
          <YStack paddingTop="$3">
            <Button
              variant="primary"
              disabled={!tokenName.trim() || createdSecret !== null || isCreating}
              onPress={onCreate}
            >
              Create token
            </Button>
          </YStack>
        </YStack>
      )}
      {error ? <Text variant="error">{error}</Text> : null}
      {isLoading ? (
        <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray6}>
          Loading tokens…
        </Text>
      ) : accessTokens.length === 0 ? (
        <Text textAlign="center">No tokens yet.</Text>
      ) : (
        <YStack>
          {accessTokens.map((token) => (
            <TokenRow
              key={token.id}
              name={token.name}
              prefix={token.prefix}
              metaLabel={token.metaLabel}
              revoked={token.revoked === true}
              revoking={revokingId === token.id}
              {...(token.revoked
                ? {}
                : {
                    onRevoke: () => {
                      onRevoke(token.id);
                    },
                  })}
            />
          ))}
        </YStack>
      )}
    </SectionCard>
  );
}
