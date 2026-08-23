import type { MapController } from '../map/MapController';
import type { TvWallMode } from '../types/state';
import type { TvScene } from '../types/scene';

export interface TvSceneActivationInput {
  enabled: boolean;
  mode: TvWallMode;
  controller: MapController | null;
  scene: TvScene;
}

export interface TvSceneActivation {
  sync(input: TvSceneActivationInput): void;
  dispose(): void;
}

export function createTvSceneActivation(): TvSceneActivation {
  let activeController: MapController | null = null;
  let activeSceneId: string | null = null;

  const clear = () => {
    activeController = null;
    activeSceneId = null;
  };

  return {
    sync({ enabled, mode, controller, scene }) {
      if (!enabled || mode !== 'autopilot') {
        activeController?.stop();
        clear();
        return;
      }

      // A null controller means OsirisMap is unavailable or being destroyed.
      // Its lifecycle binding stops the map before publishing null.
      if (!controller) {
        clear();
        return;
      }

      if (activeController === controller && activeSceneId === scene.id) return;
      if (activeController && activeController !== controller) activeController.stop();

      controller.flyTo(scene.camera);
      activeController = controller;
      activeSceneId = scene.id;
    },
    dispose() {
      activeController?.stop();
      clear();
    },
  };
}
