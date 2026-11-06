import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { Button } from "../widgets/Button.js";
import { Card } from "../widgets/Card.js";
import { Text } from "../widgets/Text.js";
import { CheckboxField } from "./CheckboxField.js";
import { RadioOptionGroup, type RadioOption } from "./RadioOptionGroup.js";

export type RecipeSharingViewProps = {
  /** Section heading ("Sharing"). */
  title?: string;
  /** The visibility options (value / label / description are caller data). */
  options: RadioOption[];
  /** The selected visibility (the host's pending selection). */
  value: string;
  onValueChange: (value: string) => void;
  /** A visibility mutation is in flight: the controls disable. */
  pending?: boolean;
  /**
   * Warning shown while the public option is selected (the
   * public-discoverability notice); the host supplies the copy
   * and passes null when the selection is not public.
   */
  publicWarning?: string | null;
  /**
   * Publishing consent: the checkbox renders when
   * `onConsentCheckedChange` is provided. Its description is a
   * ReactNode so the host's policy link stays inline and
   * pressable (the CheckboxField description contract).
   */
  consentLabel?: string;
  consentDescription?: ReactNode;
  consentChecked?: boolean;
  onConsentCheckedChange?: (checked: boolean) => void;
  /** Saving requires consent: Save disables until it is checked. */
  consentRequired?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  savePendingLabel?: string;
  /** The token share-link block; renders when `onRotateShareLink` is provided. */
  shareLinkLabel?: string;
  shareLinkUrl?: string | null;
  onRotateShareLink?: () => void;
  /** The host composes the label ("Generate share link" / "Rotate share link"). */
  rotateShareLinkLabel?: string;
  shareLinkPending?: boolean;
  onCopyShareLink?: () => void;
  copyShareLinkLabel?: string;
  /** The public permalink block; renders when a URL and copy intent exist. */
  permalinkLabel?: string;
  permalinkUrl?: string | null;
  onCopyPermalink?: () => void;
  copyPermalinkLabel?: string;
};

/**
 * RecipeSharingView (#438 Part 3): the recipe sharing /
 * visibility card as a view — the visibility radio group, the
 * public-discoverability warning, the publishing-consent
 * checkbox, the Save action, the token share-link row, and the
 * public permalink row, composed from the shared widgets and
 * views so hosts no longer import Card / Button / TextLink /
 * Text to build the panel themselves (the eciperay audit's
 * coverage disposition for those specifiers).
 *
 * Every mutation and all URL building stay with the caller:
 * the view receives the selection, the consent flag, and the
 * composed URLs as data, and reports intents. Save disables
 * while a mutation is pending or while required consent is
 * unchecked — the consent gate is presentation of the props
 * the view already holds; the consent state machine itself
 * (grants, withdrawals, forced re-consent) is the host's.
 */
export function RecipeSharingView({
  title = "Sharing",
  options,
  value,
  onValueChange,
  pending = false,
  publicWarning,
  consentLabel = "Publishing consent",
  consentDescription,
  consentChecked = false,
  onConsentCheckedChange,
  consentRequired = false,
  onSave,
  saveLabel = "Save visibility",
  savePendingLabel = "Saving…",
  shareLinkLabel = "Anyone with this link can view this recipe.",
  shareLinkUrl,
  onRotateShareLink,
  rotateShareLinkLabel = "Generate share link",
  shareLinkPending = false,
  onCopyShareLink,
  copyShareLinkLabel = "Copy share link",
  permalinkLabel = "Public link",
  permalinkUrl,
  onCopyPermalink,
  copyPermalinkLabel = "Copy public link",
}: RecipeSharingViewProps) {
  return (
    <Card variant="bordered">
      <YStack gap="$3">
        <Text variant="subheading">{title}</Text>
        <RadioOptionGroup
          options={options}
          value={value}
          onValueChange={onValueChange}
          disabled={pending}
        />
        {publicWarning ? <Text variant="hint">{publicWarning}</Text> : null}
        {onConsentCheckedChange ? (
          <CheckboxField
            label={consentLabel}
            description={consentDescription}
            checked={consentChecked}
            onCheckedChange={onConsentCheckedChange}
            disabled={pending}
          />
        ) : null}
        {onSave ? (
          <XStack>
            <Button
              variant="primary"
              disabled={pending || (consentRequired && !consentChecked)}
              onPress={onSave}
            >
              {pending ? savePendingLabel : saveLabel}
            </Button>
          </XStack>
        ) : null}
        {onRotateShareLink ? (
          <YStack gap="$2">
            <Text variant="hint">{shareLinkLabel}</Text>
            <XStack gap="$2" flexWrap="wrap">
              <Button
                variant="secondary"
                size="sm"
                disabled={shareLinkPending}
                onPress={onRotateShareLink}
              >
                {rotateShareLinkLabel}
              </Button>
              {shareLinkUrl && onCopyShareLink ? (
                <Button variant="secondary" size="sm" onPress={onCopyShareLink}>
                  {copyShareLinkLabel}
                </Button>
              ) : null}
            </XStack>
          </YStack>
        ) : null}
        {permalinkUrl && onCopyPermalink ? (
          <YStack gap="$2">
            <Text variant="hint">{permalinkLabel}</Text>
            <XStack gap="$2" alignItems="center" flexWrap="wrap">
              <Text variant="muted">{permalinkUrl}</Text>
              <Button ghost size="sm" onPress={onCopyPermalink}>
                {copyPermalinkLabel}
              </Button>
            </XStack>
          </YStack>
        ) : null}
      </YStack>
    </Card>
  );
}
