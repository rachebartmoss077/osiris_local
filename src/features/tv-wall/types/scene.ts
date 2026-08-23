export interface SceneCamera {
  center: [number, number];
  zoom: number;
  pitch?: number;
  bearing?: number;
  durationMs?: number;
}

export interface TvScene {
  id: string;
  label: string;
  camera: SceneCamera;
}
