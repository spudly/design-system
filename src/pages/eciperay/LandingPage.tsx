import { BigFooterShell, type BigFooterData } from "../../widgets/content/BigFooter.js";
import { Button } from "../../widgets/actions/Button.js";
import { Col } from "../../widgets/layout/Col.js";
import { Card } from "../../widgets/layout/Card.js";
import { CardGrid } from "../../widgets/layout/CardGrid.js";
import { ScreenContainer } from "../../widgets/layout/ScreenContainer.js";
import { StackedButtonRow } from "../../widgets/actions/StackedButtonRow.js";
import { Text } from "../../widgets/data/Text.js";
import {
  ConsentBannerView,
  type ConsentBannerViewProps,
} from "../../views/shared/ConsentBannerView.js";
import {
  InstallBannerView,
  type InstallBannerViewProps,
} from "../../views/shared/InstallBannerView.js";

/**
 * LandingPage (#171, B7/C11): the signed-out marketing landing —
 * the content view of Eciperay's `/` surface for signed-out
 * visitors. The web host keeps the routing branch (signed-out
 * visitors land here; signed-in users get the DS-adopted home)
 * and the public chrome (the shared public frame is a DS building
 * block the host composes around this view, per the ownership
 * model Stephen confirmed on #171).
 *
 * Banners (#879 — supersedes the earlier note that the host
 * keeps the analytics consent banner): this page renders the
 * consent banner and the mobile-app install banner itself,
 * like the shell pages — the host passes each banner's state
 * as DATA (`consentBanner` / `installBanner`, the banner
 * views' own prop shapes): presence is visibility, copy and
 * labels cross as data (the views' label props fall back to
 * the voice defaults), and accept / decline / dismiss are
 * bare callbacks. The consent record, the analytics wiring,
 * and the install dismissal state stay host-side; the views
 * are NOT exported for hosts to mount. The banners render
 * after the feature cards, exactly where hosts mount their
 * local banners today (each view pins itself to its screen
 * edge: install to the top, consent to the bottom), so there
 * is no visual change. Omit a prop (or pass null) and that
 * banner does not render.
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
 * The page composes DS components only (#119): the sections'
 * geometry now lives in the named widgets (tranche 2) — the
 * hero's centering in a Col at gap m (#746 — HeroStack's top
 * breathing room is the parent shell's spacing now), the
 * CTA row's geometry in StackedButtonRow, and the cards' flex,
 * 260px wrap basis, and the grid's wrap in CardGrid — so the
 * page passes only content (Text, Button, Card) and applies no
 * styling of its own. An earlier tranche cut extracted them as
 * Hero / CtaRow / FeatureCard library components; they had no
 * second consumer, so they were folded back into the page, and
 * tranche 2 re-extracted the geometry under the widget names
 * above.
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

/** The consent banner as data (#879): the ConsentBannerView prop shape, aliased per the page-prop rule. */
export type LandingPageConsentBanner = ConsentBannerViewProps;

/** The install banner as data (#879): the InstallBannerView prop shape, aliased per the page-prop rule. */
export type LandingPageInstallBanner = InstallBannerViewProps;

export type LandingPageProps = {
  /** The page footer data (#410): one footer object supplied by the host; see BigFooter. */
  footer?: BigFooterData;
  /**
   * The analytics consent banner as data (#879): when present,
   * the page renders ConsentBannerView itself (bottom-pinned)
   * after the feature cards. Copy crosses as data; the accept /
   * decline labels default to the voice object's
   * consentBannerView labels when omitted. The consent state
   * and its side effects stay host-side — only the accept /
   * decline intents cross. Omit (or pass null) while consent
   * is not outstanding and no banner renders.
   */
  consentBanner?: LandingPageConsentBanner | null;
  /**
   * The mobile-app install banner as data (#879): when
   * present, the page renders InstallBannerView itself
   * (top-pinned) after the feature cards. The message and the
   * app-store links cross as data (hrefs, per #248); dismissal
   * is a bare callback and the dismissal state stays
   * host-side. Omit (or pass null) once dismissed and no
   * banner renders.
   */
  installBanner?: LandingPageInstallBanner | null;
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
  footer,
  consentBanner,
  installBanner,
}: LandingPageProps) {
  return (
    <BigFooterShell footer={footer}>
      <ScreenContainer>
        {installBanner ? <InstallBannerView {...installBanner} pinning="flow" /> : null}
        <Col center gap="m">
          <Text variant="heading" textAlign="center">
            {heroTitle}
          </Text>
          <Text color="$textMuted" textAlign="center">
            {heroSubtitle}
          </Text>
        </Col>
        <StackedButtonRow>
          <Button href={discoverCta.href} variant="primary">
            {discoverCta.label}
          </Button>
          <Button href={signUpCta.href} variant="secondary">
            {signUpCta.label}
          </Button>
          <Button href={getAppCta.href} variant="secondary">
            {getAppCta.label}
          </Button>
        </StackedButtonRow>
        <CardGrid>
          {[featureOne, featureTwo, featureThree].map((feature) => (
            <Card key={feature.title}>
              <Text variant="subheading">{feature.title}</Text>
              <Text color="$textMuted">{feature.description}</Text>
            </Card>
          ))}
        </CardGrid>
        {consentBanner ? <ConsentBannerView {...consentBanner} /> : null}
      </ScreenContainer>
    </BigFooterShell>
  );
}
