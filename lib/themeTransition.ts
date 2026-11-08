type ThemeValue = 'light' | 'dark';

/**
 * Circular-reveal theme toggle (View Transitions API).
 * Expands a flash circle outward from the clicked button, then swaps the theme.
 * Falls back to an instant swap where the API is unavailable.
 */
export function toggleThemeWithRipple(
  event: React.MouseEvent<HTMLElement> | MouseEvent,
  isDark: boolean,
  setTheme: (theme: ThemeValue) => void,
) {
  const next: ThemeValue = isDark ? 'light' : 'dark';
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!doc.startViewTransition || prefersReducedMotion) {
    setTheme(next);
    return;
  }

  const x = 'clientX' in event ? event.clientX : window.innerWidth - 40;
  const y = 'clientY' in event ? event.clientY : 40;
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = doc.startViewTransition(() => {
    setTheme(next);
  });

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 450,
          easing: 'ease-out',
          fill: 'both',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    }, () => undefined);
}
