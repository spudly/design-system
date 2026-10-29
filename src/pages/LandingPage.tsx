import { Button } from "../components/Button.js";
import { CardGrid } from "../components/CardGrid.js";
import { CtaRow } from "../components/CtaRow.js";
import { FeatureCard } from "../components/FeatureCard.js";
import { Hero } from "../components/Hero.js";
import { ScreenContainer } from "../components/ScreenContainer.js";

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
 * The page composes components and passes data only (#119): the
 * hero is Hero, the CTAs are Button href links in a CtaRow, and
 * the feature slots are FeatureCards in a CardGrid — each
 * component owns its treatment; the page keeps the structure
 * and the content contract.
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
      <Hero title={heroTitle} subtitle={heroSubtitle} />
      <CtaRow>
        <Button href={discoverCta.href} variant="primary">
          {discoverCta.label}
        </Button>
        <Button href={signUpCta.href} variant="secondary">
          {signUpCta.label}
        </Button>
        <Button href={getAppCta.href} variant="secondary">
          {getAppCta.label}
        </Button>
      </CtaRow>
      <CardGrid>
        <FeatureCard feature={featureOne} />
        <FeatureCard feature={featureTwo} />
        <FeatureCard feature={featureThree} />
      </CardGrid>
    </ScreenContainer>
  );
}
