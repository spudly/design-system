import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { View } from "tamagui";
import { tokens } from "../tokens/index.js";
import { CookLogForm } from "./CookLogForm.js";

const meta: Meta<typeof CookLogForm> = {
  title: "Components/CookLogForm",
  component: CookLogForm,
  globals: { theme: "light_warmHarvest" },
};

export default meta;
type Story = StoryObj<typeof CookLogForm>;

function Viewport({ children, onOverlay = false }: { children: ReactNode; onOverlay?: boolean }) {
  return (
    <View
      width={430}
      maxWidth="100%"
      padding="$4"
      backgroundColor={onOverlay ? tokens.colors.gray.gray10 : undefined}
    >
      {children}
    </View>
  );
}

export const Dark: Story = {
  render: () => (
    <Viewport onOverlay>
      <CookLogForm onSubmit={() => undefined} onSkip={() => undefined} isPending={false} />
    </Viewport>
  ),
};

export const Light: Story = {
  render: () => (
    <Viewport>
      <CookLogForm
        variant="light"
        onSubmit={() => undefined}
        onSkip={() => undefined}
        isPending={false}
      />
    </Viewport>
  ),
};

export const Pending: Story = {
  render: () => (
    <Viewport>
      <CookLogForm variant="light" onSubmit={() => undefined} onSkip={() => undefined} isPending />
    </Viewport>
  ),
};

export const CustomSecondaryLabel: Story = {
  render: () => (
    <Viewport>
      <CookLogForm
        variant="light"
        secondaryLabel="Cancel"
        onSubmit={() => undefined}
        onSkip={() => undefined}
        isPending={false}
      />
    </Viewport>
  ),
};
