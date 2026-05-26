// Explore Data — 2 variants

// Variant A: Sidebar left + center list + right detail panel (matches reference)
function ExploreA({ density = 'comfortable', panelPos = 'right', mapFirst = false, sidebar = true }) {
  return (
    <Page screenLabel="01 Explore Data · A · Split List + Map">
      <TopNav active="EXPLORE DATA" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LeftSidebar hidden={!sidebar} />
        {/* CENTER: list */}
        <main style={{
          flex: mapFirst ? '0 0 360px' : 1,
          padding: 'var(--pad)',
          display: 'flex', flexDirection: 'column', gap: 'var(--gap)',
          overflowY: 'auto', minWidth: 0,
          borderRight: '1.4px solid var(--line-soft)'
        }}>
          <div>
            <div className="h1">Explore Data</div>
            <div className="dim" style={{ fontSize: 'var(--text-sm)' }}>
              Find, access, and use trusted geospatial data from across Indonesia's upstream oil &amp; gas ecosystem.
            </div>
          </div>

          <div className="row">
            <div className="searchbar grow" style={{ maxWidth: 'none' }}>
              <span className="ico ico-sm"></span> Search datasets, layers, documents…
            </div>
            <div className="btn primary" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' }}>⏷ Filters</div>
            <span className="annotation" style={{ fontSize: 12 }}>Clear</span>
          </div>

          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {['Data Type', 'Theme', 'Provider', 'Domain / WK', 'Format', 'More Filters'].map(p => (
              <span key={p} className="pill ghost">{p} ⏷</span>
            ))}
          </div>

          <div className="row wf wf-soft" style={{ padding: 10, gap: 14 }}>
            {[['2,452', 'Datasets'], ['145', 'Providers'], ['38', 'Domains / WK'], ['98%', 'Data Availability']].map(([n, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 6, background: 'var(--fill-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
                }}>◇</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{n}</div>
                  <div className="dim" style={{ fontSize: 10 }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="h3">Datasets <span className="dim">(2,452)</span></div>
            <div className="row" style={{ gap: 6 }}>
              <span className="pill active">▦ Grid</span>
              <span className="pill ghost">≡ List</span>
              <span className="pill ghost">Sort by: Relevance ⏷</span>
            </div>
          </div>

          <div>
            <DatasetRow kind="LAYER" title="Working Area (WK) Boundary — ONWJ" type="Administrative"
              format="Vector (SHP, GeoJSON)" updated="2 days ago"
              desc="Batas Wilayah Kerja (WK) berdasarkan kontrak terkini yang berlaku."
              provider="PHE ONWJ" stats={['128', '3.2K', '12']} />
            <DatasetRow kind="LAYER" title="Seismic 3D — North Sumatra Basin" type="Seismic"
              format="Volume (SEG-Y)" updated="5 days ago"
              desc="Data seismik 3D area Cekungan Sumatera Utara."
              provider="Medco E&P" stats={['96', '2.1K', '8']} />
            <DatasetRow kind="LAYER" title="Well Location" type="Well & Drilling"
              format="Vector (SHP, GeoJSON)" updated="1 day ago"
              desc="Lokasi sumur produksi, eksplorasi dan appraisal."
              provider="PHM" stats={['256', '5.4K', '20']} />
            <DatasetRow kind="DOCUMENT" title="PSC Document — WK Rokan" type="Document"
              format="PDF" updated="10 days ago"
              desc="Dokumen Perjanjian Kerja Sama (PSC) WK Rokan."
              provider="SKK Migas" stats={['78', '1.1K', '6']} />
          </div>

          <div className="row" style={{ justifyContent: 'space-between', color: 'var(--ink-mute)', fontSize: 11, marginTop: 4 }}>
            <span>Showing 1 – 20 of 2,452 datasets</span>
            <span className="row" style={{ gap: 4 }}>
              <span className="pill ghost">‹</span>
              <span className="pill active">1</span>
              <span className="pill ghost">2</span>
              <span className="pill ghost">3</span>
              <span className="pill ghost">…</span>
              <span className="pill ghost">123</span>
              <span className="pill ghost">›</span>
            </span>
          </div>
        </main>

        {/* MAP */}
        <section style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <div className="row" style={{
            position: 'absolute', top: 10, left: 10, zIndex: 3, gap: 0,
            background: '#fff', border: '1.4px solid var(--line)', borderRadius: 4, overflow: 'hidden'
          }}>
            <span className="btn primary" style={{ borderRadius: 0, border: 0, padding: '5px 14px' }}>MAP VIEW</span>
            <span className="btn" style={{ borderRadius: 0, border: 0, padding: '5px 14px' }}>TABLE VIEW</span>
          </div>
          <MapBlock withLayers />
          <AiFloater style={{ position: 'absolute', right: 16, bottom: 16 }} />
        </section>

        {/* RIGHT DETAIL */}
        {panelPos === 'right' && (
          <aside style={{
            width: 240, borderLeft: '1.4px solid var(--line-soft)', padding: 'var(--pad)',
            display: 'flex', flexDirection: 'column', gap: 'var(--gap)', overflowY: 'auto', background: 'var(--paper)'
          }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="cap">DATA INFORMATION</span>
              <span style={{ cursor: 'pointer', color: 'var(--ink-mute)' }}>×</span>
            </div>
            <div className="h3">Working Area (WK) Boundary — ONWJ</div>
            <div className="row">
              <span className="avatar" style={{ width: 18, height: 18, fontSize: 8 }}>PH</span>
              <span style={{ fontSize: 11 }}>PHE ONWJ</span>
              <span className="pill verified" style={{ marginLeft: 'auto', fontSize: 9 }}>✓ Verified</span>
            </div>
            <div className="dim" style={{ fontSize: 11 }}>Administrative · Vector (SHP)</div>
            <div className="dim" style={{ fontSize: 11 }}>Batas Wilayah Kerja (WK) berdasarkan kontrak terkini yang berlaku.</div>
            <div className="row">
              <span className="btn" style={{ flex: 1 }}>View Details</span>
              <span className="btn green" style={{ flex: 1 }}>+ Add to Map</span>
            </div>
            <div className="divider"></div>
            <div className="cap">ATTRIBUTES</div>
            {[['Total Area', '13,978.45 km²'], ['Status', 'Active'], ['Operator', 'PHE ONWJ'], ['Contract Start', '2018-08-09'], ['Contract End', '2048-08-08']].map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                <span className="dim">{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div className="divider"></div>
            <div className="cap">DATA QUALITY</div>
            {[['Completeness', '98%'], ['Positional Accuracy', 'High'], ['Currency', '2 days ago']].map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                <span className="dim">{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div className="divider"></div>
            <div className="cap">RELATED DATA</div>
            <div style={{ fontSize: 11, color: 'var(--accent)' }}>· PSC Document — WK ONWJ</div>
            <div style={{ fontSize: 11, color: 'var(--accent)' }}>· Field — ONWJ Area</div>
          </aside>
        )}
      </div>

      {panelPos === 'bottom' && (
        <div style={{ borderTop: '1.4px solid var(--line)', padding: 'var(--pad)', background: 'var(--paper-2)' }}>
          <span className="annotation">Detail panel (bottom drawer) — same content, horizontal layout</span>
        </div>
      )}

      <FlowBand />
      <KeyBand />
    </Page>
  );
}

// Variant B: Map-first, top filter bar, results as bottom drawer
function ExploreB({ density = 'comfortable', sidebar = true }) {
  return (
    <Page screenLabel="01 Explore Data · B · Map-first w/ Drawer">
      <TopNav active="EXPLORE DATA" />
      {/* filter strip */}
      <div className="row" style={{
        padding: '10px var(--pad)', borderBottom: '1.4px solid var(--line-soft)', gap: 8, flexWrap: 'wrap'
      }}>
        <div className="h2" style={{ marginRight: 12 }}>Explore Data</div>
        <div className="searchbar" style={{ flex: 1, maxWidth: 360 }}>
          <span className="ico ico-sm"></span> Search datasets…
        </div>
        {['Data Type', 'Theme', 'Provider', 'Format', 'Date'].map(p => (
          <span key={p} className="pill ghost">{p} ⏷</span>
        ))}
        <span className="annotation">Clear all</span>
        <div style={{ marginLeft: 'auto' }} className="row">
          <span className="pill">2,452 results</span>
          <span className="btn">↓ Export</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* MAP (dominant) */}
        <section style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapBlock withLayers withCoords />
          <div className="floater" style={{ top: 14, right: 14, width: 200 }}>
            <div className="cap">Quick Filters</div>
            <div className="col" style={{ gap: 4, marginTop: 6 }}>
              {['Working Areas', 'Wells', 'Seismic Surveys', 'Pipelines', 'Facilities'].map((l, i) => (
                <label key={l} className="row" style={{ fontSize: 11 }}>
                  <input type="checkbox" defaultChecked={i < 4} /> {l}
                </label>
              ))}
            </div>
          </div>
          <AiFloater style={{ position: 'absolute', right: 16, top: '50%' }} />
        </section>

        {/* Right rail: pinned dataset */}
        <aside style={{ width: 280, borderLeft: '1.4px solid var(--line-soft)', padding: 'var(--pad)',
          display: 'flex', flexDirection: 'column', gap: 'var(--gap)', overflowY: 'auto' }}>
          <div className="cap">PINNED · 3 datasets</div>
          {[1, 2, 3].map(i => (
            <div key={i} className="wf wf-soft" style={{ padding: 8 }}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="thumb" style={{ width: 48, height: 36, fontSize: 8 }}>thumb</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{['WK Boundary ONWJ', 'Seismic 3D N.Sumatra', 'Well Location'][i - 1]}</div>
                  <div className="dim" style={{ fontSize: 10 }}>PHE ONWJ · SHP</div>
                  <div className="row" style={{ marginTop: 4, gap: 6 }}>
                    <span className="pill verified" style={{ fontSize: 9 }}>✓ Verified</span>
                    <span className="dim" style={{ fontSize: 10 }}>2d ago</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="btn ghost" style={{ marginTop: 4 }}>+ Compare selected</div>
          <div className="divider"></div>
          <div className="cap">AREA INSIGHT</div>
          <div style={{ fontSize: 11 }} className="dim">Klik pada peta untuk melihat ringkasan otomatis area.</div>
          <div className="wf wf-dashed" style={{ padding: 8, fontFamily: 'Caveat, cursive', fontSize: 13, color: 'var(--ink-mute)' }}>
            "Area ini punya 23 sumur aktif, 4 lapangan produksi, dan rata-rata produksi 12,400 BOPD" — AI summary
          </div>
        </aside>
      </div>

      {/* bottom results drawer */}
      <div style={{ borderTop: '1.4px solid var(--line)', background: 'var(--paper)', flex: '0 0 auto', maxHeight: 220, display: 'flex', flexDirection: 'column' }}>
        <div className="row" style={{ padding: '8px var(--pad)', borderBottom: '1.4px solid var(--line-soft)', justifyContent: 'space-between' }}>
          <div className="row">
            <span className="h3">Results</span>
            <span className="dim" style={{ fontSize: 11 }}>2,452 datasets · 145 providers</span>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill">▦ Cards</span>
            <span className="pill active">≡ Table</span>
            <span className="dim" style={{ fontSize: 11 }}>⇕ drag to expand</span>
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '4px var(--pad) 8px' }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', fontSize: 9.5, letterSpacing: .5 }}>
                {['', 'Name', 'Type', 'Provider', 'Format', 'Updated', 'Quality', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 4px', borderBottom: '1px dashed var(--line-soft)', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['WK Boundary ONWJ', 'Administrative', 'PHE ONWJ', 'SHP', '2d ago', '98%'],
                ['Seismic 3D N.Sumatra', 'Seismic', 'Medco E&P', 'SEG-Y', '5d ago', '95%'],
                ['Well Location', 'Well & Drilling', 'PHM', 'SHP', '1d ago', '99%'],
                ['Pipeline Network', 'Infrastructure', 'PHE', 'GeoJSON', '6d ago', '92%'],
                ['PSC Doc — Rokan', 'Document', 'SKK Migas', 'PDF', '10d ago', '—'],
              ].map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: '6px 4px', borderBottom: '1px dashed var(--line-soft)' }}><input type="checkbox" defaultChecked={i < 2} /></td>
                  {r.map((c, j) => (
                    <td key={j} style={{ padding: '6px 4px', borderBottom: '1px dashed var(--line-soft)', fontWeight: j === 0 ? 600 : 400 }}>{c}</td>
                  ))}
                  <td style={{ padding: '6px 4px', borderBottom: '1px dashed var(--line-soft)' }}>
                    <span className="pill" style={{ fontSize: 9 }}>+ Map</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FlowBand />
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { ExploreA, ExploreB });
