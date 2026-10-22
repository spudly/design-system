import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";
import { BlankWord } from "../components/BlankWord.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { PrevNextNav } from "../components/PrevNextNav.js";
import { ProgressBar } from "../components/ProgressBar.js";
import { SearchField } from "../components/SearchField.js";
import { SectionCard } from "../components/SectionCard.js";
import { StatCard } from "../components/StatCard.js";
import { StepDots } from "../components/StepDots.js";
import { Text } from "../components/Text.js";
import { VerseText } from "../components/VerseText.js";
import { tokens } from "../tokens/index.js";
import { PageFrame } from "./PageFrame.js";
import { passageFixture, progressFixtures, verseListFixtures } from "./fixtures.js";

/**
 * Full-page demo stories for Memorize's core screens (#44), composed
 * from @spudly/ui components with the static fixtures in ./fixtures.ts.
 * Every story pins the Quiet Dawn theme, Memorize's brand, via its
 * Storybook global.
 */
const meta: Meta = {
  title: "Pages/Memorize",
  globals: { theme: "light_quietDawn" },
};

export default meta;
type Story = StoryObj;

function HomeVerseSearchDemo() {
  const [query, setQuery] = useState("");
  return (
    <PageFrame>
      <Text variant="heading">Memorize</Text>
      <SearchField
        label="Search verses"
        placeholder="Search by reference or text…"
        value={query}
        onChangeText={setQuery}
      />
      <SectionCard title="Continue">
        <YStack gap={tokens.spacing[2]}>
          <Text variant="subheading">{passageFixture.reference}</Text>
          <Text variant="verse">{passageFixture.text}</Text>
          <Button>Resume session</Button>
        </YStack>
      </SectionCard>
      <YStack gap={tokens.spacing[3]}>
        {verseListFixtures.map((verse) => (
          <Card key={verse.reference}>
            <YStack gap={tokens.spacing[1]}>
              <Text variant="subheading">{verse.reference}</Text>
              <Text variant="hint">{verse.hint}</Text>
            </YStack>
          </Card>
        ))}
      </YStack>
    </PageFrame>
  );
}

export const HomeVerseSearch: Story = {
  render: () => <HomeVerseSearchDemo />,
};

export const PassageView: Story = {
  render: () => (
    <PageFrame>
      <Text variant="heading">{passageFixture.reference}</Text>
      <VerseText>{passageFixture.text}</VerseText>
      <PrevNextNav
        backLabel="Previous passage"
        nextLabel="Next passage"
        onBack={() => undefined}
        onNext={() => undefined}
      />
      <Button>Start memorization</Button>
    </PageFrame>
  ),
};

/**
 * A memorization session mid-drill: the first blank is already revealed
 * and the other two are still hidden. The initial revealed state is a
 * fixed fixture (not random, not clock-based) so the screenshot is the
 * same on every run.
 */
function MemorizationSessionDemo() {
  const words = passageFixture.drillWords;
  const [revealed, setRevealed] = useState<boolean[]>([true, false, false]);
  const reveal = (index: number) =>
    setRevealed((rows) => rows.map((row, i) => (i === index ? true : row)));
  return (
    <PageFrame>
      <Text variant="heading">{passageFixture.reference}</Text>
      <XStack justifyContent="space-between" alignItems="center">
        <Text variant="hint">Session progress</Text>
        <StepDots count={3} activeIndex={1} label="Round 2 of 3" />
      </XStack>
      <ProgressBar value={40} accessibilityLabel="Memorization session progress" />
      <Text variant="verse">
        The LORD is my shepherd; I shall not{" "}
        <BlankWord
          word={words[0]!}
          revealed={revealed[0]!}
          onReveal={() => reveal(0)}
          index={0}
          total={words.length}
        />
        . He makes me lie down in green{" "}
        <BlankWord
          word={words[1]!}
          revealed={revealed[1]!}
          onReveal={() => reveal(1)}
          index={1}
          total={words.length}
        />
        . He leads me beside still{" "}
        <BlankWord
          word={words[2]!}
          revealed={revealed[2]!}
          onReveal={() => reveal(2)}
          index={2}
          total={words.length}
        />
        . He restores my soul.
      </Text>
      <Text variant="hint">Tap a blank to reveal its word.</Text>
      <Button variant="secondary">End session</Button>
    </PageFrame>
  );
}

export const MemorizationSession: Story = {
  render: () => <MemorizationSessionDemo />,
};

export const Progress: Story = {
  render: () => (
    <PageFrame>
      <Text variant="heading">Progress</Text>
      <XStack gap={tokens.spacing[3]} flexWrap="wrap">
        {progressFixtures.stats.map((stat) => (
          <StatCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            sublabel={stat.sublabel}
          />
        ))}
      </XStack>
      <SectionCard title="Passages in progress">
        <YStack gap={tokens.spacing[4]}>
          {progressFixtures.passages.map((passage) => (
            <YStack key={passage.reference} gap={tokens.spacing[2]}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text variant="body">{passage.reference}</Text>
                <Text variant="hint">{passage.percent}%</Text>
              </XStack>
              <ProgressBar
                value={passage.percent}
                accessibilityLabel={`${passage.reference} progress`}
              />
            </YStack>
          ))}
        </YStack>
      </SectionCard>
    </PageFrame>
  ),
};
