// AlasBuana Prototype — Real interactive map (Leaflet)
// Lazy-loaded; mounts inside any container. Centered on Indonesia.

// Indonesia bounds + sample geospatial data with REAL coordinates
const ID_BOUNDS = [[-11.5, 94.5], [6.5, 141.5]]; // SW, NE
const ID_CENTER = [-2.5, 118.0];

// Sample geometries with real lat/lng — toggled by mapLayers Set
const REAL_LAYERS = {
  'wk-onwj': {
    title: 'WK Boundary — ONWJ',
    color: '#1f8a4a',
    type: 'polygon',
    // Offshore North West Java — simplified polygon
    coords: [
      [-5.45, 106.20], [-5.45, 108.20], [-5.95, 108.40],
      [-6.45, 108.35], [-6.55, 107.85], [-6.40, 107.20],
      [-6.10, 106.55], [-5.80, 106.20], [-5.45, 106.20],
    ],
  },
  'seismic-3d-nsumatra': {
    title: 'Seismic 3D — N. Sumatra',
    color: '#7a5cb8',
    type: 'polygon',
    // North Sumatra basin — simplified rectangle
    coords: [
      [3.50, 96.80], [3.50, 98.50], [5.20, 98.50],
      [5.20, 96.80], [3.50, 96.80],
    ],
  },
  'well-loc': {
    title: 'Well Locations',
    color: '#c2840d',
    type: 'points',
    points: [
      // Cluster ONWJ
      { lat: -5.85, lng: 107.10, label: 'ONWJ-A-12', kind: 'Production' },
      { lat: -5.92, lng: 107.45, label: 'ONWJ-B-08', kind: 'Production' },
      { lat: -6.05, lng: 107.30, label: 'ONWJ-A-21', kind: 'Appraisal' },
      { lat: -5.78, lng: 107.85, label: 'ONWJ-C-15', kind: 'Exploration' },
      { lat: -5.65, lng: 106.85, label: 'ONWJ-D-04', kind: 'Production' },
      // Cluster Sumatra
      { lat: 4.25, lng: 97.40, label: 'NSU-EXP-01', kind: 'Exploration' },
      { lat: 4.10, lng: 97.85, label: 'NSU-EXP-02', kind: 'Exploration' },
      { lat: 3.95, lng: 98.20, label: 'NSU-DEV-08', kind: 'Production' },
      // East Kalimantan
      { lat: 0.50, lng: 117.40, label: 'PHM-MHK-12', kind: 'Production' },
      { lat: 0.20, lng: 117.55, label: 'PHM-MHK-15', kind: 'Production' },
      { lat: -0.10, lng: 117.30, label: 'PHM-MHK-19', kind: 'Appraisal' },
      // South Sulawesi
      { lat: -3.85, lng: 121.10, label: 'PSN-SUL-03', kind: 'Production' },
    ],
  },
  'pipeline-network': {
    title: 'Pipeline Network',
    color: '#185a8c',
    type: 'lines',
    lines: [
      // Trans-Java offshore pipeline
      [[-5.80, 106.30], [-5.90, 107.00], [-5.95, 107.60], [-5.85, 108.10]],
      // Sumatra trunk
      [[3.50, 97.20], [4.20, 97.80], [4.50, 98.50]],
      // Kalimantan main
      [[0.45, 117.40], [0.10, 117.50], [-0.15, 117.30]],
    ],
  },
  'facility': {
    title: 'Facilities',
    color: '#cf3a2a',
    type: 'points',
    points: [
      { lat: -5.92, lng: 107.45, label: 'CPP-A · ONWJ',  kind: 'CPP' },
      { lat: 0.45, lng: 117.42, label: 'CPP-MHK',        kind: 'CPP' },
      { lat: 4.20, lng: 97.85, label: 'FPSO N.Sumatra',  kind: 'FPSO' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// RealMap — Leaflet wrapper
// ─────────────────────────────────────────────────────────────
function RealMap({ activeLayers, onSelect, highlightId, fullscreen = false, showCoords = true }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const layerGroupRef = React.useRef(null);

  // Mount once
  React.useEffect(() => {
    if (!ref.current || !window.L) return;
    if (mapRef.current) return; // already mounted

    const L = window.L;

    const map = L.map(ref.current, {
      center: ID_CENTER,
      zoom: 5,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: false,
    });

    // Carto Positron — clean, neutral basemap. Matches design system.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom zoom control TOP-right (leaves bottom corners free)
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Hide attribution — we surface 'Carto' in the coord overlay instead

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Fit initial view to Indonesia
    setTimeout(() => map.fitBounds(ID_BOUNDS, { padding: [20, 20] }), 50);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layers when activeLayers changes
  React.useEffect(() => {
    if (!mapRef.current || !window.L || !layerGroupRef.current) return;
    const L = window.L;
    const group = layerGroupRef.current;
    group.clearLayers();

    activeLayers.forEach(id => {
      const cfg = REAL_LAYERS[id];
      if (!cfg) return;

      if (cfg.type === 'polygon') {
        const poly = L.polygon(cfg.coords, {
          color: cfg.color,
          weight: 2,
          fillColor: cfg.color,
          fillOpacity: 0.18,
        }).bindTooltip(cfg.title, { sticky: true, className: 'leaflet-custom-tip' });
        poly.on('click', () => onSelect && onSelect(id));
        group.addLayer(poly);
      }

      if (cfg.type === 'points') {
        cfg.points.forEach(p => {
          const marker = L.circleMarker([p.lat, p.lng], {
            radius: 5,
            fillColor: cfg.color,
            color: '#fff',
            weight: 1.6,
            fillOpacity: 0.95,
          }).bindTooltip(`<b>${p.label}</b><br/>${p.kind}`, { sticky: true, className: 'leaflet-custom-tip' });
          marker.on('click', () => onSelect && onSelect(id));
          group.addLayer(marker);
        });
      }

      if (cfg.type === 'lines') {
        cfg.lines.forEach(line => {
          const polyline = L.polyline(line, {
            color: cfg.color,
            weight: 2.4,
            opacity: 0.85,
            dashArray: '6 4',
          }).bindTooltip(cfg.title, { sticky: true, className: 'leaflet-custom-tip' });
          polyline.on('click', () => onSelect && onSelect(id));
          group.addLayer(polyline);
        });
      }
    });

    // If a single highlight id is set, fit to it
    if (highlightId && activeLayers.includes(highlightId)) {
      const cfg = REAL_LAYERS[highlightId];
      if (cfg && cfg.type === 'polygon') {
        mapRef.current.fitBounds(cfg.coords, { padding: [40, 40], maxZoom: 8 });
      } else if (cfg && cfg.type === 'points' && cfg.points.length) {
        const bounds = L.latLngBounds(cfg.points.map(p => [p.lat, p.lng]));
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
      }
    }
  }, [activeLayers.join('|'), highlightId, onSelect]);

  // Invalidate size when parent resizes (panel toggles etc)
  React.useEffect(() => {
    if (!mapRef.current) return;
    const ro = new ResizeObserver(() => {
      mapRef.current && mapRef.current.invalidateSize();
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#e4ecf4' }}>
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}></div>

      {/* Coords + CRS overlay */}
      {showCoords && (
        <div style={{
        position: 'absolute', left: 16, bottom: 16,
        display: 'flex', gap: 10, alignItems: 'center',
        background: 'rgba(255,255,255,.94)',
        border: '1px solid var(--hf-line)',
        borderRadius: 'var(--hf-r-2)', padding: '5px 10px',
        fontSize: 10.5, fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-ink-3)',
        zIndex: 400, pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}>
        <span>−2.5°S, 118.0°E</span>
        <span style={{ color: 'var(--hf-ink-5)' }}>|</span>
        <span>EPSG:4326</span>
        <span style={{ color: 'var(--hf-ink-5)' }}>|</span>
        <span>© Carto · OSM</span>
      </div>
      )}
    </div>
  );
}

Object.assign(window, { RealMap, REAL_LAYERS, ID_BOUNDS, ID_CENTER });
