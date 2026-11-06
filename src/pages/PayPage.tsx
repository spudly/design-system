import { BigFooterShell, type BigFooterData } from "../components/BigFooter.js";
import { Button } from "../components/Button.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { SectionCard } from "../components/SectionCard.js";
import { SectionStack } from "../components/SectionStack.js";
import { Spinner } from "../components/Spinner.js";
import { Text } from "../components/Text.js";

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
 * the states' presentation and the generic copy (the
 * PublicRecipePage DS-owned-copy precedent — the copy names
 * no brand, so both apps share the page); the way out of the
 * terminal states crosses as intents (`onRetryPress`,
 * `onHomePress`), with the home button's label supplied by
 * the host because it names the host's home.
 */
export type PayPageStatus = "unconfigured" | "needs-transaction" | "opening" | "closed" | "error";

export type PayPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  status: PayPageStatus;
  /** Reopen the checkout window (the closed and error states). */
  onRetryPress?: () => void;
  /** Leave for the host's home (the needs-transaction state). */
  onHomePress?: () => void;
  /** The home button's label; it names the host's home, so the host supplies it. */
  homeLabel?: string;
};

const STATUS_COPY: Record<PayPageStatus, { title: string; body?: string }> = {
  unconfigured: {
    title: "Complete your purchase",
    body: "Checkout isn't configured yet, so there's nothing to pay for here.",
  },
  "needs-transaction": {
    title: "Checkout",
    body: "This page completes a purchase started somewhere else — it needs the checkout link from that purchase to open a payment window.",
  },
  opening: {
    title: "Complete your purchase",
  },
  closed: {
    title: "Complete your purchase",
    body: "The payment window was closed before the purchase finished.",
  },
  error: {
    title: "Complete your purchase",
    body: "The payment window couldn't be opened. Check your connection and try again.",
  },
};

export function PayPage({
  status,
  onRetryPress,
  onHomePress,
  homeLabel = "Go to home",
  footer,
}: PayPageProps) {
  const copy = STATUS_COPY[status];
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer variant="padded">
        <SectionCard title={copy.title} variant="elevated">
          <SectionStack>
            {status === "opening" ? (
              <>
                <Spinner label="Opening the secure payment window" />
                <Text variant="body">Opening the secure payment window…</Text>
              </>
            ) : (
              <>
                {copy.body ? <Text variant="body">{copy.body}</Text> : null}
                {status === "needs-transaction" && onHomePress ? (
                  <Button variant="primary" onPress={onHomePress}>
                    {homeLabel}
                  </Button>
                ) : null}
                {(status === "closed" || status === "error") && onRetryPress ? (
                  <Button variant="primary" onPress={onRetryPress}>
                    {status === "closed" ? "Reopen checkout" : "Try again"}
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
