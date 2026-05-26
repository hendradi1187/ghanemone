// Workspace — 2 variants

// Variant A: Project list left + active workspace canvas
function WorkspaceA() {
  return (
    <Page screenLabel="05 Workspace · A · Project canvas">
      <TopNav active="WORKSPACE" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Project list */}
        <aside style={{ width: 240, borderRight: '1.4px solid var(--line-soft)', padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="h3">Workspaces</div>
            <span className="pill active" style={{ fontSize: 9 }}>+ New</span>
          </div>
          <div className="searchbar" style={{ maxWidth: 'none', padding: '4px 8px' }}>
            <span className="ico ico-sm"></span> Filter projects…
          </div>
          <div className="cap">PINNED</div>
          {[
            ['Mahakam Production Review', 'pers', 8, true],
            ['Sumatera Block Scoping', 'team', 12, true],
          ].map(([n, k, c, on]) => (
            <div key={n} className={'wf ' + (on ? '' : 'wf-soft')} style={{ padding: 8, borderColor: on ? 'var(--accent)' : 'var(--line-soft)', background: on ? 'var(--accent-soft)' : 'transparent', cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{n}</div>
              <div className="row" style={{ marginTop: 3, fontSize: 10 }}>
                <span className="pill ghost" style={{ fontSize: 9 }}>{k === 'pers' ? '👤 personal' : '👥 team'}</span>
                <span className="dim" style={{ marginLeft: 'auto' }}>{c} items</span>
              </div>
            </div>
          ))}
          <div className="cap">RECENT</div>
          {[
            'ONWJ permit review',
            'Q1 reserve audit',
            'New WK feasibility',
            'Pipeline integrity scan',
            'Compliance Q4',
          ].map(p => (
            <div key={p} className="row" style={{ fontSize: 11, padding: '4px 6px', borderRadius: 3, cursor: 'pointer' }}>
              <span className="ico-plain"></span> {p}
              <span className="dim" style={{ marginLeft: 'auto', fontSize: 9 }}>2d</span>
            </div>
          ))}
          <div className="divider"></div>
          <div className="cap">SHARED WITH ME</div>
          {['Regulator review board', 'SKK monthly KPI'].map(p => (
            <div key={p} className="row" style={{ fontSize: 11, padding: '4px 6px' }}>
              <span className="ico-plain"></span> {p}
            </div>
          ))}
        </aside>

        {/* Main canvas */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '12px var(--pad)', borderBottom: '1.4px solid var(--line-soft)' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="h1">Sumatera Block Scoping</div>
                <div className="row" style={{ marginTop: 2, gap: 8 }}>
                  <span className="dim" style={{ fontSize: 11 }}>Team project · 4 contributors</span>
                  <span className="row" style={{ gap: -4 }}>
                    {['BA', 'JD', 'RK', 'LM'].map(n => <span key={n} className="avatar" style={{ marginLeft: -4, width: 22, height: 22 }}>{n}</span>)}
                  </span>
                  <span className="pill ghost" style={{ fontSize: 9 }}>last edit 12m ago</span>
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span className="btn">Share</span>
                <span className="btn">↓ Export</span>
                <span className="btn primary">▶ Run AI report</span>
              </div>
            </div>
            <div className="row" style={{ gap: 0, marginTop: 10, borderBottom: '1.4px solid transparent' }}>
              {['Overview', 'Datasets (12)', 'Map', 'Charts (5)', 'Notes', 'Activity', 'Settings'].map((t, i) => (
                <span key={t} style={{
                  padding: '6px 12px', fontSize: 11, fontWeight: 600,
                  borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                  color: i === 0 ? 'var(--accent)' : 'var(--ink-soft)', cursor: 'pointer'
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ padding: 'var(--pad)', flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Description card */}
            <div className="wf" style={{ padding: 14, gridColumn: '1 / -1' }}>
              <div className="cap">PROJECT BRIEF</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Memetakan potensi WK baru di Sumatera Utara berbasis data seismic terkini + production history block-block tetangga. Goal: ringkasan untuk steering committee 25 Mei.
              </div>
              <div className="row" style={{ marginTop: 8, gap: 6 }}>
                <span className="pill">📍 Sumatera Utara</span>
                <span className="pill">📅 Due 25 Mei</span>
                <span className="pill verified" style={{ fontSize: 10 }}>✓ Compliance OK</span>
              </div>
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="h3">Datasets in workspace</div>
                <span className="pill ghost" style={{ fontSize: 9 }}>+ Add</span>
              </div>
              {[
                ['Seismic 3D — N.Sumatra', 'Medco E&P', 'SEG-Y'],
                ['Well Locations — North Cluster', 'PHM', 'SHP'],
                ['WK Boundary — adjacent', 'PHE', 'GeoJSON'],
                ['PSC Doc — Aceh', 'SKK Migas', 'PDF'],
                ['Production History 2015-25', 'PHM', 'CSV'],
              ].map((d, i) => (
                <div key={i} className="row" style={{ padding: '6px 0', fontSize: 11, borderTop: i ? '1px dashed var(--line-soft)' : 0 }}>
                  <span className="ico-plain"></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b>{d[0]}</b> <span className="dim">· {d[1]} · {d[2]}</span>
                  </span>
                  <span className="pill ghost" style={{ fontSize: 9 }}>view</span>
                </div>
              ))}
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="h3">Workspace map</div>
                <span className="pill ghost" style={{ fontSize: 9 }}>open full</span>
              </div>
              <div style={{ height: 180, marginTop: 6, border: '1.2px solid var(--line-soft)', borderRadius: 4, overflow: 'hidden' }}>
                <MapBlock withLayers={false} withBasemap={false} withCoords={false} />
              </div>
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="h3" style={{ marginBottom: 6 }}>Notes & decisions</div>
              <div className="wf wf-dashed" style={{ padding: 8, fontFamily: 'Caveat, cursive', fontSize: 14, color: 'var(--ink-soft)' }}>
                "Seismic Medco kelihatan korelasi sama production trend di block sebelah — perlu di-overlay."
                <div style={{ fontSize: 11, marginTop: 6, color: 'var(--ink-mute)' }}>— Ahmad, 2 hari lalu</div>
              </div>
              <div className="wf wf-dashed" style={{ padding: 8, fontFamily: 'Caveat, cursive', fontSize: 14, color: 'var(--ink-soft)', marginTop: 6 }}>
                "TODO: minta clearance ke regulator untuk re-process data 2019."
              </div>
              <div className="btn ghost" style={{ marginTop: 6 }}>+ Add note</div>
            </div>

            <div className="wf" style={{ padding: 12 }}>
              <div className="h3" style={{ marginBottom: 6 }}>Recent activity</div>
              {[
                ['Lina', 'added 2 seismic surveys', '12m'],
                ['AI', 'generated correlation report', '1h'],
                ['Budi', 'commented on Well Locations', '3h'],
                ['You', 'created workspace', '2d'],
              ].map(([w, a, t], i) => (
                <div key={i} className="row" style={{ padding: '5px 0', fontSize: 11, borderTop: i ? '1px dashed var(--line-soft)' : 0 }}>
                  <span className="avatar" style={{ width: 18, height: 18, fontSize: 7 }}>{w.slice(0, 2).toUpperCase()}</span>
                  <span style={{ flex: 1 }}><b>{w}</b> {a}</span>
                  <span className="dim" style={{ fontSize: 9 }}>{t}</span>
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

// Variant B: Card grid of workspaces + templates
function WorkspaceB() {
  return (
    <Page screenLabel="05 Workspace · B · Grid & templates">
      <TopNav active="WORKSPACE" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Workspace</div>
            <div className="dim" style={{ fontSize: 11 }}>Tempat kerja kolaboratif untuk analisis lintas dataset · 14 active</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <div className="searchbar" style={{ width: 220 }}><span className="ico ico-sm"></span> Search workspace…</div>
            <span className="pill ghost">Filter: All ⏷</span>
            <span className="btn primary">+ New workspace</span>
          </div>
        </div>

        <div>
          <div className="cap" style={{ marginBottom: 6 }}>CONTINUE WORKING ON</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { n: 'Sumatera Block Scoping', s: 'PHE · Medco · PHM', p: 64, d: 'Due 25 Mei', users: ['BA', 'JD', 'RK'] },
              { n: 'Mahakam Production Review', s: 'PHM · SKK', p: 32, d: 'in progress', users: ['LM', 'PD'] },
              { n: 'Onshore Pipeline Audit', s: 'Pertagas', p: 88, d: 'Review', users: ['EF'] },
            ].map(card => (
              <div key={card.n} className="wf" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}>
                <div style={{ height: 80, marginBottom: 4, borderRadius: 4, overflow: 'hidden', border: '1.2px solid var(--line-soft)' }}>
                  <MapBlock withLayers={false} withBasemap={false} withCoords={false} />
                </div>
                <div className="h3">{card.n}</div>
                <div className="dim" style={{ fontSize: 10 }}>{card.s}</div>
                <div style={{ height: 6, background: 'var(--fill)', borderRadius: 3 }}>
                  <div style={{ width: card.p + '%', height: '100%', background: 'var(--accent)', borderRadius: 3 }}></div>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="row" style={{ gap: -4 }}>
                    {card.users.map(u => <span key={u} className="avatar" style={{ marginLeft: -4, width: 22, height: 22 }}>{u}</span>)}
                  </span>
                  <span className="pill ghost" style={{ fontSize: 9 }}>{card.d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="cap">START FROM A TEMPLATE</div>
            <span className="pill ghost" style={{ fontSize: 9 }}>view all 18 →</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { i: '🗺', n: 'WK Feasibility Study', d: 'Map + seismic + nearby production' },
              { i: '🛢', n: 'Field Production Review', d: 'KPI + decline curve + workover log' },
              { i: '📜', n: 'PSC Compliance Pack', d: 'Doc review + boundary + reporting' },
              { i: '🚨', n: 'Asset Integrity Audit', d: 'Pipeline + facility + incident' },
              { i: '🌳', n: 'ESG Impact Assessment', d: 'Env zones + emission + mitigation' },
              { i: '🧪', n: 'Exploration Sandbox', d: 'Blank canvas + AI suggestions' },
              { i: '📊', n: 'Quarterly Reporting', d: 'Charts + commentary + signoff' },
              { i: '📡', n: 'Real-time Monitoring', d: 'Live stream + alerts + map' },
            ].map(t => (
              <div key={t.n} className="wf wf-soft" style={{ padding: 12, cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{t.i}</div>
                <div className="h3" style={{ fontSize: 12 }}>{t.n}</div>
                <div className="dim" style={{ fontSize: 10, marginTop: 2 }}>{t.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="cap" style={{ marginBottom: 6 }}>ALL WORKSPACES · 14</div>
          <div className="wf" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--paper-2)', color: 'var(--ink-mute)' }}>
                <tr>
                  {['Name', 'Owner', 'Type', 'Items', 'Last edit', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 9.5, letterSpacing: .5, textTransform: 'uppercase', fontWeight: 700, borderBottom: '1.4px solid var(--line-soft)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Sumatera Block Scoping', 'You', 'Team', 12, '12m ago', 'Active'],
                  ['Mahakam Production Review', 'L. Marpaung', 'Team', 8, '3h ago', 'Active'],
                  ['Onshore Pipeline Audit', 'E. Fauzi', 'Personal', 24, '1d ago', 'Review'],
                  ['Q1 Reserve Audit', 'You', 'Team', 18, '2d ago', 'Done'],
                  ['Pipeline Integrity 2025', 'B. Adi', 'Team', 5, '5d ago', 'Draft'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px dashed var(--line-soft)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '8px 10px' }}>{r[1]}</td>
                    <td style={{ padding: '8px 10px' }}><span className="pill ghost" style={{ fontSize: 9 }}>{r[2]}</span></td>
                    <td style={{ padding: '8px 10px' }}>{r[3]}</td>
                    <td style={{ padding: '8px 10px' }} className="dim">{r[4]}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span className={'pill ' + (r[5] === 'Active' ? 'verified' : r[5] === 'Review' ? 'amber' : r[5] === 'Draft' ? 'ghost' : '')} style={{ fontSize: 9 }}>{r[5]}</span>
                    </td>
                    <td style={{ padding: '8px 10px', color: 'var(--ink-mute)' }}>⋯</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

Object.assign(window, { WorkspaceA, WorkspaceB });
