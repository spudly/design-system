import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "../data/Text.js";

import { Col } from "./Col.js";
import { Row } from "./Row.js";
import { Spacer } from "./Spacer.js";

const meta: Meta<typeof Spacer> = {
  title: "Widgets/Layout & Structure/Spacer",
  component: Spacer,
};

export default meta;
type Story = StoryObj<typeof Spacer>;

// Spacer is the rare exception to parent-gap spacing; these
// stories exist to size-check the t-shirt steps, not as a pattern
// to copy — sibling spacing belongs to the parent's gap.
export const Vertical: Story = {
  render: () => (
    <Col>
      <Text>Above</Text>
      {/* Story-only sizing demo: the gap between these two blocks
          is the Spacer's whole subject. */}
      <Spacer y="xl" />
      <Text>Below</Text>
    </Col>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Row middle>
      <Text>Left</Text>
      {/* Story-only sizing demo, as above. */}
      <Spacer x="xl" />
      <Text>Right</Text>
    </Row>
  ),
};
