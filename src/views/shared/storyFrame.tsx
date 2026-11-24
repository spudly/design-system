import type { ReactNode } from "react";
import { View } from "tamagui";
import { tokens } from "../../tokens/index.js";

type StoryFrameVariant = "phone" | "dialog" | "banner" | "panel" | "overlayPanel";

type StoryFrameProps = {
  children: ReactNode;
  /**
   * The named frame configuration the story needs — variants, not
   * styling props (DS components own their styles; this story-only
   * helper follows the same rule):
   * - `phone`: fixed 844 height (full-phone views)
   * - `dialog`: fixed 500 height (dialog-shaped views)
   * - `banner`: fixed 300 height (banner views)
   * - `panel`: the standard $4 inset (form/panel views)
   * - `overlayPanel`: $4 inset on the overlay surface color
   *   (views shown over a scrim/backdrop)
   * No variant: the plain 430px column.
   */
  variant?: StoryFrameVariant;
};

const heightFor: Partial<Record<StoryFrameVariant, number>> = {
  phone: 844,
  dialog: 500,
  banner: 300,
};

/**
 * The one shared story frame for view stories (#668): a 430px-wide
 * phone-width column, replacing the per-file `Viewport` helpers that
 * were copy-pasted across every story file. Page stories do not use
 * this — the Storybook preview decorator frames them from the
 * resolved dsViewport (toolbar, story parameter, phone preset) so
 * the viewport toolbar can drive their width.
 */
export function StoryFrame({ children, variant }: StoryFrameProps) {
  const padded = variant === "panel" || variant === "overlayPanel";
  const onOverlay = variant === "overlayPanel";
  return (
    <View
      width={430}
      maxWidth="100%"
      height={variant ? heightFor[variant] : undefined}
      padding={padded ? "$4" : undefined}
      backgroundColor={onOverlay ? tokens.colors.gray.gray10 : undefined}
    >
      {children}
    </View>
  );
}
