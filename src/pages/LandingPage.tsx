import { Anchor, XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
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
 * signed-in app pages keep the callbacks-out pattern.
 *
 * The features are three FIXED slots (Stephen's decision on
 * #171, against the array lean): the page's structure is fixed,
 * and adding a fourth feature later is a deliberate contract
 * change, not a longer array from the host.
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

/**
 * One hero CTA: a real anchor wearing the Button variants'
 * styling (primary = filled brand, secondary = muted fill), so
 * the landing's links read as the same calls to action the
 * app's buttons do while keeping native link semantics — an
 * `href` and the link role on web (crawlable, open-in-new-tab);
 * on native the anchor opens the URL.
 */
function LandingCta({ cta, variant }: { cta: LandingPageCta; variant: "primary" | "secondary" }) {
  return (
    <Anchor
      href={cta.href}
      backgroundColor={variant === "primary" ? "$primary" : tokens.colors.gray.gray3}
      color={variant === "primary" ? "$onPrimary" : tokens.colors.gray.gray10}
      fontSize={tokens.typography.fontSize.md}
      fontWeight={tokens.typography.fontWeight.semibold}
      paddingHorizontal={tokens.spacing[4]}
      paddingVertical={tokens.spacing[3]}
      borderRadius={tokens.radii.md}
      textAlign="center"
      textDecorationLine="none"
    >
      {cta.label}
    </Anchor>
  );
}

/** One fixed feature slot: a uniform card — title + one line. */
function LandingFeatureCard({ feature }: { feature: LandingPageFeature }) {
  return (
    <Card flex={1} flexBasis={260} gap="$2">
      <Text variant="subheading">{feature.title}</Text>
      <Text color="$textMuted">{feature.description}</Text>
    </Card>
  );
}

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
      <XStack flexWrap="wrap" gap="$3" justifyContent="center">
        <LandingCta cta={discoverCta} variant="primary" />
        <LandingCta cta={signUpCta} variant="secondary" />
        <LandingCta cta={getAppCta} variant="secondary" />
      </XStack>
      <XStack flexWrap="wrap" gap="$3">
        <LandingFeatureCard feature={featureOne} />
        <LandingFeatureCard feature={featureTwo} />
        <LandingFeatureCard feature={featureThree} />
      </XStack>
    </ScreenContainer>
  );
}
