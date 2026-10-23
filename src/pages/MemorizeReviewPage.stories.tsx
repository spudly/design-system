import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MemorizeReviewPage, type MemorizeReviewPageVerse } from "./MemorizeReviewPage.js";

/**
 * Stories for the real MemorizeReviewPage component (#49) —
 * not a made-up page composition: this renders the same
 * component the Memorize app will consume, driven by fixture
 * props. It succeeds the "Progress" demo in Pages/Memorize
 * (#44); that demo invented a stats dashboard (mastered
 * counts, drill accuracy, per-passage percent bars) the real
 * app never had, so its fixtures do NOT carry over — the
 * fixtures below are verses from the app's own built-in demo
 * set, in the due list's shape (reference + text only, as the
 * review cards render them).
 *
 * The frame matches the other page stories: a phone viewport
 * (430×844) pinned so Chromatic screenshots are deterministic
 * and the fixed shell bounds the way it does on device. Theme
 * pinned to Quiet Dawn, Memorize's brand, like Pages/Memorize.
 */
const meta: Meta<typeof MemorizeReviewPage> = {
  title: "Pages/Memorize/MemorizeReviewPage",
  component: MemorizeReviewPage,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof MemorizeReviewPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 430, maxWidth: "100%", height: 844, display: "flex" }}>{children}</div>
  );
}

// The app's due order is oldest-due first; the set is three
// verses from the app's built-in demo set so the heading's
// count, the card stack, and the button rows all render as
// they do on device.
const dueVerses: MemorizeReviewPageVerse[] = [
  {
    id: "ether-12-27",
    reference: "Ether 12:27",
    text: "And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me; for if they humble themselves before me, and have faith in me, then will I make weak things become strong unto them.",
  },
  {
    id: "proverbs-3-5-6",
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
  },
  {
    id: "2-nephi-2-25",
    reference: "2 Nephi 2:25",
    text: "Adam fell that men might be; and men are, that they might have joy.",
  },
];

export const Default: Story = {
  render: () => (
    <Viewport>
      <MemorizeReviewPage
        verses={dueVerses}
        onRememberedPress={() => undefined}
        onForgotPress={() => undefined}
      />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <MemorizeReviewPage
        verses={[]}
        onRememberedPress={() => undefined}
        onForgotPress={() => undefined}
      />
    </Viewport>
  ),
};
