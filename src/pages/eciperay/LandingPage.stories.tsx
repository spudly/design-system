import type { Meta, StoryObj } from "@storybook/react";

import { landingFixture, eciperayFooterFixture } from "../shared/fixtures.js";

import { LandingPage } from "./LandingPage.js";

const meta: Meta<typeof LandingPage> = {
  title: "Pages/Eciperay/LandingPage",
  component: LandingPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof LandingPage>;

/**
 * The landing is a static view — one state, all content from
 * props — so a single story renders the whole page: hero, the
 * three link CTAs, and the three fixed feature cards. Default
 * defaults to the phone viewport (430×844) like the other page
 * stories; Wide renders the same page unconstrained so the
 * wide-web layout can be checked (the CTA row in one row, the
 * three feature cards sharing a row at their 260px basis) —
 * the colocated LandingPage.test.steps.md section names which story each
 * layout check uses.
 */
export const Default: Story = {
  render: () => (
    <>
      <LandingPage footer={eciperayFooterFixture} {...landingFixture} />
    </>
  ),
};

export const Wide: Story = {
  parameters: { dsViewport: "full" },
  render: () => <LandingPage footer={eciperayFooterFixture} {...landingFixture} />,
};

/** Consent banner data (#879): Eciperay's analytics-consent copy as the host passes it. */
const consentBannerFixture = {
  messageBeforeLink: "We use cookies and analytics as described in our",
  linkLabel: "privacy policy",
  linkHref: "/privacy",
  messageAfterLink: ".",
  onAccept: () => { /* noop */ },
  onDecline: () => { /* noop */ },
};

/** Install banner data (#879): the mobile-app prompt as the host passes it. */
const installBannerFixture = {
  message: "Get the Eciperay app for the best cooking experience.",
  links: [
    { label: "Download on the App Store", href: "/get-the-app" },
    { label: "Get it on Google Play", href: "/get-the-app" },
  ],
  onDismiss: () => { /* noop */ },
};

/** Consent outstanding on the signed-out surface (#879): the page renders the bottom-pinned consent banner itself. */
export const WithConsentBanner: Story = {
  render: () => (
    <>
      <LandingPage
        footer={eciperayFooterFixture}
        {...landingFixture}
        consentBanner={consentBannerFixture}
      />
    </>
  ),
};

/** Both banners visible (#879): the install banner pins to the top, the consent banner to the bottom. */
export const WithBanners: Story = {
  render: () => (
    <>
      <LandingPage
        footer={eciperayFooterFixture}
        {...landingFixture}
        consentBanner={consentBannerFixture}
        installBanner={installBannerFixture}
      />
    </>
  ),
};
