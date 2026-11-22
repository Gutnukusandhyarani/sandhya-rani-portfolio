import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'dark' | 'light';

const listeners = new Set<() => void>();
const root = () => document.documentElement;

export function getTheme(): Theme {
  return root().dataset.theme === 'light' ? 'light' : 'dark';
}

function apply(theme: Theme) {
  root().dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080808' : '#fafaf8');
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage unavailable — theme still applies for this visit */
  }
  listeners.forEach((l) => l());
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Switch theme. When the View Transitions API exists, the new theme is revealed
 * as an expanding circle that starts at (x, y) — the pull-cord knob.
 */
export function toggleTheme(origin?: { x: number; y: number }) {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

  if (!doc.startViewTransition || prefersReducedMotion()) {
    root().classList.add('theme-fade');
    apply(next);
    window.setTimeout(() => root().classList.remove('theme-fade'), prefersReducedMotion() ? 0 : 650);
    return;
  }

  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 0;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const t = doc.startViewTransition(() => flushSync(() => apply(next)));
  t.ready.then(() => {
    root().animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 1100, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getTheme,
    () => 'dark' as Theme,
  );
}
