import { BigFooterShell, type BigFooterData, type BigFooterShellHeader } from "../../widgets/content/BigFooter.js";
import { Col } from "../../widgets/layout/Col.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { Text } from "../../widgets/data/Text.js";
import { TextLink } from "../../widgets/actions/TextLink.js";

/**
 * AuthConfirmationPage (#438 Part 3): the post-auth
 * confirmation screen — the full-screen replacement state an
 * auth flow lands on ("check your email", "password updated")
 * — as a page, so hosts no longer compose ScreenContainer /
 * Text / TextLink for it themselves (the eciperay audit's
 * coverage disposition for those specifiers).
 *
 * The copy is the caller's (each flow confirms something
 * different), so title and body cross as props; the optional
 * way back crosses as an href, not a press callback — it
 * navigates (#248). The shell is the auth shell the other
 * auth pages use (SignInPage / SignUpPage).
 */
export type AuthConfirmationPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /** The page header data (#857): when supplied, the shell renders the full AppTopBar above the content. */
  header?: BigFooterShellHeader;
  title: string;
  body: string;
  /** The way back's label; renders only with `backHref`. */
  backLabel?: string;
  /** The way back's destination (#248: navigation crosses as an href). */
  backHref?: string;
};

export function AuthConfirmationPage({
  title,
  body,
  backLabel,
  backHref,
  footer,
  header,
}: AuthConfirmationPageProps) {
  return (
    <BigFooterShell footer={footer} header={header}>
      <ScreenContainer variant="auth">
        <Col gap="xxl">
          <Text variant="heading">{title}</Text>
          <Text variant="muted">{body}</Text>
          {backHref && backLabel ? <TextLink href={backHref}>{backLabel}</TextLink> : null}
        </Col>
      </ScreenContainer>
    </BigFooterShell>
  );
}
