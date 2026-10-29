import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { legalPrivacyFixture, legalTermsFixture } from "./fixtures.js";
import { LegalDocumentPage } from "./LegalDocumentPage.js";

/**
 * Stories for the real LegalDocumentPage component (#170) — this
 * renders the same component the Eciperay app will consume, driven
 * by fixture props. The two stories are the point of the page's
 * contract: the privacy policy and the terms of service are one
 * page parameterized by its content props, so each story passes a
 * different document (title, last-updated line, sections) into the
 * same frame. The fixture copy is story prose in the real
 * documents' shape — the real legal text is app content.
 *
 * Like the other page stories, the frame pins a phone viewport
 * (430×844) so Chromatic screenshots stay deterministic; the
 * document scrolls inside it. Theme pinned to Warm Harvest,
 * Eciperay's brand.
 */
const meta: Meta<typeof LegalDocumentPage> = {
  title: "Pages/Eciperay/LegalDocumentPage",
  component: LegalDocumentPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof LegalDocumentPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const PrivacyPolicy: Story = {
  render: () => (
    <Viewport>
      <LegalDocumentPage {...legalPrivacyFixture} />
    </Viewport>
  ),
};

export const TermsOfService: Story = {
  render: () => (
    <Viewport>
      <LegalDocumentPage {...legalTermsFixture} />
    </Viewport>
  ),
};
