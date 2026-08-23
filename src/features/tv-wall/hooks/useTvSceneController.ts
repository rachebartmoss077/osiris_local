'use client';

import { useEffect, useMemo } from 'react';
import { GLOBAL_OVERVIEW } from '../config/scenes';
import type { MapController } from '../map/MapController';
import { createTvSceneActivation } from '../scenes/sceneActivation';
import type { TvWallMode } from '../types/state';
import type { TvScene } from '../types/scene';

interface UseTvSceneControllerOptions {
  enabled: boolean;
  mode: TvWallMode;
  controller: MapController | null;
  scene?: TvScene;
}

export function useTvSceneController({
  enabled,
  mode,
  controller,
  scene = GLOBAL_OVERVIEW,
}: UseTvSceneControllerOptions) {
  const activation = useMemo(() => createTvSceneActivation(), []);

  useEffect(() => {
    activation.sync({ enabled, mode, controller, scene });
  }, [activation, controller, enabled, mode, scene]);

  useEffect(() => () => activation.dispose(), [activation]);
}
