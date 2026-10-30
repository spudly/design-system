import { XStack, YStack } from "tamagui";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { ScreenContainer } from "../components/ScreenContainer.js";
import { Text } from "../components/Text.js";

/**
 * LandingPage (#171, B7/C11): the signed-out marketing landing —
 * the content view of Eciperay's `/` surface for signed-out
 * visitors. The web host keeps the routing branch (signed-out
 * visitors land here; signed-in users get the DS-adopted home),
 * the public chrome (the shared public frame is a DS building
 * block the host composes around this view, per the ownership
 * model Stephen confirmed on #171), and the analytics consent
 * banner.
 *
 * The copy crosses as props (the HomePage precedent): the
 * strings and hrefs are the app's content constants, so the
 * host passes them in rather than the DS baking in app copy.
 *
 * CTA mechanics (Stephen's decision on #171, 2026-10-28): the
 * CTAs navigate, so they are real links — `{label, href}` data
 * props rendered as anchors — not press callbacks. That is the
 * navigation rule (a control that navigates is a link with an
 * href) and the deliberate exception for public web surfaces;
 * signed-in app pages keep the callbacks-out pattern. The
 * anchors are Button's href form (Stephen's ruling on PR #311):
 * an earlier dedicated CtaLink component duplicated that form
 * and was deleted — the CTAs render through <Button href>
 * (ButtonLink) with the primary/secondary variants.
 *
 * The features are three FIXED slots (Stephen's decision on
 * #171, against the array lean): the page's structure is fixed,
 * and adding a fourth feature later is a deliberate contract
 * change, not a longer array from the host.
 *
 * The page composes its sections directly (#119; Stephen's
 * no-new-components rule for tranche PRs, 2026-10-29): the hero,
 * the CTA row, and the feature grid are page-local composition,
 * not library components — the hero's centering and top
 * breathing room, the CTA row's geometry, the cards' flex and
 * 260px wrap basis, and the grid's wrap are this page's design,
 * rendered here from the shared primitives (Text, Button, Card,
 * and the Tamagui stacks). An earlier tranche cut extracted
 * them as Hero / CtaRow / FeatureCard / CardGrid library
 * components; they had no second consumer, so they were folded
 * back into the page.
 *
 * CTA row geometry (#171): the CTAs under the hero stack
 * narrow and row on wide. The DS Tamagui config defines no
 * width breakpoints — the contract's narrow rendering is the
 * native one (the RN storybook / Android VR capture) and its
 * wide rendering is web — so the row is a flat `web:` clause on
 * a column stack, the ScreenContainer idiom. A wrapping row
 * could seat two CTAs side by side at the 430px story viewport,
 * which is not the contracted stack, so the row deliberately
 * does not wrap. Tamagui applies the clause when IT compiles
 * the style; ui's web build is Vite, which does not run the
 * compiler, so the clause only takes effect behind a consumer
 * that compiles (Tamagui's Vite plugin / Metro) — the contract
 * records the intended responsive geometry whatever the
 * consumer.
 */

export type LandingPageCta = {
  label: string;
  href: string;
};

export type LandingPageFeature = {
  title: string;
  description: string;
};

export type LandingPageProps = {
  heroTitle: string;
  heroSubtitle: string;
  discoverCta: LandingPageCta;
  signUpCta: LandingPageCta;
  getAppCta: LandingPageCta;
  featureOne: LandingPageFeature;
  featureTwo: LandingPageFeature;
  featureThree: LandingPageFeature;
};

export function LandingPage({
  heroTitle,
  heroSubtitle,
  discoverCta,
  signUpCta,
  getAppCta,
  featureOne,
  featureTwo,
  featureThree,
}: LandingPageProps) {
  return (
    <ScreenContainer>
      <YStack alignItems="center" gap="$3" paddingTop="$6">
        <Text variant="heading" textAlign="center">
          {heroTitle}
        </Text>
        <Text color="$textMuted" textAlign="center">
          {heroSubtitle}
        </Text>
      </YStack>
      <YStack flexDirection="web:row" gap="$3" alignItems="center" justifyContent="center">
        <Button href={discoverCta.href} variant="primary">
          {discoverCta.label}
        </Button>
        <Button href={signUpCta.href} variant="secondary">
          {signUpCta.label}
        </Button>
        <Button href={getAppCta.href} variant="secondary">
          {getAppCta.label}
        </Button>
      </YStack>
      <XStack flexWrap="wrap" gap="$3">
        {[featureOne, featureTwo, featureThree].map((feature) => (
          <Card key={feature.title} flex={1} flexBasis={260} gap="$2">
            <Text variant="subheading">{feature.title}</Text>
            <Text color="$textMuted">{feature.description}</Text>
          </Card>
        ))}
      </XStack>
    </ScreenContainer>
  );
}
