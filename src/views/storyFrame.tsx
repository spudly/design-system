import type { ReactNode } from "react";
import { View } from "tamagui";
import { tokens } from "../tokens/index.js";

export type StoryFrameProps = {
  children: ReactNode;
  /** Fixed frame height for views whose stories pin one (banners, dialogs). */
  height?: number;
  /** Pad the frame with the standard $4 inset (form/panel views). */
  padded?: boolean;
  /** Render on the overlay surface color (views shown over a scrim/backdrop). */
  onOverlay?: boolean;
};

/**
 * The one shared story frame for view stories (#668): a 430px-wide
 * phone-width column, replacing the per-file `Viewport` helpers that
 * were copy-pasted across every story file. Page stories do not use
 * this — the Storybook preview decorator frames them from the
 * `dsViewport` global so the viewport toolbar can drive their width.
 */
export function StoryFrame({ children, height, padded = false, onOverlay = false }: StoryFrameProps) {
  return (
    <View
      width={430}
      maxWidth="100%"
      height={height}
      padding={padded ? "$4" : undefined}
      backgroundColor={onOverlay ? tokens.colors.gray.gray10 : undefined}
    >
      {children}
    </View>
  );
}
