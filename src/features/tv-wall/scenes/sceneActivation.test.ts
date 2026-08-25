import { describe, expect, it, vi } from 'vitest';
import { GLOBAL_OVERVIEW } from '../config/scenes';
import type { MapController } from '../map/MapController';
import { createTvSceneActivation } from './sceneActivation';

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

describe('TV scene activation', () => {
  it('runs GLOBAL_OVERVIEW once per Autopilot entry and stops on exit', () => {
    const controller = createControllerMock();
    const activation = createTvSceneActivation();
    const sync = (mode: 'interactive' | 'autopilot') => activation.sync({
      enabled: true,
      mode,
      controller,
      scene: GLOBAL_OVERVIEW,
    });

    sync('interactive');
    expect(controller.flyTo).not.toHaveBeenCalled();

    sync('autopilot');
    sync('autopilot');
    expect(controller.flyTo).toHaveBeenCalledOnce();
    expect(controller.flyTo).toHaveBeenCalledWith(GLOBAL_OVERVIEW.camera);

    sync('interactive');
    expect(controller.stop).toHaveBeenCalledOnce();

    sync('autopilot');
    expect(controller.flyTo).toHaveBeenCalledTimes(2);
  });

  it('does nothing while disabled or while the controller is unavailable', () => {
    const controller = createControllerMock();
    const activation = createTvSceneActivation();

    expect(() => activation.sync({
      enabled: true,
      mode: 'autopilot',
      controller: null,
      scene: GLOBAL_OVERVIEW,
    })).not.toThrow();
    activation.sync({
      enabled: false,
      mode: 'autopilot',
      controller,
      scene: GLOBAL_OVERVIEW,
    });

    expect(controller.flyTo).not.toHaveBeenCalled();
    expect(controller.stop).not.toHaveBeenCalled();
  });
});
