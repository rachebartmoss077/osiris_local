import type { TvWallState } from '../types/state';

interface TvWallModeIndicatorProps {
  state: TvWallState;
}

export function TvWallModeIndicator({ state }: TvWallModeIndicatorProps) {
  if (!state.enabled) return null;

  const isAutopilot = state.mode === 'autopilot';
  return (
    <div
      aria-live="polite"
      data-tv-wall-mode={state.mode}
      className={`pointer-events-none absolute left-1/2 top-2 z-[950] -translate-x-1/2 rounded border px-2 py-1 font-mono text-[9px] tracking-[0.16em] backdrop-blur-sm ${
        isAutopilot
          ? 'border-[var(--gold-primary)]/40 bg-black/75 text-[var(--gold-primary)]'
          : 'border-white/15 bg-black/60 text-white/50'
      }`}
    >
      TV WALL · {state.mode.toUpperCase()}
    </div>
  );
}
