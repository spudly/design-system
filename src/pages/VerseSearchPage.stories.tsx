import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { VerseSearchPage, type VerseSearchPageItem } from "./VerseSearchPage.js";

/**
 * Stories for the real VerseSearchPage component (#49) — not a
 * made-up page composition: this renders the same component the
 * Memorize app will consume, driven by fixture props. It succeeds
 * the HomeVerseSearch demo in Pages/Memorize (#44); that demo
 * fused this screen with the Verses tab and invented a
 * "Continue" section and recent-verse cards the real screen does
 * not have, so its composition does NOT carry over — the fixtures
 * below mirror the real screen's results (the demo data set's
 * verses, as the app's search returns them).
 *
 * The frame matches the other page stories: a phone viewport
 * (430×844) pinned so Chromatic screenshots are deterministic
 * and the fixed shell bounds the way it does on device. Theme
 * pinned to Quiet Dawn, Memorize's brand, like Pages/Memorize.
 */
const meta: Meta<typeof VerseSearchPage> = {
  title: "Pages/VerseSearchPage",
  component: VerseSearchPage,
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj<typeof VerseSearchPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

// Search results as the app's data source returns them: reference
// and full text per verse. The set answers the fixture query
// "charity" the way the demo set would.
const charityResults: VerseSearchPageItem[] = [
  {
    id: "moroni-7-47",
    reference: "Moroni 7:47",
    text: "But charity is the pure love of Christ, and it endureth forever; and whoso is found possessed of it at the last day, it shall be well with him.",
  },
  {
    id: "1-corinthians-13-4",
    reference: "1 Corinthians 13:4",
    text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.",
  },
  {
    id: "ether-12-34",
    reference: "Ether 12:34",
    text: "And now I know that this love which thou hast had for the children of men is charity; wherefore, except men shall have charity they cannot inherit that place which thou hast prepared in the mansions of thy Father.",
  },
];

const etherResult: VerseSearchPageItem[] = [
  {
    id: "ether-12-27",
    reference: "Ether 12:27",
    text: "And if men come unto me I will show unto them their weakness. I give unto men weakness that they may be humble; and my grace is sufficient for all men that humble themselves before me.",
  },
];

export const Default: Story = {
  render: () => (
    <Viewport>
      <VerseSearchPage
        query="charity"
        onQueryChange={() => undefined}
        onSearch={() => undefined}
        isSearching={false}
        usingDemo={false}
        errorMessage={null}
        results={charityResults}
        onAddVerse={() => undefined}
      />
    </Viewport>
  ),
};

export const DemoMode: Story = {
  // No API key in the app: the demo-set notice renders above the
  // search row, and the screen waits for a first search.
  render: () => (
    <Viewport>
      <VerseSearchPage
        query=""
        onQueryChange={() => undefined}
        onSearch={() => undefined}
        isSearching={false}
        usingDemo
        errorMessage={null}
        results={[]}
        onAddVerse={() => undefined}
      />
    </Viewport>
  ),
};

export const Searching: Story = {
  // A re-search in flight: the spinner renders above the list and
  // the previous search's results stay mounted under it.
  render: () => (
    <Viewport>
      <VerseSearchPage
        query="Ether 12:27"
        onQueryChange={() => undefined}
        onSearch={() => undefined}
        isSearching
        usingDemo={false}
        errorMessage={null}
        results={etherResult}
        onAddVerse={() => undefined}
      />
    </Viewport>
  ),
};

export const Error: Story = {
  // The app's fallback message for a failed search (a caught
  // error's own message crosses the same prop in production).
  render: () => (
    <Viewport>
      <VerseSearchPage
        query="charity"
        onQueryChange={() => undefined}
        onSearch={() => undefined}
        isSearching={false}
        usingDemo={false}
        errorMessage="Search failed"
        results={[]}
        onAddVerse={() => undefined}
      />
    </Viewport>
  ),
};

export const NoResults: Story = {
  // A completed search with no matches: the app renders an empty
  // list — there is deliberately no empty-state message on this
  // screen (see the component header).
  render: () => (
    <Viewport>
      <VerseSearchPage
        query="xyz"
        onQueryChange={() => undefined}
        onSearch={() => undefined}
        isSearching={false}
        usingDemo={false}
        errorMessage={null}
        results={[]}
        onAddVerse={() => undefined}
      />
    </Viewport>
  ),
};
