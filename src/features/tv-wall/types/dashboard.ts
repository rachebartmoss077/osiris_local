export interface TvBriefItem {
  id: string;
  title: string;
  timestamp?: number | string;
  category?: string;
  source?: string;
}

export type TvWatchStatus = 'normal' | 'elevated' | 'high' | 'unknown';

export interface TvWatchMetric {
  id: string;
  label: string;
  value?: number | string;
  status?: TvWatchStatus;
}

export interface TvHotspot {
  id: string;
  label: string;
  detail?: string;
}

export interface TvTickerItem {
  id: string;
  title: string;
}
