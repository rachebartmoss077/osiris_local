export type TvWallMode = 'interactive' | 'autopilot';

export interface TvWallState {
  enabled: boolean;
  mode: TvWallMode;
  idleTimeoutMs: number;
}
