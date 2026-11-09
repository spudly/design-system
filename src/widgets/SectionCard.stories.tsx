import type { Meta, StoryObj } from "@storybook/react";
import { YStack } from "tamagui";
import { SectionCard } from "./SectionCard.js";
import { Button } from "./Button.js";
import { ListRow } from "./ListRow.js";
import { Text } from "./Text.js";

const meta: Meta<typeof SectionCard> = {
  title: "Widgets/SectionCard",
  component: SectionCard,
  argTypes: {
    title: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "bordered", "muted", "elevated"],
    },
    elevated: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SectionCard>;

export const Default: Story = {
  args: { title: "API access tokens" },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">
        Tokens let scripts and integrations act on your behalf. Keep them secret.
      </Text>
    </SectionCard>
  ),
};

export const WithAction: Story = {
  args: { title: "Profile" },
  render: (args) => (
    <SectionCard
      {...args}
      style={{ maxWidth: 480 }}
      action={
        <Button ghost size="sm">
          Edit
        </Button>
      }
    >
      <Text variant="body">Stephen</Text>
      <Text variant="hint">stephen@example.com</Text>
    </SectionCard>
  ),
};

export const Elevated: Story = {
  args: { title: "Nutrition goals", elevated: true },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">Daily calorie target: 2,200</Text>
    </SectionCard>
  ),
};

export const Bordered: Story = {
  args: { title: "Ingredients", variant: "bordered" },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">Outline-only section, no surface fill.</Text>
    </SectionCard>
  ),
};

export const Muted: Story = {
  args: { title: "Cook history", variant: "muted" },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">Recessed section on the page-background tone.</Text>
    </SectionCard>
  ),
};

export const ElevatedVariant: Story = {
  args: { title: "Shopping list", variant: "elevated" },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <Text variant="body">Raised section via the variant prop.</Text>
    </SectionCard>
  ),
};

// Loading: the section's contents are rows that skeletonize
// from the SectionCard's LoadingScope — raw text children would
// stay readable under a skeleton title, which is not a loading
// state (Stephen on #551).
export const Loading: Story = {
  args: { title: "API access tokens", loading: true },
  render: (args) => (
    <SectionCard {...args} style={{ maxWidth: 480 }}>
      <ListRow title="ci-token" subtitle="Created Oct 2, 2026" onPress={() => {}} />
      <ListRow title="deploy-token" subtitle="Created Oct 19, 2026" onPress={() => {}} />
    </SectionCard>
  ),
};

// The overlay verifies the skeleton reproduces the original's shape/size (#278).
export const LoadingOverlay: Story = {
  render: () => (
    <YStack position="relative" maxWidth={480}>
      <SectionCard
        title="API access tokens"
        style={{ maxWidth: 480 }}
        action={
          <Button ghost size="sm">
            Edit
          </Button>
        }
      >
        <ListRow title="ci-token" subtitle="Created Oct 2, 2026" onPress={() => {}} />
        <ListRow title="deploy-token" subtitle="Created Oct 19, 2026" onPress={() => {}} />
      </SectionCard>
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.45}
        pointerEvents="none"
      >
        <SectionCard
          title="API access tokens"
          style={{ maxWidth: 480 }}
          action={
            <Button ghost size="sm">
              Edit
            </Button>
          }
          loading
        >
          <ListRow title="ci-token" subtitle="Created Oct 2, 2026" onPress={() => {}} />
          <ListRow title="deploy-token" subtitle="Created Oct 19, 2026" onPress={() => {}} />
        </SectionCard>
      </YStack>
    </YStack>
  ),
};
