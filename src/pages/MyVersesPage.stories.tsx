import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MyVersesPage, type MyVersesPageItem } from "./MyVersesPage.js";

/**
 * Stories for the real MyVersesPage component (#49) — not a
 * made-up page composition: this renders the same component the
 * Memorize app will consume, driven by fixture props. The
 * Pages/Memorize demos (#44) never showed this screen on its own
 * (the HomeVerseSearch demo folded a verse list into its invented
 * composition, with hint lines instead of the real rows' status
 * badges and actions), so the fixtures below mirror the real
 * rows: reference, status badge, verse text, the pre-composed
 * next-review line, and the Drill / Remove pair.
 *
 * The frame matches the other page stories: a phone viewport
 * (430×844) pinned so Chromatic screenshots are deterministic
 * and the fixed shell bounds the way it does on device. Theme
 * pinned to Quiet Dawn, Memorize's brand, like Pages/Memorize.
 */
const meta: Meta<typeof MyVersesPage> = {
  title: "Pages/Memorize/MyVersesPage",
  component: MyVersesPage,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof MyVersesPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 430, maxWidth: "100%", height: 844, display: "flex" }}>{children}</div>
  );
}

// The app's memorize list, as the store holds it: the
// next-review line is pre-composed by the app (its locale date
// format), so the fixture writes the finished line. The set
// varies on purpose — a memorized verse with a review scheduled,
// one still learning with a review scheduled, and one with no
// review date (no line renders).
const verseItems: MyVersesPageItem[] = [
  {
    id: "ether-12-27",
    reference: "Ether 12:27",
    text: "And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me.",
    status: "memorized",
    nextReviewLabel: "Next review: 10/25/2026",
  },
  {
    id: "alma-32-21",
    reference: "Alma 32:21",
    text: "And now as I said concerning faith—faith is not to have a perfect knowledge of things; therefore if ye have faith ye hope for things which are not seen, which are true.",
    status: "learning",
    nextReviewLabel: "Next review: 10/23/2026",
  },
  {
    id: "moroni-7-47",
    reference: "Moroni 7:47",
    text: "But charity is the pure love of Christ, and it endureth forever; and whoso is found possessed of it at the last day, it shall be well with him.",
    status: "learning",
  },
];

export const Default: Story = {
  render: () => (
    <Viewport>
      <MyVersesPage
        verses={verseItems}
        onDrillVerse={() => undefined}
        onRemoveVerse={() => undefined}
      />
    </Viewport>
  ),
};

export const Empty: Story = {
  render: () => (
    <Viewport>
      <MyVersesPage verses={[]} onDrillVerse={() => undefined} onRemoveVerse={() => undefined} />
    </Viewport>
  ),
};
