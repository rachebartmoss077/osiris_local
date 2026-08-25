import type { Map as MapLibreMap } from 'maplibre-gl';
import type { SceneCamera } from '../types/scene';
import type { CameraSnapshot, MapController } from './MapController';

type MapControllerTarget = Pick<
  MapLibreMap,
  'flyTo' | 'easeTo' | 'resize' | 'stop' | 'getCenter' | 'getZoom' | 'getPitch' | 'getBearing' | 'isMoving'
>;

export interface OsirisMapControllerBinding {
  controller: MapController;
  destroy(): void;
}

function toCameraOptions(camera: SceneCamera) {
  return {
    center: camera.center,
    zoom: camera.zoom,
    pitch: camera.pitch,
    bearing: camera.bearing,
    duration: camera.durationMs,
  };
}

function readView(map: MapControllerTarget): CameraSnapshot {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    pitch: map.getPitch(),
    bearing: map.getBearing(),
  };
}

function copySnapshot(snapshot: CameraSnapshot): CameraSnapshot {
  return { ...snapshot, center: [...snapshot.center] };
}

export function createOsirisMapController(
  map: MapControllerTarget,
): OsirisMapControllerBinding {
  let active = true;
  let lastSnapshot = readView(map);

  const controller: MapController = {
    flyTo(camera) {
      if (active) map.flyTo(toCameraOptions(camera));
    },
    easeTo(camera) {
      if (active) map.easeTo(toCameraOptions(camera));
    },
    resize() {
      if (active) map.resize();
    },
    stop() {
      if (active) map.stop();
    },
    getView() {
      if (active) lastSnapshot = readView(map);
      return copySnapshot(lastSnapshot);
    },
    isMoving() {
      return active && map.isMoving();
    },
  };

  return {
    controller,
    destroy() {
      if (!active) return;
      map.stop();
      lastSnapshot = readView(map);
      active = false;
    },
  };
}
