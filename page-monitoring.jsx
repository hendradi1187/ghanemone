// Monitoring — 2 variants
// Data pipeline status, ingestion jobs, audit log, alerts.

function MonitoringA() {
  const jobs = [
    ['Harvest · WK Boundary PHE ONWJ',   'PHE ONWJ',     'Running',  '04:12',  '78%',  'ok'],
    ['Sync · Well Headers PHM',          'PHM',          'Success',  '12 min', '100%', 'ok'],
    ['Validation · Seismic 3D N.Sum',    'Medco E&P',    'Warning',  '8 min',  '92%',  'warn'],
    ['Publish · PSC Doc Rokan',          'SKK Migas',    'Queued',   '—',      '0%',   'idle'],
    ['Harvest · Pipeline Network',       'PHE',          'Failed',   '32 min', '64%',  'err'],
    ['Sync · Facility Inventory',        'PHE ONWJ',     'Success',  '1 hr',   '100%', 'ok'],
    ['Validation · WK Topology',         'PSN',          'Running',  '01:48',  '34%',  'ok'],
    ['Audit · Access Log Daily',         'System',       'Success',  '6 hr',   '100%', 'ok'],
  ];
  const statusColor = { ok: 'verified', warn: 'amber', err: 'red', idle: 'ghost' };

  return (
    <Page screenLabel="07 Monitoring · A · Ops dashboard">
      <TopNav active="MONITORING" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Monitoring</div>
            <div className="dim" style={{ fontSize: 'var(--text-sm)' }}>
              Status ingestion, validasi & publikasi data di seluruh ekosistem SPEKTRUM
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill ghost">Range: 24 jam ⏷</span>
            <span className="pill ghost">Provider: Semua ⏷</span>
            <span className="btn">⟳ Refresh</span>
            <span className="btn primary">⚙ Configure alerts</span>
          </div>
        </div>

        {/* Health strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {[
            ['System Health',   '98.4%',   'SLA 99%',           'var(--green)', 'ok'],
            ['Active Jobs',     '12',      '3 running · 9 queued', 'var(--accent)', 'ok'],
            ['Failed (24h)',    '4',       '↑ 2 vs kemarin',     'var(--red)',    'err'],
            ['Warnings',        '9',       '↓ 3 vs kemarin',     'var(--amber)',  'warn'],
            ['Data Freshness',  '6 min',   'avg lag',            'var(--accent)', 'ok'],
          ].map(([l, v, d, c, s]) => (
            <div key={l} className="wf" style={{ padding: 12, position: 'relative' }}>
              <div className="cap">{l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.4, color: c }}>{v}</div>
              <div className="dim" style={{ fontSize: 10 }}>{d}</div>
              <span className={'pill ' + statusColor[s]} style={{ position: 'absolute', top: 8, right: 8, fontSize: 8.5, padding: '1px 6px' }}>●</span>
            </div>
          ))}
        </div>

        {/* Two-column: pipelines + alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, flex: 1, minHeight: 380 }}>
          {/* Pipelines */}
          <div className="wf" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="row" style={{ padding: '10px 12px', borderBottom: '1.4px solid var(--line-soft)', justifyContent: 'space-between' }}>
              <div className="h3">Active Pipelines</div>
              <div className="row" style={{ gap: 6 }}>
                <span className="pill ghost" style={{ fontSize: 10 }}>Filter ⏷</span>
                <span className="pill ghost" style={{ fontSize: 10 }}>Sort: Latest ⏷</span>
              </div>
            </div>
            <div style={{ overflow: 'auto', padding: '4px 12px 8px' }}>
              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', fontSize: 9.5, letterSpacing: .5 }}>
                    {['Job', 'Provider', 'Status', 'Duration', 'Progress', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(([n, p, s, d, pr, st], i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)', fontWeight: 600 }}>{n}</td>
                      <td style={{ padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)' }}>{p}</td>
                      <td style={{ padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)' }}>
                        <span className={'pill ' + statusColor[st]} style={{ fontSize: 9 }}>● {s}</span>
                      </td>
                      <td style={{ padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)', fontFamily: 'JetBrains Mono, monospace' }}>{d}</td>
                      <td style={{ padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)', width: 120 }}>
                        <div style={{ height: 6, background: 'var(--fill-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: pr, height: '100%', background: st === 'err' ? 'var(--red)' : st === 'warn' ? 'var(--amber)' : 'var(--green)' }}></div>
                        </div>
                        <div className="dim" style={{ fontSize: 9, marginTop: 2 }}>{pr}</div>
                      </td>
                      <td style={{ padding: '7px 4px', borderBottom: '1px dashed var(--line-soft)' }}>
                        <span className="pill ghost" style={{ fontSize: 9 }}>View log ›</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts */}
          <div className="wf" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="row" style={{ padding: '10px 12px', borderBottom: '1.4px solid var(--line-soft)', justifyContent: 'space-between' }}>
              <div className="h3">Recent Alerts</div>
              <span className="pill ghost" style={{ fontSize: 10 }}>Mark all read</span>
            </div>
            <div style={{ overflow: 'auto', padding: '6px 12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['err',  'Pipeline harvest gagal',           'Pipeline Network · PHE',          '4 min lalu'],
                ['warn', 'Skema metadata berubah',           'Well Headers PHM',                '12 min lalu'],
                ['warn', 'Latency tinggi (>1.5s)',           'Connector PHE ONWJ',              '32 min lalu'],
                ['ok',   'Job validation selesai',           'WK Topology PSN',                 '1 jam lalu'],
                ['err',  'SLA breach — 99% turun ke 97.8%',  'System Health',                   '2 jam lalu'],
                ['warn', 'Disk usage > 80%',                 'Spatial Index Cluster',           '3 jam lalu'],
              ].map(([s, t, src, time], i) => (
                <div key={i} className="row" style={{ alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: '1px dashed var(--line-soft)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, background: s === 'err' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : 'var(--green)', flex: '0 0 auto' }}></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 11.5 }}>{t}</div>
                    <div className="dim" style={{ fontSize: 10 }}>{src} · {time}</div>
                  </div>
                  <span className="pill ghost" style={{ fontSize: 9 }}>Resolve</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit log strip */}
        <div className="wf" style={{ padding: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="h3">Audit Log <span className="dim">(last 24h)</span></div>
            <span className="pill ghost" style={{ fontSize: 10 }}>Export CSV</span>
          </div>
          <div className="row" style={{ gap: 14, flexWrap: 'wrap', fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-soft)' }}>
            {[
              '12:48  ahmad@pertamina  publish  WK_ONWJ_2024.shp',
              '12:31  budi@medco       upload   seismic_3d_nsumatra.segy (2.4 GB)',
              '12:15  system           validate well_headers_phm.csv  → OK',
              '11:52  citra@skkmigas   approve  PSC_Rokan_2024.pdf',
              '11:34  system           harvest  PHE ONWJ connector  → 128 rows',
              '11:02  dewi@phe         download WK_Boundary_ONWJ.geojson',
            ].map(l => <div key={l} style={{ flex: '0 0 calc(50% - 7px)' }}>›  {l}</div>)}
          </div>
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

// Variant B: Timeline + system topology
function MonitoringB() {
  return (
    <Page screenLabel="07 Monitoring · B · Timeline + Topology">
      <TopNav active="MONITORING" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="h1">Monitoring · Live</div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill verified">● Live</span>
            <span className="pill ghost">Last 6 hours ⏷</span>
            <span className="btn">⚙ Settings</span>
          </div>
        </div>

        {/* Topology */}
        <div className="wf" style={{ padding: 14, position: 'relative', minHeight: 200 }}>
          <div className="cap" style={{ marginBottom: 10 }}>SYSTEM TOPOLOGY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'center' }}>
            {[
              ['KKKS', '8 / 8',  'ok'],
              ['Connectors', '8 / 8', 'ok'],
              ['Dataspace', '1 / 1', 'warn'],
              ['Governance', '1 / 1', 'ok'],
              ['Consumption', '5 / 5', 'ok'],
            ].map(([n, c, s], i, arr) => (
              <React.Fragment key={n}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    margin: '0 auto 6px', width: 56, height: 56,
                    border: '1.6px solid var(--line)', borderRadius: 8,
                    background: s === 'ok' ? 'var(--green-soft)' : 'var(--amber-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: s === 'ok' ? 'var(--green)' : 'var(--amber)'
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{n}</div>
                  <div className="dim" style={{ fontSize: 10 }}>{c} healthy</div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="dim" style={{ fontSize: 10, marginTop: 10, textAlign: 'center' }}>
            ↔ flow diagram, animated when live — 1.24M req · 4 alerts active
          </div>
        </div>

        {/* Timeline */}
        <div className="wf" style={{ padding: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="h3">Event Timeline</div>
            <div className="row" style={{ gap: 4 }}>
              {['All', 'Errors', 'Warnings', 'Info'].map((t, i) => (
                <span key={t} className={'pill ' + (i === 0 ? 'active' : 'ghost')} style={{ fontSize: 10 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', marginTop: 12, paddingLeft: 16 }}>
            <div style={{ position: 'absolute', left: 5, top: 4, bottom: 0, width: 2, background: 'var(--line-soft)' }}></div>
            {[
              ['12:48',  'err',  'Pipeline harvest failed — Pipeline Network (PHE)',           'auto-retry in 5 min'],
              ['12:31',  'warn', 'Metadata schema drift detected — Well Headers PHM',          'review required'],
              ['12:15',  'ok',   'Validation OK — Well Headers PHM (256 records)',             ''],
              ['11:52',  'ok',   'Document approved — PSC_Rokan_2024.pdf',                    'by citra@skkmigas'],
              ['11:34',  'ok',   'Harvest complete — PHE ONWJ connector (128 rows)',           ''],
              ['11:02',  'info', 'Download — WK_Boundary_ONWJ.geojson by dewi@phe',            ''],
              ['10:48',  'warn', 'Latency spike on Connector PHE ONWJ — peak 1.8s',            'resolved auto'],
              ['10:12',  'ok',   'Job queued — Sync Facility Inventory',                       ''],
            ].map(([t, s, msg, sub], i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: 14, paddingLeft: 18 }}>
                <span style={{
                  position: 'absolute', left: -3, top: 4, width: 12, height: 12, borderRadius: '50%',
                  background: '#fff', border: '2px solid ' + (s === 'err' ? 'var(--red)' : s === 'warn' ? 'var(--amber)' : s === 'ok' ? 'var(--green)' : 'var(--accent)'),
                }}></span>
                <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--ink-mute)' }}>{t}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 600 }}>{msg}</span>
                  {sub && <span className="dim" style={{ fontSize: 10 }}>· {sub}</span>}
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

Object.assign(window, { MonitoringA, MonitoringB });
