// AlasBuana wireframes — shared primitives & chrome
// Globals exposed at bottom for cross-file consumption.

// ─────────────────────────────────────────────────────────────────
// MapBlock — placeholder for the Indonesia geospatial map
// Renders an SVG approximation of Indonesia's archipelago with
// scatter points + WK polygons. Strictly low-fi.
// ─────────────────────────────────────────────────────────────────
function MapBlock({ note, withPins = true, withLayers = false, withCoords = true, withBasemap = true, children }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'var(--map-water)', overflow: 'hidden',
      borderLeft: '1.4px solid var(--line-soft)'
    }}>
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id="seahatch" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 14 L14 0" stroke="#c3d5e6" strokeWidth=".4" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="800" height="400" fill="url(#seahatch)" />
        {/* Sumatra */}
        <path d="M60 130 Q90 120 130 150 Q180 200 220 230 Q250 250 270 280 Q260 295 240 290 Q200 270 160 240 Q110 200 80 170 Q55 150 60 130 Z"
          fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth="1.2" />
        {/* Java */}
        <path d="M270 290 Q330 285 400 295 Q470 305 510 305 Q480 315 420 315 Q360 312 300 305 Q275 302 270 290 Z"
          fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth="1.2" />
        {/* Kalimantan */}
        <path d="M340 130 Q400 125 460 145 Q510 160 530 200 Q540 240 510 260 Q470 270 430 255 Q390 240 360 215 Q335 185 335 155 Q335 140 340 130 Z"
          fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth="1.2" />
        {/* Sulawesi */}
        <path d="M560 180 Q580 170 590 200 Q585 230 595 250 Q605 270 590 280 Q580 270 575 250 Q565 240 555 235 Q570 220 565 210 Q555 200 560 180 Z"
          fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth="1.2" />
        {/* Papua */}
        <path d="M680 200 Q720 190 760 210 Q780 230 760 260 Q720 275 685 265 Q665 250 670 230 Q670 210 680 200 Z"
          fill="var(--map-land)" stroke="var(--map-stroke)" strokeWidth="1.2" />
        {/* Malaysia (top) */}
        <path d="M170 80 Q230 75 290 90 Q310 95 305 110 Q280 115 230 110 Q190 105 170 95 Q165 88 170 80 Z"
          fill="#e0e6dd" stroke="var(--map-stroke)" strokeWidth="1.0" opacity="0.7" />
        {/* country labels */}
        <text x="200" y="65" fill="#5b6a7b" fontSize="10" fontFamily="Inter, sans-serif">MALAYSIA</text>
        <text x="290" y="115" fill="#5b6a7b" fontSize="9" fontFamily="Inter, sans-serif">Singapore</text>
        <text x="380" y="200" fill="#5b6a7b" fontSize="11" fontFamily="Inter, sans-serif" fontStyle="italic">Kalimantan</text>
        <text x="350" y="350" fill="#5b6a7b" fontSize="10" fontFamily="Inter, sans-serif" fontStyle="italic">Java Sea</text>
        <text x="450" y="380" fill="#5b6a7b" fontSize="10" fontFamily="Inter, sans-serif" fontStyle="italic">INDIAN OCEAN</text>

        {/* WK polygons (rectangles to suggest blocks) */}
        <g stroke="#8a6db0" strokeWidth=".8" fill="#c7b3df" fillOpacity=".35">
          <rect x="120" y="155" width="22" height="18" />
          <rect x="155" y="180" width="28" height="22" />
          <rect x="180" y="210" width="20" height="18" />
          <rect x="370" y="180" width="26" height="20" />
          <rect x="410" y="200" width="22" height="18" />
          <rect x="445" y="225" width="24" height="22" />
        </g>
        <g stroke="#d97757" strokeWidth=".8" fill="#f5c8b3" fillOpacity=".3">
          <rect x="240" y="290" width="30" height="14" />
          <rect x="280" y="288" width="34" height="16" />
          <rect x="330" y="290" width="28" height="14" />
        </g>

        {withPins && (
          <g>
            {[
              [120, 168, '#2f8a4e'], [142, 196, '#2f8a4e'], [175, 220, '#b58200'],
              [200, 248, '#2f8a4e'], [380, 195, '#3b5bdb'], [410, 215, '#3b5bdb'],
              [445, 232, '#d97757'], [285, 297, '#b58200'], [340, 300, '#2f8a4e'],
              [570, 215, '#3b5bdb'], [585, 245, '#d97757'], [710, 230, '#2f8a4e'],
              [255, 296, '#3b5bdb'], [395, 220, '#2f8a4e'], [430, 248, '#b58200'],
            ].map(([x, y, c], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="6" fill="#fff" stroke={c} strokeWidth="1.4" />
                <circle r="2" fill={c} />
              </g>
            ))}
          </g>
        )}
      </svg>

      {withBasemap && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <div className="btn" style={{ background: '#fff', fontSize: 10 }}>
            <span className="ico ico-sm"></span> Basemap
          </div>
        </div>
      )}

      {withLayers && (
        <div className="floater" style={{ left: 14, bottom: 14, width: 170 }}>
          <div className="cap" style={{ marginBottom: 6 }}>Map Layers</div>
          {['Working Area (WK)', 'Block / Contract', 'Field', 'Well', 'Pipeline', 'Facility'].map(l => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '2px 0' }}>
              <span style={{
                width: 11, height: 11, border: '1.4px solid var(--line)', borderRadius: 2,
                background: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9
              }}>✓</span>
              {l}
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, cursor: 'pointer' }}>+ Add Layer</div>
        </div>
      )}

      {withCoords && (
        <div style={{
          position: 'absolute', left: 14, bottom: withLayers ? 'auto' : 10,
          top: withLayers ? 10 : 'auto',
          display: 'flex', gap: 10, alignItems: 'center',
          fontSize: 10, color: 'var(--ink-soft)',
          background: 'rgba(255,255,255,.85)', padding: '3px 8px', borderRadius: 3,
          border: '1px solid var(--line-soft)'
        }}>
          <span>300 km ▭</span>
          <span>−2.5487, 115.2216</span>
          <span>EPSG:4326</span>
        </div>
      )}

      {note && (
        <div className="annotation" style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)' }}>
          {note}
        </div>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TopNav — site-wide top navigation chrome
// ─────────────────────────────────────────────────────────────────
function TopNav({ active = 'EXPLORE DATA', notifs = 12, showSearch = true }) {
  const links = ['EXPLORE DATA', 'MAP', 'DASHBOARD', 'ANALYTICS', 'WORKSPACE', 'APPS', 'MONITORING'];
  return (
    <div className="topnav">
      <div className="brand">
        <span className="logo">AB</span>
        <span>AlasBuana<span className="dot">.com</span></span>
        <span className="sub" style={{ marginLeft: 4 }}>AI Intelligence</span>
      </div>
      {showSearch && (
        <div className="searchbar">
          <span className="ico ico-sm"></span>
          <span>Search for data, e.g. 'Seismic', 'Well', 'Pipeline', 'Block ONWJ'…</span>
        </div>
      )}
      <div className="navlinks">
        {links.map(l => (
          <a key={l} className={l === active ? 'active' : ''}>{l}</a>
        ))}
      </div>
      <div className="userbox">
        <span className="ico-plain" title="help">?</span>
        <span className="bell">🔔</span>
        <span className="avatar">SM</span>
        <span style={{ fontSize: 11, fontWeight: 600 }}>SKK MIGAS</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LeftSidebar — categories & data providers
// ─────────────────────────────────────────────────────────────────
function LeftSidebar({ active = 'All Data', hidden = false }) {
  if (hidden) return null;
  const browse = [
    ['All Data', null, true],
    ['Layers', null],
    ['Documents', null],
    ['Maps', null],
    ['Apps & Services', null],
  ];
  const cats = ['Administrative', 'Upstream Assets', 'Seismic', 'Well & Drilling',
    'Facilities', 'Pipeline', 'Environment', 'Infrastructure', 'Basemap'];
  const providers = [
    ['PHM', 245, '#2f8a4e'],
    ['PHE ONWJ', 183, '#d97757'],
    ['PSN', 167, '#3b5bdb'],
    ['Medco E&P', 142, '#3b5bdb'],
    ['Harbour Energy', 96, '#b58200'],
  ];
  return (
    <aside className="lsidebar">
      <div className="ls-group">
        <div className="ls-head">BROWSE</div>
        {browse.map(([l, _, on]) => (
          <div key={l} className={'ls-item' + (on ? ' active' : '')}>
            <span className="ico-plain"></span> {l}
          </div>
        ))}
      </div>
      <div className="ls-group">
        <div className="ls-head">CATEGORIES</div>
        {cats.map(c => (
          <div key={c} className="ls-item">
            {c} <span className="chev">›</span>
          </div>
        ))}
      </div>
      <div className="ls-group">
        <div className="ls-head">DATA PROVIDER</div>
        {providers.map(([n, c, color]) => (
          <div key={n} className="ls-item">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flex: '0 0 auto' }}></span>
            {n} <span className="badge">{c}</span>
          </div>
        ))}
        <div className="ls-item" style={{ color: 'var(--accent)', fontSize: 11 }}>Show more</div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────
// FlowBand — bottom data-flow diagram (5 layers)
// ─────────────────────────────────────────────────────────────────
function FlowBand({ compact = false }) {
  const layers = [
    { n: '1', t: 'KKKS INTERNAL SYSTEM', items: ['GIS Studio', 'PSC Documents', 'Physical Warehouse', 'Files in Workstation'], ftr: '(Data Owner)' },
    { n: '2', t: 'CONNECTOR & FEDERATION', items: ['SPARK Connector', 'Metadata Harvesting', 'Data Transformation', 'Secure Transmission'], ftr: '(Connector Layer)' },
    { n: '3', t: 'SPEKTRUM DATASPACE', items: ['Metadata Broker', 'Policy & Contract', 'Spatial & Context Layer', 'Security & Consent', 'Audit & Monitoring'], ftr: '(Dataspace Layer)' },
    { n: '4', t: 'GOVERNANCE & APPLICATION', items: ['Data Submission', 'Verification & Review', 'Compliance & Audit', 'Approval & Publication'], ftr: '(Governance Layer)' },
    { n: '5', t: 'CONSUMPTION LAYER', items: ['Interactive Map', 'Analytics & AI', 'Monitoring & Reporting', 'API & Data Services'], ftr: '(Application Layer)' },
  ];
  return (
    <div className="flowband">
      <div style={{ flex: '0 0 130px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="cap" style={{ color: 'var(--ink)' }}>SUMBER DATA DARI</div>
        <div className="cap" style={{ color: 'var(--ink)' }}>EKOSISTEM SPEKTRUM</div>
        <div style={{ fontSize: 9.5, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.3 }}>
          Semua data pada AlasBuana berasal dari ekosistem SPEKTRUM Dataspace yang terhubung aman dan tergovernance.
        </div>
        <div className="btn ghost" style={{ marginTop: 6, alignSelf: 'flex-start', fontSize: 10 }}>Pelajari lebih lanjut →</div>
      </div>
      {layers.map((L, i) => (
        <React.Fragment key={L.n}>
          <div className="flowcard">
            <div className="h">{L.n}. {L.t}</div>
            <ul>
              {L.items.map(x => (
                <li key={x}><span className="ico-plain" style={{ width: 9, height: 9 }}></span>{x}</li>
              ))}
            </ul>
            <div className="ftr">{L.ftr}</div>
          </div>
          {i < layers.length - 1 && <div className="flowarrow">→</div>}
        </React.Fragment>
      ))}
      <div className="flowcard" style={{ flex: '0 0 130px', borderStyle: 'solid' }}>
        <div className="h">DATA FLOW</div>
        <ul style={{ fontSize: 10 }}>
          {[
            ['#1f6feb', 'Data Connection'],
            ['#2f8a4e', 'Governance Flow'],
            ['#8a6db0', 'Metadata Flow'],
            ['#d97757', 'Monitoring & Audit'],
          ].map(([c, t]) => (
            <li key={t}>
              <span style={{
                display: 'inline-block', width: 16, height: 0, borderTop: `2px dashed ${c}`,
                marginRight: 2
              }}></span>{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// KeyBand — bottom dark band w/ key benefits
// ─────────────────────────────────────────────────────────────────
function KeyBand() {
  const items = [
    ['🗺', 'Satu Peta Nasional', 'Terintegrasi'],
    ['✓', 'Data Akurat & Terpercaya', '(Single Source of Truth)'],
    ['🛡', 'Keamanan & Governance', 'Berkelas Dunia'],
    ['⚡', 'Keputusan Lebih Cepat', 'dengan AI Intelligence'],
    ['📈', 'Interoperable & Scalable', 'Untuk Masa Depan'],
  ];
  return (
    <div className="keyband">
      <b>KEY BENEFITS</b>
      <div className="kb-items">
        {items.map(([ico, t1, t2]) => (
          <div className="kb" key={t1}>
            <span className="h">{ico}</span>
            <div className="t"><div>{t1}</div><div style={{ opacity: .7 }}>{t2}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AiFloater — floating AI assistant widget
// ─────────────────────────────────────────────────────────────────
function AiFloater({ style }) {
  return (
    <div className="float-ai" style={style}>
      <span className="star">✦</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>AI Assistant</div>
        <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>Ask anything about the data…</div>
      </div>
      <span style={{ marginLeft: 6, color: 'var(--ink-mute)', fontSize: 14 }}>×</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DatasetRow — one row in the dataset list
// ─────────────────────────────────────────────────────────────────
function DatasetRow({ kind = 'LAYER', title, type, format, updated, desc, provider, stats, verified = true }) {
  return (
    <div className="ds-row">
      <div className="thumb" style={{ height: 64, position: 'relative' }}>
        <span style={{
          position: 'absolute', top: 4, right: 4, background: 'var(--green)',
          color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 2,
          letterSpacing: .4
        }}>{kind}</span>
        thumb
      </div>
      <div className="meta">
        <div className="top">
          <span className="title">{title}</span>
          {verified && <span className="pill verified" style={{ fontSize: 9 }}>✓ Verified</span>}
        </div>
        <div className="sub">{type} · {format} · Updated {updated}</div>
        <div className="desc">{desc}</div>
        <div className="ftr">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span className="avatar" style={{ width: 16, height: 16, fontSize: 7 }}>{provider.slice(0, 2).toUpperCase()}</span>
            {provider}
          </span>
          <span>⬇ {stats[0]}</span>
          <span>👁 {stats[1]}</span>
          <span>★ {stats[2]}</span>
          <span style={{ marginLeft: 'auto' }}>⋯</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ArtboardFrame — wraps full-page wireframes in a phone-like shell
// (just a clean rect; design canvas provides the chrome)
// ─────────────────────────────────────────────────────────────────
function Page({ children, screenLabel }) {
  return (
    <div className="ab" data-screen-label={screenLabel}>
      {children}
    </div>
  );
}

Object.assign(window, {
  MapBlock, TopNav, LeftSidebar, FlowBand, KeyBand, AiFloater, DatasetRow, Page,
});
