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
      // This outer layer stays full-width so the $surface paint covers
      // the whole screen; the content column inside it is capped and
      // centered by StyledAuthContent at the FormScreenLayout geometry
      // (480px) — without the cap the auth pages stretched edge-to-edge
      // on desktop web (#265). Centering comes from this layer's
      // alignItems, not alignSelf on the column, so it holds under any
      // parent, flex or block. On phone-width viewports the cap does
      // not bind and nothing changes.
      auth: {
        backgroundColor: "$surface",
        paddingHorizontal: tokens.spacing[6],
        paddingTop: 80,
        alignItems: "center",
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
  },
});

/**
 * The capped, centered content column rendered inside the `auth`
 * shell (see the auth variant above): 480px wide at most, with the
 * shell's section gap between the page's children.
 */
const StyledAuthContent = styled(YStack, {
  name: "ScreenContainerAuthContent",

  width: "100%",
  maxWidth: 480,
  gap: tokens.spacing[4],
});

type StyledContentProps = GetProps<typeof StyledContent>;

export type ScreenContainerProps = StyledContentProps & {
  /** Wrap content in a scroll view. Defaults to true. */
  scrollable?: boolean;
  /**
   * Shell mode: `default` page padding, `padded` (wider), `list` (flush —
   * caller manages padding), `auth` (surface background, large top offset,
   * content in a centered column capped at 480px).
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
  const content = (
    <StyledContent {...rest}>
      {rest.variant === "auth" ? <StyledAuthContent>{children}</StyledAuthContent> : children}
    </StyledContent>
  );
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
