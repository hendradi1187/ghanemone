// AlasBuana Hi-Fi — Explore Data (sesuai referensi screenshot)

function HfExplore() {
  return (
    <HfPage screenLabel="HF 01 · Explore Data">
      <HfTopNav active="EXPLORE DATA" />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <HfSidebar active="All Data" />

        {/* CENTER: list */}
        <main style={{ flex: '0 0 460px', minWidth: 0, padding: '18px 18px 0', overflowY: 'auto',
          borderRight: '1px solid var(--hf-line)', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Page header */}
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span className="cap" style={{ color: 'var(--hf-green-700)' }}>SPEKTRUM · Trusted Data</span>
            </div>
            <div className="h1">Explore Data</div>
            <div className="body" style={{ marginTop: 4 }}>
              Find, access, and use trusted geospatial data from across Indonesia's upstream oil &amp; gas ecosystem.
            </div>
          </div>

          {/* Search + filter */}
          <div className="row" style={{ gap: 8 }}>
            <div className="field" style={{ flex: 1 }}>
              <Icon name="search" size={14} color="var(--hf-ink-4)" />
              <input placeholder="Cari datasets, layers, dokumen…" />
            </div>
            <button className="btn"><Icon name="filter" size={13} /> Filters</button>
          </div>

          {/* Filter chips */}
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {[
              ['Data Type',     'Layer'],
              ['Theme',         'Administrative'],
              ['Provider',      'PHE ONWJ'],
              ['Domain / WK',   'ONWJ'],
            ].map(([k, v]) => (
              <span key={k} className="pill" style={{ background: 'var(--hf-green-50)', color: 'var(--hf-green-700)', borderColor: 'var(--hf-green-200)', border: '1px solid var(--hf-green-200)' }}>
                {k}: <b style={{ marginLeft: 2 }}>{v}</b>
                <Icon name="x" size={11} color="var(--hf-green-600)" style={{ marginLeft: 2 }} />
              </span>
            ))}
            <span className="pill ghost">+ Format</span>
            <span className="pill ghost">+ More</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--hf-green-600)', fontWeight: 600, cursor: 'pointer' }}>Clear all</span>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[
              ['2,452',   'Datasets',          'database',  'var(--hf-green-500)'],
              ['145',     'Providers',         'user',      'var(--hf-blue-500)'],
              ['38',      'Domains',           'map',       'var(--hf-amber-500)'],
              ['98.2%',   'SLA',               'shield',    'var(--hf-purple-500)'],
            ].map(([v, l, ico, c]) => (
              <div key={l} style={{
                padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--hf-surface)', border: '1px solid var(--hf-line)', borderRadius: 'var(--hf-r-2)'
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 'var(--hf-r-2)',
                  background: 'var(--hf-surface-3)', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={ico} size={14} color={c} />
                </span>
                <div>
                  <div className="num" style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--hf-ink-4)' }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* List header */}
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
            <div className="h3">Datasets <span className="muted num" style={{ fontWeight: 500 }}>(2,452)</span></div>
            <div className="row" style={{ gap: 6 }}>
              <div className="row" style={{ background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)', padding: 2 }}>
                <button className="iconbtn" style={{ width: 26, height: 24, background: 'var(--hf-surface)', boxShadow: 'var(--hf-sh-1)' }}><Icon name="grid" size={13} /></button>
                <button className="iconbtn" style={{ width: 26, height: 24, border: 0, background: 'transparent' }}><Icon name="list" size={13} /></button>
              </div>
              <button className="btn sm">Sort: Relevance <Icon name="chevron" size={11} /></button>
            </div>
          </div>

          {/* Dataset list */}
          <div style={{ margin: '0 -2px' }}>
            <HfDatasetCard
              kind="LAYER"
              title="Working Area (WK) Boundary — ONWJ"
              type="Administrative" format="Vector · SHP, GeoJSON" updated="2 hari lalu"
              desc="Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini."
              provider="PHE ONWJ" providerInit="PH" providerColor="var(--hf-amber-500)"
              stats={['128', '3.2K', '12']}
            />
            <HfDatasetCard
              kind="LAYER"
              kindColor="var(--hf-purple-500)"
              title="Seismic 3D — North Sumatra Basin"
              type="Seismic" format="Volume · SEG-Y" updated="5 hari lalu"
              desc="Data seismik 3D di area Cekungan Sumatera Utara, kualitas tinggi."
              provider="Medco E&P" providerInit="ME" providerColor="var(--hf-blue-500)"
              stats={['96', '2.1K', '8']}
            />
            <HfDatasetCard
              kind="LAYER"
              kindColor="var(--hf-amber-500)"
              title="Well Location — Indonesia"
              type="Well & Drilling" format="Vector · SHP" updated="kemarin"
              desc="Lokasi sumur produksi, eksplorasi, dan appraisal di seluruh Indonesia."
              provider="Pertamina Hulu Mahakam" providerInit="PHM" providerColor="var(--hf-green-500)"
              stats={['256', '5.4K', '20']}
            />
            <HfDatasetCard
              kind="DOC"
              kindColor="var(--hf-blue-500)"
              title="PSC Document — WK Rokan (Amendment 2024)"
              type="Document" format="PDF · 2.4 MB" updated="10 hari lalu"
              desc="Dokumen Perjanjian Kerja Sama (PSC) Wilayah Kerja Rokan."
              provider="SKK Migas" providerInit="SM" providerColor="var(--hf-blue-500)"
              stats={['78', '1.1K', '6']}
              verified={true}
            />
          </div>

          {/* Pagination */}
          <div className="row" style={{ justifyContent: 'space-between', padding: '14px 0 18px', color: 'var(--hf-ink-4)', fontSize: 11 }}>
            <span>Showing 1–4 of <b className="num" style={{ color: 'var(--hf-ink-2)' }}>2,452</b> datasets</span>
            <div className="row" style={{ gap: 2 }}>
              <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="chevL" size={12} /></button>
              <button className="btn sm" style={{ minWidth: 26, padding: '4px 8px', borderColor: 'var(--hf-green-500)', color: 'var(--hf-green-700)', background: 'var(--hf-green-50)' }}>1</button>
              <button className="btn sm" style={{ minWidth: 26, padding: '4px 8px' }}>2</button>
              <button className="btn sm" style={{ minWidth: 26, padding: '4px 8px' }}>3</button>
              <span style={{ padding: '0 4px' }}>…</span>
              <button className="btn sm" style={{ minWidth: 26, padding: '4px 8px' }}>123</button>
              <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="chevR" size={12} /></button>
            </div>
          </div>
        </main>

        {/* MAP */}
        <section style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          {/* View toggle */}
          <div style={{
            position: 'absolute', top: 16, left: 16, zIndex: 3,
            display: 'inline-flex', background: '#fff', border: '1px solid var(--hf-line)',
            borderRadius: 'var(--hf-r-2)', padding: 2, boxShadow: 'var(--hf-sh-2)'
          }}>
            <span className="btn primary sm" style={{ borderRadius: 4, padding: '5px 12px' }}><Icon name="map" size={12} color="#fff" /> Map view</span>
            <span className="btn ghost sm" style={{ borderRadius: 4, padding: '5px 12px' }}><Icon name="list" size={12} /> Table view</span>
            <span className="btn ghost sm" style={{ borderRadius: 4, padding: '5px 12px' }}>Split</span>
          </div>

          <HfMap withPins withLegend withCoords />

          <HfAiPill style={{ position: 'absolute', right: 16, bottom: 60 }} />
        </section>

        {/* RIGHT DETAIL */}
        <aside style={{
          flex: '0 0 280px', borderLeft: '1px solid var(--hf-line)',
          padding: 18, display: 'flex', flexDirection: 'column', gap: 14,
          overflowY: 'auto', background: 'var(--hf-surface)'
        }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="cap">Data information</span>
            <button className="iconbtn" style={{ width: 22, height: 22, border: 0 }}><Icon name="x" size={13} /></button>
          </div>

          <div>
            <div className="row" style={{ gap: 6, marginBottom: 6 }}>
              <span className="pill" style={{ background: 'var(--hf-green-500)', color: '#fff', fontSize: 9 }}>LAYER</span>
              <span className="pill green dot">Verified</span>
            </div>
            <div className="h3" style={{ fontSize: 14, lineHeight: 1.3 }}>Working Area (WK) Boundary — ONWJ</div>
            <div className="sm">Administrative · Vector (SHP)</div>
          </div>

          <div className="row">
            <span className="avatar sm" style={{ background: 'transparent', borderColor: 'var(--hf-amber-500)', color: 'var(--hf-amber-700)' }}>PH</span>
            <span style={{ fontSize: 11.5, fontWeight: 600 }}>PHE ONWJ</span>
            <Icon name="check" size={11} color="var(--hf-green-600)" style={{ marginLeft: 'auto' }} />
            <span style={{ fontSize: 10.5, color: 'var(--hf-green-700)', fontWeight: 600 }}>Trusted</span>
          </div>

          <div className="sm">Batas Wilayah Kerja (WK) Offshore North West Java berdasarkan kontrak PSC terkini.</div>

          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm" style={{ flex: 1 }}>Details</button>
            <button className="btn primary sm" style={{ flex: 1 }}><Icon name="plus" size={11} color="#fff" /> Add to Map</button>
          </div>

          <div className="divider"></div>

          <div className="cap">Attributes</div>
          {[
            ['Total Area',       '13,978.45 km²'],
            ['Status',           'Active'],
            ['Operator',         'PHE ONWJ'],
            ['Contract Start',   '2018-08-09'],
            ['Contract End',     '2048-08-08'],
            ['CRS',              'EPSG:4326'],
          ].map(([k, v]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span className="muted">{k}</span>
              <span className="num" style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}

          <div className="divider"></div>

          <div className="cap">Data quality</div>
          {[
            ['Completeness',         98,  'var(--hf-green-500)'],
            ['Positional accuracy',  'High', null],
            ['Currency',             '2d',   null],
          ].map(([k, v, c]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span className="muted">{k}</span>
              {c ? (
                <div className="row" style={{ gap: 6 }}>
                  <div style={{ width: 60, height: 4, background: 'var(--hf-surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: v + '%', height: '100%', background: c }}></div>
                  </div>
                  <span className="num" style={{ fontWeight: 600 }}>{v}%</span>
                </div>
              ) : <span className="num" style={{ fontWeight: 600 }}>{v}</span>}
            </div>
          ))}

          <div className="divider"></div>

          <div className="cap">Related</div>
          {[
            ['PSC Document — WK ONWJ',     'doc'],
            ['Field — ONWJ Area',          'map'],
            ['Well Headers — ONWJ',        'database'],
          ].map(([n, ico]) => (
            <div key={n} className="row" style={{ fontSize: 11.5, color: 'var(--hf-blue-600)', cursor: 'pointer', padding: '2px 0' }}>
              <Icon name={ico} size={12} color="var(--hf-blue-500)" />
              <span style={{ flex: 1 }}>{n}</span>
              <Icon name="arrowUpRight" size={11} />
            </div>
          ))}
        </aside>
      </div>

      {/* Bottom dark band — Key Benefits / Trust */}
      <div className="band-dark row" style={{ gap: 20 }}>
        <div className="row" style={{ gap: 10 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 'var(--hf-r-2)',
            background: 'rgba(255,255,255,.08)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon name="shield" size={18} color="#a8d6b6" />
          </span>
          <div>
            <div style={{ fontSize: 11, color: '#a8d6b6', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Key Benefits</div>
            <div style={{ fontSize: 12.5, color: '#e9eef9' }}>Powered by SPEKTRUM Dataspace</div>
          </div>
        </div>
        <div className="row" style={{ flex: 1, gap: 22, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {[
            ['globe',    'Satu Peta Nasional',        'Terintegrasi seluruh KKKS'],
            ['check',    'Data Akurat & Terpercaya',  'Single Source of Truth'],
            ['shield',   'Keamanan & Governance',     'Berkelas Dunia'],
            ['bolt',     'Keputusan Lebih Cepat',     'dengan AI Intelligence'],
            ['chart',    'Interoperable & Scalable',  'Untuk Masa Depan'],
          ].map(([ico, t, sub]) => (
            <div key={t} className="row" style={{ gap: 8, fontSize: 11 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 'var(--hf-r-2)',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.14)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
              }}>
                <Icon name={ico} size={13} color="#a8d6b6" />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 1.25 }}>
                <span style={{ fontWeight: 600, color: '#f3f6fc' }}>{t}</span>
                <span style={{ color: '#a3b1cd', fontSize: 10.5 }}>{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HfPage>
  );
}

Object.assign(window, { HfExplore });
