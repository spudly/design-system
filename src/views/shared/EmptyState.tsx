import { Col } from "../../widgets/layout/Col.js";
import { iconsByName, type IconName } from "../../icons/iconRegistry.js";
import { tokens } from "../../tokens/index.js";
import { politeLiveRegionProps } from "../../widgets/accessibility.js";
import { Button } from "../../widgets/actions/Button.js";
import { Text } from "../../widgets/data/Text.js";

export type EmptyStateProps = {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Link form of the action (#856): when the action navigates, the
   * host supplies `actionHref` instead of `onAction` and the action
   * renders in Button's href form (a real link, #248). Exactly one
   * of `onAction` / `actionHref` is supplied alongside `actionLabel`.
   */
  actionHref?: string;
  /**
   * Optional decorative icon (#856): a DS icon name rendered above
   * the title in the theme's primary ink. The title and body carry
   * the meaning; the glyph is aria-hidden.
   */
  icon?: IconName;
  /**
   * Announce this empty state as a polite status message when it
   * appears — for empty states that are the RESULT of an action
   * (e.g. a completed search with no matches), which screen-reader
   * users otherwise have to navigate to discover. Leave unset for
   * empty states that are simply an initial list state.
   */
  announce?: boolean;
};

/**
 * Empty-state composition: optional icon, title, optional body,
 * optional action. Used for empty lists, empty search results, and
 * "nothing due" states. The action is a callback (`onAction`) for
 * in-place recovery or a link (`actionHref`) for navigation (#248,
 * #856). With `announce`, the container carries
 * `politeLiveRegionProps` (`role="status"` on web,
 * `accessibilityLiveRegion="polite"` on native — the
 * SecretRevealPanel pattern).
 */
export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  actionHref,
  icon,
  announce,
}: EmptyStateProps) {
  const Glyph = icon === undefined ? undefined : iconsByName[icon];
  const glyphInk = tokens.colors.primary.primary8;
  return (
    <Col center middle gap="s" p="xl" {...(announce ? politeLiveRegionProps : null)}>
      {Glyph ? <Glyph size={32} color={glyphInk} /> : null}
      <Text variant="subheading">{title}</Text>
      {body ? (
        <Text variant="hint" textAlign="center">
          {body}
        </Text>
      ) : null}
      {actionLabel && actionHref ? (
        <Button variant="secondary" href={actionHref}>
          {actionLabel}
        </Button>
      ) : actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Col>
  );
}
