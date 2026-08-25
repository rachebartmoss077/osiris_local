import { describe, expect, it, vi } from 'vitest';
import type { MapController } from '../map/MapController';
import { createTvWallMapLayoutResize } from './mapLayoutResize';

function createControllerMock(): MapController {
  return {
    flyTo: vi.fn(),
    easeTo: vi.fn(),
    resize: vi.fn(),
    stop: vi.fn(),
    getView: vi.fn(() => ({ center: [0, 0] as [number, number], zoom: 2, pitch: 0, bearing: 0 })),
    isMoving: vi.fn(() => false),
  };
}

describe('TV Wall map layout resize', () => {
  it('resizes once for each layout transition without looping on repeat syncs', () => {
    const controller = createControllerMock();
    const lifecycle = createTvWallMapLayoutResize();

    lifecycle.sync({ active: false, controller });
    lifecycle.sync({ active: false, controller });
    lifecycle.sync({ active: true, controller });
    lifecycle.sync({ active: true, controller });
    lifecycle.sync({ active: false, controller });

    expect(controller.resize).toHaveBeenCalledTimes(3);
  });

  it('handles controller invalidation and resizes a replacement controller', () => {
    const first = createControllerMock();
    const replacement = createControllerMock();
    const lifecycle = createTvWallMapLayoutResize();

    lifecycle.sync({ active: true, controller: first });
    lifecycle.sync({ active: true, controller: null });
    lifecycle.sync({ active: true, controller: replacement });

    expect(first.resize).toHaveBeenCalledOnce();
    expect(replacement.resize).toHaveBeenCalledOnce();

    lifecycle.dispose();
    lifecycle.sync({ active: true, controller: replacement });
    expect(replacement.resize).toHaveBeenCalledTimes(2);
  });
});
