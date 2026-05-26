// Detail Dataset — drill-down view, 2 variants
// User clicks a dataset row → lands here.

function DetailA() {
  return (
    <Page screenLabel="08 Detail Dataset · A · Split: Map + Info tabs">
      <TopNav active="EXPLORE DATA" />
      {/* Breadcrumb */}
      <div className="row" style={{
        padding: '8px var(--pad)', borderBottom: '1.4px solid var(--line-soft)',
        fontSize: 11, color: 'var(--ink-mute)', gap: 6, flex: '0 0 auto'
      }}>
        <span>Explore Data</span> <span>›</span>
        <span>Administrative</span> <span>›</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Working Area (WK) Boundary — ONWJ</span>
        <span style={{ marginLeft: 'auto' }} className="pill verified">✓ Verified</span>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* MAP (left) */}
        <section style={{ flex: '1 1 55%', position: 'relative', minWidth: 0, borderRight: '1.4px solid var(--line-soft)' }}>
          <MapBlock withLayers={false} withCoords />
          <div className="floater" style={{ top: 14, left: 14, padding: '6px 10px' }}>
            <div className="cap">PREVIEW</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Working Area Boundary — ONWJ</div>
            <div className="dim" style={{ fontSize: 10 }}>1 polygon · 13,978 km²</div>
          </div>
          <div className="row" style={{ position: 'absolute', bottom: 14, left: 14, gap: 6 }}>
            <span className="btn"><span className="ico ico-sm"></span> Fit to bounds</span>
            <span className="btn"><span className="ico ico-sm"></span> Toggle 3D</span>
            <span className="btn"><span className="ico ico-sm"></span> Compare</span>
          </div>
        </section>

        {/* INFO (right) */}
        <aside style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--paper)' }}>
          {/* Header */}
          <div style={{ padding: 'var(--pad)', borderBottom: '1.4px solid var(--line-soft)' }}>
            <div className="row" style={{ gap: 8 }}>
              <span className="pill" style={{ background: 'var(--green-soft)', borderColor: 'var(--green)', color: 'var(--green)', fontSize: 9 }}>LAYER</span>
              <span className="pill ghost" style={{ fontSize: 9 }}>Administrative</span>
              <span className="pill ghost" style={{ fontSize: 9 }}>Vector · SHP</span>
            </div>
            <div className="h1" style={{ marginTop: 6 }}>Working Area (WK) Boundary — ONWJ</div>
            <div className="dim" style={{ fontSize: 12 }}>
              Batas Wilayah Kerja (WK) Offshore North West Java berdasarkan kontrak terkini yang berlaku.
            </div>
            <div className="row" style={{ marginTop: 10, gap: 6 }}>
              <span className="btn green" style={{ flex: 1 }}>+ Add to Map</span>
              <span className="btn primary" style={{ flex: 1 }}>↓ Download (SHP)</span>
              <span className="btn">⤴ Share</span>
              <span className="btn">★</span>
            </div>
            <div className="row" style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-mute)', gap: 14 }}>
              <span>⬇ 128 downloads</span>
              <span>👁 3,214 views</span>
              <span>★ 12</span>
              <span style={{ marginLeft: 'auto' }}>Updated 2 days ago</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="row" style={{
            padding: '0 var(--pad)', borderBottom: '1.4px solid var(--line-soft)',
            gap: 18, fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5
          }}>
            {['Overview', 'Attributes', 'Quality', 'Lineage', 'API', 'Discussion (3)'].map((t, i) => (
              <a key={t} style={{
                padding: '10px 0',
                borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)',
                cursor: 'pointer'
              }}>{t}</a>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding: 'var(--pad)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Provider */}
            <div className="wf wf-soft" style={{ padding: 10 }}>
              <div className="row">
                <span className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>PH</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>PHE ONWJ</div>
                  <div className="dim" style={{ fontSize: 10.5 }}>Data Provider · 183 datasets · Verified since 2023</div>
                </div>
                <span className="btn ghost" style={{ fontSize: 10 }}>View profile</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="cap">DESCRIPTION</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>
                Layer ini berisi batas Wilayah Kerja (WK) ONWJ yang berlaku berdasarkan PSC terkini.
                Geometri dikurasi dari sumber resmi PHE ONWJ dan telah divalidasi terhadap topology rules
                serta cross-checked dengan basis data SKK Migas.
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="cap">TAGS</div>
              <div className="row" style={{ marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                {['administrative', 'wilayah-kerja', 'PSC', 'offshore', 'jawa-barat', 'PHE', 'boundary'].map(t => (
                  <span key={t} className="pill ghost" style={{ fontSize: 9.5 }}>#{t}</span>
                ))}
              </div>
            </div>

            {/* Attributes preview */}
            <div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="cap">KEY ATTRIBUTES</div>
                <span className="pill ghost" style={{ fontSize: 9 }}>See all 12 →</span>
              </div>
              <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Total Area',       '13,978.45 km²'],
                  ['Status',           'Active'],
                  ['Operator',         'PHE ONWJ'],
                  ['Contract Start',   '2018-08-09'],
                  ['Contract End',     '2048-08-08'],
                  ['CRS',              'EPSG:4326'],
                  ['Geometry',         'MultiPolygon (1)'],
                  ['Last Validated',   '2 days ago'],
                ].map(([k, v]) => (
                  <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--line-soft)', fontSize: 11 }}>
                    <span className="dim">{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <div className="cap">DATA QUALITY</div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Completeness',         98,  'var(--green)'],
                  ['Positional accuracy',  92,  'var(--green)'],
                  ['Attribute accuracy',   88,  'var(--green)'],
                  ['Currency',             85,  'var(--amber)'],
                  ['Topology',             96,  'var(--green)'],
                ].map(([k, v, c]) => (
                  <div key={k} className="row" style={{ gap: 8, fontSize: 11 }}>
                    <span style={{ flex: '0 0 130px' }} className="dim">{k}</span>
                    <div style={{ flex: 1, height: 5, background: 'var(--fill-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: v + '%', height: '100%', background: c }}></div>
                    </div>
                    <span style={{ flex: '0 0 36px', textAlign: 'right', fontWeight: 600 }}>{v}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            <div>
              <div className="cap">RELATED DATASETS</div>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['PSC Document — WK ONWJ',        'Document · PDF'],
                  ['Field Boundary — ONWJ Area',    'Layer · SHP'],
                  ['Well Headers — ONWJ',           'Layer · CSV'],
                  ['Production Forecast — ONWJ',    'Dataset · XLSX'],
                ].map(([n, sub]) => (
                  <div key={n} className="row wf wf-soft" style={{ padding: 6, gap: 8 }}>
                    <div className="thumb" style={{ width: 36, height: 28, fontSize: 7 }}>thumb</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600 }}>{n}</div>
                      <div className="dim" style={{ fontSize: 10 }}>{sub}</div>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: 11 }}>+ Add</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
      <AiFloater style={{ position: 'absolute', right: 500, bottom: 16 }} />
      <KeyBand />
    </Page>
  );
}

// Variant B: Full-width hero + tabs below, no map split
function DetailB() {
  return (
    <Page screenLabel="08 Detail Dataset · B · Hero + Full-width Tabs">
      <TopNav active="EXPLORE DATA" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Breadcrumb */}
        <div className="row" style={{
          padding: '8px var(--pad)', borderBottom: '1.4px solid var(--line-soft)',
          fontSize: 11, color: 'var(--ink-mute)', gap: 6
        }}>
          <span>Explore Data</span> <span>›</span>
          <span>Administrative</span> <span>›</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Working Area (WK) Boundary — ONWJ</span>
        </div>

        {/* HERO */}
        <div style={{ padding: 'var(--pad)', background: 'var(--paper-2)', borderBottom: '1.4px solid var(--line-soft)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
            <div>
              <div className="row" style={{ gap: 6 }}>
                <span className="pill" style={{ background: 'var(--green-soft)', borderColor: 'var(--green)', color: 'var(--green)', fontSize: 9 }}>LAYER</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>Administrative</span>
                <span className="pill verified" style={{ fontSize: 9 }}>✓ Verified</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -.4, marginTop: 6 }}>
                Working Area (WK) Boundary — ONWJ
              </div>
              <div className="dim" style={{ fontSize: 12.5, marginTop: 4 }}>
                Batas Wilayah Kerja (WK) Offshore North West Java berdasarkan kontrak PSC terkini.
              </div>
              <div className="row" style={{ marginTop: 14, gap: 8 }}>
                <span className="btn green">+ Add to Map</span>
                <span className="btn primary">↓ Download (SHP · 2.1 MB)</span>
                <span className="btn">⊞ Open in Analytics</span>
                <span className="btn">⤴ Share</span>
                <span className="btn">★ Save</span>
              </div>
              <div className="row" style={{ marginTop: 12, gap: 18, fontSize: 11, color: 'var(--ink-soft)' }}>
                <span className="row"><span className="avatar" style={{ width: 18, height: 18, fontSize: 8 }}>PH</span>&nbsp;PHE ONWJ</span>
                <span>⬇ 128 downloads</span>
                <span>👁 3,214 views</span>
                <span>★ 12 saved</span>
                <span>🕐 Updated 2 days ago</span>
              </div>
            </div>

            {/* Map mini-preview */}
            <div className="wf" style={{ overflow: 'hidden', height: 200, position: 'relative' }}>
              <MapBlock withBasemap={false} withCoords={false} />
              <div className="floater" style={{ bottom: 8, left: 8, padding: '4px 8px', fontSize: 10 }}>
                Preview · click to expand
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="row" style={{
          padding: '0 var(--pad)', borderBottom: '1.4px solid var(--line-soft)',
          gap: 22, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5,
          background: 'var(--paper)', position: 'sticky', top: 0, zIndex: 2
        }}>
          {['Overview', 'Attributes (12)', 'Quality', 'Lineage', 'API & Access', 'Discussion (3)', 'Versions (8)'].map((t, i) => (
            <a key={t} style={{
              padding: '12px 0',
              borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)',
              cursor: 'pointer'
            }}>{t}</a>
          ))}
        </div>

        {/* CONTENT — 3 column overview */}
        <div style={{ padding: 'var(--pad)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14 }}>
          {/* Description + attributes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="wf" style={{ padding: 12 }}>
              <div className="cap">DESCRIPTION</div>
              <p style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 6 }}>
                Layer ini berisi batas Wilayah Kerja (WK) ONWJ yang berlaku berdasarkan PSC terkini.
                Geometri dikurasi dari sumber resmi PHE ONWJ dan telah divalidasi terhadap topology rules
                serta cross-checked dengan basis data SKK Migas.
              </p>
              <p style={{ fontSize: 12.5, lineHeight: 1.55 }}>
                Data ini dimaksudkan untuk analisis spasial, perencanaan eksplorasi, dan pelaporan
                regulasi. Pembaruan dilakukan otomatis ketika ada perubahan kontrak.
              </p>
              <div className="row" style={{ marginTop: 8, flexWrap: 'wrap', gap: 4 }}>
                {['administrative', 'wilayah-kerja', 'PSC', 'offshore', 'jawa-barat', 'PHE'].map(t => (
                  <span key={t} className="pill ghost" style={{ fontSize: 9.5 }}>#{t}</span>
                ))}
              </div>
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="cap">KEY ATTRIBUTES</div>
              <table style={{ width: '100%', fontSize: 11.5, marginTop: 6, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Total Area',       '13,978.45 km²'],
                    ['Status',           'Active'],
                    ['Operator',         'PHE ONWJ'],
                    ['Contract Start',   '2018-08-09'],
                    ['Contract End',     '2048-08-08'],
                    ['CRS',              'EPSG:4326'],
                    ['Geometry',         'MultiPolygon (1)'],
                    ['Format',           'ESRI Shapefile · GeoJSON'],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: '5px 4px', borderBottom: '1px dashed var(--line-soft)', color: 'var(--ink-mute)' }}>{k}</td>
                      <td style={{ padding: '5px 4px', borderBottom: '1px dashed var(--line-soft)', fontWeight: 600 }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality + lineage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="wf" style={{ padding: 12 }}>
              <div className="cap">DATA QUALITY</div>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Completeness',         98,  'var(--green)'],
                  ['Positional accuracy',  92,  'var(--green)'],
                  ['Attribute accuracy',   88,  'var(--green)'],
                  ['Currency',             85,  'var(--amber)'],
                  ['Topology',             96,  'var(--green)'],
                ].map(([k, v, c]) => (
                  <div key={k}>
                    <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                      <span className="dim">{k}</span>
                      <span style={{ fontWeight: 600 }}>{v}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--fill-2)', borderRadius: 3, overflow: 'hidden', marginTop: 2 }}>
                      <div style={{ width: v + '%', height: '100%', background: c }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dim" style={{ marginTop: 8, fontSize: 10.5 }}>
                Last validated 2 days ago by automated QA pipeline.
              </div>
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="cap">LINEAGE</div>
              <div style={{ marginTop: 8, fontSize: 11 }}>
                {[
                  ['Source',     'PHE ONWJ GIS Studio'],
                  ['Connector',  'SPARK Connector v2.4'],
                  ['Harvested',  '2024-08-09 04:12'],
                  ['Validated',  '2024-08-09 04:18'],
                  ['Published',  '2024-08-09 04:22'],
                ].map(([k, v], i, arr) => (
                  <div key={k} style={{ position: 'relative', paddingLeft: 14, paddingBottom: 8 }}>
                    <span style={{ position: 'absolute', left: 0, top: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></span>
                    {i < arr.length - 1 && <span style={{ position: 'absolute', left: 3.2, top: 12, bottom: 0, width: 1.6, background: 'var(--line-soft)' }}></span>}
                    <div className="dim" style={{ fontSize: 10 }}>{k}</div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="wf" style={{ padding: 12 }}>
              <div className="cap">API & ACCESS</div>
              <div className="wf wf-fill" style={{ padding: 8, marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--ink-soft)' }}>
                GET /api/v1/datasets/<br />
                &nbsp;&nbsp;wk-boundary-onwj.geojson<br />
                &nbsp;&nbsp;?bbox=…&token=…
              </div>
              <div className="row" style={{ marginTop: 6, gap: 4 }}>
                <span className="pill ghost" style={{ fontSize: 9 }}>Copy</span>
                <span className="pill ghost" style={{ fontSize: 9 }}>Open in API Explorer</span>
              </div>
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="cap">RELATED</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {[
                  'PSC Document — WK ONWJ',
                  'Field — ONWJ Area',
                  'Well Headers — ONWJ',
                  'Production — ONWJ',
                ].map(n => (
                  <div key={n} className="row" style={{ gap: 6, fontSize: 11.5, padding: '4px 0', borderBottom: '1px dashed var(--line-soft)' }}>
                    <span className="ico-plain" style={{ width: 10, height: 10 }}></span>
                    <span style={{ flex: 1 }}>{n}</span>
                    <span style={{ color: 'var(--accent)', fontSize: 11 }}>+</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wf wf-dashed" style={{ padding: 10 }}>
              <div className="cap">ASK AI</div>
              <div className="dim" style={{ fontSize: 11, marginTop: 4 }}>
                "Berapa banyak sumur produksi di dalam WK ini, dan rata-rata produksi 2024?"
              </div>
              <span className="btn primary" style={{ marginTop: 6, fontSize: 10 }}>✦ Ask AI</span>
            </div>
          </div>
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { DetailA, DetailB });
