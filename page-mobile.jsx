// Mobile wireframes — Explore + Map (375 × 812, iPhone-ish)

// Phone frame wrapper — thin chrome only; primary chrome lives in the design canvas.
function PhoneFrame({ children, screenLabel }) {
  return (
    <Page screenLabel={screenLabel}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#e9e6df', padding: 24, minHeight: 0
      }}>
        <div style={{
          width: 360, height: 760, background: '#fff',
          border: '6px solid #1f2937', borderRadius: 32,
          boxShadow: '0 6px 24px rgba(0,0,0,.12)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
        }}>
          {/* status bar */}
          <div className="row" style={{
            height: 24, padding: '0 18px', justifyContent: 'space-between',
            fontSize: 10, fontWeight: 700, flex: '0 0 auto'
          }}>
            <span>9:41</span>
            <span style={{ width: 60, height: 14, background: '#1f2937', borderRadius: 8, marginTop: 6 }}></span>
            <span>● 􀙇 􀛨</span>
          </div>
          {children}
        </div>
      </div>
    </Page>
  );
}

// Mobile top header — brand + hamburger + search
function MTop({ title = 'Explore Data', back = false }) {
  return (
    <div className="row" style={{
      padding: '8px 14px', borderBottom: '1.4px solid var(--line-soft)',
      gap: 10, flex: '0 0 auto'
    }}>
      {back ? <span style={{ fontSize: 18, color: 'var(--ink)' }}>‹</span>
            : <span style={{ fontSize: 16 }}>☰</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
      </div>
      <span className="ico ico-sm"></span>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', background: 'var(--fill-2)',
        border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 8, fontWeight: 700
      }}>SM</span>
    </div>
  );
}

// Mobile bottom tab bar
function MTabs({ active = 'explore' }) {
  const tabs = [
    ['explore',  '◇',  'Explore'],
    ['map',      '◉',  'Map'],
    ['dash',     '▦',  'Dashboard'],
    ['ws',       '☰',  'Workspace'],
    ['me',       '◯',  'Me'],
  ];
  return (
    <div className="row" style={{
      borderTop: '1.4px solid var(--line-soft)',
      padding: '6px 6px 8px', justifyContent: 'space-around',
      flex: '0 0 auto', background: 'var(--paper)'
    }}>
      {tabs.map(([id, ico, l]) => (
        <div key={id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: id === active ? 'var(--accent)' : 'var(--ink-mute)',
          fontWeight: id === active ? 700 : 500, fontSize: 9.5
        }}>
          <span style={{ fontSize: 14 }}>{ico}</span>
          {l}
        </div>
      ))}
    </div>
  );
}

// Mobile Explore — list view
function MobileExplore() {
  return (
    <PhoneFrame screenLabel="09 Mobile · Explore Data">
      <MTop title="AlasBuana" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search */}
        <div className="searchbar" style={{ maxWidth: 'none', padding: '7px 12px' }}>
          <span className="ico ico-sm"></span> Cari dataset…
        </div>
        {/* Chips */}
        <div className="row" style={{ gap: 6, overflowX: 'auto', flexWrap: 'nowrap', margin: '0 -14px', padding: '0 14px' }}>
          {['All', 'Layers', 'Wells', 'Seismic', 'Pipeline', 'Docs'].map((c, i) => (
            <span key={c} className={'pill ' + (i === 0 ? 'active' : 'ghost')} style={{ fontSize: 10.5, flex: '0 0 auto' }}>{c}</span>
          ))}
        </div>
        {/* Hero KPI */}
        <div className="wf wf-soft row" style={{ padding: 10, gap: 12 }}>
          {[['2,452', 'Datasets'], ['145', 'Providers'], ['98%', 'SLA']].map(([n, l]) => (
            <div key={l} style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{n}</div>
              <div className="dim" style={{ fontSize: 9.5 }}>{l}</div>
            </div>
          ))}
        </div>
        {/* List */}
        <div className="cap">DATASETS (2,452)</div>
        {[
          ['WK Boundary ONWJ',      'PHE ONWJ',    'Administrative · SHP',  'verified'],
          ['Seismic 3D N.Sumatra',  'Medco E&P',   'Seismic · SEG-Y',       'verified'],
          ['Well Location',         'PHM',         'Well · SHP',            'verified'],
          ['Pipeline Network',      'PHE',         'Infrastructure · GeoJSON', ''],
          ['PSC Doc Rokan',         'SKK Migas',   'Document · PDF',        'verified'],
        ].map(([t, p, sub, v], i) => (
          <div key={i} className="row wf wf-soft" style={{ padding: 8, gap: 10, alignItems: 'flex-start' }}>
            <div className="thumb" style={{ width: 56, height: 44, flex: '0 0 auto', fontSize: 7 }}>thumb</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 11.5, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                {v && <span className="pill verified" style={{ fontSize: 8 }}>✓</span>}
              </div>
              <div className="dim" style={{ fontSize: 10 }}>{p}</div>
              <div className="dim" style={{ fontSize: 9.5 }}>{sub}</div>
              <div className="row" style={{ gap: 8, marginTop: 4, fontSize: 9, color: 'var(--ink-mute)' }}>
                <span>⬇ 128</span> <span>★ 12</span>
                <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontWeight: 600 }}>+ Map</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Floating AI */}
      <div style={{ position: 'absolute', right: 14, bottom: 70, zIndex: 4 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22,
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: '0 4px 12px rgba(59,91,219,.4)'
        }}>✦</div>
      </div>
      <MTabs active="explore" />
    </PhoneFrame>
  );
}

// Mobile Map — full screen
function MobileMap() {
  return (
    <PhoneFrame screenLabel="10 Mobile · Map View">
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapBlock withBasemap={false} withCoords={false} />

        {/* Top floating search */}
        <div className="floater" style={{ top: 12, left: 12, right: 12, padding: '8px 12px', flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>☰</span>
          <span className="ico ico-sm"></span>
          <span style={{ flex: 1, fontSize: 11, color: 'var(--ink-mute)' }}>Search area, WK, well…</span>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: 'var(--fill-2)',
            border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 8, fontWeight: 700
          }}>SM</span>
        </div>

        {/* Layer toggle FAB stack */}
        <div style={{ position: 'absolute', right: 12, top: 80, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['◉', '⊞', '⊕', '◐'].map((ico, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: 8, background: '#fff',
              border: '1.4px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,.08)', fontSize: 14
            }}>{ico}</div>
          ))}
        </div>

        {/* Coord pill */}
        <div style={{
          position: 'absolute', left: 12, bottom: 200,
          background: 'rgba(255,255,255,.85)', padding: '3px 8px',
          borderRadius: 3, border: '1px solid var(--line-soft)',
          fontSize: 9.5, color: 'var(--ink-soft)'
        }}>−2.5487, 115.2216 · 300 km ▭</div>

        {/* Bottom sheet (peek) */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: '#fff', borderTop: '1.4px solid var(--line)',
          borderRadius: '14px 14px 0 0', padding: '8px 14px 14px',
          boxShadow: '0 -4px 16px rgba(0,0,0,.06)',
          maxHeight: 220, display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2, background: 'var(--line-soft)',
            margin: '0 auto 8px'
          }}></div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12 }}>WK Boundary — ONWJ</div>
              <div className="dim" style={{ fontSize: 10 }}>PHE ONWJ · 13,978 km²</div>
            </div>
            <span className="pill verified" style={{ fontSize: 8 }}>✓ Verified</span>
          </div>
          <div className="row" style={{ marginTop: 8, gap: 6 }}>
            <span className="btn" style={{ flex: 1, fontSize: 10 }}>Details</span>
            <span className="btn green" style={{ flex: 1, fontSize: 10 }}>+ Add to Map</span>
          </div>
          <div className="cap" style={{ marginTop: 10, fontSize: 8.5 }}>NEARBY (3)</div>
          {[
            ['Well · ONWJ-A-12',     '2.4 km'],
            ['Pipeline · ONWJ Main', '5.1 km'],
            ['Facility · CPP-A',     '6.8 km'],
          ].map(([n, d]) => (
            <div key={n} className="row" style={{ padding: '4px 0', fontSize: 10.5, borderBottom: '1px dashed var(--line-soft)' }}>
              <span className="ico-plain" style={{ width: 10, height: 10 }}></span>
              <span style={{ flex: 1, marginLeft: 6 }}>{n}</span>
              <span className="dim">{d}</span>
            </div>
          ))}
        </div>
      </div>
      <MTabs active="map" />
    </PhoneFrame>
  );
}

// Mobile Detail Dataset
function MobileDetail() {
  return (
    <PhoneFrame screenLabel="11 Mobile · Detail Dataset">
      <MTop title="Dataset" back />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* mini map */}
        <div style={{ height: 140, position: 'relative' }}>
          <MapBlock withBasemap={false} withCoords={false} />
        </div>
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="row" style={{ gap: 4 }}>
            <span className="pill" style={{ background: 'var(--green-soft)', borderColor: 'var(--green)', color: 'var(--green)', fontSize: 8 }}>LAYER</span>
            <span className="pill ghost" style={{ fontSize: 8 }}>Admin</span>
            <span className="pill verified" style={{ fontSize: 8 }}>✓ Verified</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: -.2 }}>Working Area (WK) Boundary — ONWJ</div>
          <div className="dim" style={{ fontSize: 10.5 }}>
            Batas Wilayah Kerja Offshore North West Java berdasarkan PSC terkini.
          </div>
          <div className="row" style={{ fontSize: 9.5, color: 'var(--ink-mute)', gap: 10 }}>
            <span>PHE ONWJ</span><span>⬇ 128</span><span>★ 12</span><span>2d ago</span>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="btn green" style={{ flex: 1, fontSize: 11 }}>+ Add to Map</span>
            <span className="btn primary" style={{ flex: 1, fontSize: 11 }}>↓ Download</span>
          </div>

          {/* Tabs */}
          <div className="row" style={{ gap: 18, borderBottom: '1.4px solid var(--line-soft)', marginTop: 6, fontSize: 11, fontWeight: 600 }}>
            {['Overview', 'Attributes', 'Quality', 'More'].map((t, i) => (
              <a key={t} style={{ padding: '8px 0', borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent', color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)' }}>{t}</a>
            ))}
          </div>

          <div className="cap" style={{ marginTop: 6 }}>KEY ATTRIBUTES</div>
          {[
            ['Total Area',       '13,978.45 km²'],
            ['Status',           'Active'],
            ['Operator',         'PHE ONWJ'],
            ['Contract End',     '2048-08-08'],
            ['CRS',              'EPSG:4326'],
          ].map(([k, v]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed var(--line-soft)', fontSize: 11 }}>
              <span className="dim">{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}

          <div className="cap" style={{ marginTop: 6 }}>QUALITY</div>
          {[['Completeness', 98], ['Accuracy', 92], ['Currency', 85]].map(([k, v]) => (
            <div key={k} className="row" style={{ gap: 6, fontSize: 10.5 }}>
              <span style={{ flex: '0 0 90px' }} className="dim">{k}</span>
              <div style={{ flex: 1, height: 4, background: 'var(--fill-2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: v + '%', height: '100%', background: v >= 90 ? 'var(--green)' : 'var(--amber)' }}></div>
              </div>
              <span style={{ flex: '0 0 30px', textAlign: 'right', fontWeight: 600 }}>{v}%</span>
            </div>
          ))}
        </div>
      </div>
      <MTabs active="explore" />
    </PhoneFrame>
  );
}

Object.assign(window, { MobileExplore, MobileMap, MobileDetail });
