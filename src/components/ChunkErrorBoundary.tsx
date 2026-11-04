import { Component, type ReactNode } from "react";
import { isWeb } from "tamagui";
import { Alert } from "./Alert.js";
import { Button } from "./Button.js";

export type ChunkErrorBoundaryProps = {
  children: ReactNode;
  /**
   * Recovery action override. The default reloads the page on web
   * (see the component note) and does nothing where no page reload
   * exists; a native host that needs a recovery action supplies its
   * own here.
   */
  onReload?: () => void;
};

export type ChunkErrorBoundaryState = {
  failed: boolean;
};

/**
 * Recovery boundary for lazily loaded surfaces, lifted from
 * Memorize's app shell (memorize#54; design-system#411).
 *
 * Suspense covers a pending chunk; a *rejected* chunk import (e.g.
 * the old chunk 404s after a new deploy) propagates here instead of
 * unmounting the whole app. React caches the rejected lazy result,
 * so remounting cannot retry it — a full reload is the reliable
 * recovery, and the fallback's button performs one by default on
 * web (`window.location.reload()`, guarded the way this repo's
 * other web-only code is: `isWeb` plus a `typeof window` check, so
 * non-web renders never touch `window`). Callers key this boundary
 * by the active surface, so switching surfaces clears the error
 * state and the other surfaces stay usable.
 *
 * The fallback is composed from the design system's own Alert and
 * Button: an error Alert ("This section failed to load.") and a
 * "Reload the app" button. The button's label is its accessible
 * name; the Alert announces itself with the error live region.
 */
export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ChunkErrorBoundaryState {
    return { failed: true };
  }

  handleReload = (): void => {
    if (this.props.onReload) {
      this.props.onReload();
      return;
    }
    if (isWeb && typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <>
          <Alert severity="error">This section failed to load.</Alert>
          <Button onPress={this.handleReload}>Reload the app</Button>
        </>
      );
    }
    return this.props.children;
  }
}
