import type { ReactNode } from "react";

import { Row } from "../layout/Row.js";
import { Col } from "../layout/Col.js";
import { tokens } from "../../tokens/index.js";
import { LoadingScope, useLoadingScope } from "../../contexts/LoadingScope.js";
import { platformAccessibilityProps, politeLiveRegionProps } from "../accessibility.js";
import { Button } from "../actions/Button.js";
import { Text } from "../data/Text.js";
import { useVoice } from "../../voice/index.js";
import { TextSkeleton } from "../feedback/TextSkeleton.js";

/**
 * The secret's bordered box (#746, Option B): a surface Row
 * with the medium radius and 12px padding (p "m").
 */
function SecretBox({ children }: { children: ReactNode }) {
  return (
    <Row
      middle
      backgroundColor="$surface"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={tokens.radii.md}
      p="m"
    >
      {children}
    </Row>
  );
}

export type SecretRevealPanelProps = {
  /** The secret value to display (shown once). */
  secret: string;
  /** Panel title. Defaults to the voice object's secretRevealPanel title (#539). */
  title?: string;
  /** Copy action label. Defaults to the voice object's secretRevealPanel copy label (#539). */
  copyLabel?: string;
  /** Called with the secret when Copy is pressed; the app wires the real clipboard. */
  onCopy: (secret: string) => void;
  onDismiss?: () => void;
  /** Loading state (#278): the panel renders skeletons mirroring
   * its layout — title and hint bones at their own sizes, a text
   * bone inside the secret box at the box's geometry, and its
   * Copy / Dismiss actions kept in place as inert rectangle
   * skeletons (Buttons skeletonize themselves inside the loading
   * scope). The secret itself never renders while loading. An
   * enclosing composite's LoadingScope can also put the panel
   * into this state without prop-drilling. */
  loading?: boolean;
};

/**
 * Show-once secret display (API tokens, recovery codes, etc.). Renders the
 * secret in mono inside a bordered box with Copy and optional Dismiss
 * actions. The container announces politely so its appearance is
 * announced — `role="status"` on web, `accessibilityLiveRegion="polite"`
 * on native, via `politeLiveRegionProps` (`status` is not a valid React
 * Native `accessibilityRole` and crashes Android — spudly/eciperay#156).
 * The app wires `onCopy` to the real clipboard API.
 */
export function SecretRevealPanel({
  secret,
  title,
  copyLabel,
  onCopy,
  onDismiss,
  loading = false,
}: SecretRevealPanelProps) {
  const voice = useVoice();
  const resolvedTitle = title ?? voice.secretRevealPanel.title;
  const resolvedCopyLabel = copyLabel ?? voice.secretRevealPanel.copyLabel;
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same stack — a title bone at the
    // subheading size, a hint bone at the hint size, the secret
    // box holding one bone at the mono line's size, and the
    // actions row rendered inside the loading scope so its
    // Buttons render as inert rectangle skeletons at their
    // normal geometry (Stephen on #551). The region is marked
    // busy, not live: a skeleton announces nothing, and the
    // secret value itself never appears.
    return (
      <LoadingScope active>
        <Col gap="m" {...platformAccessibilityProps({ accessibilityState: { busy: true } })}>
          <Col width="55%">
            <TextSkeleton size="xl" lines={1} />
          </Col>
          <Col width="75%">
            <TextSkeleton size="sm" lines={1} />
          </Col>
          <SecretBox>
            <Col grow shrink>
              <TextSkeleton size="sm" lines={1} />
            </Col>
          </SecretBox>
          <Row gap="s">
            <Button variant="primary" size="sm" onPress={() => { onCopy(secret); }}>
              {resolvedCopyLabel}
            </Button>
            {onDismiss ? (
              <Button variant="secondary" size="sm" onPress={onDismiss}>
                {voice.secretRevealPanel.dismissLabel}
              </Button>
            ) : null}
          </Row>
        </Col>
      </LoadingScope>
    );
  }
  return (
    <Col gap="m" {...politeLiveRegionProps}>
      <Text variant="subheading">{resolvedTitle}</Text>
      <Text variant="hint">{voice.secretRevealPanel.hint}</Text>
      <SecretBox>
        <Text
          style={{
            fontFamily: tokens.typography.fontFamily.mono,
            fontSize: tokens.typography.fontSize.sm,
            flex: 1,
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {secret}
        </Text>
      </SecretBox>
      <Row gap="s">
        <Button variant="primary" size="sm" onPress={() => { onCopy(secret); }}>
          {resolvedCopyLabel}
        </Button>
        {onDismiss ? (
          <Button variant="secondary" size="sm" onPress={onDismiss}>
            {voice.secretRevealPanel.dismissLabel}
          </Button>
        ) : null}
      </Row>
    </Col>
  );
}
