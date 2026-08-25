import type { MapController } from '../map/MapController';

export interface TvWallMapLayoutInput {
  active: boolean;
  controller: MapController | null;
}

export interface TvWallMapLayoutResize {
  sync(input: TvWallMapLayoutInput): void;
  dispose(): void;
}

export function createTvWallMapLayoutResize(): TvWallMapLayoutResize {
  let previousActive: boolean | null = null;
  let previousController: MapController | null = null;

  const clear = () => {
    previousActive = null;
    previousController = null;
  };

  return {
    sync({ active, controller }) {
      if (!controller) {
        clear();
        return;
      }

      if (previousController === controller && previousActive === active) return;

      controller.resize();
      previousController = controller;
      previousActive = active;
    },
    dispose: clear,
  };
}
