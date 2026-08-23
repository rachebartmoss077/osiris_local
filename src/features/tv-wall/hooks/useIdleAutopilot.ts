'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { createIdleAutopilotController } from '../utils/interactionEvents';

interface UseIdleAutopilotOptions {
  enabled: boolean;
  idleTimeoutMs: number;
  onIdle: () => void;
  onInteraction: () => void;
}

export function useIdleAutopilot({
  enabled,
  idleTimeoutMs,
  onIdle,
  onInteraction,
}: UseIdleAutopilotOptions): MutableRefObject<number> {
  const lastUserInteractionRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    lastUserInteractionRef.current = performance.now();
    const controller = createIdleAutopilotController({
      enabled: true,
      idleTimeoutMs,
      target: window,
      onIdle,
      onInteraction: (at) => {
        lastUserInteractionRef.current = at;
        onInteraction();
      },
    });

    controller.start();
    return () => controller.stop();
  }, [enabled, idleTimeoutMs, onIdle, onInteraction]);

  return lastUserInteractionRef;
}
