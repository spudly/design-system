import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { View, styled, useTheme } from "tamagui";
import { isWeb } from "@tamagui/constants";
import { platformAccessibilityProps } from "./accessibility.js";
import { tokens } from "../tokens/index.js";

/**
 * The shared pulse behind every skeleton primitive (#278).
 *
 * One clock, one phase: the phase is derived from the absolute
 * wall-clock time (modulo the cycle), so every bone on a screen —
 * inside a SkeletonClock provider or not, mounted together or
 * staggered — computes the SAME opacity at the same moment.
 * Synchronization is by construction, not by coordination.
 *
 * Why a phase store and not React Native's Animated value: the
 * package root may not value-import react-native (the root entry
 * is loaded in plain Node by the test suite, where react-native
 * does not parse — the BoundedList rule), and the Tamagui config
 * registers no native animation driver. A tiny external store
 * driven by requestAnimationFrame gives the identical contract —
 * one looping value every primitive reads — with no new
 * dependency and no platform imports. Subscribers are the bone
 * leaves, so the per-frame updates re-render bones only.
 *
 * Reduced motion: on web the clock freezes when the OS asks for
 * reduced motion (prefers-reduced-motion), and a provider can
 * freeze explicitly (deterministic captures: Chromatic / Android
 * VR pass `frozen`). Native reduced-motion cannot be read without
 * the react-native import the root forbids, so native hosts that
 * need the freeze pass `frozen` — the default native experience
 * pulses, matching the platform's other indeterminate loaders.
 */

const CYCLE_MS = 1200;
const OPACITY_MIN = 0.45;
const OPACITY_MAX = 1;
const FROZEN_OPACITY = 0.72;

/** The eased pulse opacity for an absolute timestamp. */
function pulseOpacity(now: number): number {
  const t = (now % CYCLE_MS) / CYCLE_MS;
  const triangle = t < 0.5 ? t * 2 : (1 - t) * 2;
  // Smoothstep easing on the way up and down (ease-in-out).
  const eased = triangle * triangle * (3 - 2 * triangle);
  return OPACITY_MIN + (OPACITY_MAX - OPACITY_MIN) * eased;
}

type SkeletonClockStore = {
  subscribe: (listener: () => void) => () => void;
  getOpacity: () => number;
  getServerOpacity: () => number;
  setFrozen: (frozen: boolean) => void;
};

function createSkeletonClockStore(initiallyFrozen: boolean): SkeletonClockStore {
  const listeners = new Set<() => void>();
  let frozen = initiallyFrozen;
  let frame: number | null = null;
  let lastOpacity = frozen ? FROZEN_OPACITY : pulseOpacity(Date.now());

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const stopLoop = () => {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  };

  const tick = () => {
    frame = null;
    const next = pulseOpacity(Date.now());
    if (Math.abs(next - lastOpacity) > 0.002) {
      lastOpacity = next;
      notify();
    }
    if (listeners.size > 0 && !frozen) {
      frame = requestAnimationFrame(tick);
    }
  };

  const startLoop = () => {
    if (frame === null && !frozen && listeners.size > 0) {
      frame = requestAnimationFrame(tick);
    }
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      startLoop();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) stopLoop();
      };
    },
    getOpacity: () => (frozen ? FROZEN_OPACITY : lastOpacity),
    getServerOpacity: () => FROZEN_OPACITY,
    setFrozen: (next) => {
      if (frozen === next) return;
      frozen = next;
      if (frozen) {
        stopLoop();
      } else {
        lastOpacity = pulseOpacity(Date.now());
        startLoop();
      }
      notify();
    },
  };
}

const SkeletonClockContext = createContext<SkeletonClockStore | null>(null);

function webPrefersReducedMotion(): boolean {
  if (!isWeb || typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Live-tracks the web reduced-motion preference (always false off web). */
function useWebPrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(webPrefersReducedMotion);
  useEffect(() => {
    if (!isWeb || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

let defaultStore: SkeletonClockStore | null = null;

function getDefaultStore(): SkeletonClockStore {
  if (defaultStore === null) {
    defaultStore = createSkeletonClockStore(webPrefersReducedMotion());
  }
  return defaultStore;
}

export type SkeletonClockProps = {
  children?: ReactNode;
  /**
   * Freeze the pulse at a static mid-opacity. For deterministic
   * captures (Chromatic, Android VR) and hosts honoring a native
   * reduced-motion signal the package cannot read itself. On web
   * the clock also freezes automatically under
   * prefers-reduced-motion.
   */
  frozen?: boolean;
};

/**
 * Optional provider scoping one clock to a subtree — chiefly to
 * freeze it. Primitives work without it: provider-less bones share
 * a module-level clock on the same absolute phase, so a screen of
 * skeletons stays synchronized either way.
 */
export function SkeletonClock({ children, frozen = false }: SkeletonClockProps) {
  const webReducedMotion = useWebPrefersReducedMotion();
  const storeRef = useRef<SkeletonClockStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createSkeletonClockStore(frozen || webPrefersReducedMotion());
  }
  useEffect(() => {
    storeRef.current?.setFrozen(frozen || webReducedMotion);
  }, [frozen, webReducedMotion]);
  return (
    <SkeletonClockContext.Provider value={storeRef.current}>
      {children}
    </SkeletonClockContext.Provider>
  );
}

/**
 * The current pulse opacity from the enclosing clock (or the
 * shared default clock). Internal: the primitives consume it; it
 * is not part of the package's public surface.
 */
export function useSkeletonOpacity(): number {
  const store = useContext(SkeletonClockContext) ?? getDefaultStore();
  return useSyncExternalStore(store.subscribe, store.getOpacity, store.getServerOpacity);
}

const BoneBase = styled(View, {
  name: "SkeletonBone",
});

export type SkeletonBoneProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
};

/**
 * One pulsing bone: theme border-role fill at the shared clock's
 * opacity, hidden from assistive tech (a skeleton announces
 * nothing — the region it stands in for carries the busy state).
 * Internal building block for the skeleton primitives; not
 * exported from the package barrel.
 */
export function SkeletonBone({ width, height, borderRadius }: SkeletonBoneProps) {
  const opacity = useSkeletonOpacity();
  const theme = useTheme();
  // The fill is the theme's border role; read it from the active
  // theme (the tag-color / button-glyph pattern) so the bone is
  // the same color on web and native renderers alike. The
  // fallback is the base theme's border value (gray3).
  const fill =
    typeof theme.borderColor?.val === "string" ? theme.borderColor.val : tokens.colors.gray.gray3;
  return (
    <BoneBase
      style={{ width, height, borderRadius, opacity, backgroundColor: fill }}
      {...platformAccessibilityProps({ accessibilityElementsHidden: true })}
    />
  );
}
