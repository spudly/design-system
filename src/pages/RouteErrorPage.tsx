import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Text } from "../widgets/Text.js";
import { TextLink } from "../widgets/TextLink.js";
import { useVoice } from "../voice/index.js";

/**
 * RouteErrorPage (#438 Part 3): the router's fallback page —
 * the not-found and unexpected-error states a route boundary
 * renders — as a page, so hosts no longer compose
 * ScreenContainer / Text / TextLink for it themselves (the
 * eciperay audit's coverage disposition for those specifiers).
 *
 * The copy is the page's own generic wording per variant,
 * read from the voice object (#539) and overridable by the
 * host; the way home crosses as an href, not a press
 * callback — it navigates (#248).
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

export function RouteErrorPage({
  variant,
  title: titleProp,
  message: messageProp,
  homeHref = "/",
  homeLabel: homeLabelProp,
  footer,
}: RouteErrorPageProps) {
  const voice = useVoice();
  const defaultTitle =
    variant === "notFound" ? voice.routeErrorPage.notFoundTitle : voice.routeErrorPage.errorTitle;
  const defaultMessage =
    variant === "notFound"
      ? voice.routeErrorPage.notFoundMessage
      : voice.routeErrorPage.errorMessage;
  const title = titleProp ?? defaultTitle;
  const message = messageProp ?? defaultMessage;
  const homeLabel = homeLabelProp ?? voice.routeErrorPage.homeLabel;
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <SectionStack>
          <Text variant="heading">{title}</Text>
          <Text variant="body">{message}</Text>
          <TextLink href={homeHref}>{homeLabel}</TextLink>
        </SectionStack>
      </ScreenContainer>
    </BigFooterShell>
  );
}
