import { BigFooterShell, type BigFooterData } from "../widgets/BigFooter.js";
import { Button } from "../widgets/Button.js";
import { ScreenContainer } from "../widgets/ScreenContainer.js";
import { SectionCard } from "../widgets/SectionCard.js";
import { SectionStack } from "../widgets/SectionStack.js";
import { Spinner } from "../widgets/Spinner.js";
import { Text } from "../widgets/Text.js";
import { useVoice } from "../voice/index.js";

/**
 * PayPage (#438 Part 3): the checkout-completion page — the
 * card a payment provider integration lands on to open its
 * checkout window — as a page, so hosts no longer compose
 * ScreenContainer / SectionCard / Text / Button / Spinner for
 * it themselves (the eciperay audit's coverage disposition
 * for those specifiers).
 *
 * The provider session stays with the host: it opens the
 * checkout window from the transaction it was handed and
 * reports the outcome as the `status` union. The page owns
 * the states' presentation and the generic copy, read from
 * the voice object (#539 — the copy names no brand, so both
 * apps share the page); the way out of the terminal
 * states crosses as intents (`onRetryPress`), and
 * home is an href (`homeHref`) because it navigates, with
 * the home button's label supplied by the host because it
 * names the host's home.
 */
export type PayPageStatus = "unconfigured" | "needs-transaction" | "opening" | "closed" | "error";

export type PayPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  status: PayPageStatus;
  /** Reopen the checkout window (the closed and error states). */
  onRetryPress?: () => void;
  /** Leave for the host's home (the needs-transaction state): an href, because it navigates. */
  homeHref?: string;
  /** The home button's label; it names the host's home, so it defaults to the voice slot and the host may override it. */
  homeLabel?: string;
};

export function PayPage({
  status,
  onRetryPress,
  homeHref,
  homeLabel: homeLabelProp,
  footer,
}: PayPageProps) {
  const voice = useVoice();
  const copy =
    status === "needs-transaction"
      ? { title: voice.payPage.needsTransactionTitle, body: voice.payPage.needsTransactionBody }
      : status === "unconfigured"
        ? { title: voice.payPage.title, body: voice.payPage.unconfiguredBody }
        : status === "closed"
          ? { title: voice.payPage.title, body: voice.payPage.closedBody }
          : status === "error"
            ? { title: voice.payPage.title, body: voice.payPage.errorBody }
            : { title: voice.payPage.title, body: undefined };
  const homeLabel = homeLabelProp ?? voice.payPage.homeLabel;
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <SectionCard title={copy.title} variant="elevated">
          <SectionStack>
            {status === "opening" ? (
              <>
                <Spinner label={voice.payPage.openingLabel} />
                <Text variant="body">{voice.payPage.openingMessage}</Text>
              </>
            ) : (
              <>
                {copy.body ? <Text variant="body">{copy.body}</Text> : null}
                {status === "needs-transaction" && homeHref ? (
                  <Button variant="primary" href={homeHref}>
                    {homeLabel}
                  </Button>
                ) : null}
                {(status === "closed" || status === "error") && onRetryPress ? (
                  <Button variant="primary" onPress={onRetryPress}>
                    {status === "closed" ? voice.payPage.reopenLabel : voice.payPage.retryLabel}
                  </Button>
                ) : null}
              </>
            )}
          </SectionStack>
        </SectionCard>
      </ScreenContainer>
    </BigFooterShell>
  );
}
