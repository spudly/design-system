import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { BlankWord } from "./BlankWord.js";
import { Text } from "./Text.js";

const meta: Meta<typeof BlankWord> = {
  title: "Widgets/Data Display/BlankWord",
  component: BlankWord,
  argTypes: {
    word: { control: "text" },
    revealed: { control: "boolean" },
    index: { control: { type: "number", min: 0 } },
    total: { control: { type: "number", min: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof BlankWord>;

export const Hidden: Story = {
  args: {
    word: "want",
    revealed: false,
    index: 0,
    total: 3,
    // eslint-disable-next-line no-console -- story action callback — the console is the Storybook demo output
    onReveal: () => { console.log("revealed"); },
  },
};

export const Revealed: Story = {
  args: {
    word: "want",
    revealed: true,
    index: 0,
    total: 3,
    onReveal: () => { /* noop */ },
  },
};

function InteractiveDrill() {
  const words = ["want", "pastures", "waters"];
  const [revealed, setRevealed] = useState<boolean[]>(words.map(() => false));
  /* eslint-disable @typescript-eslint/no-non-null-assertion -- words is a three-entry literal and revealed is mapped from it, so indices 0-1 always exist */
  const word0 = words[0]!;
  const word1 = words[1]!;
  const revealed0 = revealed[0]!;
  const revealed1 = revealed[1]!;
  /* eslint-enable @typescript-eslint/no-non-null-assertion -- end of the fixed-size index block above */
  return (
    <Text variant="verse">
      The LORD is my shepherd; I shall not{" "}
      <BlankWord
        word={word0}
        revealed={revealed0}
        onReveal={() => { setRevealed((r) => r.map((v, i) => (i === 0 ? true : v))); }}
        index={0}
        total={words.length}
      />{" "}
      He makes me lie down in green{" "}
      <BlankWord
        word={word1}
        revealed={revealed1}
        onReveal={() => { setRevealed((r) => r.map((v, i) => (i === 1 ? true : v))); }}
        index={1}
        total={words.length}
      />
      .
    </Text>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveDrill />,
};
