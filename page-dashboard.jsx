// Dashboard — 2 variants

// Variant A: KPI cards top + charts grid + activity feed sidebar
function DashboardA() {
  return (
    <Page screenLabel="03 Dashboard · A · KPI grid + activity">
      <TopNav active="DASHBOARD" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Dashboard</div>
            <div className="dim" style={{ fontSize: 'var(--text-sm)' }}>Ringkasan ekosistem data — diperbarui 2 menit lalu</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill ghost">Period: 30 hari ⏷</span>
            <span className="pill ghost">Provider: Semua ⏷</span>
            <span className="btn">↓ Export</span>
            <span className="btn primary">+ New report</span>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            ['Total Datasets', '2,452', '+128 / 30d', 'var(--accent)'],
            ['Active Providers', '145', '+6 / 30d', 'var(--green)'],
            ['API Calls', '1.24M', '+12.3% MoM', 'var(--amber)'],
            ['Data Availability', '98.2%', 'SLA 99%', 'var(--accent)'],
          ].map(([l, v, d, c]) => (
            <div key={l} className="wf" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="cap">{l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: c, letterSpacing: -.5 }}>{v}</div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="dim" style={{ fontSize: 10 }}>{d}</span>
                <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>▲</span>
              </div>
              <div className="spark" style={{ marginTop: 4 }}></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, flex: 1, minHeight: 0 }}>
          {/* Big chart */}
          <div className="wf" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="h3">Data Submissions per Provider</div>
              <div className="row" style={{ gap: 4 }}>
                <span className="pill active" style={{ fontSize: 9 }}>30d</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>90d</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>1y</span>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 180, position: 'relative', borderBottom: '1.2px solid var(--line-soft)', borderLeft: '1.2px solid var(--line-soft)' }}>
              <div className="bars" style={{ height: '100%', paddingTop: 10 }}>
                {[60, 45, 80, 70, 90, 55, 65, 75, 85, 50, 95, 70, 60, 80, 45, 70, 88, 92, 65, 78].map((h, i) => (
                  <b key={i} style={{ height: h + '%' }}></b>
                ))}
              </div>
              <div style={{ position: 'absolute', left: -2, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-mute)', padding: '4px 0' }}>
                <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-mute)' }}>
              {['1', '5', '10', '15', '20', '25', '30'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Donut / categories */}
          <div className="wf" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="h3">Datasets by Category</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'conic-gradient(#3b5bdb 0 28%, #2f8a4e 28% 50%, #b58200 50% 68%, #d97757 68% 82%, #8a6db0 82% 100%)',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', inset: 22, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>2,452</div>
              </div>
              <div className="col" style={{ gap: 4, fontSize: 11 }}>
                {[['Seismic', '28%', '#3b5bdb'], ['Well', '22%', '#2f8a4e'], ['Admin', '18%', '#b58200'], ['Infra', '14%', '#d97757'], ['Other', '18%', '#8a6db0']].map(([n, p, c]) => (
                  <div key={n} className="row" style={{ gap: 5 }}>
                    <span style={{ width: 8, height: 8, background: c, borderRadius: 1 }}></span>
                    <span>{n}</span><span style={{ marginLeft: 'auto', color: 'var(--ink-mute)' }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div className="wf" style={{ padding: 12 }}>
            <div className="h3" style={{ marginBottom: 6 }}>Top Providers</div>
            {[['PHM', 245, 95], ['PHE ONWJ', 183, 78], ['PSN', 167, 65], ['Medco E&P', 142, 55], ['Harbour Energy', 96, 38]].map(([n, c, w]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 11 }}>
                <span style={{ width: 90 }}>{n}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--fill)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: w + '%', height: '100%', background: 'var(--accent)' }}></div>
                </div>
                <span style={{ width: 30, textAlign: 'right', fontWeight: 600 }}>{c}</span>
              </div>
            ))}
          </div>

          <div className="wf" style={{ padding: 12 }}>
            <div className="h3" style={{ marginBottom: 6 }}>Data Quality</div>
            <div className="col" style={{ gap: 6 }}>
              {[['Completeness', 98, 'var(--green)'], ['Accuracy', 94, 'var(--green)'], ['Timeliness', 86, 'var(--amber)'], ['Consistency', 91, 'var(--green)']].map(([n, v, c]) => (
                <div key={n}>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                    <span>{n}</span><span style={{ fontWeight: 700 }}>{v}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--fill)', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
                    <div style={{ width: v + '%', height: '100%', background: c }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wf" style={{ padding: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="h3">Recent Activity</div>
              <span className="pill ghost" style={{ fontSize: 9 }}>view all</span>
            </div>
            {[
              ['PHE ONWJ', 'submitted', 'WK Boundary v3', '2m ago'],
              ['SKK Migas', 'approved', 'PSC Doc Rokan', '12m ago'],
              ['Medco E&P', 'updated', 'Seismic 3D Sumatera', '1h ago'],
              ['PHM', 'submitted', 'Well Locations Q4', '3h ago'],
              ['PSN', 'verified', 'Pipeline Network', '5h ago'],
            ].map(([who, act, what, when], i) => (
              <div key={i} className="row" style={{ padding: '4px 0', fontSize: 10.5, borderTop: i ? '1px dashed var(--line-soft)' : 0, gap: 6 }}>
                <span className="avatar" style={{ width: 18, height: 18, fontSize: 7 }}>{who.slice(0, 2)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div><b>{who}</b> <span className="dim">{act}</span> <b>{what}</b></div>
                  <div className="dim" style={{ fontSize: 9 }}>{when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

// Variant B: Hero KPI + tab sections (more editorial)
function DashboardB() {
  return (
    <Page screenLabel="03 Dashboard · B · Hero + tabbed sections">
      <TopNav active="DASHBOARD" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
        {/* Hero KPI */}
        <div className="wf" style={{ padding: 18, background: 'linear-gradient(135deg, #0a1a3a 0%, #1d3a8a 100%)', color: '#fff', border: 0, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ fontSize: 10, letterSpacing: 1, opacity: .7 }}>EKOSISTEM ALASBUANA · LIVE</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, marginTop: 4 }}>2,452 datasets</div>
            <div style={{ fontSize: 12, opacity: .8 }}>dari 145 provider · disubmit dalam 30 hari terakhir: 128 (+5.5%)</div>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 18 }}>
            {[['Wells', '24,184'], ['Pipelines', '1,860 km'], ['Active WKs', '142'], ['API Calls /day', '41k']].map(([l, v]) => (
              <div key={l} style={{ flex: 1 }}>
                <div style={{ fontSize: 10, opacity: .65, letterSpacing: .6, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
                <div style={{ height: 22, background: 'rgba(255,255,255,.08)', borderTop: '1.4px solid rgba(255,255,255,.4)', marginTop: 4, clipPath: 'polygon(0 60%, 20% 40%, 40% 55%, 60% 25%, 80% 35%, 100% 15%, 100% 100%, 0 100%)' }}></div>
              </div>
            ))}
          </div>
          <div className="btn" style={{ background: '#fff', color: '#0a1a3a', border: 0 }}>View live map →</div>
        </div>

        <div className="row" style={{ gap: 0, borderBottom: '1.4px solid var(--line-soft)' }}>
          {['Ringkasan', 'Submissions', 'Quality', 'Usage', 'Compliance', 'Saved Views'].map((t, i) => (
            <span key={t} style={{
              padding: '10px 16px', fontSize: 12, fontWeight: 600,
              borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)', cursor: 'pointer'
            }}>{t}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="wf" style={{ padding: 14 }}>
            <div className="h3" style={{ marginBottom: 8 }}>Submission Trend</div>
            <div style={{ height: 160, position: 'relative', borderBottom: '1.2px solid var(--line-soft)' }}>
              <svg viewBox="0 0 400 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <path d="M0 140 L40 120 L80 130 L120 100 L160 110 L200 80 L240 90 L280 60 L320 70 L360 40 L400 50 L400 160 L0 160 Z"
                  fill="var(--accent-soft)" />
                <path d="M0 140 L40 120 L80 130 L120 100 L160 110 L200 80 L240 90 L280 60 L320 70 L360 40 L400 50"
                  fill="none" stroke="var(--accent)" strokeWidth="2" />
                <path d="M0 150 L40 140 L80 135 L120 130 L160 120 L200 115 L240 105 L280 100 L320 95 L360 85 L400 75"
                  fill="none" stroke="var(--green)" strokeWidth="2" strokeDasharray="4 3" />
              </svg>
            </div>
            <div className="row" style={{ marginTop: 6, fontSize: 10, gap: 12 }}>
              <span><span style={{ display: 'inline-block', width: 12, borderTop: '2px solid var(--accent)', verticalAlign: 'middle' }}></span> New datasets</span>
              <span><span style={{ display: 'inline-block', width: 12, borderTop: '2px dashed var(--green)', verticalAlign: 'middle' }}></span> Approvals</span>
            </div>
          </div>

          <div className="wf" style={{ padding: 14 }}>
            <div className="h3" style={{ marginBottom: 8 }}>Geographic Coverage</div>
            <div style={{ height: 160, position: 'relative' }}>
              <MapBlock withLayers={false} withBasemap={false} withCoords={false} />
            </div>
            <div className="row" style={{ marginTop: 6, fontSize: 11, justifyContent: 'space-between' }}>
              <span><b>87%</b> wilayah RI tercover</span>
              <span className="dim">98% di Sumatera · 92% di Kalimantan · 65% di Papua</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { t: 'Pending Approvals', n: '14', s: '4 high priority', c: 'var(--amber)', list: ['WK Boundary update — Rokan', 'PSC Document — Mahakam', 'Pipeline addition — Trans-Java'] },
            { t: 'Quality Issues', n: '7', s: '2 critical', c: 'var(--red)', list: ['Missing CRS on Well-Survey-12', 'Stale data: Seismic 2D Java', 'Schema mismatch on 4 layers'] },
            { t: 'AI Insights', n: '3 new', s: 'this week', c: 'var(--accent)', list: ['Production drop in WK Mahakam', '8 sumur expired permit', 'New data correlates w/ rig activity'] },
          ].map(card => (
            <div key={card.t} className="wf" style={{ padding: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="cap">{card.t}</div>
                <span style={{ fontSize: 20, fontWeight: 800, color: card.c }}>{card.n}</span>
              </div>
              <div className="dim" style={{ fontSize: 10, marginBottom: 6 }}>{card.s}</div>
              {card.list.map((x, i) => (
                <div key={i} className="row" style={{ fontSize: 11, padding: '3px 0', borderTop: i ? '1px dashed var(--line-soft)' : 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: card.c, flex: '0 0 auto' }}></span>
                  <span style={{ flex: 1 }}>{x}</span>
                  <span style={{ color: 'var(--ink-mute)' }}>›</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { DashboardA, DashboardB });
