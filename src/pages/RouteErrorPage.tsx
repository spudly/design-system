import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionStack } from "../components/SectionStack.js";
import { Text } from "../components/Text.js";
import { TextLink } from "../components/TextLink.js";

/**
 * RouteErrorPage (#438 Part 3): the router's fallback page —
 * the not-found and unexpected-error states a route boundary
 * renders — as a page, so hosts no longer compose
 * ScreenContainer / Text / TextLink for it themselves (the
 * eciperay audit's coverage disposition for those specifiers).
 *
 * The copy is the page's own generic wording per variant (the
 * DS-owned-copy precedent), overridable by the host; the way
 * home crosses as an href, not a press callback — it
 * navigates (#248).
 */
export type RouteErrorPageVariant = "notFound" | "error";

export type RouteErrorPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  variant: RouteErrorPageVariant;
  title?: string;
  message?: string;
  /** The home destination (#248: navigation crosses as an href). */
  homeHref?: string;
  homeLabel?: string;
};

const VARIANT_COPY: Record<RouteErrorPageVariant, { title: string; message: string }> = {
  notFound: {
    title: "Page not found",
    message: "We couldn't find that page. It may have been moved or the link may be broken.",
  },
  error: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Try reloading the page, or head back home.",
  },
};

export function RouteErrorPage({
  variant,
  title,
  message,
  homeHref = "/",
  homeLabel = "Go to the home page",
  footer,
}: RouteErrorPageProps) {
  const copy = VARIANT_COPY[variant];
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <SectionStack>
          <Text variant="heading">{title ?? copy.title}</Text>
          <Text variant="body">{message ?? copy.message}</Text>
          <TextLink href={homeHref}>{homeLabel}</TextLink>
        </SectionStack>
      </ScreenContainer>
    </BigFooterShell>
  );
}
