import type { TvScene } from '../types/scene';

export const GLOBAL_OVERVIEW: TvScene = {
  id: 'GLOBAL_OVERVIEW',
  label: 'Global Overview',
  camera: {
    center: [0, 20],
    zoom: 1.75,
    pitch: 0,
    bearing: 0,
    durationMs: 3_500,
  },
};
