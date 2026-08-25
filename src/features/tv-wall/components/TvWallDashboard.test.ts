import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TvWallDashboard } from './TvWallDashboard';

function renderDashboard(active: boolean) {
  const map = createElement('div', { 'data-map-sentinel': 'existing-map' });
  return renderToStaticMarkup(createElement(
    TvWallDashboard,
    { active, controller: null },
    map,
  ));
}

describe('TvWallDashboard', () => {
  it('renders the dashboard zones only in Autopilot while preserving the map slot', () => {
    const interactive = renderDashboard(false);
    const autopilot = renderDashboard(true);

    expect(interactive).toContain('data-map-sentinel="existing-map"');
    expect(interactive).not.toContain('data-tv-dashboard="autopilot"');
    expect(interactive).not.toContain('data-tv-zone="brief"');

    expect(autopilot).toContain('data-map-sentinel="existing-map"');
    expect(autopilot).toContain('data-tv-dashboard="autopilot"');
    expect(autopilot).toContain('data-tv-zone="globe"');
    expect(autopilot).toContain('data-tv-zone="brief"');
    expect(autopilot).toContain('data-tv-zone="watchboard"');
    expect(autopilot).toContain('data-tv-zone="ticker"');
  });

  it('renders honest empty states without fabricated metrics or hotspots', () => {
    const html = renderDashboard(true);

    expect(html).toContain('Awaiting prioritized intelligence feed');
    expect(html).toContain('DATA MODEL PENDING');
    expect(html).toContain('No verified hotspots available');
    expect(html).toContain('Awaiting verified priority events');
    expect(html).not.toContain('%');
  });
});
