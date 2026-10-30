import type { ReactNode } from "react";
import { Button } from "../components/Button.js";
import { ButtonRow } from "../components/ButtonRow.js";
import { CancelSessionAction } from "../components/CancelSessionAction.js";
import { FormHeading } from "../components/FormHeading.js";
import { MessageList } from "../components/MessageList.js";
import { PreviewCard } from "../components/PreviewCard.js";
import { SessionShell } from "../components/SessionShell.js";
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
 *
 * De-styled for #119: the page renders no layout primitives
 * and sets no styling props. SessionShell owns the two states'
 * frames (the recessed background, content padding, and the
 * section rhythm) and the running state's scrolling;
 * FormHeading owns the title block; MessageList owns the
 * transcript bubbles; PreviewCard frames the preview stage;
 * the prompt and follow-up fields take TextAreaField's `xl` /
 * `lg` height steps instead of a raw minHeight; the start
 * action grows through Button's `grow` prop; and the cancel
 * control is CancelSessionAction (TextAction's keyboard and
 * disabled semantics under the muted underlined treatment),
 * replacing the hand-built pressable stack this page used to
 * carry — including its keyboard handler, which now also
 * refuses held-key repeats, as TextAction does.
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
  if (!session) {
    return (
      <SessionShell>
        <FormHeading subtitle={config.intro}>{config.title}</FormHeading>
        <TextAreaField
          value={prompt}
          onChangeText={onPromptChange}
          placeholder={config.promptPlaceholder}
          size="xl"
          textAlignVertical="top"
        />
        {error ? <Text variant="error">{error}</Text> : null}
        <ButtonRow>
          <Button variant="ghost" onPress={onEmptyCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            grow
            disabled={busy || !prompt.trim()}
            onPress={() => {
              onStart(prompt);
            }}
          >
            {startPending ? config.startPendingLabel : config.startLabel}
          </Button>
        </ButtonRow>
      </SessionShell>
    );
  }

  return (
    <SessionShell scrollable>
      <FormHeading subtitle={session.phaseLabel}>{config.title}</FormHeading>
      <MessageList messages={session.messages} userLabel="You" assistantLabel="Plan" />
      {session.canRefine ? (
        <>
          <TextAreaField
            value={followUp}
            onChangeText={onFollowUpChange}
            placeholder="Ask for changes to the plan…"
            size="lg"
          />
          <ButtonRow>
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
          </ButtonRow>
        </>
      ) : null}
      {preview ? (
        <PreviewCard
          title={config.previewTitle}
          actions={
            <Button variant="primary" disabled={busy} onPress={onFinalize}>
              {finalizePending ? config.finalizePendingLabel : config.finalizeLabel}
            </Button>
          }
        >
          {preview}
        </PreviewCard>
      ) : null}
      {error ? <Text variant="error">{error}</Text> : null}
      {session.canCancel ? <CancelSessionAction disabled={busy} onPress={onCancel} /> : null}
    </SessionShell>
  );
}
