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
 * no text, the overlay paints nothing. The frame's visible texts
 * are marked `accessible={false}` in the native rendering — the
 * overlay's composed label is the row's one accessibility stop,
 * the native counterpart of the web anchor wrapping its texts.
 *
 * Layering contract: render the overlay as the frame's LAST child
 * (the topmost layer). Native hit testing targets the topmost view
 * under the touch and bubbles through its ancestors only — a
 * sibling overlay UNDER the content would never see presses that
 * land on the content's plain views, so the overlay sits on top
 * and takes the surface's presses directly. The one exception is
 * a frame whose content nests a pressable of its own (RecipesPage's
 * text block, with the log-cook control in its subtitle flow):
 * there the overlay renders FIRST (bottom layer) and the frame's
 * non-interactive content is made pointer-transparent
 * (`pointerEvents="none"` on the plain texts, `"box-none"` on the
 * flow wrapper), so hit testing falls through the content to the
 * overlay while the nested pressable — which keeps the default
 * pointer events — still takes its own presses.
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
