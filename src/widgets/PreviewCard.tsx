import type { ReactNode } from "react";
import { YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "./accessibility.js";
import { useLoadingScope } from "./LoadingScope.js";
import { Text } from "./Text.js";
import { TextSkeleton } from "./TextSkeleton.js";

export type PreviewCardProps = {
  /**
   * Optional heading at the top of the card, naming what the
   * preview shows (e.g. "Your recipe"). Rendered in the card's
   * own title treatment; omit it when the preview names itself.
   */
  title?: string;
  /**
   * Optional actions rendered below the preview content (e.g.
   * the confirm button for the previewed result), separated
   * from the content by the card's own spacing.
   */
  actions?: ReactNode;
  /** The preview content itself — host-rendered, framed here. */
  children: ReactNode;
  /** Loading state (#278): the frame renders text skeletons in
   * place of its title and preview content, with no actions.
   * An enclosing composite's LoadingScope can also put the
   * card into this state without prop-drilling. */
  loading?: boolean;
};

/**
 * Framed preview panel: a bordered surface card that frames
 * content the host renders — a parsed result, a proposed
 * change, a draft — so the user can review it before acting.
 * The frame (border, surface fill, padding), the title
 * treatment, and the actions separation are the card's own;
 * the caller supplies only the title text, the preview node,
 * and the action controls. Extracted for the #119 page
 * de-styling program: the import review and the AI session
 * preview stage framed their previews with identical
 * hand-styled stacks.
 */
export function PreviewCard({ title, actions, children, loading = false }: PreviewCardProps) {
  const showSkeleton = useLoadingScope(loading);
  if (showSkeleton) {
    // Loading (#278): the same frame, with a title skeleton when
    // the card is titled and a three-line text skeleton standing
    // in for the preview content — no host content, no actions,
    // and the region marked busy.
    return (
      <YStack
        borderRadius={tokens.radii.lg}
        borderWidth={1}
        borderColor={tokens.colors.gray.gray3}
        backgroundColor="$surface"
        padding="$4"
        {...platformAccessibilityProps({ accessibilityState: { busy: true } })}
      >
        {title ? (
          <YStack paddingBottom="$3">
            <TextSkeleton lines={1} />
          </YStack>
        ) : null}
        <TextSkeleton lines={3} />
      </YStack>
    );
  }
  return (
    <YStack
      borderRadius={tokens.radii.lg}
      borderWidth={1}
      borderColor={tokens.colors.gray.gray3}
      backgroundColor="$surface"
      padding="$4"
    >
      {title ? (
        <YStack paddingBottom="$3">
          <Text
            fontSize={tokens.typography.fontSize.sm}
            fontWeight={tokens.typography.fontWeight.semibold}
            color={tokens.colors.gray.gray10}
          >
            {title}
          </Text>
        </YStack>
      ) : null}
      {children}
      {actions ? <YStack paddingTop="$4">{actions}</YStack> : null}
    </YStack>
  );
}
