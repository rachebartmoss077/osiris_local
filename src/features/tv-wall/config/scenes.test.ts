import { describe, expect, it } from 'vitest';
import { GLOBAL_OVERVIEW } from './scenes';

describe('GLOBAL_OVERVIEW', () => {
  it('defines a finite, television-friendly global camera', () => {
    const { camera } = GLOBAL_OVERVIEW;
    const values = [
      camera.center[0],
      camera.center[1],
      camera.zoom,
      camera.pitch,
      camera.bearing,
      camera.durationMs,
    ];

    expect(GLOBAL_OVERVIEW.id).toBe('GLOBAL_OVERVIEW');
    expect(values.every(value => Number.isFinite(value))).toBe(true);
    expect(camera.center[0]).toBeGreaterThanOrEqual(-180);
    expect(camera.center[0]).toBeLessThanOrEqual(180);
    expect(camera.center[1]).toBeGreaterThanOrEqual(-85);
    expect(camera.center[1]).toBeLessThanOrEqual(85);
    expect(camera.zoom).toBeGreaterThanOrEqual(1.5);
    expect(camera.zoom).toBeLessThanOrEqual(5);
    expect(camera.pitch).toBeGreaterThanOrEqual(0);
    expect(camera.pitch).toBeLessThanOrEqual(60);
    expect(camera.bearing).toBeGreaterThanOrEqual(-180);
    expect(camera.bearing).toBeLessThanOrEqual(180);
    expect(camera.durationMs).toBeGreaterThan(0);
  });
});
