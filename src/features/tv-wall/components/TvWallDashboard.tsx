'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createTvWallMapLayoutResize } from '../layout/mapLayoutResize';
import type { MapController } from '../map/MapController';
import type {
  TvBriefItem,
  TvHotspot,
  TvTickerItem,
  TvWatchMetric,
  TvWatchStatus,
} from '../types/dashboard';
import styles from './TvWallDashboard.module.css';

const UNKNOWN_WATCH_METRICS: readonly TvWatchMetric[] = [
  { id: 'military', label: 'MILITARY', status: 'unknown' },
  { id: 'cyber', label: 'CYBER', status: 'unknown' },
  { id: 'internet', label: 'INTERNET', status: 'unknown' },
  { id: 'hazards', label: 'NATURAL HAZARDS', status: 'unknown' },
  { id: 'infrastructure', label: 'INFRASTRUCTURE', status: 'unknown' },
];

const STATUS_CLASS: Record<TvWatchStatus, string> = {
  normal: styles.statusNormal,
  elevated: styles.statusElevated,
  high: styles.statusHigh,
  unknown: styles.statusUnknown,
};

export interface TvWallDashboardProps {
  active: boolean;
  controller: MapController | null;
  children?: ReactNode;
  systemStatus?: 'connecting' | 'connected' | 'error';
  briefItems?: readonly TvBriefItem[];
  watchMetrics?: readonly TvWatchMetric[];
  hotspots?: readonly TvHotspot[];
  tickerItems?: readonly TvTickerItem[];
}

function formatUtcTime(value: number | string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`;
}

function UtcClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const date = new Date(now);
  const value = `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')} UTC`;
  return <time className={styles.clock}>{value}</time>;
}

export function TvWallDashboard({
  active,
  controller,
  children,
  systemStatus = 'connecting',
  briefItems = [],
  watchMetrics = [],
  hotspots = [],
  tickerItems = [],
}: TvWallDashboardProps) {
  const resizeLifecycle = useMemo(() => createTvWallMapLayoutResize(), []);

  useLayoutEffect(() => {
    resizeLifecycle.sync({ active, controller });
  }, [active, controller, resizeLifecycle]);

  useEffect(() => () => resizeLifecycle.dispose(), [resizeLifecycle]);

  const visibleMetrics = watchMetrics.length > 0 ? watchMetrics : UNKNOWN_WATCH_METRICS;
  const statusLabel = systemStatus === 'connected' ? 'LIVE' : systemStatus.toUpperCase();

  return (
    <div
      className={active ? styles.dashboard : styles.inactive}
      data-tv-dashboard={active ? 'autopilot' : undefined}
    >
      {active ? (
        <header key="header" className={styles.header} data-tv-zone="header">
          <div className={styles.identity}>
            <span className={styles.wordmark}>OSIRIS</span>
            <span className={styles.mission}>GLOBAL SITUATIONAL INTELLIGENCE</span>
          </div>
          <div className={styles.headerStatus}>
            <span className={`${styles.liveStatus} ${styles[systemStatus]}`}>
              <span className={styles.liveDot} />{statusLabel}
            </span>
            <UtcClock />
          </div>
        </header>
      ) : null}

      <section
        key="globe"
        className={styles.globePanel}
        data-tv-zone={active ? 'globe' : undefined}
        aria-label={active ? 'Live globe' : undefined}
      >
        {active ? (
          <div key="globe-heading" className={styles.panelHeading}>
            <span>LIVE GLOBE</span>
            <span className={styles.panelCode}>01 / GLOBAL</span>
          </div>
        ) : null}
        <div key="map-viewport" className={styles.mapViewport}>{children}</div>
        {active ? <span key="map-status" className={styles.mapStatus}>GLOBAL VIEW</span> : null}
      </section>

      {active ? (
        <section key="brief" className={styles.panel} data-tv-zone="brief" aria-labelledby="tv-brief-title">
          <div className={styles.panelHeading}>
            <h2 id="tv-brief-title">GLOBAL BRIEF</h2>
            <span className={styles.panelCode}>VERIFIED FEED</span>
          </div>
          <div className={styles.panelBody}>
            {briefItems.length > 0 ? (
              <ol className={styles.briefList}>
                {briefItems.slice(0, 5).map(item => {
                  const time = item.timestamp === undefined ? null : formatUtcTime(item.timestamp);
                  return (
                    <li key={item.id} className={styles.briefItem}>
                      <div className={styles.itemMeta}>
                        <span>{item.category ?? 'REPORTED EVENT'}</span>
                        {time ? <time>{time}</time> : null}
                      </div>
                      <p>{item.title}</p>
                      {item.source ? <span className={styles.itemSource}>SOURCE · {item.source}</span> : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyMarker}>NO PRIORITIZED ITEMS</span>
                <p>Awaiting prioritized intelligence feed</p>
                <small>No synthetic summaries are displayed.</small>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {active ? (
        <section key="watchboard" className={styles.panel} data-tv-zone="watchboard" aria-labelledby="tv-watch-title">
          <div className={styles.panelHeading}>
            <h2 id="tv-watch-title">GLOBAL WATCHBOARD</h2>
            <span className={styles.panelCode}>DATA MODEL PENDING</span>
          </div>
          <div className={styles.watchBody}>
            <dl className={styles.metricList}>
              {visibleMetrics.slice(0, 6).map(metric => {
                const status = metric.status ?? 'unknown';
                return (
                  <div key={metric.id} className={styles.metricRow}>
                    <dt>{metric.label}</dt>
                    <dd className={STATUS_CLASS[status]}>{metric.value ?? '—'}</dd>
                  </div>
                );
              })}
            </dl>
            <div className={styles.hotspots}>
              <div className={styles.subheading}>TOP HOTSPOTS</div>
              {hotspots.length > 0 ? (
                <ol className={styles.hotspotList}>
                  {hotspots.slice(0, 5).map(hotspot => (
                    <li key={hotspot.id}>
                      <span>{hotspot.label}</span>
                      <small>{hotspot.detail ?? 'REPORTED'}</small>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.hotspotEmpty}>No verified hotspots available</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {active ? (
        <footer key="ticker" className={styles.ticker} data-tv-zone="ticker">
          <span className={styles.tickerLabel}>PRIORITY EVENTS</span>
          <span className={styles.tickerContent}>
            {tickerItems.length > 0
              ? tickerItems.slice(0, 3).map(item => item.title).join('  ·  ')
              : 'Awaiting verified priority events'}
          </span>
          <span className={styles.tickerState}>STANDBY</span>
        </footer>
      ) : null}
    </div>
  );
}
