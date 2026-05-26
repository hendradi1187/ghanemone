// Map View — 2 variants (full screen geospatial)

// Variant A: Full-bleed map with floating panels (Mapbox-style)
function MapA() {
  return (
    <Page screenLabel="02 Map View · A · Full-bleed floating panels">
      <TopNav active="MAP" />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <MapBlock withCoords={false} withBasemap={false} />

        {/* Top floating search */}
        <div className="floater" style={{ top: 14, left: 14, width: 320, padding: 0 }}>
          <div className="row" style={{ padding: '8px 10px' }}>
            <span className="ico ico-sm"></span>
            <input placeholder="Search by area, WK, well…" style={{
              flex: 1, border: 0, outline: 0, fontSize: 12, background: 'transparent'
            }} />
            <span className="pill ghost" style={{ fontSize: 9 }}>⌘K</span>
          </div>
          <div style={{ borderTop: '1.4px dashed var(--line-soft)', padding: '6px 10px' }}>
            <div className="cap" style={{ fontSize: 8.5 }}>RECENT</div>
            {['WK ONWJ', 'Cekungan Sumatera Utara', 'Pipeline Trans-Java'].map(r => (
              <div key={r} style={{ fontSize: 11, padding: '3px 0', color: 'var(--ink-soft)' }}>↻ {r}</div>
            ))}
          </div>
        </div>

        {/* Left layer panel */}
        <div className="floater" style={{ left: 14, top: 200, width: 220 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="cap">MAP LAYERS</span>
            <span className="pill ghost" style={{ fontSize: 9 }}>edit</span>
          </div>
          {[
            ['Working Area (WK)', '#8a6db0', true],
            ['Block / Contract', '#3b5bdb', true],
            ['Field', '#2f8a4e', true],
            ['Well', '#d97757', true],
            ['Pipeline', '#b58200', true],
            ['Facility', '#1f6feb', true],
            ['Seismic Coverage', '#9ca3af', false],
            ['Environmental Zones', '#c83a3a', false],
          ].map(([l, c, on]) => (
            <div key={l} className="row" style={{ fontSize: 11, padding: '2px 0' }}>
              <span style={{
                width: 11, height: 11, borderRadius: 2, border: `1.4px solid ${c}`,
                background: on ? c : 'transparent', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8
              }}>{on ? '✓' : ''}</span>
              {l}
              <span style={{ marginLeft: 'auto', color: 'var(--ink-mute)', fontSize: 9 }}>⚙</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, cursor: 'pointer' }}>+ Add Layer</div>
        </div>

        {/* Right detail panel */}
        <div className="floater" style={{ right: 14, top: 14, width: 280 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="cap">SELECTED · WK PERTAMINA EP-1</span>
            <span style={{ cursor: 'pointer', color: 'var(--ink-mute)' }}>×</span>
          </div>
          <div className="h3" style={{ marginTop: 4 }}>Wilayah Kerja Pertamina EP Field-1</div>
          <div className="row" style={{ marginTop: 4 }}>
            <span className="pill verified" style={{ fontSize: 9 }}>✓ Verified</span>
            <span className="pill ghost" style={{ fontSize: 9 }}>Active</span>
          </div>
          <div className="divider"></div>
          <div className="col" style={{ gap: 4 }}>
            {[['Total Area', '4,210 km²'], ['Operator', 'PT Pertamina EP'], ['Active Wells', '142'], ['Avg Prod', '8,300 BOPD'], ['Contract', '2018 – 2048']].map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                <span className="dim">{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <div className="cap">RELATED LAYERS</div>
          <div className="col" style={{ gap: 3, marginTop: 4 }}>
            {['Wells (142)', 'Pipelines (8)', 'Facilities (3)', 'Seismic 3D (2 surveys)'].map(r => (
              <div key={r} style={{ fontSize: 11, color: 'var(--accent)' }}>+ {r}</div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="btn" style={{ flex: 1 }}>Details</span>
            <span className="btn green" style={{ flex: 1 }}>Export Area</span>
          </div>
        </div>

        {/* Map toolbar (zoom, measure, draw) */}
        <div style={{ position: 'absolute', right: 14, bottom: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['+', '−', '⟲', '◐', '↧', '⊞'].map((t, i) => (
            <span key={i} className="btn" style={{ width: 32, height: 32, padding: 0, background: '#fff', fontSize: 14 }}>{t}</span>
          ))}
        </div>

        {/* Legend */}
        <div className="floater" style={{ right: 14, bottom: 14, width: 220 }}>
          <div className="cap">LEGEND</div>
          <div className="col" style={{ gap: 3, marginTop: 4 }}>
            {[
              ['Working Area Boundary', '#8a6db0'],
              ['Active Well', '#2f8a4e'],
              ['Plugged Well', '#9ca3af'],
              ['Pipeline (gas)', '#b58200'],
              ['Pipeline (oil)', '#d97757'],
              ['Facility', '#3b5bdb'],
            ].map(([l, c]) => (
              <div key={l} className="row" style={{ fontSize: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1.2px solid #fff', boxShadow: `0 0 0 1px ${c}` }}></span>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Basemap button */}
        <div style={{ position: 'absolute', top: 14, right: 320 }}>
          <span className="btn" style={{ background: '#fff' }}>
            <span className="ico ico-sm"></span> Basemap
          </span>
        </div>

        <AiFloater style={{ position: 'absolute', left: 14, bottom: 14 }} />

        <div className="stickynote" style={{ right: 320, bottom: 120 }}>
          Floating panels = canvas terasa luas; cocok untuk geoscientist eksplorasi
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

// Variant B: Map + persistent left layer rail + right context panel
function MapB() {
  return (
    <Page screenLabel="02 Map View · B · Rail layout (GIS pro style)">
      <TopNav active="MAP" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left rail: layer tree (ArcGIS style) */}
        <aside style={{ width: 260, borderRight: '1.4px solid var(--line-soft)', display: 'flex', flexDirection: 'column' }}>
          <div className="row" style={{ padding: '10px var(--pad)', borderBottom: '1.4px solid var(--line-soft)' }}>
            <span className="h3">Layers</span>
            <span style={{ marginLeft: 'auto' }} className="row">
              <span className="pill ghost" style={{ fontSize: 9 }}>+ Add</span>
              <span className="pill ghost" style={{ fontSize: 9 }}>⏷</span>
            </span>
          </div>
          <div style={{ padding: '8px var(--pad)', overflowY: 'auto', flex: 1, fontSize: 11 }}>
            {[
              { g: 'Administrative', items: ['Working Area (WK)', 'Block / Contract Area', 'Province Boundary'] },
              { g: 'Upstream Assets', items: ['Field', 'Well — Producing', 'Well — Drilling', 'Well — Plugged'] },
              { g: 'Infrastructure', items: ['Pipeline Network', 'Facility / Plant', 'Tank Farm'] },
              { g: 'Seismic & Subsurface', items: ['2D Seismic Lines', '3D Seismic Coverage', 'Magnetic Survey'] },
              { g: 'Environment', items: ['Protected Areas', 'Mangrove', 'Bathymetry'] },
            ].map(group => (
              <div key={group.g} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 }}>▾ {group.g}</div>
                {group.items.map((it, i) => (
                  <div key={it} className="row" style={{ paddingLeft: 14, gap: 6, padding: '3px 0 3px 14px' }}>
                    <input type="checkbox" defaultChecked={i < 2} />
                    <span style={{ width: 8, height: 8, background: '#8a6db0', borderRadius: 1 }}></span>
                    <span>{it}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--ink-mute)' }}>⚙</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding: 10, borderTop: '1.4px solid var(--line-soft)', fontSize: 10, color: 'var(--ink-mute)' }}>
            <div>Drag to reorder · ⚙ = style</div>
          </div>
        </aside>

        {/* MAP */}
        <section style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          {/* top toolbar */}
          <div className="row" style={{
            padding: '6px 10px', background: 'var(--paper)',
            borderBottom: '1.4px solid var(--line-soft)', gap: 6
          }}>
            {['Pan', 'Select', 'Measure', 'Draw', 'Buffer', 'Split-screen'].map((t, i) => (
              <span key={t} className={'pill ' + (i === 1 ? 'active' : 'ghost')} style={{ fontSize: 10 }}>{t}</span>
            ))}
            <div style={{ marginLeft: 'auto' }} className="row" style={{ gap: 6 }}>
              <span className="pill ghost" style={{ fontSize: 10 }}>Basemap: Satellite ⏷</span>
              <span className="pill ghost" style={{ fontSize: 10 }}>Scale 1:5,000,000</span>
            </div>
          </div>
          <div style={{ position: 'absolute', inset: '34px 0 0 0' }}>
            <MapBlock withLayers={false} withBasemap={false} withCoords />
          </div>
          <AiFloater style={{ position: 'absolute', right: 14, bottom: 14 }} />
        </section>

        {/* Right context panel — tabs */}
        <aside style={{ width: 280, borderLeft: '1.4px solid var(--line-soft)', display: 'flex', flexDirection: 'column' }}>
          <div className="row" style={{ borderBottom: '1.4px solid var(--line-soft)' }}>
            {['Info', 'Attributes', 'Analytics'].map((t, i) => (
              <span key={t} style={{
                padding: '8px 12px', fontSize: 11, fontWeight: 600,
                borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)',
                cursor: 'pointer'
              }}>{t}</span>
            ))}
          </div>
          <div style={{ padding: 'var(--pad)', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="h3">Selected feature</div>
            <div className="thumb" style={{ height: 80 }}>map-snippet</div>
            <div className="dim" style={{ fontSize: 11 }}>Click any feature on the map to inspect.</div>
            <div className="divider"></div>
            <div className="cap">CURRENT VIEWPORT</div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span className="dim">Center</span><span>−2.55°, 115.22°</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span className="dim">Zoom</span><span>6.2</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span className="dim">Visible WKs</span><span>32</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span className="dim">Visible Wells</span><span>1,184</span>
            </div>
            <div className="divider"></div>
            <div className="cap">BOOKMARKS</div>
            {['Cekungan Sumatera Utara', 'East Kalimantan Basin', 'WK Rokan – overview'].map(b => (
              <div key={b} className="row" style={{ fontSize: 11, padding: '3px 0' }}>
                <span>★</span> {b}
                <span style={{ marginLeft: 'auto', color: 'var(--ink-mute)' }}>↗</span>
              </div>
            ))}
            <div className="btn ghost" style={{ marginTop: 4 }}>+ Save current view</div>
          </div>
        </aside>
      </div>
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { MapA, MapB });
