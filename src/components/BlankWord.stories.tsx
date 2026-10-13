import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BlankWord } from "./BlankWord.js";
import { Text } from "./Text.js";

const meta: Meta<typeof BlankWord> = {
  title: "Components/BlankWord",
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
    onReveal: () => console.log("revealed"),
  },
};

export const Revealed: Story = {
  args: {
    word: "want",
    revealed: true,
    index: 0,
    total: 3,
    onReveal: () => {},
  },
};

function InteractiveDrill() {
  const words = ["want", "pastures", "waters"];
  const [revealed, setRevealed] = useState<boolean[]>(words.map(() => false));
  return (
    <Text variant="verse">
      The LORD is my shepherd; I shall not{" "}
      <BlankWord
        word={words[0]!}
        revealed={revealed[0]!}
        onReveal={() => setRevealed((r) => r.map((v, i) => (i === 0 ? true : v)))}
        index={0}
        total={words.length}
      />{" "}
      He makes me lie down in green{" "}
      <BlankWord
        word={words[1]!}
        revealed={revealed[1]!}
        onReveal={() => setRevealed((r) => r.map((v, i) => (i === 1 ? true : v)))}
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
