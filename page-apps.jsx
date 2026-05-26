// Apps — 2 variants

// Variant A: App-store grid with category filters
function AppsA() {
  return (
    <Page screenLabel="06 Apps · A · Store grid">
      <TopNav active="APPS" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside style={{ width: 200, borderRight: '1.4px solid var(--line-soft)', padding: 'var(--pad)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="h3">Apps</div>
          <div className="cap">CATEGORIES</div>
          {[
            ['All apps', 48, true],
            ['Geospatial', 12],
            ['Subsurface', 8],
            ['Production', 9],
            ['Compliance', 6],
            ['AI & Models', 7],
            ['Reporting', 4],
            ['Integrations', 2],
          ].map(([n, c, on]) => (
            <div key={n} className={'ls-item' + (on ? ' active' : '')}>
              {n} <span className="badge">{c}</span>
            </div>
          ))}
          <div className="divider"></div>
          <div className="cap">FROM</div>
          {['SKK Migas', 'Pertamina', 'Community', '3rd party'].map(p => (
            <label key={p} className="row" style={{ fontSize: 11, padding: '3px 0' }}>
              <input type="checkbox" defaultChecked /> {p}
            </label>
          ))}
        </aside>

        <main style={{ flex: 1, padding: 'var(--pad)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="h1">Apps & Services</div>
              <div className="dim" style={{ fontSize: 11 }}>Aplikasi siap pakai untuk memperkaya data ekosistem AlasBuana.</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <div className="searchbar" style={{ width: 260 }}><span className="ico ico-sm"></span> Search apps…</div>
              <span className="pill ghost">Sort: Popular ⏷</span>
            </div>
          </div>

          {/* Featured banner */}
          <div className="wf" style={{ padding: 18, background: '#0a1a3a', color: '#fff', display: 'flex', alignItems: 'center', gap: 18, border: 0 }}>
            <div style={{ width: 60, height: 60, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), #7b91ed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: .8, opacity: .7 }}>FEATURED</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>AlasBuana AI Co-pilot</div>
              <div style={{ fontSize: 11, opacity: .8 }}>Tanya tentang data, generate report, atau cari korelasi dalam natural language.</div>
            </div>
            <span className="btn" style={{ background: '#fff', color: '#0a1a3a', border: 0 }}>Launch app →</span>
          </div>

          <div>
            <div className="cap" style={{ marginBottom: 6 }}>INSTALLED · 6</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { i: '🗺', n: 'Map Studio', d: 'Pro GIS editor', c: 'var(--green)' },
                { i: '📊', n: 'Reserve Modeler', d: 'P10/P50/P90', c: 'var(--accent)' },
                { i: '🛢', n: 'Decline Curve', d: 'Arps + AI', c: 'var(--amber)' },
                { i: '🛰', n: 'Satellite Watch', d: 'Sentinel alerts', c: 'var(--accent)' },
              ].map(a => (
                <div key={a.n} className="wf" style={{ padding: 12, cursor: 'pointer' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 24 }}>{a.i}</span>
                    <span className="pill verified" style={{ fontSize: 9 }}>✓ Installed</span>
                  </div>
                  <div className="h3" style={{ marginTop: 6 }}>{a.n}</div>
                  <div className="dim" style={{ fontSize: 10 }}>{a.d}</div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <span className="btn primary" style={{ flex: 1, padding: '4px 8px' }}>Open</span>
                    <span className="pill ghost" style={{ fontSize: 9 }}>⚙</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="cap">EXPLORE · 48 apps</div>
              <span className="pill ghost" style={{ fontSize: 9 }}>view: ▦ ≡</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {[
                { i: '⛏', n: 'Drilling Optimizer', d: 'Suggest optimal trajectory', t: 'AI · Subsurface', r: 4.6, free: true },
                { i: '🌊', n: 'Bathymetry Pro', d: 'High-res offshore data', t: 'Geospatial', r: 4.3 },
                { i: '⚙', n: 'Equipment Registry', d: 'Track wellheads, pumps', t: 'Production', r: 4.1, free: true },
                { i: '📜', n: 'PSC Doc Reader', d: 'OCR + extract clauses', t: 'Compliance · AI', r: 4.8 },
                { i: '🚁', n: 'Drone Survey Hub', d: 'Process flight outputs', t: 'Geospatial', r: 4.0 },
                { i: '📡', n: 'IoT Sensor Stream', d: 'Real-time facility data', t: 'Integration', r: 4.4 },
                { i: '🛡', n: 'HSE Tracker', d: 'Incident & near-miss log', t: 'Compliance', r: 4.7, free: true },
                { i: '💧', n: 'Water Cut Analyzer', d: 'Per-well water trend', t: 'Production · AI', r: 4.2 },
              ].map(a => (
                <div key={a.n} className="wf wf-soft" style={{ padding: 12, cursor: 'pointer' }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 24 }}>{a.i}</span>
                    {a.free && <span className="pill" style={{ fontSize: 9 }}>Free</span>}
                  </div>
                  <div className="h3" style={{ marginTop: 6 }}>{a.n}</div>
                  <div className="dim" style={{ fontSize: 10 }}>{a.d}</div>
                  <div className="row" style={{ marginTop: 6, fontSize: 10, color: 'var(--ink-mute)' }}>
                    <span>★ {a.r}</span>
                    <span>· {a.t}</span>
                  </div>
                  <div className="btn ghost" style={{ marginTop: 6 }}>Install</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <KeyBand />
    </Page>
  );
}

// Variant B: Categorized horizontal lanes (storefront)
function AppsB() {
  const lanes = [
    { c: 'Diintegrasikan untuk SKK Migas', items: ['AI Co-pilot', 'Reserve Modeler', 'PSC Doc Reader', 'HSE Tracker', 'Approval Hub'] },
    { c: 'Subsurface & Geoscience', items: ['Seismic Viewer', 'Petrel Bridge', 'Well Log Studio', 'Velocity Modeler', 'Fault Tracker'] },
    { c: 'Production & Facilities', items: ['Decline Curve', 'Water Cut Analyzer', 'Workover Planner', 'Equipment Registry', 'Surface Optimizer'] },
    { c: 'AI & Automation', items: ['AI Co-pilot', 'Drilling Optimizer', 'Anomaly Detector', 'Forecast Studio', 'Report Generator'] },
    { c: 'Compliance & Reporting', items: ['PSC Doc Reader', 'HSE Tracker', 'Royalty Calculator', 'ESG Dashboard', 'Audit Trail'] },
  ];
  return (
    <Page screenLabel="06 Apps · B · Storefront lanes">
      <TopNav active="APPS" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Apps & Services</div>
            <div className="dim" style={{ fontSize: 11 }}>Marketplace aplikasi untuk ekosistem upstream Indonesia.</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <div className="searchbar" style={{ width: 320 }}>
              <span className="ico ico-sm"></span> Cari app, integrasi, atau model…
            </div>
            <span className="btn">My installed (6)</span>
            <span className="btn primary">+ Publish app</span>
          </div>
        </div>

        {/* Hero */}
        <div className="wf" style={{ padding: 0, overflow: 'hidden', border: '1.4px solid var(--accent)' }}>
          <div className="row" style={{ background: 'var(--accent-soft)', padding: 20, gap: 18, alignItems: 'flex-start' }}>
            <div style={{ width: 84, height: 84, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), #7b91ed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#fff' }}>✦</div>
            <div style={{ flex: 1 }}>
              <div className="row">
                <span style={{ fontSize: 18, fontWeight: 800 }}>AlasBuana AI Co-pilot</span>
                <span className="pill" style={{ fontSize: 9, borderColor: 'var(--accent)', color: 'var(--accent)' }}>★ Editor's pick</span>
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: 'var(--ink-soft)' }}>
                Natural-language interface ke seluruh data ekosistem. Buat report, cari korelasi, jalankan analitik tanpa SQL.
              </div>
              <div className="row" style={{ marginTop: 8, gap: 12 }}>
                <span className="row" style={{ gap: 4, fontSize: 11 }}><b>★ 4.8</b><span className="dim">· 1.2k installs</span></span>
                <span className="dim" style={{ fontSize: 11 }}>by SKK Migas Labs</span>
                <span className="pill verified" style={{ fontSize: 9 }}>✓ Verified</span>
              </div>
            </div>
            <div className="col" style={{ alignItems: 'flex-end', gap: 6 }}>
              <span className="btn primary">Install</span>
              <span className="dim" style={{ fontSize: 10 }}>Free for SKK Migas org</span>
            </div>
          </div>
        </div>

        {lanes.map(lane => (
          <div key={lane.c}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="h3">{lane.c}</div>
              <span className="pill ghost" style={{ fontSize: 9 }}>see all →</span>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {lane.items.map((n, i) => (
                <div key={n} className="wf wf-soft" style={{ flex: '0 0 180px', padding: 10 }}>
                  <div style={{ height: 60, background: 'var(--fill)', borderRadius: 4, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {['🗺', '📊', '🛢', '✦', '📜', '🛰', '⚙', '💧'][i % 8]}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{n}</div>
                  <div className="dim" style={{ fontSize: 10 }}>★ {(4 + (i % 9) / 10).toFixed(1)} · short blurb</div>
                  <div className="btn ghost" style={{ marginTop: 6, padding: '3px 6px', fontSize: 10 }}>Install</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { AppsA, AppsB });
