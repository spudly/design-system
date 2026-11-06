import { createContext, useContext, type ReactNode } from "react";

/**
 * Internal loading-state context (#278): the mechanism composites
 * use to tell their OWN sub-parts that the composite is loading,
 * without prop-drilling the flag through every internal layer.
 *
 * The PUBLIC contract stays the explicit `loading` prop on the
 * composite itself — LoadingScope is deliberately not exported
 * from the package barrel and app code never touches it. A
 * composite wraps its internals in <LoadingScope active={loading}>;
 * internal pieces read useLoadingScope() to swap content for
 * skeletons. Standalone primitives (BoxSkeleton and friends) take
 * no loading prop at all: rendering one IS the loading state.
 */

const LoadingScopeContext = createContext(false);

export type LoadingScopeProps = {
  /** Whether the enclosing composite is in its loading state. */
  active?: boolean;
  children?: ReactNode;
};

export function LoadingScope({ active = false, children }: LoadingScopeProps) {
  return <LoadingScopeContext.Provider value={active}>{children}</LoadingScopeContext.Provider>;
}

/** Whether the nearest enclosing composite is loading. */
export function useLoadingScope(): boolean {
  return useContext(LoadingScopeContext);
}
