import type { ReactNode } from "react";
import { XStack, YStack } from "tamagui";
import { useLoadingScope } from "../contexts/LoadingScope.js";
import { tokens } from "../tokens/index.js";
import { BoxSkeleton } from "../widgets/BoxSkeleton.js";
import { Button } from "../widgets/Button.js";
import { Card } from "../widgets/Card.js";
import { Center } from "../widgets/Center.js";
import { CircleSkeleton } from "../widgets/CircleSkeleton.js";
import { Text } from "../widgets/Text.js";
import { SIZABLE_TEXT_LINE_BOX, TextSkeleton } from "../widgets/TextSkeleton.js";
import { CheckboxField } from "./CheckboxField.js";
import { RadioOptionGroup, type RadioOption } from "./RadioOptionGroup.js";
import { useVoice } from "../voice/index.js";

export type RecipeSharingViewProps = {
  /** Section heading. Defaults to the voice object's recipeSharingView title (#539). */
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
   * Defaults to the voice object's recipeSharingView consentLabel (#539).
   */
  consentLabel?: string;
  consentDescription?: ReactNode;
  consentChecked?: boolean;
  onConsentCheckedChange?: (checked: boolean) => void;
  /** Saving requires consent: Save disables until it is checked. */
  consentRequired?: boolean;
  onSave?: () => void;
  /** Defaults to the voice object's recipeSharingView saveLabel (#539). */
  saveLabel?: string;
  /** Defaults to the voice object's recipeSharingView savePendingLabel (#539). */
  savePendingLabel?: string;
  /** The token share-link block; renders when `onRotateShareLink` is provided. Defaults to the voice object's recipeSharingView shareLinkLabel (#539). */
  shareLinkLabel?: string;
  shareLinkUrl?: string | null;
  onRotateShareLink?: () => void;
  /** The host composes the label (a generate or rotate wording). Defaults to the voice object's recipeSharingView rotateShareLinkLabel (#539). */
  rotateShareLinkLabel?: string;
  shareLinkPending?: boolean;
  onCopyShareLink?: () => void;
  /** Defaults to the voice object's recipeSharingView copyShareLinkLabel (#539). */
  copyShareLinkLabel?: string;
  /** The public permalink block; renders when a URL and copy intent exist. Defaults to the voice object's recipeSharingView permalinkLabel (#539). */
  permalinkLabel?: string;
  permalinkUrl?: string | null;
  onCopyPermalink?: () => void;
  /** Defaults to the voice object's recipeSharingView copyPermalinkLabel (#539). */
  copyPermalinkLabel?: string;
  /** Loading state (#278): the Card carries the loading scope
   * and the view renders a mirror of its layout — the title as
   * a text skeleton at its own (xl) size, one radio-row
   * skeleton per option (a circle bone centered in the radio
   * item's 44px touch-target slot, with label and description
   * bones at sm), the warning and consent rows as bones in
   * their slots when they would render, and the Save,
   * share-link, and permalink Buttons kept inside the Card's
   * loading scope so they render as inert skeletons when their
   * blocks would render — their hint and URL lines as text
   * bones. No real URLs, values, or selections show. An
   * enclosing composite's LoadingScope can also put the view
   * into this state without prop-drilling. */
  loading?: boolean;
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
  title: titleProp,
  options,
  value,
  onValueChange,
  pending = false,
  publicWarning,
  consentLabel: consentLabelProp,
  consentDescription,
  consentChecked = false,
  onConsentCheckedChange,
  consentRequired = false,
  onSave,
  saveLabel: saveLabelProp,
  savePendingLabel: savePendingLabelProp,
  shareLinkLabel: shareLinkLabelProp,
  shareLinkUrl,
  onRotateShareLink,
  rotateShareLinkLabel: rotateShareLinkLabelProp,
  shareLinkPending = false,
  onCopyShareLink,
  copyShareLinkLabel: copyShareLinkLabelProp,
  permalinkLabel: permalinkLabelProp,
  permalinkUrl,
  onCopyPermalink,
  copyPermalinkLabel: copyPermalinkLabelProp,
  loading = false,
}: RecipeSharingViewProps) {
  const voice = useVoice();
  const title = titleProp ?? voice.recipeSharingView.title;
  const consentLabel = consentLabelProp ?? voice.recipeSharingView.consentLabel;
  const saveLabel = saveLabelProp ?? voice.recipeSharingView.saveLabel;
  const savePendingLabel = savePendingLabelProp ?? voice.recipeSharingView.savePendingLabel;
  const shareLinkLabel = shareLinkLabelProp ?? voice.recipeSharingView.shareLinkLabel;
  const rotateShareLinkLabel =
    rotateShareLinkLabelProp ?? voice.recipeSharingView.rotateShareLinkLabel;
  const copyShareLinkLabel = copyShareLinkLabelProp ?? voice.recipeSharingView.copyShareLinkLabel;
  const permalinkLabel = permalinkLabelProp ?? voice.recipeSharingView.permalinkLabel;
  const copyPermalinkLabel = copyPermalinkLabelProp ?? voice.recipeSharingView.copyPermalinkLabel;
  const showSkeleton = useLoadingScope(loading);
  return (
    <Card variant="bordered" loading={showSkeleton}>
      <YStack gap="$3">
        {showSkeleton ? (
          <TextSkeleton size="xl" lines={1} />
        ) : (
          <Text variant="subheading">{title}</Text>
        )}
        {showSkeleton ? (
          // The radio rows' mirror (#278): RadioOptionGroup's
          // own stack (gap spacing 1) of rows (gap spacing 2,
          // centered) — the item's 44px touch-target slot
          // centering a circle bone, the label bone at md
          // centered in the option Label's own line box
          // (SIZABLE_TEXT_LINE_BOX, 27 — a plain md line box
          // left each row short and the drift accumulated
          // down the group, Stephen on #579), and a
          // description bone at sm when the option carries
          // one. No real labels or selection show.
          <YStack gap={tokens.spacing[1]}>
            {options.map((option) => (
              <XStack key={option.value} alignItems="center" gap={tokens.spacing[2]}>
                <Center width={44} height={44}>
                  <CircleSkeleton size={20} />
                </Center>
                <YStack flex={1} gap={tokens.spacing[1]}>
                  <Center height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
                    <TextSkeleton size="md" lines={1} />
                  </Center>
                  {option.description ? <TextSkeleton size="sm" lines={1} /> : null}
                </YStack>
              </XStack>
            ))}
          </YStack>
        ) : (
          <RadioOptionGroup
            options={options}
            value={value}
            onValueChange={onValueChange}
            disabled={pending}
          />
        )}
        {publicWarning ? (
          showSkeleton ? (
            <TextSkeleton size="sm" lines={1} />
          ) : (
            <Text variant="hint">{publicWarning}</Text>
          )
        ) : null}
        {onConsentCheckedChange ? (
          showSkeleton ? (
            // The consent field's mirror (#278): CheckboxField's
            // own row (gap spacing 3, 44px minimum) — the 24px
            // visual box bone centered in its 44px touch-target
            // slot, the label bone at md centered in the field
            // Label's own line box (SIZABLE_TEXT_LINE_BOX, 27),
            // and a description bone at sm when a description
            // would render.
            <XStack alignItems="center" gap={tokens.spacing[3]} minHeight={44}>
              <Center width={44} height={44}>
                <BoxSkeleton width={24} height={24} />
              </Center>
              <YStack flex={1} gap={tokens.spacing[1]}>
                <Center height={SIZABLE_TEXT_LINE_BOX} horizontal={false}>
                  <TextSkeleton size="md" lines={1} />
                </Center>
                {consentDescription ? <TextSkeleton size="sm" lines={1} /> : null}
              </YStack>
            </XStack>
          ) : (
            <CheckboxField
              label={consentLabel}
              description={consentDescription}
              checked={consentChecked}
              onCheckedChange={onConsentCheckedChange}
              disabled={pending}
            />
          )
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
            {showSkeleton ? (
              <TextSkeleton size="sm" lines={1} />
            ) : (
              <Text variant="hint">{shareLinkLabel}</Text>
            )}
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
            {showSkeleton ? (
              <TextSkeleton size="sm" lines={1} />
            ) : (
              <Text variant="hint">{permalinkLabel}</Text>
            )}
            <XStack gap="$2" alignItems="center" flexWrap="wrap">
              {showSkeleton ? (
                <YStack flex={1}>
                  <TextSkeleton size="md" lines={1} />
                </YStack>
              ) : (
                <Text variant="muted">{permalinkUrl}</Text>
              )}
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
