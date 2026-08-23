import { describe, expect, it, vi } from 'vitest';
import { createOsirisMapController } from './createOsirisMapController';

function createMapMock() {
  const map = {
    flyTo: vi.fn(),
    easeTo: vi.fn(),
    stop: vi.fn(),
    getCenter: vi.fn(() => ({ lng: 12, lat: 34 })),
    getZoom: vi.fn(() => 4),
    getPitch: vi.fn(() => 20),
    getBearing: vi.fn(() => -15),
    isMoving: vi.fn(() => true),
  };
  return map;
}

describe('createOsirisMapController', () => {
  it('delegates flyTo and easeTo with translated duration', () => {
    const map = createMapMock();
    const { controller } = createOsirisMapController(map);
    const camera = {
      center: [0, 20] as [number, number],
      zoom: 1.75,
      pitch: 0,
      bearing: 0,
      durationMs: 3_500,
    };

    controller.flyTo(camera);
    controller.easeTo(camera);

    const expected = {
      center: [0, 20],
      zoom: 1.75,
      pitch: 0,
      bearing: 0,
      duration: 3_500,
    };
    expect(map.flyTo).toHaveBeenCalledWith(expected);
    expect(map.easeTo).toHaveBeenCalledWith(expected);
  });

  it('delegates stop and exposes movement and camera snapshots', () => {
    const map = createMapMock();
    const { controller } = createOsirisMapController(map);

    controller.stop();
    expect(map.stop).toHaveBeenCalledOnce();
    expect(controller.isMoving()).toBe(true);
    expect(controller.getView()).toEqual({
      center: [12, 34],
      zoom: 4,
      pitch: 20,
      bearing: -15,
    });
  });

  it('invalidates stale controllers when the map lifecycle ends', () => {
    const map = createMapMock();
    const binding = createOsirisMapController(map);

    binding.destroy();
    binding.controller.flyTo({ center: [0, 0], zoom: 2 });
    binding.controller.stop();

    expect(map.stop).toHaveBeenCalledOnce();
    expect(map.flyTo).not.toHaveBeenCalled();
    expect(binding.controller.isMoving()).toBe(false);
  });
});
