import type { Meta, StoryObj } from "@storybook/react";
import { XStack, YStack } from "tamagui";

import { LoadingScope } from "../../contexts/LoadingScope.js";
import { BrandLink } from "../actions/BrandLink.js";
import { TextLink } from "../actions/TextLink.js";
import { Text } from "../data/Text.js";
import { Col } from "../layout/Col.js";
import { Row } from "../layout/Row.js";

import { Alert } from "./Alert.js";
import { BoxSkeleton } from "./BoxSkeleton.js";
import { ChangedListBanner } from "./ChangedListBanner.js";
import { CheckboxSkeletonRow } from "./CheckboxSkeletonRow.js";
import { CircleSkeleton } from "./CircleSkeleton.js";
import { FixedActionBanner } from "./FixedActionBanner.js";
import { LoadingActionCardRow } from "./LoadingActionCardRow.js";
import { LoadingCardRow } from "./LoadingCardRow.js";
import { LoadingListItem } from "./LoadingListItem.js";
import { LoadingMediaRow } from "./LoadingMediaRow.js";
import { ProgressBar } from "./ProgressBar.js";
import { RadioSkeletonRow } from "./RadioSkeletonRow.js";
import { SkeletonPanel } from "./SkeletonPanel.js";
import { Spinner } from "./Spinner.js";
import { TextSkeleton } from "./TextSkeleton.js";
import { Toast } from "./Toast.js";

/**
 * Composite story (#711): every feedback & loading widget rendered
 * together, so cross-widget inconsistencies — alert/banner/toast
 * treatments side by side, skeleton shapes against the rows they
 * stand in for, progress indicators at matched values — are
 * visible at a glance instead of hidden by isolated stories.
 *
 * Stories only: no component behavior lives here. Any inconsistency
 * this surface exposes gets filed as its own bug issue, never fixed
 * inside this story's PR.
 */
const meta: Meta = {
  title: "Widgets/Feedback & Loading/Composite: Feedback & Loading",
};

export default meta;
type Story = StoryObj;

const noop = () => {};

/** Every messaging surface in one column: the banner row, alerts
 * in all severities, the changed-list banner, a toast card, and
 * the fixed action banner — where tone, padding, and corner
 * treatment drift between surfaces shows. */
export const Messaging: Story = {
  render: () => (
    <YStack maxWidth={430} gap={16}>
      <Row middle between gap="l">
        <BrandLink label="Eciperay" href="/" />
        <TextLink href="/sign-in">Sign in</TextLink>
      </Row>
      <Alert severity="info">Syncing your recipes with the cloud…</Alert>
      <Alert severity="success">Recipe saved! Nice work.</Alert>
      <Alert severity="warning">You have 3 recipes with missing photos.</Alert>
      <Alert severity="error">Could not load recipes. Check your connection and try again.</Alert>
      <ChangedListBanner
        label="Ingredients differ from the parent version (2 changed)."
        onRevert={noop}
      />
      <Toast title="Recipe saved" description="Creamy Tuscan Garlic Chicken is in your library." />
      <FixedActionBanner
        message="We use cookies to improve your experience."
        primaryAction={{ label: "Accept", onPress: noop }}
        secondaryAction={{ label: "Decline", onPress: noop }}
        onDismiss={noop}
      />
    </YStack>
  ),
};

/** Progress at matched values: the bar and the determinate
 * spinner at 5 / 70 / 100, plus the indeterminate forms — where
 * track and fill treatments compare directly. */
export const Progress: Story = {
  render: () => (
    <YStack maxWidth={430} gap={20}>
      <YStack gap={8}>
        <ProgressBar value={5} />
        <ProgressBar value={70} />
        <ProgressBar value={100} />
      </YStack>
      <XStack gap={16} alignItems="center">
        <Spinner value={5} label="Progress 5 percent" />
        <Spinner value={70} label="Progress 70 percent" />
        <Spinner value={100} label="Progress 100 percent" />
        <Spinner label="Loading recipes" />
        <Spinner size="large" label="Loading" />
      </XStack>
    </YStack>
  ),
};

/** The loading family in one scope: skeleton rows for each row
 * shape they replace, the form-row skeletons, and a composed
 * skeleton panel — where bone shapes and pulse rhythm compare. */
export const LoadingFamily: Story = {
  render: () => (
    <YStack maxWidth={430} gap={20}>
      <LoadingScope active>
        <Col>
          <LoadingListItem />
          <LoadingListItem />
          <LoadingMediaRow />
          <LoadingMediaRow />
        </Col>
        <Col gap="s">
          <LoadingCardRow />
          <LoadingActionCardRow accessibilityLabel="Delete meal">Delete</LoadingActionCardRow>
        </Col>
        <YStack gap={12}>
          <CheckboxSkeletonRow description />
          <RadioSkeletonRow />
          <XStack gap={12} alignItems="center">
            <CircleSkeleton size={48} />
            <TextSkeleton lines={2} />
          </XStack>
          <BoxSkeleton width="100%" height={120} />
        </YStack>
        <SkeletonPanel>
          <Text>First bone</Text>
          <Text>Second bone</Text>
        </SkeletonPanel>
      </LoadingScope>
    </YStack>
  ),
};
