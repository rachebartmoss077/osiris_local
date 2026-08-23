import type { TvWallState } from '../types/state';

export const DEFAULT_TV_WALL_IDLE_TIMEOUT_MS = 30_000;

export type TvWallAction =
  | { type: 'configure'; enabled: boolean; idleTimeoutMs?: number }
  | { type: 'idle' }
  | { type: 'interaction' };

function normalizeIdleTimeoutMs(value: number): number {
  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_TV_WALL_IDLE_TIMEOUT_MS;
}

export function createInitialTvWallState(
  enabled = false,
  idleTimeoutMs = DEFAULT_TV_WALL_IDLE_TIMEOUT_MS,
): TvWallState {
  return {
    enabled,
    mode: 'interactive',
    idleTimeoutMs: normalizeIdleTimeoutMs(idleTimeoutMs),
  };
}

export function tvWallReducer(state: TvWallState, action: TvWallAction): TvWallState {
  switch (action.type) {
    case 'configure': {
      const idleTimeoutMs = normalizeIdleTimeoutMs(action.idleTimeoutMs ?? state.idleTimeoutMs);
      if (
        state.enabled === action.enabled
        && state.idleTimeoutMs === idleTimeoutMs
        && (action.enabled || state.mode === 'interactive')
      ) {
        return state;
      }
      return {
        enabled: action.enabled,
        mode: action.enabled ? state.mode : 'interactive',
        idleTimeoutMs,
      };
    }
    case 'idle':
      if (!state.enabled || state.mode === 'autopilot') return state;
      return { ...state, mode: 'autopilot' };
    case 'interaction':
      if (!state.enabled || state.mode === 'interactive') return state;
      return { ...state, mode: 'interactive' };
  }
}
