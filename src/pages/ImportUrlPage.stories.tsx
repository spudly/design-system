import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View, YStack } from "tamagui";
import { Text } from "../components/Text.js";
import { ImportUrlPage } from "./ImportUrlPage.js";

const meta: Meta<typeof ImportUrlPage> = {
  title: "Pages/Eciperay/ImportUrlPage",
  component: ImportUrlPage,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof ImportUrlPage>;

function Viewport({ children }: { children: ReactNode }) {
  return (
    <View width={430} maxWidth="100%" height={844}>
      {children}
    </View>
  );
}

export const Filled: Story = {
  render: () => (
    <Viewport>
      <ImportUrlPage
        url="https://example.com/recipes/mushroom-stroganoff"
        onUrlChange={() => undefined}
        onSubmit={() => undefined}
      />
    </Viewport>
  ),
};

/**
 * Stateful: the URL field is editable and every submit (Import
 * button or Enter in the field) increments the counter under the
 * page, so the Enter-to-submit wiring is observable in Storybook
 * — clearing the field first shows Enter doing nothing.
 */
function InteractiveDemo() {
  const [url, setUrl] = useState("https://example.com/recipes/mushroom-stroganoff");
  const [submitted, setSubmitted] = useState(0);
  return (
    <YStack>
      <ImportUrlPage
        url={url}
        onUrlChange={setUrl}
        onSubmit={() => {
          setSubmitted((current) => current + 1);
        }}
      />
      <Text>Submitted {submitted} times</Text>
    </YStack>
  );
}

export const Interactive: Story = {
  render: () => (
    <Viewport>
      <InteractiveDemo />
    </Viewport>
  ),
};
