import { Anchor } from "tamagui";
import {
  platformAccessibilityProps,
  type TranslatableAccessibilityProps,
} from "./accessibility.js";

export type LinkOverlayProps = TranslatableAccessibilityProps & {
  href: string;
};

/**
 * The native half of a view-level link surface — a card, a row, a
 * text block — whose web half is a Tamagui Anchor wrapped around
 * the surface's content.
 *
 * Tamagui's Anchor is a styled SizableText: a React Native `Text`.
 * That is the right element for a text-shaped link (Button,
 * TextLink, BackLink — a single label in a text frame), but on
 * native it cannot carry a multi-child subtree. Children of a
 * native Text compose as one inline text run, so block structure
 * inside the anchor is lost: stacked title/subtitle children flow
 * inline after each other at the anchor's text weight, and view
 * children (a card, a thumbnail, a star row) are measured by text
 * layout — the card collapses to a narrow pill and row content
 * overflows its card (the #248 stage-2 rows in PR #295's Android
 * captures). On web the same Anchor is pinned to `display: flex`,
 * a real flex container, which is why the defect is native-only.
 *
 * So a multi-child link surface platform-splits (the DiscoveryCard
 * pattern, extended to keep the native press behavior the href
 * forms promise): on web the Anchor wraps the content exactly as
 * before; on native a view-level frame — the caller's Card /
 * YStack / View, given `position: "relative"` — lays the content
 * out, and this overlay, a childless Anchor stretched over the
 * frame, carries the href and the link's accessibility props. A
 * press on the surface reaches the overlay and opens the href
 * through the platform link path (the Anchor's own `Linking`
 * handling), preserving the href forms' native contract; rendering
 * no text, the overlay paints nothing.
 *
 * Layering contract: render the overlay as the frame's FIRST child
 * (the bottom layer). Content above it that is not itself pressable
 * — plain texts and views — does not consume touches, so presses
 * fall through to the overlay, while a pressable nested inside the
 * content (RecipesPage's log-cook control) sits above the overlay
 * and keeps its own presses.
 */
export function LinkOverlay({ href, ...a11yProps }: LinkOverlayProps) {
  return (
    <Anchor
      href={href}
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      {...platformAccessibilityProps(a11yProps)}
    />
  );
}
