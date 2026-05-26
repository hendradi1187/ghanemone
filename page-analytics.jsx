// Analytics — 2 variants

// Variant A: Sidebar filters + main charts + insight panel (BI-style)
function AnalyticsA() {
  return (
    <Page screenLabel="04 Analytics · A · BI workspace">
      <TopNav active="ANALYTICS" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Filter rail */}
        <aside style={{ width: 220, borderRight: '1.4px solid var(--line-soft)', padding: 'var(--pad)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="h3">Filters</div>
          {[
            { l: 'Metric', items: ['Production (BOPD)', 'Well count', 'Pipeline length', 'API usage'], active: 0 },
            { l: 'Region', items: ['Sumatera', 'Kalimantan', 'Java', 'Sulawesi', 'Papua'] },
            { l: 'Provider', items: ['PHM', 'PHE ONWJ', 'PSN', 'Medco E&P'] },
            { l: 'Time Range', items: ['Last 7d', 'Last 30d', 'YTD', 'Custom…'] },
          ].map(g => (
            <div key={g.l}>
              <div className="cap" style={{ marginBottom: 4 }}>{g.l}</div>
              {g.items.map((x, i) => (
                <label key={x} className="row" style={{ fontSize: 11, padding: '2px 0' }}>
                  <input type="checkbox" defaultChecked={i === (g.active ?? 0)} />
                  {x}
                </label>
              ))}
            </div>
          ))}
          <div className="btn primary">Apply</div>
          <div className="btn ghost">Reset</div>
        </aside>

        {/* Main chart area */}
        <main style={{ flex: 1, padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minWidth: 0 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="h1">Analytics</div>
              <div className="dim" style={{ fontSize: 11 }}>Eksplorasi tren, korelasi & forecasting di seluruh ekosistem.</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span className="pill ghost">Saved view: National Overview ⏷</span>
              <span className="btn">↓ CSV</span>
              <span className="btn primary">+ New chart</span>
            </div>
          </div>

          {/* Stat strip */}
          <div className="row" style={{ gap: 10 }}>
            {[['Total Production', '742k BOPD', '+2.3%', 'var(--green)'],
              ['Active Wells', '12,842', '+0.8%', 'var(--green)'],
              ['Decline Rate', '4.1%', '−0.2%', 'var(--green)'],
              ['Reserve Replacement', '88%', '−3%', 'var(--red)']].map(([l, v, d, c]) => (
              <div key={l} className="wf" style={{ flex: 1, padding: 10 }}>
                <div className="cap">{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 10, color: c, fontWeight: 600 }}>{d}</div>
              </div>
            ))}
          </div>

          {/* Big time-series chart */}
          <div className="wf" style={{ padding: 12, flex: 1, minHeight: 250, display: 'flex', flexDirection: 'column' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="h3">Production by Region — last 12 months</div>
              <div className="row" style={{ gap: 4 }}>
                <span className="pill active" style={{ fontSize: 9 }}>Line</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>Stacked</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>Area</span>
              </div>
            </div>
            <div style={{ flex: 1, position: 'relative', borderLeft: '1.2px solid var(--line-soft)', borderBottom: '1.2px solid var(--line-soft)' }}>
              <svg viewBox="0 0 600 220" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {[40, 80, 120, 160].map(y => (
                  <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#e5e7eb" strokeWidth=".6" strokeDasharray="3 4" />
                ))}
                <path d="M0 120 L50 100 L100 110 L150 80 L200 90 L250 60 L300 70 L350 50 L400 60 L450 40 L500 50 L550 30 L600 35" fill="none" stroke="#3b5bdb" strokeWidth="2" />
                <path d="M0 140 L50 135 L100 125 L150 130 L200 115 L250 120 L300 100 L350 110 L400 95 L450 100 L500 85 L550 90 L600 75" fill="none" stroke="#2f8a4e" strokeWidth="2" />
                <path d="M0 165 L50 160 L100 162 L150 150 L200 155 L250 145 L300 148 L350 138 L400 142 L450 130 L500 135 L550 125 L600 128" fill="none" stroke="#b58200" strokeWidth="2" />
                <path d="M0 180 L50 178 L100 175 L150 170 L200 172 L250 165 L300 168 L350 160 L400 162 L450 155 L500 158 L550 150 L600 152" fill="none" stroke="#d97757" strokeWidth="2" />
                <line x1="500" x2="500" y1="0" y2="220" stroke="#9ca3af" strokeDasharray="2 3" />
                <text x="505" y="14" fontSize="9" fill="#6b7280" fontFamily="Inter">forecast →</text>
              </svg>
            </div>
            <div className="row" style={{ marginTop: 8, fontSize: 10, gap: 14 }}>
              {[['#3b5bdb', 'Sumatera'], ['#2f8a4e', 'Kalimantan'], ['#b58200', 'Java'], ['#d97757', 'Papua']].map(([c, l]) => (
                <span key={l} className="row" style={{ gap: 4 }}>
                  <span style={{ width: 14, height: 0, borderTop: `2px solid ${c}` }}></span> {l}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="wf" style={{ padding: 12 }}>
              <div className="h3" style={{ marginBottom: 8 }}>Scatter: Reserves vs Production</div>
              <div style={{ height: 140, position: 'relative', borderLeft: '1.2px solid var(--line-soft)', borderBottom: '1.2px solid var(--line-soft)' }}>
                <svg viewBox="0 0 400 140" style={{ width: '100%', height: '100%' }}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <circle key={i}
                      cx={20 + (i * 17) % 360 + (i % 5) * 6}
                      cy={20 + ((i * 31) % 100) + (i % 3) * 5}
                      r={3 + (i % 4)}
                      fill={['#3b5bdb', '#2f8a4e', '#b58200', '#d97757'][i % 4]}
                      opacity=".7" />
                  ))}
                </svg>
              </div>
            </div>
            <div className="wf" style={{ padding: 12 }}>
              <div className="h3" style={{ marginBottom: 8 }}>Top Fields by Output</div>
              {['Rokan', 'Mahakam', 'ONWJ', 'Cepu', 'Tangguh', 'Senipah'].map((f, i) => (
                <div key={f} className="row" style={{ padding: '4px 0', fontSize: 11 }}>
                  <span style={{ width: 80 }}>{f}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--fill)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: (90 - i * 12) + '%', height: '100%', background: 'var(--accent)' }}></div>
                  </div>
                  <span style={{ width: 60, textAlign: 'right', fontWeight: 600, fontSize: 11 }}>{180 - i * 25}k BOPD</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* AI insight rail */}
        <aside style={{ width: 250, borderLeft: '1.4px solid var(--line-soft)', padding: 'var(--pad)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="row">
            <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent), #7b91ed)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</span>
            <div className="h3">AI Insights</div>
          </div>
          {[
            { tag: 'Anomali', c: 'var(--red)', t: 'Penurunan produksi 12% di WK Mahakam selama 2 minggu terakhir' },
            { tag: 'Korelasi', c: 'var(--accent)', t: 'Aktivitas rig naik di Sumatera berkorelasi r=0.86 dengan submission seismic baru' },
            { tag: 'Forecast', c: 'var(--green)', t: 'Estimasi produksi nasional Q3 2026: ~768k BOPD (±3.2%)' },
            { tag: 'Tip', c: 'var(--amber)', t: 'Coba bandingkan Decline Rate vs Workover Activity untuk WKs Tier-2' },
          ].map((it, i) => (
            <div key={i} className="wf wf-soft" style={{ padding: 10 }}>
              <span className="pill" style={{ fontSize: 9, borderColor: it.c, color: it.c, marginBottom: 4 }}>{it.tag}</span>
              <div style={{ fontSize: 11, lineHeight: 1.4, marginTop: 4 }}>{it.t}</div>
              <div className="row" style={{ marginTop: 6, gap: 6 }}>
                <span className="pill ghost" style={{ fontSize: 9 }}>👍</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>Open chart</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>Dismiss</span>
              </div>
            </div>
          ))}
          <div className="wf wf-dashed" style={{ padding: 8, fontSize: 11 }}>
            <div className="cap">ASK</div>
            <div className="dim" style={{ fontSize: 10, marginTop: 4 }}>"Bandingkan produksi Mahakam vs Rokan tahun ini"</div>
          </div>
        </aside>
      </div>
      <KeyBand />
    </Page>
  );
}

// Variant B: Query builder top + visualization canvas
function AnalyticsB() {
  return (
    <Page screenLabel="04 Analytics · B · Query builder canvas">
      <TopNav active="ANALYTICS" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Analytics — Query Builder</div>
            <div className="dim" style={{ fontSize: 11 }}>Susun query lintas dataset · drag & drop · jalankan tanpa SQL</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill ghost">My Saved (12) ⏷</span>
            <span className="btn">↻ Reset</span>
            <span className="btn primary">▶ Run query</span>
          </div>
        </div>

        {/* Query builder */}
        <div className="wf" style={{ padding: 14 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="cap" style={{ alignSelf: 'center' }}>FROM</span>
            <span className="pill active">Wells</span>
            <span className="pill ghost">+ join</span>
            <span className="cap" style={{ alignSelf: 'center', marginLeft: 8 }}>WHERE</span>
            <span className="pill ghost">region = Sumatera</span>
            <span className="pill ghost">status = Producing</span>
            <span className="pill ghost">drilled_at &gt; 2020-01-01</span>
            <span className="pill ghost">+ filter</span>
            <span className="cap" style={{ alignSelf: 'center', marginLeft: 8 }}>GROUP BY</span>
            <span className="pill ghost">operator</span>
            <span className="cap" style={{ alignSelf: 'center', marginLeft: 8 }}>SELECT</span>
            <span className="pill active">count(well_id)</span>
            <span className="pill active">avg(production_bopd)</span>
            <span className="pill ghost">+ metric</span>
          </div>
          <div className="divider" style={{ margin: '10px 0' }}></div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="annotation">≈ 1,842 rows matched · est. 0.6s</span>
            <div className="row" style={{ gap: 6 }}>
              <span className="pill ghost">Preview rows</span>
              <span className="pill ghost">View SQL</span>
            </div>
          </div>
        </div>

        {/* Visualization canvas */}
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 240px', gap: 10, flex: 1, minHeight: 0 }}>
          {/* Viz type picker */}
          <div className="wf" style={{ padding: 10 }}>
            <div className="cap" style={{ marginBottom: 8 }}>CHART TYPE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {['Bar', 'Line', 'Area', 'Pie', 'Scatter', 'Heatmap', 'Map', 'KPI'].map((t, i) => (
                <div key={t} className={'wf ' + (i === 0 ? '' : 'wf-soft')} style={{
                  padding: '8px 4px', fontSize: 10, textAlign: 'center', cursor: 'pointer',
                  background: i === 0 ? 'var(--accent-soft)' : 'transparent',
                  borderColor: i === 0 ? 'var(--accent)' : 'var(--line-soft)',
                  color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)', fontWeight: 600
                }}>
                  <div style={{ height: 22, marginBottom: 4 }}>
                    {/* tiny pictogram */}
                    {t === 'Bar' && '▮▮▮'}
                    {t === 'Line' && '╱╲╱'}
                    {t === 'Area' && '▲▼'}
                    {t === 'Pie' && '◔'}
                    {t === 'Scatter' && '∴'}
                    {t === 'Heatmap' && '▦'}
                    {t === 'Map' && '◖◗'}
                    {t === 'KPI' && '123'}
                  </div>
                  {t}
                </div>
              ))}
            </div>
            <div className="divider"></div>
            <div className="cap" style={{ marginBottom: 6 }}>ENCODINGS</div>
            {[['X', 'operator'], ['Y', 'avg(prod)'], ['Color', 'region'], ['Size', '—']].map(([k, v]) => (
              <div key={k} className="row" style={{ fontSize: 10.5, padding: '3px 0' }}>
                <span className="dim" style={{ width: 32 }}>{k}</span>
                <span className="pill ghost" style={{ fontSize: 9, flex: 1 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="wf" style={{ padding: 14, display: 'flex', flexDirection: 'column' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="h3">Wells Producing — by Operator (Sumatera)</div>
              <div className="row" style={{ gap: 4 }}>
                <span className="pill ghost" style={{ fontSize: 9 }}>↕ swap axes</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>sort: value ⏷</span>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 220, marginTop: 10, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: '100%', borderBottom: '1.2px solid var(--line-soft)', borderLeft: '1.2px solid var(--line-soft)', paddingLeft: 30, paddingBottom: 24 }}>
                {[['PHM', 92], ['PHE', 78], ['Medco', 64], ['PSN', 52], ['Harbour', 41], ['Mubadala', 30], ['Others', 22]].map(([n, h]) => (
                  <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>{Math.round(h * 12)}</span>
                    <div style={{ width: '70%', height: h + '%', background: 'var(--accent)', borderRadius: '3px 3px 0 0' }}></div>
                    <span style={{ fontSize: 10, color: 'var(--ink-soft)' }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right notes */}
          <div className="wf" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="h3">Notes & share</div>
            <div className="wf wf-dashed" style={{ padding: 8, fontFamily: 'Caveat, cursive', fontSize: 13, color: 'var(--ink-soft)' }}>
              "Tabel ini buat presentasi Senin. Pakai data per provider, group operator >5 wells."
            </div>
            <div className="cap">SHARED WITH</div>
            <div className="row">
              <span className="avatar">AB</span><span className="avatar">CD</span><span className="avatar">EF</span>
              <span className="pill ghost" style={{ fontSize: 9 }}>+ invite</span>
            </div>
            <div className="cap">EXPORT</div>
            <div className="col" style={{ gap: 4 }}>
              <span className="pill ghost">↓ CSV</span>
              <span className="pill ghost">↓ PNG</span>
              <span className="pill ghost">↓ Embed code</span>
              <span className="pill ghost">↓ Save to Workspace</span>
            </div>
            <div className="cap">AI HELP</div>
            <div className="wf" style={{ padding: 8, borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}>
              <div style={{ fontSize: 11 }}>"Apakah ada outlier?" — AI menemukan 2 operator dengan production/well 3× rata-rata.</div>
            </div>
          </div>
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { AnalyticsA, AnalyticsB });
