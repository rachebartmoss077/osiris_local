import type { SceneCamera } from '../types/scene';

export interface CameraSnapshot {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface MapController {
  flyTo(camera: SceneCamera): void;
  easeTo(camera: SceneCamera): void;
  stop(): void;
  getView(): CameraSnapshot;
  isMoving(): boolean;
}
