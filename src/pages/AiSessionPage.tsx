import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import { tokens } from "../tokens/index.js";
import { platformAccessibilityProps } from "../components/accessibility.js";
import { Button } from "../components/Button.js";
import { TextAreaField } from "../components/TextAreaField.js";
import { Text } from "../components/Text.js";

/**
 * AiSessionPage (#126, B3c): the AI session view — the split
 * view half of Eciperay's `AiSessionFlow` (the B2 audit's
 * mixed disposition: "view layer → DS; session state machine,
 * mutations, and error mapping stay app-side as the host").
 *
 * The split (proposals on #126, shipped as the batch's
 * interim): the host keeps the session state and the five
 * session mutations (start, message, approve, finalize,
 * cancel) and maps the app's phase type to display state —
 * what crosses is a session view-model (the host-resolved
 * phase label, the transcript, and the stage booleans
 * `canRefine` / `canCancel`), the pending flags, the host's
 * error string, and bare intents back (`onStart(text)`,
 * `onSendMessage(text)`, `onApprovePlan`, `onFinalize`,
 * `onCancel`, `onEmptyCancel`). There is no streaming in the
 * app today — the session API is request/response — so no
 * token-stream contract is needed; a future streaming API
 * would extend the view-model, not this page's shape.
 *
 * The recipe preview crosses as a ReactNode slot: the host
 * parses the proposed recipe and renders its preview
 * component into the card this page frames (the preview
 * renderer stays app-side — see ImportReviewPage).
 *
 * The config strings are app content: both AI flows (generate
 * and tweak) render this page with their own titles, labels,
 * and copy, passed in via `config` — no app phase type or flow
 * identity enters the DS. The prompt and follow-up texts are
 * controlled (the host reads them at submit); the transcript
 * and stage rendering mirrors the app view, including the
 * planning stage's refine row and the preview stage's card.
 *
 * The secondary actions (the start view's Cancel, the planning
 * stage's Refine plan) are ghost buttons (#184): Button has no
 * "outlined" variant, so the old `variant="outlined"` fell back
 * to the primary fill and the gray label clashed with it —
 * dark text on the terracotta fill was hard to read next to
 * the real primary button. Ghost's label color is Button's
 * dark-aware $link role, readable on the page background.
 */

export type AiSessionPageConfig = {
  title: string;
  intro: string;
  promptPlaceholder: string;
  startLabel: string;
  startPendingLabel: string;
  previewTitle: string;
  finalizeLabel: string;
  finalizePendingLabel: string;
};

export type AiSessionPageMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiSessionPageSession = {
  /** The host-resolved phase label ("Planning", "Preview ready", …). */
  phaseLabel: string;
  messages: AiSessionPageMessage[];
  /** The planning stage: show the refine input and actions. */
  canRefine: boolean;
  /** The cancel row shows unless the session is finished. */
  canCancel: boolean;
};

export type AiSessionPageProps = {
  config: AiSessionPageConfig;
  session: AiSessionPageSession | null;
  /** The host-rendered recipe preview for the preview stage. */
  preview?: ReactNode;
  prompt: string;
  onPromptChange: (value: string) => void;
  followUp: string;
  onFollowUpChange: (value: string) => void;
  /** Any session request in flight. */
  busy: boolean;
  startPending?: boolean;
  approvePending?: boolean;
  finalizePending?: boolean;
  error?: string | null;
  onStart: (prompt: string) => void;
  onSendMessage: (text: string) => void;
  onApprovePlan: () => void;
  onFinalize: () => void;
  onCancel: () => void;
  onEmptyCancel: () => void;
};

export function AiSessionPage({
  config,
  session,
  preview,
  prompt,
  onPromptChange,
  followUp,
  onFollowUpChange,
  busy,
  startPending = false,
  approvePending = false,
  finalizePending = false,
  error,
  onStart,
  onSendMessage,
  onApprovePlan,
  onFinalize,
  onCancel,
  onEmptyCancel,
}: AiSessionPageProps) {
  // Web keyboard support (the TextLink/MealPlansPage pattern): the
  // Cancel control below carries the button role on web, and a div
  // with a role is not keyboard-operable on its own, so Enter and
  // Space invoke the same callback as a press. `tabIndex` and
  // `onKeyDown` are web-only props in Tamagui and are ignored on
  // native, where onPress is the activation path.
  // Both activation paths route through one busy-guarded callback:
  // pointerEvents="none" blocks pointer input while busy, but a
  // focused control can still receive key events and an assistive-
  // technology virtual click can still reach onPress.
  const handleCancel = () => {
    if (busy) return;
    onCancel();
  };
  const handleCancelKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCancel();
    }
  };
  if (!session) {
    return (
      <YStack
        flex={1}
        backgroundColor={tokens.colors.gray.gray1}
        paddingHorizontal="$4"
        paddingTop="$4"
      >
        <YStack paddingBottom="$2">
          <Text
            fontSize={tokens.typography.fontSize["2xl"]}
            fontWeight={tokens.typography.fontWeight.bold}
            color={tokens.colors.gray.gray10}
          >
            {config.title}
          </Text>
        </YStack>
        <YStack paddingBottom="$6">
          <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
            {config.intro}
          </Text>
        </YStack>
        <YStack paddingBottom="$4">
          <TextAreaField
            value={prompt}
            onChangeText={onPromptChange}
            placeholder={config.promptPlaceholder}
            minHeight={192}
            textAlignVertical="top"
          />
        </YStack>
        {error ? (
          <YStack paddingBottom="$4">
            <Text variant="error">{error}</Text>
          </YStack>
        ) : null}
        <XStack gap="$3">
          <Button variant="ghost" onPress={onEmptyCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            flex={1}
            disabled={busy || !prompt.trim()}
            onPress={() => {
              onStart(prompt);
            }}
          >
            {startPending ? config.startPendingLabel : config.startLabel}
          </Button>
        </XStack>
      </YStack>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tokens.colors.gray.gray1 }}
      contentContainerStyle={{
        paddingHorizontal: tokens.spacing[4],
        paddingTop: tokens.spacing[4],
      }}
    >
      <YStack paddingBottom="$2">
        <Text
          fontSize={tokens.typography.fontSize["2xl"]}
          fontWeight={tokens.typography.fontWeight.bold}
          color={tokens.colors.gray.gray10}
        >
          {config.title}
        </Text>
      </YStack>
      <YStack paddingBottom="$4">
        <Text color="$textMuted" fontSize={tokens.typography.fontSize.sm}>
          {session.phaseLabel}
        </Text>
      </YStack>
      <YStack gap="$3" paddingBottom="$4">
        {session.messages.map((message, index) => (
          <YStack
            key={index}
            paddingStart={message.role === "user" ? "$8" : undefined}
            paddingEnd={message.role === "assistant" ? "$8" : undefined}
          >
            <YStack
              borderRadius={tokens.radii.md}
              backgroundColor={
                message.role === "user" ? tokens.colors.gray.gray2 : "$primarySubtle"
              }
              padding="$3"
            >
              <YStack paddingBottom="$1">
                <Text
                  fontSize={tokens.typography.fontSize.xs}
                  fontWeight={tokens.typography.fontWeight.semibold}
                  color={tokens.colors.gray.gray6}
                  textTransform="uppercase"
                >
                  {message.role === "user" ? "You" : "Plan"}
                </Text>
              </YStack>
              <Text fontSize={tokens.typography.fontSize.sm} color={tokens.colors.gray.gray9}>
                {message.content}
              </Text>
            </YStack>
          </YStack>
        ))}
      </YStack>
      {session.canRefine ? (
        <YStack paddingBottom="$4" gap="$3">
          <TextAreaField
            value={followUp}
            onChangeText={onFollowUpChange}
            placeholder="Ask for changes to the plan…"
            minHeight={96}
          />
          <XStack flexWrap="wrap" gap="$2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy || !followUp.trim()}
              onPress={() => {
                onSendMessage(followUp);
              }}
            >
              Refine plan
            </Button>
            <Button variant="primary" size="sm" disabled={busy} onPress={onApprovePlan}>
              {approvePending ? "Building preview…" : "Approve plan"}
            </Button>
          </XStack>
        </YStack>
      ) : null}
      {preview ? (
        <YStack paddingBottom="$4">
          <YStack
            borderRadius={tokens.radii.lg}
            borderWidth={1}
            borderColor={tokens.colors.gray.gray3}
            backgroundColor="$surface"
            padding="$4"
          >
            <YStack paddingBottom="$3">
              <Text
                fontSize={tokens.typography.fontSize.sm}
                fontWeight={tokens.typography.fontWeight.semibold}
                color={tokens.colors.gray.gray10}
              >
                {config.previewTitle}
              </Text>
            </YStack>
            {preview}
            <YStack paddingTop="$4">
              <Button variant="primary" disabled={busy} onPress={onFinalize}>
                {finalizePending ? config.finalizePendingLabel : config.finalizeLabel}
              </Button>
            </YStack>
          </YStack>
        </YStack>
      ) : null}
      {error ? (
        <YStack paddingBottom="$4">
          <Text variant="error">{error}</Text>
        </YStack>
      ) : null}
      {session.canCancel ? (
        <YStack paddingBottom={tokens.spacing[8]}>
          <YStack
            opacity={busy ? 0.5 : 1}
            pointerEvents={busy ? "none" : "auto"}
            onPress={handleCancel}
            {...platformAccessibilityProps({
              accessibilityRole: "button",
              accessibilityLabel: "Cancel session",
              accessibilityState: { disabled: busy },
            })}
            tabIndex={0}
            onKeyDown={handleCancelKeyDown}
            cursor="web:pointer"
          >
            <Text
              fontSize={tokens.typography.fontSize.sm}
              color={tokens.colors.gray.gray6}
              textDecorationLine="underline"
            >
              Cancel session
            </Text>
          </YStack>
        </YStack>
      ) : null}
    </ScrollView>
  );
}
