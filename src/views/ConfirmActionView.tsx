import { Alert } from "../widgets/Alert.js";
import { Button } from "../widgets/Button.js";
import { Dialog } from "../widgets/Dialog.js";

export type ConfirmActionViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** A failure from the last confirm attempt, shown inside the dialog. */
  error?: string | null;
  confirmLabel: string;
  /** The confirm button's label while the action runs ("Deleting…"). */
  confirmPendingLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  /** The confirm button's tone: destructive confirmations are danger (the default). */
  confirmTone?: "danger" | "primary";
  /**
   * The cancel button's label. Omit for a single-action dialog
   * (a notice the user only acknowledges — the confirm button
   * is the only action).
   */
  cancelLabel?: string;
  onCancel?: () => void;
};

/**
 * ConfirmActionView (#438 Part 3): the confirmation-dialog
 * shape hosts used to hand-compose from Dialog + Button +
 * Alert (the eciperay audit's coverage disposition for those
 * specifiers) — a Dialog with an optional in-dialog error and
 * a cancel / confirm action row, as a view.
 *
 * The mutation stays with the caller: the view reports the
 * confirm intent and renders the pending and error states it
 * is given. While `pending`, dismissal is locked — the view
 * swallows close requests (Escape, overlay, cancel) without
 * reporting them, exactly as the host dialogs did, so an
 * in-flight destructive action cannot be dismissed out from
 * under its own error surface. Focus trapping, initial focus,
 * and focus restoration are the Dialog's.
 */
export function ConfirmActionView({
  open,
  onOpenChange,
  title,
  description,
  error,
  confirmLabel,
  confirmPendingLabel,
  pending = false,
  onConfirm,
  confirmTone = "danger",
  cancelLabel,
  onCancel,
}: ConfirmActionViewProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && pending) {
      return;
    }
    onOpenChange(next);
  };
  const handleCancel = () => {
    if (pending) {
      return;
    }
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      {...(description ? { description } : {})}
      actions={
        <>
          {cancelLabel ? (
            <Button variant="secondary" disabled={pending} onPress={handleCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button variant={confirmTone} disabled={pending} onPress={onConfirm}>
            {pending && confirmPendingLabel ? confirmPendingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      {error ? <Alert severity="error" message={error} /> : null}
    </Dialog>
  );
}
