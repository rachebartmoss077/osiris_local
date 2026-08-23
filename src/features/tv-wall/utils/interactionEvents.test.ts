import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialTvWallState, tvWallReducer } from '../state/tvWallReducer';
import {
  createIdleAutopilotController,
  type TvWallInteractionTarget,
} from './interactionEvents';

class FakeInteractionTarget implements TvWallInteractionTarget {
  private listeners = new Map<string, Set<EventListener>>();

  addEventListener(type: string, listener: EventListener) {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ type } as Event);
    }
  }

  listenerCount() {
    return [...this.listeners.values()].reduce((total, listeners) => total + listeners.size, 0);
  }
}

describe('idle Autopilot controller', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enters Autopilot only after the full 30 second timeout', () => {
    const target = new FakeInteractionTarget();
    let state = createInitialTvWallState(true);
    const controller = createIdleAutopilotController({
      enabled: true,
      idleTimeoutMs: 30_000,
      target,
      now: () => Date.now(),
      onIdle: () => { state = tvWallReducer(state, { type: 'idle' }); },
      onInteraction: () => { state = tvWallReducer(state, { type: 'interaction' }); },
    });

    controller.start();
    vi.advanceTimersByTime(29_000);
    expect(state.mode).toBe('interactive');
    vi.advanceTimersByTime(1_000);
    expect(state.mode).toBe('autopilot');
    controller.stop();
  });

  it('exits on pointer input and starts a fresh idle cycle', () => {
    const target = new FakeInteractionTarget();
    let state = createInitialTvWallState(true);
    const controller = createIdleAutopilotController({
      enabled: true,
      idleTimeoutMs: 30_000,
      target,
      now: () => Date.now(),
      onIdle: () => { state = tvWallReducer(state, { type: 'idle' }); },
      onInteraction: () => { state = tvWallReducer(state, { type: 'interaction' }); },
    });

    controller.start();
    vi.advanceTimersByTime(30_000);
    expect(state.mode).toBe('autopilot');

    target.emit('pointerdown');
    expect(state.mode).toBe('interactive');

    vi.advanceTimersByTime(29_999);
    expect(state.mode).toBe('interactive');
    vi.advanceTimersByTime(1);
    expect(state.mode).toBe('autopilot');
    controller.stop();
  });

  it('throttles continuous pointer movement without losing immediate input', () => {
    const target = new FakeInteractionTarget();
    const onInteraction = vi.fn();
    const controller = createIdleAutopilotController({
      enabled: true,
      idleTimeoutMs: 30_000,
      target,
      now: () => Date.now(),
      onIdle: vi.fn(),
      onInteraction,
    });

    controller.start();
    for (let index = 0; index < 100; index += 1) target.emit('pointermove');
    expect(onInteraction).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersByTime(250);
    target.emit('pointermove');
    expect(onInteraction).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(1);
    controller.stop();
  });

  it('does not attach listeners or timers while disabled', () => {
    const target = new FakeInteractionTarget();
    const controller = createIdleAutopilotController({
      enabled: false,
      idleTimeoutMs: 30_000,
      target,
      now: () => Date.now(),
      onIdle: vi.fn(),
      onInteraction: vi.fn(),
    });

    controller.start();
    expect(target.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes every listener and pending timer on stop', () => {
    const target = new FakeInteractionTarget();
    const controller = createIdleAutopilotController({
      enabled: true,
      idleTimeoutMs: 30_000,
      target,
      now: () => Date.now(),
      onIdle: vi.fn(),
      onInteraction: vi.fn(),
    });

    controller.start();
    expect(target.listenerCount()).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBe(1);

    controller.stop();
    expect(target.listenerCount()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
