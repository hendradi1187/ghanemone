// AlasBuana Hi-Fi — Component library
// Icons + chrome (TopNav, Sidebar) + reusable elements (MapBlock, AiPill, DatasetCard).
// Exposed at window scope at the bottom for cross-file usage.

// ─────────────────────────────────────────────────────────────
// Icon — lucide-style stroked SVG.
// ─────────────────────────────────────────────────────────────
const __ICON_PATHS = {
  search: 'M11 19a8 8 0 1 1 5.3-2L21 21M11 19a8 8 0 0 0 5.3-2',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0',
  help: 'M9 9a3 3 0 1 1 4.5 2.6c-.8.5-1.5 1-1.5 2.4M12 17h.01',
  chevron: 'M6 9l6 6 6-6',
  chevR: 'M9 6l6 6-6 6',
  chevL: 'M15 6l-9 6 9 6',
  plus: 'M12 5v14M5 12h14',
  download: 'M12 4v12m0 0l-4-4m4 4l4-4M4 20h16',
  upload: 'M12 20V8m0 0l-4 4m4-4l4 4M4 4h16',
  filter: 'M3 5h18l-7 9v6l-4-2v-4z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5',
  pin: 'M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  database: 'M4 6c0-1.5 3.6-3 8-3s8 1.5 8 3v12c0 1.5-3.6 3-8 3s-8-1.5-8-3V6zM4 12c0 1.5 3.6 3 8 3s8-1.5 8-3M4 6c0 1.5 3.6 3 8 3s8-1.5 8-3',
  map: 'M9 4l-6 3v13l6-3 6 3 6-3V4l-6 3-6-3zM9 4v13M15 7v13',
  chart: 'M3 21h18M5 21V10m4 11V6m4 15v-9m4 9V8',
  pieChart: 'M21 12a9 9 0 1 1-9-9v9h9z',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  globe: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM3.6 9h16.8M3.6 15h16.8M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M9 14h6M9 18h4',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  star: 'M12 2l3.1 6.3 7 .9-5 4.9 1.2 6.9L12 17.8l-6.3 3.2L7 14.1 2 9.2l7-.9z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  check: 'M5 12l4 4L19 6',
  warn: 'M12 9v4m0 4h.01M12 2L2 22h20L12 2z',
  x: 'M6 6l12 12M18 6L6 18',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDown: 'M12 5v14M5 12l7 7 7-7',
  arrowR: 'M5 12h14M12 5l7 7-7 7',
  spark: 'M5 3v3M19 18v3M5 21v-3M19 6V3M3 5h3M16 19h3M3 19h3M16 5h3M12 8l1.5 3.5L17 13l-3.5 1.5L12 18l-1.5-3.5L8 13l3.5-1.5z',
  refresh: 'M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  clock: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v14',
  comment: 'M21 12a8 8 0 0 1-12 7L3 21l2-6a8 8 0 1 1 16-3z',
  arrowUpRight: 'M7 17L17 7M7 7h10v10'
};
function Icon({ name, size = 16, color = 'currentColor', style, strokeWidth = 1.7 }) {
  const d = __ICON_PATHS[name];
  if (!d) return <span style={{ display: 'inline-block', width: size, height: size, ...style }}></span>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flex: '0 0 auto', display: 'inline-block', ...style }}>
      <path d={d} />
    </svg>);

}

// ─────────────────────────────────────────────────────────────
// HfPage — root artboard wrapper. Sets .hf class so tokens apply.
// ─────────────────────────────────────────────────────────────
function HfPage({ children, screenLabel }) {
  return (
    <div className="hf" data-screen-label={screenLabel}>
      {children}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HfTopNav — primary chrome
// ─────────────────────────────────────────────────────────────
function HfTopNav({ active = 'EXPLORE DATA', user = { initials: 'SM', org: 'SKK Migas', role: 'Regulator' } }) {
  const links = [
  ['EXPLORE DATA', 'database'],
  ['MAP', 'map'],
  ['DASHBOARD', 'grid'],
  ['ANALYTICS', 'chart'],
  ['WORKSPACE', 'layers'],
  ['APPS', 'globe'],
  ['MONITORING', 'activity']];

  return (
    <div className="topnav">
      <div className="brand">
        <span className="brand-mark">GO</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Ghanem<span className="dot">.one</span></span>
          <span className="sub">AI Intelligence · Satu Peta Nasional</span>
        </div>
      </div>
      <div className="field" style={{ width: 360, marginLeft: 8 }}>
        <Icon name="search" size={14} color="var(--hf-ink-4)" />
        <input placeholder="Cari dataset, area kerja, sumur, atau dokumen…" />
        <span className="pill ghost" style={{ fontSize: 10 }}>⌘K</span>
      </div>
      <div className="links">
        {links.map(([l, ico]) =>
        <a key={l} className={l === active ? 'active' : ''}>{l}</a>
        )}
      </div>
      <div className="row" style={{ marginLeft: 8, gap: 6 }}>
        <button className="iconbtn" title="Help"><Icon name="help" size={15} /></button>
        <button className="iconbtn" title="Notifications" style={{ position: 'relative' }}>
          <Icon name="bell" size={15} />
          <span style={{
            position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%',
            background: 'var(--hf-red-500)', border: '1.5px solid #fff'
          }}></span>
        </button>
        <div className="row" style={{ gap: 8, paddingLeft: 8, marginLeft: 4, borderLeft: '1px solid var(--hf-line)' }}>
          <span className="avatar">{user.initials}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{user.org}</span>
            <span style={{ fontSize: 10, color: 'var(--hf-ink-4)' }}>{user.role}</span>
          </div>
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HfSidebar — categories & providers
// ─────────────────────────────────────────────────────────────
function HfSidebar({ active = 'All Data' }) {
  const browse = [
  ['All Data', 'grid', 2452],
  ['Layers', 'layers', 1832],
  ['Documents', 'doc', 412],
  ['Maps', 'map', 96],
  ['Apps & Services', 'globe', 24]];

  const cats = [
  ['Administrative', '#1f8a4a'],
  ['Upstream Assets', '#2a5fb8'],
  ['Seismic', '#7a5cb8'],
  ['Well & Drilling', '#c2840d'],
  ['Facilities', '#cf3a2a'],
  ['Pipeline', '#1f8a4a'],
  ['Environment', '#2a5fb8'],
  ['Infrastructure', '#7a5cb8'],
  ['Basemap', '#6b7891']];

  const providers = [
  ['Pertamina Hulu Mahakam', 'PHM', 245, 'var(--hf-green-500)'],
  ['PHE ONWJ', 'PHE', 183, 'var(--hf-amber-500)'],
  ['Pertamina Subsurface', 'PSN', 167, 'var(--hf-blue-500)'],
  ['Medco E&P', 'ME', 142, 'var(--hf-blue-500)'],
  ['Harbour Energy', 'HE', 96, 'var(--hf-purple-500)'],
  ['Premier Oil', 'PO', 78, 'var(--hf-red-500)']];

  return (
    <aside className="sidebar">
      <div className="side-group">
        <div className="side-head">Browse</div>
        {browse.map(([l, ico, n]) =>
        <div key={l} className={'side-item' + (l === active ? ' active' : '')}>
            <Icon name={ico} size={15} />
            <span>{l}</span>
            <span className="count num">{n.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="side-group">
        <div className="side-head">Categories</div>
        {cats.map(([c, color]) =>
        <div key={c} className="side-item">
            <span className="swatch" style={{ background: color }}></span>
            <span style={{ flex: 1 }}>{c}</span>
            <Icon name="chevR" size={12} color="var(--hf-ink-5)" />
          </div>
        )}
      </div>

      <div className="side-group">
        <div className="side-head">Data provider</div>
        {providers.map(([n, init, c, color]) =>
        <div key={init} className="side-item">
            <span className="avatar sm" style={{ background: 'transparent', borderColor: color, color: color }}>{init}</span>
            <span style={{ flex: 1, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</span>
            <span className="count num">{c}</span>
          </div>
        )}
        <div className="side-item" style={{ color: 'var(--hf-green-600)', fontSize: 11.5, fontWeight: 600 }}>
          <span style={{ width: 22 }}></span>Show all 145 providers →
        </div>
      </div>
    </aside>);

}

// ─────────────────────────────────────────────────────────────
// HfMap — real Leaflet map (OpenStreetMap via Carto Positron tiles)
// Renders Indonesia + curated sample upstream geometries (WK, wells,
// pipelines, facilities) so static hi-fi pages look populated.
//
// Drop-in compatible with the original SVG version:
//   <HfMap withPins withCoords withLegend />
// New optional props:
//   showAllLayers={false} — by default true (so designs look populated)
// ─────────────────────────────────────────────────────────────
const HF_MAP_LAYERS = {
  'wk-onwj': {
    title: 'WK Boundary — ONWJ',
    color: '#1f8a4a',
    type: 'polygon',
    coords: [
    [-5.45, 106.20], [-5.45, 108.20], [-5.95, 108.40],
    [-6.45, 108.35], [-6.55, 107.85], [-6.40, 107.20],
    [-6.10, 106.55], [-5.80, 106.20], [-5.45, 106.20]]

  },
  'seismic-3d-nsumatra': {
    title: 'Seismic 3D — N. Sumatra',
    color: '#7a5cb8',
    type: 'polygon',
    coords: [
    [3.50, 96.80], [3.50, 98.50], [5.20, 98.50],
    [5.20, 96.80], [3.50, 96.80]]

  },
  'wk-rokan': {
    title: 'WK Rokan',
    color: '#2a5fb8',
    type: 'polygon',
    coords: [
    [0.50, 100.80], [0.50, 102.20], [1.60, 102.20],
    [1.60, 100.80], [0.50, 100.80]]

  },
  'wk-mahakam': {
    title: 'WK Mahakam',
    color: '#c2840d',
    type: 'polygon',
    coords: [
    [-0.85, 116.95], [-0.85, 117.80], [0.45, 117.80],
    [0.45, 116.95], [-0.85, 116.95]]

  },
  'well-loc': {
    title: 'Wells',
    color: '#c2840d',
    type: 'points',
    points: [
    { lat: -5.85, lng: 107.10, label: 'ONWJ-A-12' },
    { lat: -5.92, lng: 107.45, label: 'ONWJ-B-08' },
    { lat: -6.05, lng: 107.30, label: 'ONWJ-A-21' },
    { lat: -5.78, lng: 107.85, label: 'ONWJ-C-15' },
    { lat: -5.65, lng: 106.85, label: 'ONWJ-D-04' },
    { lat: 4.25, lng: 97.40, label: 'NSU-EXP-01' },
    { lat: 4.10, lng: 97.85, label: 'NSU-EXP-02' },
    { lat: 3.95, lng: 98.20, label: 'NSU-DEV-08' },
    { lat: 0.50, lng: 117.40, label: 'PHM-MHK-12' },
    { lat: 0.20, lng: 117.55, label: 'PHM-MHK-15' },
    { lat: -0.10, lng: 117.30, label: 'PHM-MHK-19' },
    { lat: -3.85, lng: 121.10, label: 'PSN-SUL-03' },
    { lat: 1.05, lng: 101.45, label: 'ROKAN-12' },
    { lat: 1.25, lng: 101.65, label: 'ROKAN-08' }]

  },
  'pipeline-network': {
    title: 'Pipelines',
    color: '#185a8c',
    type: 'lines',
    lines: [
    [[-5.80, 106.30], [-5.90, 107.00], [-5.95, 107.60], [-5.85, 108.10]],
    [[3.50, 97.20], [4.20, 97.80], [4.50, 98.50]],
    [[0.45, 117.40], [0.10, 117.50], [-0.15, 117.30]],
    [[1.00, 101.20], [1.20, 101.60], [1.40, 102.00]]]

  },
  'facility': {
    title: 'Facilities',
    color: '#cf3a2a',
    type: 'points',
    points: [
    { lat: -5.92, lng: 107.45, label: 'CPP-A · ONWJ' },
    { lat: 0.45, lng: 117.42, label: 'CPP-MHK' },
    { lat: 4.20, lng: 97.85, label: 'FPSO N.Sumatra' },
    { lat: 1.05, lng: 101.45, label: 'CGS Rokan' }]

  }
};

const HF_ID_BOUNDS = [[-11.5, 94.5], [6.5, 141.5]];
const HF_ID_CENTER = [-2.5, 118.0];

function HfMap({
  withPins = true,
  withCoords = true,
  withLegend = false,
  showAllLayers = true,
  fitTo = null,
  children
}) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || !window.L || mapRef.current) return;
    const L = window.L;
    const map = L.map(ref.current, {
      center: HF_ID_CENTER,
      zoom: 5,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: false,
      // Touch on tiny static thumbs is annoying; disable drag on small mounts
      scrollWheelZoom: 'center'
    });

    // Carto Positron — clean, neutral basemap (OpenStreetMap data)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Render layers
    Object.keys(HF_MAP_LAYERS).forEach((id) => {
      const cfg = HF_MAP_LAYERS[id];
      if (cfg.type === 'polygon') {
        L.polygon(cfg.coords, {
          color: cfg.color, weight: 1.8,
          fillColor: cfg.color, fillOpacity: 0.16
        }).bindTooltip(cfg.title, { sticky: true, className: 'leaflet-custom-tip' }).addTo(map);
      } else if (cfg.type === 'points' && withPins) {
        cfg.points.forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 4.5, fillColor: cfg.color,
            color: '#fff', weight: 1.4, fillOpacity: 0.95
          }).bindTooltip(`<b>${p.label}</b>`, { sticky: true, className: 'leaflet-custom-tip' }).addTo(map);
        });
      } else if (cfg.type === 'lines') {
        cfg.lines.forEach((line) => {
          L.polyline(line, {
            color: cfg.color, weight: 2.2,
            opacity: 0.8, dashArray: '6 4'
          }).bindTooltip(cfg.title, { sticky: true, className: 'leaflet-custom-tip' }).addTo(map);
        });
      }
    });

    // Fit view
    setTimeout(() => {
      if (fitTo && HF_MAP_LAYERS[fitTo]) {
        const cfg = HF_MAP_LAYERS[fitTo];
        if (cfg.type === 'polygon') map.fitBounds(cfg.coords, { padding: [30, 30], maxZoom: 8 });else
        if (cfg.type === 'points') {
          map.fitBounds(L.latLngBounds(cfg.points.map((p) => [p.lat, p.lng])), { padding: [30, 30], maxZoom: 8 });
        }
      } else {
        map.fitBounds(HF_ID_BOUNDS, { padding: [20, 20] });
      }
    }, 50);

    mapRef.current = map;
    return () => {map.remove();mapRef.current = null;};
  }, [fitTo]);

  // Invalidate size when parent resizes (e.g. panel toggles)
  React.useEffect(() => {
    if (!mapRef.current || !ref.current) return;
    const ro = new ResizeObserver(() => {
      mapRef.current && mapRef.current.invalidateSize();
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="map" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={ref} style={{ position: 'absolute', inset: 0, background: '#e4ecf4' }}></div>

      {withLegend &&
      <div className="floater" style={{ position: 'absolute', left: 16, bottom: 16, padding: '10px 12px', minWidth: 180, zIndex: 500 }}>
          <div className="cap" style={{ marginBottom: 6 }}>Map Layers</div>
          {[
        ['Working Area (WK)', 'var(--hf-purple-500)', true],
        ['Block / Contract', 'var(--hf-green-500)', true],
        ['Field', 'var(--hf-amber-500)', true],
        ['Well', 'var(--hf-amber-500)', true],
        ['Pipeline', 'var(--hf-blue-500)', false],
        ['Facility', 'var(--hf-red-500)', false]].
        map(([l, c, on]) =>
        <div key={l} className="row" style={{ padding: '3px 0', fontSize: 11.5 }}>
              <span style={{
            width: 14, height: 14, borderRadius: 3,
            border: '1.4px solid ' + c, background: on ? c : 'transparent',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>{on && <Icon name="check" size={9} color="#fff" />}</span>
              <span style={{ color: 'var(--hf-ink-2)' }}>{l}</span>
            </div>
        )}
        </div>
      }

      {withCoords &&
      <div style={{
        position: 'absolute', right: 16, bottom: 16, zIndex: 500,
        display: 'flex', gap: 10, alignItems: 'center',
        background: 'rgba(255,255,255,.94)',
        border: '1px solid var(--hf-line)',
        borderRadius: 'var(--hf-r-2)', padding: '5px 10px',
        fontSize: 10.5, fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-ink-3)',
        whiteSpace: 'nowrap', pointerEvents: 'none'
      }}>
          <span>−2.5°S, 118.0°E</span>
          <span style={{ color: 'var(--hf-ink-5)' }}>|</span>
          <span>EPSG:4326</span>
          <span style={{ color: 'var(--hf-ink-5)' }}>|</span>
          <span>© Carto · OSM</span>
        </div>
      }

      {/* Map controls (zoom / basemap) — visual only, real interactions on the actual map */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 500 }}>
        <button className="iconbtn" style={{ background: '#fff', boxShadow: 'var(--hf-sh-2)' }}
        onClick={() => mapRef.current && mapRef.current.zoomIn()}><Icon name="plus" size={14} /></button>
        <button className="iconbtn" style={{ background: '#fff', boxShadow: 'var(--hf-sh-2)' }}
        onClick={() => mapRef.current && mapRef.current.zoomOut()}>−</button>
        <button className="iconbtn" style={{ background: '#fff', boxShadow: 'var(--hf-sh-2)' }} title="Basemap"><Icon name="layers" size={14} /></button>
      </div>

      {children}
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HfAiPill — floating assistant
// ─────────────────────────────────────────────────────────────
function HfAiPill({ style, expanded = false }) {
  if (expanded) {
    return (
      <div style={{
        ...style,
        width: 320, padding: 14,
        background: 'var(--hf-surface)',
        border: '1px solid var(--hf-line)',
        borderRadius: 'var(--hf-r-4)',
        boxShadow: 'var(--hf-sh-4)'
      }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <span className="ai-pill" style={{ padding: 0, boxShadow: 'none', border: 0, background: 'transparent' }}>
            <span className="star"><Icon name="sparkle" size={14} color="#fff" /></span>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>AI Assistant</div>
            <div style={{ fontSize: 11, color: 'var(--hf-ink-4)' }}>Powered by SPEKTRUM AI · Claude</div>
          </div>
          <button className="iconbtn" style={{ width: 24, height: 24 }}><Icon name="x" size={13} /></button>
        </div>
        <div style={{
          fontSize: 12, lineHeight: 1.5, padding: 10,
          background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)',
          color: 'var(--hf-ink-2)', marginBottom: 8
        }}>
          Area ONWJ punya <b>23 sumur aktif</b>, <b>4 lapangan produksi</b>, dan rata-rata produksi <b>12,400 BOPD</b> di Q3 2024.
          Mau lihat detail per lapangan?
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {['Detail per lapangan', 'Bandingkan dengan Q2', 'Ekspor laporan'].map((s) =>
          <span key={s} className="pill blue" style={{ cursor: 'pointer' }}>{s}</span>
          )}
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <Icon name="sparkle" size={14} color="var(--hf-blue-500)" />
          <input placeholder="Tanya apa saja tentang data…" />
          <Icon name="arrowR" size={14} color="var(--hf-ink-4)" />
        </div>
      </div>);

  }
  return (
    <div className="ai-pill" style={style}>
      <span className="star"><Icon name="sparkle" size={14} color="#fff" /></span>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2 }}>AI Assistant</span>
        <span style={{ fontSize: 10.5, color: 'var(--hf-ink-4)', lineHeight: 1.2 }}>Ask anything about the data…</span>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HfDatasetCard — list-row item
// ─────────────────────────────────────────────────────────────
function HfDatasetCard({ kind = 'LAYER', kindColor = 'var(--hf-green-500)', title, type, format, updated, desc,
  provider, providerInit = 'PH', providerColor = 'var(--hf-green-500)', stats = [], verified = true, thumb }) {
  return (
    <div className="ds-card">
      <div className="ds-thumb">
        <span className="tag" style={{ background: kindColor }}>{kind}</span>
        {thumb}
      </div>
      <div className="ds-meta">
        <div className="row" style={{ gap: 6 }}>
          <span className="title" style={{ flex: 1 }}>{title}</span>
          {verified &&
          <span className="pill green" style={{ fontSize: 9.5 }}>
              <Icon name="check" size={10} color="var(--hf-green-700)" /> Verified
            </span>
          }
          <button className="iconbtn" style={{ width: 24, height: 24, border: 0 }}><Icon name="more" size={14} /></button>
        </div>
        <div className="sm">{type} · {format} · Updated {updated}</div>
        <div className="sm" style={{ color: 'var(--hf-ink-2)' }}>{desc}</div>
        <div className="stats">
          <span className="row" style={{ gap: 6 }}>
            <span className="avatar sm" style={{ background: 'transparent', borderColor: providerColor, color: providerColor }}>{providerInit}</span>
            <span style={{ color: 'var(--hf-ink-2)', fontWeight: 500 }}>{provider}</span>
          </span>
          <span className="row" style={{ gap: 4 }}><Icon name="download" size={12} /> <span className="num">{stats[0]}</span></span>
          <span className="row" style={{ gap: 4 }}><Icon name="eye" size={12} /> <span className="num">{stats[1]}</span></span>
          <span className="row" style={{ gap: 4 }}><Icon name="star" size={12} /> <span className="num">{stats[2]}</span></span>
          <span style={{ marginLeft: 'auto' }}>
            <span className="btn sm" style={{ marginRight: 6 }}>Details</span>
            <span className="btn primary sm"><Icon name="plus" size={12} color="#fff" /> Add to Map</span>
          </span>
        </div>
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HfKpi — small KPI tile
// ─────────────────────────────────────────────────────────────
function HfKpi({ label, value, delta, dir = 'up', sub, icon, color = 'var(--hf-green-500)' }) {
  return (
    <div className="kpi">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="label">{label}</span>
        {icon &&
        <span style={{
          width: 26, height: 26, borderRadius: 'var(--hf-r-2)',
          background: 'var(--hf-green-50)', color: color,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon name={icon} size={14} color={color} />
          </span>
        }
      </div>
      <span className="num-big">{value}</span>
      <div className="row" style={{ gap: 6 }}>
        {delta &&
        <span className={'delta ' + dir}>
            <Icon name={dir === 'up' ? 'arrowUp' : 'arrowDown'} size={11} />
            {delta}
          </span>
        }
        {sub && <span style={{ fontSize: 10.5, color: 'var(--hf-ink-4)' }}>{sub}</span>}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────────
// HfSpark / HfBarChart — chart placeholders
// ─────────────────────────────────────────────────────────────
function HfSpark({ data = [12, 18, 14, 22, 19, 28, 24, 33, 30, 38, 35, 44], color = 'var(--hf-green-500)', height = 48, fill = true }) {
  const max = Math.max(...data),min = Math.min(...data),range = max - min || 1;
  const w = 200,pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + i / (data.length - 1) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y];
  });
  const line = pts.map(([x, y], i) => i === 0 ? `M${x} ${y}` : `L${x} ${y}`).join(' ');
  const area = line + ` L${pts[pts.length - 1][0]} ${height - pad} L${pad} ${height - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: height, display: 'block' }}>
      {fill && <path d={area} fill={color} opacity=".12" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => i === pts.length - 1 &&
      <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={color} strokeWidth="1.6" />
      )}
    </svg>);

}
function HfBars({ data = [40, 65, 55, 80, 72, 90, 85, 95, 88, 76, 82, 100], color = 'var(--hf-blue-500)', height = 60 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height, width: '100%' }}>
      {data.map((v, i) =>
      <div key={i} style={{
        flex: 1, height: v / max * 100 + '%',
        background: color, opacity: .25 + v / max * .75,
        borderRadius: '2px 2px 0 0'
      }}></div>
      )}
    </div>);

}
// Donut chart
function HfDonut({ data = [['Layers', 75, 'var(--hf-green-500)'], ['Documents', 17, 'var(--hf-blue-500)'], ['Maps', 4, 'var(--hf-amber-500)'], ['Apps', 4, 'var(--hf-purple-500)']], size = 120, thickness = 18 }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, [_, v]) => s + v, 0);
  let off = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hf-surface-3)" strokeWidth={thickness} />
      {data.map(([l, v, col], i) => {
        const dash = v / total * c;
        const seg =
        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={col} strokeWidth={thickness}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={-off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />;


        off += dash;
        return seg;
      })}
    </svg>);

}

Object.assign(window, {
  Icon, HfPage, HfTopNav, HfSidebar, HfMap, HfAiPill,
  HfDatasetCard, HfKpi, HfSpark, HfBars, HfDonut
});