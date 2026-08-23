import { describe, expect, it } from 'vitest';
import {
  createInitialTvWallState,
  DEFAULT_TV_WALL_IDLE_TIMEOUT_MS,
  tvWallReducer,
} from './tvWallReducer';

describe('tvWallReducer', () => {
  it('starts in interactive mode', () => {
    expect(createInitialTvWallState(true)).toEqual({
      enabled: true,
      mode: 'interactive',
      idleTimeoutMs: DEFAULT_TV_WALL_IDLE_TIMEOUT_MS,
    });
  });

  it('enters Autopilot after becoming idle', () => {
    const state = tvWallReducer(createInitialTvWallState(true), { type: 'idle' });
    expect(state.mode).toBe('autopilot');
  });

  it('returns to Interactive on input', () => {
    const autopilot = tvWallReducer(createInitialTvWallState(true), { type: 'idle' });
    const interactive = tvWallReducer(autopilot, { type: 'interaction' });
    expect(interactive.mode).toBe('interactive');
  });

  it('supports a repeated Interactive/Autopilot cycle', () => {
    let state = createInitialTvWallState(true);
    state = tvWallReducer(state, { type: 'idle' });
    state = tvWallReducer(state, { type: 'interaction' });
    state = tvWallReducer(state, { type: 'idle' });
    expect(state.mode).toBe('autopilot');
  });

  it('never enters Autopilot while disabled', () => {
    const disabled = createInitialTvWallState(false);
    expect(tvWallReducer(disabled, { type: 'idle' })).toBe(disabled);

    const autopilot = tvWallReducer(createInitialTvWallState(true), { type: 'idle' });
    expect(tvWallReducer(autopilot, { type: 'configure', enabled: false })).toMatchObject({
      enabled: false,
      mode: 'interactive',
    });
  });
});
