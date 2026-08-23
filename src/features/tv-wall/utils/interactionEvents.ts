export const TV_WALL_INTERACTION_EVENTS = [
  'pointerdown',
  'pointermove',
  'wheel',
  'touchstart',
  'touchmove',
  'keydown',
] as const;

export type TvWallInteractionEvent = (typeof TV_WALL_INTERACTION_EVENTS)[number];

const CONTINUOUS_INTERACTION_EVENTS = new Set<TvWallInteractionEvent>([
  'pointermove',
  'wheel',
  'touchmove',
]);

export const DEFAULT_CONTINUOUS_EVENT_THROTTLE_MS = 250;

export interface TvWallInteractionTarget {
  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ): void;
}

interface IdleAutopilotControllerOptions {
  enabled: boolean;
  idleTimeoutMs: number;
  target: TvWallInteractionTarget;
  onIdle: () => void;
  onInteraction: (at: number) => void;
  now?: () => number;
  continuousEventThrottleMs?: number;
}

export interface IdleAutopilotController {
  start(): void;
  stop(): void;
}

const listenerOptions: AddEventListenerOptions = { capture: true, passive: true };

export function createIdleAutopilotController({
  enabled,
  idleTimeoutMs,
  target,
  onIdle,
  onInteraction,
  now = () => performance.now(),
  continuousEventThrottleMs = DEFAULT_CONTINUOUS_EVENT_THROTTLE_MS,
}: IdleAutopilotControllerOptions): IdleAutopilotController {
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let started = false;
  let lastContinuousInteractionAt = Number.NEGATIVE_INFINITY;

  const clearIdleTimer = () => {
    if (idleTimer === null) return;
    clearTimeout(idleTimer);
    idleTimer = null;
  };

  const scheduleIdle = () => {
    clearIdleTimer();
    idleTimer = setTimeout(() => {
      idleTimer = null;
      onIdle();
    }, idleTimeoutMs);
  };

  const handleInteraction: EventListener = (event) => {
    const at = now();
    const eventType = event.type as TvWallInteractionEvent;

    if (CONTINUOUS_INTERACTION_EVENTS.has(eventType)) {
      if (at - lastContinuousInteractionAt < continuousEventThrottleMs) return;
      lastContinuousInteractionAt = at;
    }

    onInteraction(at);
    scheduleIdle();
  };

  return {
    start() {
      if (!enabled || started) return;
      started = true;
      for (const eventName of TV_WALL_INTERACTION_EVENTS) {
        // Capture ensures controls that stop propagation still count as activity.
        target.addEventListener(eventName, handleInteraction, listenerOptions);
      }
      scheduleIdle();
    },
    stop() {
      if (!started) return;
      started = false;
      clearIdleTimer();
      for (const eventName of TV_WALL_INTERACTION_EVENTS) {
        target.removeEventListener(eventName, handleInteraction, listenerOptions);
      }
    },
  };
}
