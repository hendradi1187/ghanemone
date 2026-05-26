// Auxiliary pages — Login/SSO, Upload Data (KKKS), Compliance (Regulator), 404/Empty

function LoginPage() {
  return (
    <Page screenLabel="12 Login · SSO + Email">
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0 }}>
        {/* Left: brand + value prop with map backdrop */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', padding: 40 }}>
          <div className="brand">
            <span className="logo">AB</span>
            <span style={{ fontSize: 18 }}>AlasBuana<span className="dot">.com</span></span>
          </div>
          <div style={{ position: 'absolute', inset: 0, top: 80, opacity: .35 }}>
            <MapBlock withBasemap={false} withCoords={false} withPins={false} />
          </div>
          <div style={{ position: 'relative', marginTop: 'auto', maxWidth: 380 }}>
            <div className="cap">SATU PETA NASIONAL</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -.6, lineHeight: 1.15, marginTop: 8 }}>
              Data hulu migas Indonesia, dalam satu peta yang terpercaya.
            </div>
            <div className="dim" style={{ fontSize: 13, marginTop: 12 }}>
              AlasBuana menghubungkan data dari seluruh KKKS melalui ekosistem SPEKTRUM Dataspace.
              Aman, ter-governance, dan siap dipakai.
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div className="wf" style={{ width: 380, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="h1" style={{ fontSize: 22 }}>Masuk ke AlasBuana</div>
              <div className="dim" style={{ fontSize: 12 }}>Gunakan akun terdaftar Anda untuk melanjutkan.</div>
            </div>

            {/* SSO buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['SKK Migas SSO',   'recommended'],
                ['Pertamina SSO',   ''],
                ['Microsoft Azure AD', ''],
              ].map(([n, tag]) => (
                <div key={n} className="row wf wf-soft" style={{ padding: '10px 12px', cursor: 'pointer' }}>
                  <span className="ico"></span>
                  <span style={{ fontWeight: 600, fontSize: 12.5, flex: 1 }}>Lanjutkan dengan {n}</span>
                  {tag && <span className="pill verified" style={{ fontSize: 8 }}>Disarankan</span>}
                  <span style={{ color: 'var(--ink-mute)' }}>›</span>
                </div>
              ))}
            </div>

            <div className="row" style={{ gap: 8 }}>
              <div className="divider" style={{ flex: 1 }}></div>
              <span className="dim" style={{ fontSize: 10 }}>atau email</span>
              <div className="divider" style={{ flex: 1 }}></div>
            </div>

            {/* Email form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <div className="cap">EMAIL</div>
                <div className="wf wf-soft" style={{ padding: '8px 10px', marginTop: 4, color: 'var(--ink-mute)', fontSize: 12 }}>
                  nama@perusahaan.co.id
                </div>
              </div>
              <div>
                <div className="cap">PASSWORD</div>
                <div className="wf wf-soft row" style={{ padding: '8px 10px', marginTop: 4, color: 'var(--ink-mute)', fontSize: 12 }}>
                  <span style={{ flex: 1 }}>••••••••••</span>
                  <span className="ico ico-sm"></span>
                </div>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                <label className="row" style={{ gap: 4 }}><input type="checkbox" defaultChecked /> Ingat saya</label>
                <a style={{ color: 'var(--accent)', cursor: 'pointer' }}>Lupa password?</a>
              </div>
              <div className="btn primary" style={{ marginTop: 4, justifyContent: 'center', padding: '8px 12px' }}>Masuk</div>
            </div>

            <div className="dim" style={{ fontSize: 10.5, textAlign: 'center' }}>
              Belum punya akun? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Daftar sebagai KKKS</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

// Upload Data (Operator KKKS persona) — multi-step submission
function UploadPage() {
  return (
    <Page screenLabel="13 Upload Data · KKKS submission">
      <TopNav active="WORKSPACE" />
      {/* breadcrumb */}
      <div className="row" style={{ padding: '8px var(--pad)', borderBottom: '1.4px solid var(--line-soft)', fontSize: 11, color: 'var(--ink-mute)', gap: 6 }}>
        <span>Workspace</span><span>›</span>
        <span>Data Submission</span><span>›</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>New Upload</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 320px', flex: 1, minHeight: 0 }}>
        {/* Stepper */}
        <aside style={{ borderRight: '1.4px solid var(--line-soft)', padding: 'var(--pad)', background: 'var(--paper-2)' }}>
          <div className="cap" style={{ marginBottom: 12 }}>SUBMISSION FLOW</div>
          {[
            ['1', 'Pilih jenis data',     'done'],
            ['2', 'Upload file',          'active'],
            ['3', 'Metadata & atribut',   'todo'],
            ['4', 'Validasi otomatis',    'todo'],
            ['5', 'Review & submit',      'todo'],
            ['6', 'Approval',             'todo'],
          ].map(([n, t, s]) => (
            <div key={n} className="row" style={{ padding: '8px 0', borderBottom: '1px dashed var(--line-soft)', gap: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '1.4px solid ' + (s === 'done' ? 'var(--green)' : s === 'active' ? 'var(--accent)' : 'var(--line-soft)'),
                background: s === 'done' ? 'var(--green)' : s === 'active' ? 'var(--accent-soft)' : 'var(--paper)',
                color: s === 'done' ? '#fff' : s === 'active' ? 'var(--accent)' : 'var(--ink-mute)',
                fontSize: 10, fontWeight: 700, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center'
              }}>{s === 'done' ? '✓' : n}</span>
              <span style={{ fontSize: 11.5, fontWeight: s === 'active' ? 700 : 500, color: s === 'todo' ? 'var(--ink-mute)' : 'var(--ink)' }}>{t}</span>
            </div>
          ))}
          <div className="stickynote" style={{ position: 'static', marginTop: 14, maxWidth: 'none', transform: 'rotate(-1deg)' }}>
            Audit log otomatis di setiap step — semua aksi tercatat
          </div>
        </aside>

        {/* Center: dropzone + file list */}
        <main style={{ padding: 'var(--pad)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="h1" style={{ fontSize: 22 }}>Upload file data</div>
            <div className="dim" style={{ fontSize: 12 }}>Drop file di sini, atau pilih dari workstation. Maks. 5 GB/file.</div>
          </div>

          {/* Dropzone */}
          <div className="wf wf-dashed" style={{
            padding: 40, textAlign: 'center', borderWidth: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
          }}>
            <span style={{
              width: 56, height: 56, borderRadius: 12, background: 'var(--accent-soft)',
              border: '1.4px solid var(--accent)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--accent)'
            }}>↑</span>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Drag & drop file di sini</div>
            <div className="dim" style={{ fontSize: 11 }}>Atau</div>
            <div className="btn primary">Pilih file dari komputer</div>
            <div className="dim" style={{ fontSize: 10.5, marginTop: 4 }}>
              Format didukung: SHP, GeoJSON, KML, SEG-Y, LAS, CSV, PDF, XLSX, GeoTIFF · Maks. 5 GB
            </div>
          </div>

          {/* File list */}
          <div>
            <div className="cap" style={{ marginBottom: 6 }}>FILE TERPILIH (3)</div>
            {[
              ['WK_Boundary_ONWJ_2024.shp',        '2.1 MB',  'Uploaded',  100, 'ok'],
              ['Well_Headers_ONWJ.csv',            '348 KB',  'Uploaded',  100, 'ok'],
              ['Seismic_3D_NSumatra_NEW.segy',     '2.4 GB',  'Uploading', 67,  'busy'],
            ].map(([n, sz, st, p, s]) => (
              <div key={n} className="row wf wf-soft" style={{ padding: 8, gap: 10, marginBottom: 6 }}>
                <span className="ico"></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 11.5 }}>{n}</span>
                    <span className="dim" style={{ fontSize: 10 }}>{sz}</span>
                  </div>
                  <div className="row" style={{ gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--fill-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: p + '%', height: '100%', background: s === 'ok' ? 'var(--green)' : 'var(--accent)' }}></div>
                    </div>
                    <span className="dim" style={{ fontSize: 9.5 }}>{st} {p < 100 ? p + '%' : ''}</span>
                  </div>
                </div>
                <span style={{ color: 'var(--ink-mute)', cursor: 'pointer' }}>×</span>
              </div>
            ))}
          </div>

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1.4px solid var(--line-soft)' }}>
            <span className="btn">‹ Kembali</span>
            <div className="row" style={{ gap: 6 }}>
              <span className="btn ghost">Simpan sebagai draft</span>
              <span className="btn primary">Lanjut: Metadata ›</span>
            </div>
          </div>
        </main>

        {/* Right: guidelines */}
        <aside style={{ borderLeft: '1.4px solid var(--line-soft)', padding: 'var(--pad)', overflowY: 'auto', background: 'var(--paper)' }}>
          <div className="cap">GUIDELINES</div>
          <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.5 }}>
            Setiap data yang diunggah akan melewati <b>validasi otomatis</b> (topology, schema, metadata), kemudian
            di-review oleh tim SKK Migas sebelum dipublikasikan ke ekosistem.
          </div>

          <div className="cap" style={{ marginTop: 14 }}>SLA APPROVAL</div>
          <div className="wf wf-fill" style={{ padding: 8, marginTop: 4, fontSize: 11 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="dim">Validasi otomatis</span><span style={{ fontWeight: 600 }}>&lt; 10 menit</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="dim">Review manual</span><span style={{ fontWeight: 600 }}>1–3 hari kerja</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="dim">Publikasi</span><span style={{ fontWeight: 600 }}>Otomatis</span>
            </div>
          </div>

          <div className="cap" style={{ marginTop: 14 }}>CHECKLIST</div>
          {[
            ['Geometri valid (no self-intersection)', true],
            ['CRS terdefinisi (EPSG)',                 true],
            ['Atribut wajib terisi',                   false],
            ['Lisensi & sensitivitas ditentukan',      false],
          ].map(([t, ok]) => (
            <div key={t} className="row" style={{ padding: '4px 0', fontSize: 11 }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                border: '1.4px solid ' + (ok ? 'var(--green)' : 'var(--line-soft)'),
                background: ok ? 'var(--green)' : 'var(--paper)',
                color: '#fff', fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>{ok ? '✓' : ''}</span>
              <span style={{ marginLeft: 6 }}>{t}</span>
            </div>
          ))}

          <div className="cap" style={{ marginTop: 14 }}>BUTUH BANTUAN?</div>
          <div className="wf wf-dashed" style={{ padding: 8, marginTop: 4, fontSize: 11 }}>
            <div style={{ fontWeight: 600 }}>📞 SPEKTRUM Helpdesk</div>
            <div className="dim" style={{ fontSize: 10 }}>support@spektrum.id · Senin–Jumat 08–17 WIB</div>
            <span className="btn ghost" style={{ marginTop: 6, fontSize: 10 }}>✦ Tanya AI Assistant</span>
          </div>
        </aside>
      </div>
    </Page>
  );
}

// Compliance View (Regulator persona) — submission queue + approvals
function CompliancePage() {
  return (
    <Page screenLabel="14 Compliance · Regulator view">
      <TopNav active="MONITORING" />
      <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="h1">Compliance & Approvals</div>
            <div className="dim" style={{ fontSize: 12 }}>Review submission KKKS · Regulator workspace</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <span className="pill ghost">Period: 30 hari ⏷</span>
            <span className="pill ghost">KKKS: Semua ⏷</span>
            <span className="btn">↓ Export laporan</span>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
          {[
            ['Pending Review',   '14',     'urgent: 3',          'var(--amber)'],
            ['Approved (30d)',   '186',    '+12% MoM',           'var(--green)'],
            ['Rejected (30d)',   '7',      '4 quality, 3 policy', 'var(--red)'],
            ['Avg Approval',     '2.4d',   'SLA 3 hari',         'var(--accent)'],
            ['Compliance Rate',  '96%',    'all KKKS',           'var(--green)'],
          ].map(([l, v, d, c]) => (
            <div key={l} className="wf" style={{ padding: 12 }}>
              <div className="cap">{l}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.4, color: c }}>{v}</div>
              <div className="dim" style={{ fontSize: 10 }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Approval queue */}
        <div className="wf" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="row" style={{ padding: '10px 12px', borderBottom: '1.4px solid var(--line-soft)', justifyContent: 'space-between' }}>
            <div className="h3">Approval Queue</div>
            <div className="row" style={{ gap: 4 }}>
              {['Pending (14)', 'In Review (6)', 'Approved', 'Rejected', 'All'].map((t, i) => (
                <span key={t} className={'pill ' + (i === 0 ? 'active' : 'ghost')} style={{ fontSize: 10 }}>{t}</span>
              ))}
            </div>
          </div>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--ink-mute)', textTransform: 'uppercase', fontSize: 9.5, letterSpacing: .5 }}>
                {['', 'Dataset', 'KKKS', 'Submitted', 'Type', 'Auto-validation', 'Risk', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--line-soft)', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['WK_Boundary_ONWJ_2024.shp',        'PHE ONWJ',     '2 jam lalu',   'Layer',       'OK',     'low',    'urgent'],
                ['Well_Headers_ONWJ_Q3.csv',         'PHE ONWJ',     '4 jam lalu',   'Tabular',     'OK',     'low',    ''],
                ['Seismic_3D_NSumatra_NEW.segy',     'Medco E&P',    '6 jam lalu',   'Volume',      'Warn',   'med',    'urgent'],
                ['PSC_Rokan_Amendment_2024.pdf',     'SKK Migas',    '1 hari',       'Document',    'OK',     'low',    ''],
                ['Pipeline_Network_TransJava.kml',   'PHE',          '1 hari',       'Layer',       'Err',    'high',   'urgent'],
                ['Facility_Inventory_ONWJ.xlsx',     'PHE ONWJ',     '2 hari',       'Tabular',     'OK',     'low',    ''],
              ].map(([n, k, ts, ty, val, risk, urg], i) => (
                <tr key={i}>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }}><input type="checkbox" /></td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)', fontWeight: 600 }}>
                    {n}{urg && <span className="pill red" style={{ fontSize: 8, marginLeft: 6 }}>● URGENT</span>}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }}>{k}</td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }} className="dim">{ts}</td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }}>{ty}</td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }}>
                    <span className={'pill ' + (val === 'OK' ? 'verified' : val === 'Warn' ? 'amber' : 'red')} style={{ fontSize: 9 }}>● {val}</span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }}>
                    <span className={'pill ' + (risk === 'low' ? 'verified' : risk === 'med' ? 'amber' : 'red')} style={{ fontSize: 9 }}>{risk}</span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px dashed var(--line-soft)' }}>
                    <div className="row" style={{ gap: 4 }}>
                      <span className="btn green" style={{ fontSize: 9, padding: '3px 8px' }}>✓ Approve</span>
                      <span className="btn" style={{ fontSize: 9, padding: '3px 8px' }}>Review</span>
                      <span className="btn ghost" style={{ fontSize: 9, padding: '3px 8px', color: 'var(--red)', borderColor: 'var(--red)' }}>Reject</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom: by KKKS + audit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="wf" style={{ padding: 12 }}>
            <div className="h3">Compliance per KKKS</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['PHE ONWJ',          98, 'var(--green)'],
                ['Pertamina Hulu (PHM)', 96, 'var(--green)'],
                ['Medco E&P',         91, 'var(--amber)'],
                ['Harbour Energy',    88, 'var(--amber)'],
                ['Premier Oil',       78, 'var(--red)'],
              ].map(([k, v, c]) => (
                <div key={k} className="row" style={{ gap: 8, fontSize: 11 }}>
                  <span style={{ flex: '0 0 150px' }}>{k}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--fill-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: v + '%', height: '100%', background: c }}></div>
                  </div>
                  <span style={{ flex: '0 0 40px', textAlign: 'right', fontWeight: 600 }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="wf" style={{ padding: 12 }}>
            <div className="h3">Audit Trail (latest)</div>
            <div style={{ marginTop: 6, fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              {[
                '12:48  citra@skkmigas  APPROVE  WK_Boundary_ONWJ_2024.shp',
                '12:31  budi@skkmigas   REVIEW   Seismic_3D_NSumatra_NEW.segy',
                '11:52  citra@skkmigas  APPROVE  PSC_Rokan_2024.pdf',
                '11:18  dewi@skkmigas   REJECT   Pipeline_TransJava.kml (policy)',
                '10:34  system           VALIDATE Well_Headers_PHM.csv  → OK',
                '09:12  ahmad@skkmigas   COMMENT  Facility_Inventory.xlsx',
              ].map(l => <div key={l}>›  {l}</div>)}
            </div>
          </div>
        </div>
      </div>
      <KeyBand />
    </Page>
  );
}

// 404 / Empty state
function EmptyPage() {
  return (
    <Page screenLabel="15 Empty / 404">
      <TopNav active="" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40, background: 'var(--paper-2)' }}>
        <div style={{
          width: 140, height: 100, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* abstract "no data on map" icon */}
          <svg viewBox="0 0 140 100" width="140" height="100">
            <rect x="2" y="2" width="136" height="96" fill="var(--map-water)" stroke="var(--line)" strokeWidth="1.4" strokeDasharray="4 4" />
            <path d="M30 50 Q50 35 70 50 Q90 65 110 45" stroke="var(--map-stroke)" strokeWidth="1.4" fill="none" />
            <text x="70" y="58" textAnchor="middle" fontSize="36" fontFamily="Caveat, cursive" fill="var(--ink-mute)">?</text>
          </svg>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -.4 }}>Data tidak ditemukan</div>
        <div className="dim" style={{ fontSize: 13, maxWidth: 420, textAlign: 'center' }}>
          Halaman atau dataset yang Anda cari mungkin sudah dipindahkan, dihapus, atau
          belum tersedia di ekosistem SPEKTRUM.
        </div>
        <div className="row" style={{ gap: 8 }}>
          <span className="btn">‹ Kembali</span>
          <span className="btn primary">Ke Explore Data</span>
          <span className="btn ghost">Lapor masalah</span>
        </div>

        <div style={{ marginTop: 18, width: '100%', maxWidth: 540 }}>
          <div className="cap" style={{ textAlign: 'center', marginBottom: 8 }}>MUNGKIN ANDA CARI</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {[
              'Working Area (WK) Boundary — ONWJ',
              'Seismic 3D — North Sumatra Basin',
              'Well Location',
              'PSC Document — Rokan',
            ].map(t => (
              <div key={t} className="row wf wf-soft" style={{ padding: 8, gap: 8, fontSize: 11 }}>
                <span className="ico-plain" style={{ width: 12, height: 12 }}></span>
                <span style={{ flex: 1, fontWeight: 600 }}>{t}</span>
                <span style={{ color: 'var(--accent)' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { LoginPage, UploadPage, CompliancePage, EmptyPage });
