import { ScrollView, YStack, styled } from "tamagui";
import type { GetProps } from "tamagui";
import { tokens } from "../tokens/index.js";

const StyledContent = styled(YStack, {
  name: "ScreenContainer",

  flex: 1,
  minHeight: "100%",
  paddingHorizontal: tokens.spacing[4],
  paddingVertical: tokens.spacing[4],
  gap: tokens.spacing[4],

  variants: {
    variant: {
      // Standard page: default padding on all sides.
      default: {},
      // Wider page: broader horizontal padding and a larger top offset,
      // for content-led screens (the old ui-screen-shell-padded).
      padded: {
        paddingHorizontal: tokens.spacing[6],
        paddingTop: tokens.spacing[8],
      },
      // Flush: no container padding — callers manage their own, e.g. a
      // FlatList with its own content padding.
      list: {
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      // Auth shell: surface background, wide horizontal padding, and a
      // large top offset for sign-in flows (the old ui-screen-shell-auth).
      // 80px is the shell's fixed top offset; it is not on the spacing scale.
      // The content column is capped and centered at the FormScreenLayout
      // geometry (480px of content): without the cap the auth pages
      // stretched edge-to-edge on desktop web (#265). maxWidth is the
      // border box, so it is the 480px content width plus this variant's
      // horizontal padding on both sides (2 × spacing[6] = 48px). On
      // phone-width viewports the cap does not bind and nothing changes.
      auth: {
        backgroundColor: "$surface",
        paddingHorizontal: tokens.spacing[6],
        paddingTop: 80,
        width: "100%",
        maxWidth: 480 + 2 * tokens.spacing[6],
        alignSelf: "center",
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
  },
});

type StyledContentProps = GetProps<typeof StyledContent>;

export type ScreenContainerProps = StyledContentProps & {
  /** Wrap content in a scroll view. Defaults to true. */
  scrollable?: boolean;
  /**
   * Shell mode: `default` page padding, `padded` (wider), `list` (flush —
   * caller manages padding), `auth` (surface background, large top offset).
   * Page background for the other modes stays a caller/stack prop, as
   * before; only `auth` bakes in its surface background.
   */
  variant?: "default" | "padded" | "list" | "auth";
};

/**
 * Page scaffold: full-height container with horizontal page padding and
 * consistent vertical spacing between sections. Scrollable by default;
 * pass `scrollable={false}` for fixed-height screens. Use `variant` for
 * the padded, list, and auth shell modes.
 */
export function ScreenContainer({ scrollable = true, children, ...rest }: ScreenContainerProps) {
  const content = <StyledContent {...rest}>{children}</StyledContent>;
  if (!scrollable) {
    return content;
  }
  return (
    <ScrollView
      flex={1}
      // Tamagui v3 removed the $platform-web sub-object; web-only styles
      // are now flat `web:` clauses on each property value.
      display="web:flex"
      flexDirection="web:column"
      minHeight="web:100%"
    >
      {content}
    </ScrollView>
  );
}
