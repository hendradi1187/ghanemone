// AlasBuana Hi-Fi — Dashboard, Detail Dataset, Monitoring, Design System showcase

// ─────────────────────────────────────────────────────────────
// HF · Dashboard
// ─────────────────────────────────────────────────────────────
function HfDashboard() {
  return (
    <HfPage screenLabel="HF 02 · Dashboard">
      <HfTopNav active="DASHBOARD" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--hf-bg)' }}>
        {/* Header */}
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="row" style={{ gap: 8 }}>
              <span className="cap" style={{ color: 'var(--hf-green-700)' }}>Live · diperbarui 2 menit lalu</span>
              <span className="status-dot" style={{ background: 'var(--hf-green-500)' }}></span>
            </div>
            <div className="h1" style={{ marginTop: 2 }}>Dashboard</div>
            <div className="body">Ringkasan ekosistem data — semua KKKS terhubung melalui SPEKTRUM Dataspace.</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn sm"><Icon name="clock" size={12} /> Period: 30 hari <Icon name="chevron" size={11} /></button>
            <button className="btn sm"><Icon name="user" size={12} /> Provider: Semua <Icon name="chevron" size={11} /></button>
            <button className="btn sm"><Icon name="download" size={12} /> Export</button>
            <button className="btn primary sm"><Icon name="plus" size={12} color="#fff" /> New report</button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <HfKpi label="Total Datasets" value="2,452" delta="+128" sub="vs 30d ago" icon="database" />
          <HfKpi label="Active Providers" value="145" delta="+6" sub="vs 30d ago" icon="user" />
          <HfKpi label="API Calls (30d)" value="1.24M" delta="+12.3%" sub="MoM" icon="bolt" color="var(--hf-blue-500)" />
          <HfKpi label="Data Availability" value="98.2%" delta="+0.4%" sub="SLA 99%" icon="shield" color="var(--hf-amber-500)" />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
          {/* Big chart */}
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="h3">Data Activity</div>
                <div className="sm">Datasets added, accessed, and validated per day</div>
              </div>
              <div className="row" style={{ gap: 4 }}>
                {['7d', '30d', '90d', '1y'].map((p, i) => (
                  <span key={p} className={'pill ' + (i === 1 ? 'green' : 'ghost')} style={{ cursor: 'pointer' }}>{p}</span>
                ))}
              </div>
            </div>
            <div className="row" style={{ gap: 18, marginBottom: 8 }}>
              <div>
                <div className="num display" style={{ fontSize: 30 }}>+128</div>
                <div className="row" style={{ gap: 6 }}>
                  <span className="pill green dot">+12% MoM</span>
                  <span className="xs">datasets added</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <HfSpark height={64} />
              </div>
            </div>
            <div className="divider" style={{ margin: '12px -4px' }}></div>
            <div className="row" style={{ gap: 28, fontSize: 11, color: 'var(--hf-ink-3)' }}>
              <div className="row" style={{ gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--hf-green-500)' }}></span>
                Added <b className="num" style={{ color: 'var(--hf-ink)' }}>128</b>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--hf-blue-500)' }}></span>
                Accessed <b className="num" style={{ color: 'var(--hf-ink)' }}>32.4K</b>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--hf-amber-500)' }}></span>
                Validated <b className="num" style={{ color: 'var(--hf-ink)' }}>1,082</b>
              </div>
              <div className="row" style={{ gap: 6, marginLeft: 'auto' }}>
                <Icon name="arrowUpRight" size={12} color="var(--hf-blue-600)" />
                <a style={{ color: 'var(--hf-blue-600)', fontWeight: 600 }}>View in Analytics</a>
              </div>
            </div>
          </div>

          {/* Composition donut */}
          <div className="card" style={{ padding: 18 }}>
            <div className="h3">Data Composition</div>
            <div className="sm">By data type</div>
            <div className="row" style={{ marginTop: 14, gap: 18, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <HfDonut size={130} thickness={18} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>2,452</span>
                  <span className="xs">Total</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {[
                  ['Layers',    1832, 75, 'var(--hf-green-500)'],
                  ['Documents', 412,  17, 'var(--hf-blue-500)'],
                  ['Maps',       96,   4, 'var(--hf-amber-500)'],
                  ['Apps',       24,   1, 'var(--hf-purple-500)'],
                  ['Tabular',    88,   3, 'var(--hf-red-500)'],
                ].map(([l, v, p, c]) => (
                  <div key={l} className="row" style={{ fontSize: 11.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c }}></span>
                    <span style={{ flex: 1, color: 'var(--hf-ink-2)' }}>{l}</span>
                    <span className="num" style={{ fontWeight: 600 }}>{v.toLocaleString()}</span>
                    <span className="num" style={{ color: 'var(--hf-ink-4)', minWidth: 32, textAlign: 'right' }}>{p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {/* Top providers */}
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="h3">Top Providers</div>
              <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>See all →</a>
            </div>
            {[
              ['Pertamina Hulu Mahakam',  'PHM',  245, 78, 'var(--hf-green-500)'],
              ['PHE ONWJ',                 'PH',  183, 62, 'var(--hf-amber-500)'],
              ['Pertamina Subsurface',    'PSN',  167, 56, 'var(--hf-blue-500)'],
              ['Medco E&P',                'ME',  142, 48, 'var(--hf-blue-500)'],
              ['Harbour Energy',           'HE',   96, 32, 'var(--hf-purple-500)'],
            ].map(([n, init, c, w, color]) => (
              <div key={init} style={{ padding: '8px 0', borderBottom: '1px solid var(--hf-line)' }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="avatar sm" style={{ background: 'transparent', borderColor: color, color: color }}>{init}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{n}</span>
                  <span className="num" style={{ fontWeight: 600 }}>{c}</span>
                </div>
                <div style={{ height: 4, background: 'var(--hf-surface-3)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                  <div style={{ width: w + '%', height: '100%', background: color }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="h3">Recent Activity</div>
              <span className="pill green dot">Live</span>
            </div>
            {[
              ['PH', 'PHE ONWJ', 'published', 'WK Boundary 2024', '4m'],
              ['ME', 'Medco E&P', 'uploaded', 'Seismic 3D N.Sumatra', '12m'],
              ['SM', 'SKK Migas', 'approved', 'PSC Doc Rokan', '34m'],
              ['PHM', 'PHM', 'updated', 'Well Headers Q3', '1h'],
              ['PH', 'PHE ONWJ', 'commented', 'on Facility Inventory', '2h'],
              ['ME', 'Medco E&P', 'downloaded', 'WK Boundary ONWJ', '3h'],
            ].map(([init, who, verb, what, time], i) => (
              <div key={i} className="row" style={{ padding: '7px 0', borderBottom: '1px solid var(--hf-line)', gap: 8 }}>
                <span className="avatar sm" style={{ background: 'var(--hf-surface-3)', color: 'var(--hf-ink-3)', borderColor: 'var(--hf-line-2)' }}>{init}</span>
                <div style={{ flex: 1, fontSize: 11.5 }}>
                  <span style={{ fontWeight: 600 }}>{who}</span>{' '}
                  <span className="muted">{verb}</span>{' '}
                  <span style={{ color: 'var(--hf-blue-600)' }}>{what}</span>
                </div>
                <span className="xs">{time}</span>
              </div>
            ))}
          </div>

          {/* Compliance / system */}
          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="h3">Health Overview</div>
              <span className="pill green dot">All systems normal</span>
            </div>

            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="cap">Compliance</div>
                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                  <div className="num display" style={{ fontSize: 28 }}>96<span style={{ fontSize: 16, color: 'var(--hf-ink-4)' }}>%</span></div>
                  <span className="pill green dot">+2.4%</span>
                </div>
                <div className="xs">avg KKKS · 30d</div>
              </div>
              <div style={{ width: 1, background: 'var(--hf-line)' }}></div>
              <div style={{ flex: 1 }}>
                <div className="cap">Avg Approval</div>
                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                  <div className="num display" style={{ fontSize: 28 }}>2.4<span style={{ fontSize: 16, color: 'var(--hf-ink-4)' }}>d</span></div>
                  <span className="pill green dot">SLA 3d</span>
                </div>
                <div className="xs">avg approval time</div>
              </div>
            </div>

            <div className="divider" style={{ margin: '14px -4px' }}></div>

            <div className="cap" style={{ marginBottom: 6 }}>System Status</div>
            {[
              ['Dataspace Connector',  'ok'],
              ['Metadata Broker',      'ok'],
              ['Governance Engine',    'ok'],
              ['Spatial Index',        'warn'],
              ['AI Assistant',         'ok'],
            ].map(([n, s]) => (
              <div key={n} className="row" style={{ padding: '4px 0', fontSize: 11.5 }}>
                <span className="status-dot" style={{ background: s === 'ok' ? 'var(--hf-green-500)' : 'var(--hf-amber-500)' }}></span>
                <span style={{ flex: 1 }}>{n}</span>
                <span className="num" style={{ color: 'var(--hf-ink-4)' }}>{s === 'ok' ? '99.9%' : '97.8%'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Detail Dataset (drill-down)
// ─────────────────────────────────────────────────────────────
function HfDetail() {
  return (
    <HfPage screenLabel="HF 03 · Detail Dataset">
      <HfTopNav active="EXPLORE DATA" />

      {/* Breadcrumb */}
      <div className="row" style={{
        padding: '10px 20px', borderBottom: '1px solid var(--hf-line)',
        fontSize: 11.5, color: 'var(--hf-ink-4)', gap: 6, background: 'var(--hf-surface)'
      }}>
        <a style={{ color: 'var(--hf-ink-4)', cursor: 'pointer' }}>Explore Data</a>
        <Icon name="chevR" size={11} />
        <a style={{ color: 'var(--hf-ink-4)', cursor: 'pointer' }}>Administrative</a>
        <Icon name="chevR" size={11} />
        <span style={{ color: 'var(--hf-ink)', fontWeight: 600 }}>Working Area (WK) Boundary — ONWJ</span>
        <div className="row" style={{ marginLeft: 'auto', gap: 6 }}>
          <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="share" size={12} /></button>
          <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="star" size={12} /></button>
          <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="more" size={12} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* MAP */}
        <section style={{ flex: '1 1 55%', position: 'relative', minWidth: 0, borderRight: '1px solid var(--hf-line)' }}>
          <HfMap withPins={false} withCoords />

          {/* WK highlight overlay */}
          <div style={{
            position: 'absolute', top: 16, left: 16, padding: '8px 12px',
            background: 'rgba(255,255,255,.96)', border: '1px solid var(--hf-line)',
            borderRadius: 'var(--hf-r-2)', boxShadow: 'var(--hf-sh-2)'
          }}>
            <div className="cap" style={{ color: 'var(--hf-green-700)' }}>Preview</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>WK Boundary — ONWJ</div>
            <div className="xs">1 polygon · 13,978.45 km²</div>
          </div>

          <div className="row" style={{ position: 'absolute', bottom: 16, left: 16, gap: 6 }}>
            <button className="btn sm"><Icon name="map" size={12} /> Fit to bounds</button>
            <button className="btn sm">3D</button>
            <button className="btn sm">Compare</button>
          </div>
        </section>

        {/* INFO panel */}
        <aside style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--hf-surface)' }}>
          {/* Hero */}
          <div style={{ padding: 22, borderBottom: '1px solid var(--hf-line)' }}>
            <div className="row" style={{ gap: 6, marginBottom: 10 }}>
              <span className="pill" style={{ background: 'var(--hf-green-500)', color: '#fff', fontSize: 9.5 }}>LAYER</span>
              <span className="pill green dot">Verified</span>
              <span className="pill ghost">Administrative</span>
              <span className="pill ghost">Vector · SHP</span>
            </div>
            <div className="display" style={{ fontSize: 26, marginBottom: 4 }}>
              Working Area (WK) Boundary — ONWJ
            </div>
            <div className="body" style={{ marginBottom: 14 }}>
              Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini.
              Geometri dikurasi dari PHE ONWJ dan divalidasi terhadap topology rules.
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn primary lg" style={{ flex: 1 }}><Icon name="plus" size={14} color="#fff" /> Add to Map</button>
              <button className="btn accent lg" style={{ flex: 1 }}><Icon name="download" size={14} color="#fff" /> Download SHP</button>
              <button className="btn lg"><Icon name="bolt" size={14} /> Analytics</button>
            </div>
            <div className="row" style={{ marginTop: 14, gap: 18, fontSize: 11, color: 'var(--hf-ink-4)' }}>
              <span className="row" style={{ gap: 6 }}>
                <span className="avatar sm" style={{ background: 'transparent', borderColor: 'var(--hf-amber-500)', color: 'var(--hf-amber-700)' }}>PH</span>
                <b style={{ color: 'var(--hf-ink-2)' }}>PHE ONWJ</b>
              </span>
              <span className="row" style={{ gap: 4 }}><Icon name="download" size={12} /> <span className="num">128</span></span>
              <span className="row" style={{ gap: 4 }}><Icon name="eye" size={12} /> <span className="num">3,214</span></span>
              <span className="row" style={{ gap: 4 }}><Icon name="star" size={12} /> <span className="num">12</span></span>
              <span className="row" style={{ marginLeft: 'auto', gap: 4 }}>
                <Icon name="clock" size={12} /> 2 hari lalu
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ padding: '0 22px', flex: '0 0 auto' }}>
            <a className="active">Overview</a>
            <a>Attributes <span className="muted">(12)</span></a>
            <a>Quality</a>
            <a>Lineage</a>
            <a>API</a>
            <a>Discussion <span className="muted">(3)</span></a>
          </div>

          {/* Tab content */}
          <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Tags */}
            <div>
              <div className="cap" style={{ marginBottom: 6 }}>Tags</div>
              <div className="row" style={{ flexWrap: 'wrap', gap: 4 }}>
                {['administrative', 'wilayah-kerja', 'PSC', 'offshore', 'jawa-barat', 'PHE', 'boundary'].map(t => (
                  <span key={t} className="pill ghost" style={{ fontSize: 10.5 }}>#{t}</span>
                ))}
              </div>
            </div>

            {/* Key attributes */}
            <div>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="cap">Key Attributes</div>
                <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>See all 12 →</a>
              </div>
              <div className="card card-flat" style={{ borderRadius: 'var(--hf-r-3)', overflow: 'hidden' }}>
                {[
                  ['Total Area',       '13,978.45 km²'],
                  ['Status',           'Active'],
                  ['Operator',         'PHE ONWJ'],
                  ['Contract Start',   '2018-08-09'],
                  ['Contract End',     '2048-08-08'],
                  ['CRS',              'EPSG:4326'],
                  ['Geometry',         'MultiPolygon (1)'],
                  ['Last Validated',   '2 days ago'],
                ].map(([k, v], i, arr) => (
                  <div key={k} className="row" style={{
                    padding: '8px 12px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : '0',
                    fontSize: 11.5
                  }}>
                    <span className="muted" style={{ flex: '0 0 130px' }}>{k}</span>
                    <span className="num" style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data quality */}
            <div>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="cap">Data Quality</div>
                <span className="pill green dot">Excellent</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Completeness',         98,  'var(--hf-green-500)'],
                  ['Positional accuracy',  92,  'var(--hf-green-500)'],
                  ['Attribute accuracy',   88,  'var(--hf-green-500)'],
                  ['Currency',             85,  'var(--hf-amber-500)'],
                  ['Topology',             96,  'var(--hf-green-500)'],
                ].map(([k, v, c]) => (
                  <div key={k}>
                    <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                      <span className="muted">{k}</span>
                      <span className="num" style={{ fontWeight: 600 }}>{v}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--hf-surface-3)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                      <div style={{ width: v + '%', height: '100%', background: c }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lineage strip */}
            <div>
              <div className="cap" style={{ marginBottom: 8 }}>Data Lineage</div>
              <div className="row" style={{ gap: 0 }}>
                {[
                  ['Source',     'PHE ONWJ GIS', 'database'],
                  ['Connector',  'SPARK v2.4',   'bolt'],
                  ['Validated',  '2024-08-09',   'check'],
                  ['Published',  '2024-08-09',   'globe'],
                ].map(([k, v, ico], i, arr) => (
                  <React.Fragment key={k}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        width: 32, height: 32, margin: '0 auto 4px', borderRadius: '50%',
                        background: 'var(--hf-green-50)',
                        border: '1px solid var(--hf-green-200)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon name={ico} size={14} color="var(--hf-green-600)" />
                      </div>
                      <div className="xs" style={{ fontWeight: 600, color: 'var(--hf-ink-2)' }}>{k}</div>
                      <div className="xs">{v}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ flex: '0 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -22 }}>
                        <Icon name="chevR" size={14} color="var(--hf-ink-5)" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* AI prompt */}
            <div style={{
              padding: 14, borderRadius: 'var(--hf-r-3)',
              background: 'linear-gradient(135deg, #f0f3fd, #ede6f6)',
              border: '1px solid var(--hf-blue-100)'
            }}>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 'var(--hf-r-2)',
                  background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name="sparkle" size={13} color="#fff" />
                </span>
                <span style={{ fontWeight: 700, fontSize: 12.5 }}>Tanya AI tentang dataset ini</span>
              </div>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                <span className="pill blue" style={{ cursor: 'pointer' }}>Berapa banyak sumur di area ini?</span>
                <span className="pill blue" style={{ cursor: 'pointer' }}>Rata-rata produksi 2024</span>
                <span className="pill blue" style={{ cursor: 'pointer' }}>Bandingkan dengan WK terdekat</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Monitoring (live ops)
// ─────────────────────────────────────────────────────────────
function HfMonitoring() {
  const statusToken = {
    ok:   { c: 'var(--hf-green-500)',  pill: 'green',  label: 'Healthy' },
    warn: { c: 'var(--hf-amber-500)',  pill: 'amber',  label: 'Warning' },
    err:  { c: 'var(--hf-red-500)',    pill: 'red',    label: 'Failed'  },
    idle: { c: 'var(--hf-ink-5)',      pill: 'ghost',  label: 'Idle'    },
  };
  return (
    <HfPage screenLabel="HF 04 · Monitoring">
      <HfTopNav active="MONITORING" />
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Monitoring</div>
            <div className="body">Live pipeline status & system health · SPEKTRUM Dataspace</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill green dot">● Live</span>
            <button className="btn sm">Last 24h <Icon name="chevron" size={11} /></button>
            <button className="btn sm"><Icon name="refresh" size={12} /></button>
            <button className="btn primary sm"><Icon name="settings" size={12} color="#fff" /> Configure alerts</button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          <HfKpi label="System Health"  value="98.4%" delta="+0.2%" sub="SLA 99%"           icon="shield" />
          <HfKpi label="Active Jobs"    value="12"    sub="3 running · 9 queued"             icon="activity" color="var(--hf-blue-500)" />
          <HfKpi label="Failed (24h)"   value="4"     delta="+2"   dir="down" sub="vs kemarin" icon="warn" color="var(--hf-red-500)" />
          <HfKpi label="Warnings"       value="9"     delta="−3"   dir="up"   sub="vs kemarin" icon="bell" color="var(--hf-amber-500)" />
          <HfKpi label="Data Freshness" value="6 min" sub="avg lag"                            icon="clock" />
        </div>

        {/* Two-column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12, flex: 1, minHeight: 280 }}>
          {/* Pipelines */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--hf-line)' }}>
              <div className="h3">Active Pipelines</div>
              <span className="pill ghost" style={{ marginLeft: 8 }}>8 total</span>
              <div className="row" style={{ marginLeft: 'auto', gap: 6 }}>
                <button className="btn sm">All <Icon name="chevron" size={11} /></button>
                <button className="btn sm"><Icon name="filter" size={12} /></button>
              </div>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--hf-ink-4)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '.07em' }}>
                    {['Job', 'Provider', 'Status', 'Duration', 'Progress', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid var(--hf-line)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Harvest · WK Boundary',         'PHE ONWJ',     'ok',   '04:12',  78],
                    ['Sync · Well Headers',           'PHM',          'ok',   '12 min', 100],
                    ['Validation · Seismic 3D',       'Medco E&P',    'warn', '8 min',  92],
                    ['Publish · PSC Doc Rokan',       'SKK Migas',    'idle', '—',      0],
                    ['Harvest · Pipeline Network',    'PHE',          'err',  '32 min', 64],
                    ['Sync · Facility Inventory',     'PHE ONWJ',     'ok',   '1 hr',   100],
                  ].map(([n, p, s, d, pr], i, arr) => {
                    const tok = statusToken[s];
                    return (
                      <tr key={i}>
                        <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0, fontWeight: 600 }}>{n}</td>
                        <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>{p}</td>
                        <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                          <span className={'pill ' + tok.pill}>
                            <span className="status-dot" style={{ background: tok.c }}></span>
                            {s === 'ok' ? 'Running' : s === 'warn' ? 'Warning' : s === 'err' ? 'Failed' : 'Queued'}
                          </span>
                        </td>
                        <td className="num mono" style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0, fontSize: 11 }}>{d}</td>
                        <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0, width: 150 }}>
                          <div className="row" style={{ gap: 6 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--hf-surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: pr + '%', height: '100%', background: tok.c }}></div>
                            </div>
                            <span className="num xs" style={{ minWidth: 30, textAlign: 'right' }}>{pr}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                          <button className="iconbtn" style={{ width: 24, height: 24, border: 0 }}><Icon name="more" size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--hf-line)' }}>
              <div className="h3">Recent Alerts</div>
              <span className="pill red dot" style={{ marginLeft: 8 }}>2 critical</span>
              <a style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>Mark all read</a>
            </div>
            <div style={{ overflow: 'auto', padding: '4px 18px' }}>
              {[
                ['err',  'Pipeline harvest failed',           'Pipeline Network · PHE',          '4m'],
                ['warn', 'Schema drift detected',             'Well Headers PHM',                '12m'],
                ['warn', 'High latency (>1.5s)',              'Connector PHE ONWJ',              '32m'],
                ['ok',   'Validation passed',                 'WK Topology PSN',                 '1h'],
                ['err',  'SLA breach — 99% → 97.8%',          'System Health',                   '2h'],
                ['warn', 'Disk usage > 80%',                  'Spatial Index Cluster',           '3h'],
              ].map(([s, t, src, time], i, arr) => {
                const tok = statusToken[s];
                return (
                  <div key={i} className="row" style={{
                    padding: '10px 0', gap: 10,
                    borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0,
                    alignItems: 'flex-start'
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 'var(--hf-r-2)',
                      background: tok.c + '14',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flex: '0 0 auto'
                    }}>
                      <Icon name={s === 'err' ? 'warn' : s === 'warn' ? 'bell' : 'check'} size={13} color={tok.c} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{t}</div>
                      <div className="xs">{src}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="xs num">{time}</div>
                      <a style={{ fontSize: 10.5, color: 'var(--hf-blue-600)', fontWeight: 600 }}>Resolve →</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Design System Showcase
// ─────────────────────────────────────────────────────────────
function HfDesignSystem() {
  return (
    <HfPage screenLabel="HF 00 · Design System">
      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="row" style={{ gap: 10, marginBottom: 6 }}>
            <span className="brand-mark">AB</span>
            <span className="cap" style={{ color: 'var(--hf-green-700)' }}>Design System · v0.1</span>
          </div>
          <div className="display">AlasBuana Design System</div>
          <div className="body" style={{ marginTop: 8, maxWidth: 620 }}>
            Tokens, components, dan pola visual yang konsisten untuk seluruh produk AlasBuana.com.
            Bersifat institusional, tepercaya, dengan sentuhan warm-tech.
          </div>
        </div>

        {/* Color palette */}
        <Section title="Colors" subtitle="Brand · primary green dengan accent prussian blue">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            <Swatch label="Green / Primary" tone="--hf-green-500" stops={['50', '100', '200', '400', '500', '600', '700', '900']} prefix="--hf-green-" />
            <Swatch label="Blue / Accent" tone="--hf-blue-500" stops={['50', '100', '300', '500', '600', '900']} prefix="--hf-blue-" />
            <Swatch label="Amber" tone="--hf-amber-500" stops={['100', '500', '700']} prefix="--hf-amber-" />
            <Swatch label="Red" tone="--hf-red-500" stops={['100', '500', '700']} prefix="--hf-red-" />
            <Swatch label="Neutrals" tone="--hf-ink" stops={['ink', 'ink-3', 'ink-5', 'line', 'surface-3', 'bg', 'surface']} prefix="--hf-" />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" subtitle="Inter (UI) + Inter Tight (display)">
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SpecRow scale="display" sample="Satu peta nasional" meta="Inter Tight · 38 / 700 · −0.025em" />
            <SpecRow scale="h1" sample="Explore Data" meta="Inter Tight · 26 / 700 · −0.018em" />
            <SpecRow scale="h2" sample="Working Area Boundary" meta="Inter · 20 / 700 · −0.012em" />
            <SpecRow scale="h3" sample="Recent Activity" meta="Inter · 16 / 600 · −0.006em" />
            <SpecRow scale="body" sample="Find trusted geospatial data from across Indonesia." meta="Inter · 13.5 / 400" />
            <SpecRow scale="sm" sample="Updated 2 days ago" meta="Inter · 12 / 400" />
            <SpecRow scale="cap" sample="KEY ATTRIBUTES" meta="Inter · 10.5 / 600 · 0.07em" />
          </div>
        </Section>

        {/* Buttons + pills */}
        <Section title="Buttons & pills">
          <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div className="cap" style={{ marginBottom: 8 }}>Buttons</div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <button className="btn primary"><Icon name="plus" size={13} color="#fff" /> Primary</button>
                <button className="btn accent"><Icon name="download" size={13} color="#fff" /> Accent</button>
                <button className="btn">Default</button>
                <button className="btn ghost">Ghost</button>
                <button className="btn sm">Small</button>
                <button className="btn lg">Large</button>
                <button className="iconbtn"><Icon name="settings" size={14} /></button>
              </div>
            </div>
            <div>
              <div className="cap" style={{ marginBottom: 8 }}>Pills / Tags</div>
              <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <span className="pill green dot">Verified</span>
                <span className="pill green-solid">PRIMARY</span>
                <span className="pill blue dot">Live</span>
                <span className="pill amber dot">Warning</span>
                <span className="pill red dot">Critical</span>
                <span className="pill purple">Seismic</span>
                <span className="pill ghost">Filter</span>
                <span className="pill">#administrative</span>
              </div>
            </div>
            <div>
              <div className="cap" style={{ marginBottom: 8 }}>Fields</div>
              <div className="row" style={{ gap: 12 }}>
                <div className="field" style={{ width: 280 }}>
                  <Icon name="search" size={14} color="var(--hf-ink-4)" />
                  <input placeholder="Cari dataset…" />
                </div>
                <div className="field" style={{ width: 200 }}>
                  <input placeholder="nama@perusahaan.id" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* KPI tiles + chart placeholders */}
        <Section title="Data display">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            <HfKpi label="Total Datasets" value="2,452" delta="+128" sub="30d" icon="database" />
            <HfKpi label="Active Providers" value="145" delta="+6" sub="30d" icon="user" />
            <HfKpi label="API Calls" value="1.24M" delta="+12.3%" sub="MoM" icon="bolt" color="var(--hf-blue-500)" />
            <HfKpi label="Availability" value="98.2%" delta="+0.4%" sub="SLA 99%" icon="shield" color="var(--hf-amber-500)" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <div className="card" style={{ padding: 16 }}>
              <div className="cap">Trend (sparkline)</div>
              <HfSpark height={64} />
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="cap">Bars</div>
              <HfBars height={64} />
            </div>
            <div className="card" style={{ padding: 16, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
              <HfDonut size={100} thickness={14} />
            </div>
          </div>
        </Section>

        {/* Spacing & shadows */}
        <Section title="Spacing & Radii">
          <div className="card" style={{ padding: 22 }}>
            <div className="row" style={{ gap: 16, alignItems: 'flex-end' }}>
              {[
                ['4', '--hf-1'], ['8', '--hf-2'], ['12', '--hf-3'], ['16', '--hf-4'],
                ['24', '--hf-6'], ['32', '--hf-8'], ['48', '--hf-12'], ['64', '--hf-16'],
              ].map(([n, t]) => (
                <div key={t} style={{ textAlign: 'center' }}>
                  <div style={{ width: parseInt(n), height: parseInt(n), background: 'var(--hf-green-500)', borderRadius: 'var(--hf-r-1)', marginBottom: 6 }}></div>
                  <div className="xs num">{n}px</div>
                  <div className="xs mono" style={{ color: 'var(--hf-ink-5)' }}>{t}</div>
                </div>
              ))}
            </div>
            <div className="divider" style={{ margin: '20px 0' }}></div>
            <div className="row" style={{ gap: 18 }}>
              {[
                ['4',  '--hf-r-1'], ['6',  '--hf-r-2'], ['8',  '--hf-r-3'],
                ['12', '--hf-r-4'], ['999','--hf-r-pill'],
              ].map(([n, t]) => (
                <div key={t} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56,
                    background: 'var(--hf-surface-3)',
                    border: '1px solid var(--hf-line)',
                    borderRadius: 'var(--' + t.slice(2) + ')',
                    marginBottom: 6
                  }}></div>
                  <div className="xs num">{n}px</div>
                  <div className="xs mono" style={{ color: 'var(--hf-ink-5)' }}>{t}</div>
                </div>
              ))}
            </div>
            <div className="divider" style={{ margin: '20px 0' }}></div>
            <div className="row" style={{ gap: 18 }}>
              {[
                ['Level 1', 'var(--hf-sh-1)'],
                ['Level 2', 'var(--hf-sh-2)'],
                ['Level 3', 'var(--hf-sh-3)'],
                ['Level 4', 'var(--hf-sh-4)'],
              ].map(([l, sh]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ width: 80, height: 60, background: '#fff', borderRadius: 8, boxShadow: sh, marginBottom: 6 }}></div>
                  <div className="xs">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </HfPage>
  );
}

// helpers used by Design System page
function Section({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="row" style={{ marginBottom: 10, alignItems: 'baseline', gap: 12 }}>
        <span className="h2">{title}</span>
        {subtitle && <span className="sm">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
function Swatch({ label, tone, stops, prefix }) {
  return (
    <div>
      <div className="cap" style={{ marginBottom: 6 }}>{label}</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {stops.map(s => {
          const v = 'var(' + prefix + s + ')';
          // For neutrals, label = the suffix; for color scales, prepend label/number
          return (
            <div key={s} className="row" style={{
              padding: '8px 10px', gap: 8, borderBottom: '1px solid var(--hf-line)',
              fontSize: 11
            }}>
              <span style={{ width: 22, height: 22, background: v, borderRadius: 4, border: '1px solid rgba(0,0,0,.08)', flex: '0 0 auto' }}></span>
              <span className="mono" style={{ flex: 1, fontSize: 10.5 }}>{prefix + s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function SpecRow({ scale, sample, meta }) {
  return (
    <div className="row" style={{ gap: 18, alignItems: 'baseline', paddingBottom: 10, borderBottom: '1px solid var(--hf-line)' }}>
      <span className={scale} style={{ flex: 1 }}>{sample}</span>
      <span className="xs mono" style={{ color: 'var(--hf-ink-4)', flex: '0 0 auto' }}>{meta}</span>
    </div>
  );
}

Object.assign(window, { HfDashboard, HfDetail, HfMonitoring, HfDesignSystem });
