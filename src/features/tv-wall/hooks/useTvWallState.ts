'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  createInitialTvWallState,
  DEFAULT_TV_WALL_IDLE_TIMEOUT_MS,
  tvWallReducer,
} from '../state/tvWallReducer';
import { useIdleAutopilot } from './useIdleAutopilot';

interface UseTvWallStateOptions {
  idleTimeoutMs?: number;
}

export function useTvWallState({
  idleTimeoutMs = DEFAULT_TV_WALL_IDLE_TIMEOUT_MS,
}: UseTvWallStateOptions = {}) {
  const [state, dispatch] = useReducer(
    tvWallReducer,
    undefined,
    () => createInitialTvWallState(false, idleTimeoutMs),
  );
  const modeRef = useRef(state.mode);

  useEffect(() => {
    modeRef.current = state.mode;
  }, [state.mode]);

  useEffect(() => {
    const enabled = new URLSearchParams(window.location.search).get('wall') === '1';
    dispatch({ type: 'configure', enabled, idleTimeoutMs });
  }, [idleTimeoutMs]);

  const handleIdle = useCallback(() => {
    modeRef.current = 'autopilot';
    dispatch({ type: 'idle' });
  }, []);

  const handleInteraction = useCallback(() => {
    // The controller always resets its timer, but React only updates when an
    // interaction actually exits Autopilot.
    if (modeRef.current === 'autopilot') {
      modeRef.current = 'interactive';
      dispatch({ type: 'interaction' });
    }
  }, []);

  useIdleAutopilot({
    enabled: state.enabled,
    idleTimeoutMs: state.idleTimeoutMs,
    onIdle: handleIdle,
    onInteraction: handleInteraction,
  });

  return state;
}
