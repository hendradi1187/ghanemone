// AlasBuana Hi-Fi — Auxiliary pages (Login, Upload KKKS, Compliance, 404)

// ─────────────────────────────────────────────────────────────
// HF · Login & SSO
// ─────────────────────────────────────────────────────────────
function HfLogin() {
  return (
    <HfPage screenLabel="HF · Login">
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: 0 }}>
        {/* Left: brand / value */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(160deg, var(--hf-green-700) 0%, var(--hf-green-900) 60%, var(--hf-blue-900) 100%)',
          color: '#e9eef9', padding: 48, display: 'flex', flexDirection: 'column'
        }}>
          <div className="row" style={{ gap: 10 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 'var(--hf-r-2)',
              background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.22)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#fff'
            }}>AB</span>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em' }}>
              AlasBuana<span style={{ color: '#a8d6b6' }}>.com</span>
            </span>
          </div>

          {/* abstract map backdrop */}
          <svg viewBox="0 0 600 400" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .15 }}>
            <defs>
              <pattern id="hf-login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0v40" fill="none" stroke="rgba(168,214,182,.4)" strokeWidth=".6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hf-login-grid)" />
            {/* abstract Indonesia shapes */}
            <path d="M50 170 Q100 160 150 195 Q200 235 240 260 Q250 275 235 280 Q190 270 140 235 Q90 200 60 180 Z"
              fill="none" stroke="rgba(168,214,182,.6)" strokeWidth="1.4" />
            <path d="M285 280 Q380 280 470 295 Q450 305 380 305 Q320 300 285 290 Z"
              fill="none" stroke="rgba(168,214,182,.6)" strokeWidth="1.4" />
            <path d="M330 160 Q400 160 470 185 Q510 200 510 240 Q480 270 425 260 Q370 245 340 215 Q325 185 330 160 Z"
              fill="none" stroke="rgba(168,214,182,.6)" strokeWidth="1.4" />
            {[[100,200],[170,230],[225,260],[395,225],[440,245],[295,290]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="4" fill="rgba(168,214,182,.85)" />
            ))}
          </svg>

          <div style={{ marginTop: 'auto', position: 'relative', maxWidth: 460 }}>
            <div className="cap" style={{ color: '#a8d6b6', letterSpacing: '.1em' }}>SATU PETA NASIONAL</div>
            <div style={{
              fontFamily: 'Inter Tight, Inter, sans-serif',
              fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.15, marginTop: 10, color: '#fff'
            }}>
              Data hulu migas Indonesia,<br />dalam satu peta yang terpercaya.
            </div>
            <div style={{ fontSize: 14, marginTop: 12, color: '#c9d0de', lineHeight: 1.55 }}>
              AlasBuana menghubungkan data dari seluruh KKKS melalui ekosistem SPEKTRUM
              Dataspace. Aman, ter-governance, siap dipakai.
            </div>

            <div className="row" style={{ marginTop: 28, gap: 24 }}>
              {[
                ['2,452', 'Datasets'],
                ['145',   'Providers'],
                ['8',     'KKKS Active'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }} className="num">{n}</div>
                  <div style={{ fontSize: 11, color: '#a3b1cd' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--hf-bg)' }}>
          <div style={{ width: 400 }}>
            <div className="h1" style={{ marginBottom: 6 }}>Selamat datang</div>
            <div className="body" style={{ marginBottom: 24 }}>
              Masuk dengan akun terdaftar Anda untuk melanjutkan.
            </div>

            {/* SSO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {[
                ['SKK Migas SSO',         'shield',    'Disarankan'],
                ['Pertamina SSO',         'database',  ''],
                ['Microsoft Azure AD',    'globe',     ''],
              ].map(([n, ico, tag]) => (
                <button key={n} className="btn lg" style={{ justifyContent: 'flex-start', padding: '11px 14px', gap: 10 }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: 'var(--hf-r-2)',
                    background: 'var(--hf-surface-3)', display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
                  }}>
                    <Icon name={ico} size={14} />
                  </span>
                  <span style={{ flex: 1, textAlign: 'left' }}>Lanjut dengan {n}</span>
                  {tag && <span className="pill green dot" style={{ fontSize: 9.5 }}>{tag}</span>}
                  <Icon name="chevR" size={13} color="var(--hf-ink-4)" />
                </button>
              ))}
            </div>

            <div className="row" style={{ gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--hf-line)' }}></div>
              <span className="xs">atau email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--hf-line)' }}></div>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div className="cap" style={{ marginBottom: 6 }}>Email</div>
                <div className="field" style={{ background: '#fff', padding: '9px 12px' }}>
                  <input placeholder="nama@perusahaan.co.id" />
                </div>
              </div>
              <div>
                <div className="row" style={{ marginBottom: 6, justifyContent: 'space-between' }}>
                  <span className="cap">Password</span>
                  <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>Lupa password?</a>
                </div>
                <div className="field" style={{ background: '#fff', padding: '9px 12px' }}>
                  <input placeholder="••••••••••" type="password" />
                  <Icon name="eye" size={14} color="var(--hf-ink-4)" />
                </div>
              </div>

              <label className="row" style={{ fontSize: 12, gap: 8, color: 'var(--hf-ink-3)', cursor: 'pointer', marginTop: 4 }}>
                <input type="checkbox" defaultChecked />
                Ingat saya selama 30 hari
              </label>

              <button className="btn primary lg" style={{ marginTop: 6, padding: '12px 14px' }}>
                Masuk
              </button>
            </div>

            <div style={{ marginTop: 22, fontSize: 11.5, color: 'var(--hf-ink-4)', textAlign: 'center' }}>
              Belum punya akun? <a style={{ color: 'var(--hf-green-700)', fontWeight: 600 }}>Daftar sebagai KKKS</a>
            </div>
            <div style={{ marginTop: 14, fontSize: 10.5, color: 'var(--hf-ink-5)', textAlign: 'center' }}>
              Dengan masuk Anda menyetujui <a style={{ color: 'var(--hf-ink-3)' }}>Syarat Layanan</a> dan <a style={{ color: 'var(--hf-ink-3)' }}>Kebijakan Privasi</a>.
            </div>
          </div>
        </div>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Upload Data (KKKS operator)
// ─────────────────────────────────────────────────────────────
function HfUpload() {
  return (
    <HfPage screenLabel="HF · Upload Data (KKKS)">
      <HfTopNav active="WORKSPACE" user={{ initials: 'AR', org: 'PHE ONWJ', role: 'Data Operator' }} />

      {/* Breadcrumb */}
      <div className="row" style={{
        padding: '10px 20px', borderBottom: '1px solid var(--hf-line)',
        fontSize: 11.5, color: 'var(--hf-ink-4)', gap: 6, background: 'var(--hf-surface)'
      }}>
        <a style={{ cursor: 'pointer' }}>Workspace</a>
        <Icon name="chevR" size={11} />
        <a style={{ cursor: 'pointer' }}>Data Submission</a>
        <Icon name="chevR" size={11} />
        <span style={{ color: 'var(--hf-ink)', fontWeight: 600 }}>New Upload</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px', flex: 1, minHeight: 0 }}>
        {/* Stepper */}
        <aside style={{ borderRight: '1px solid var(--hf-line)', padding: 22, background: 'var(--hf-surface-2)', overflowY: 'auto' }}>
          <div className="cap" style={{ marginBottom: 14 }}>Submission Flow</div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 13, top: 14, bottom: 14, width: 2, background: 'var(--hf-line)' }}></div>
            {[
              ['1', 'Pilih jenis data',     'done'],
              ['2', 'Upload file',          'active'],
              ['3', 'Metadata & atribut',   'todo'],
              ['4', 'Validasi otomatis',    'todo'],
              ['5', 'Review & submit',      'todo'],
              ['6', 'Approval SKK Migas',   'todo'],
            ].map(([n, t, s], i, arr) => (
              <div key={n} style={{ position: 'relative', paddingLeft: 36, paddingBottom: 18 }}>
                <span style={{
                  position: 'absolute', left: 0, top: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  border: '2px solid ' + (s === 'done' ? 'var(--hf-green-500)' : s === 'active' ? 'var(--hf-green-500)' : 'var(--hf-line-2)'),
                  background: s === 'done' ? 'var(--hf-green-500)' : s === 'active' ? '#fff' : 'var(--hf-surface)',
                  color: s === 'done' ? '#fff' : s === 'active' ? 'var(--hf-green-700)' : 'var(--hf-ink-4)',
                  fontSize: 11, fontWeight: 700, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', zIndex: 1
                }}>{s === 'done' ? <Icon name="check" size={13} color="#fff" /> : n}</span>
                <div style={{
                  fontSize: 12.5, fontWeight: s === 'active' ? 700 : 500,
                  color: s === 'todo' ? 'var(--hf-ink-4)' : 'var(--hf-ink)',
                  paddingTop: 6
                }}>{t}</div>
                {s === 'active' && <div className="xs" style={{ marginTop: 2, color: 'var(--hf-green-700)' }}>Current step</div>}
                {s === 'done' && <div className="xs" style={{ marginTop: 2 }}>Layer · Vector SHP</div>}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 12, marginTop: 8, background: 'var(--hf-amber-100)', borderColor: 'transparent' }}>
            <div className="row" style={{ gap: 6, marginBottom: 4 }}>
              <Icon name="shield" size={14} color="var(--hf-amber-700)" />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--hf-amber-700)' }}>Audit Log</span>
            </div>
            <div className="xs" style={{ color: 'var(--hf-amber-700)' }}>
              Semua aksi pada submission ini tercatat otomatis di audit trail untuk compliance.
            </div>
          </div>
        </aside>

        {/* Center */}
        <main style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="cap" style={{ color: 'var(--hf-green-700)', marginBottom: 4 }}>Step 2 of 6</div>
            <div className="h1">Upload file data</div>
            <div className="body">Drop file di sini, atau pilih dari komputer. Maksimal 5 GB per file.</div>
          </div>

          {/* Dropzone */}
          <div style={{
            padding: 48, textAlign: 'center', borderRadius: 'var(--hf-r-3)',
            background: 'var(--hf-green-50)',
            border: '2px dashed var(--hf-green-500)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
          }}>
            <span style={{
              width: 64, height: 64, borderRadius: 'var(--hf-r-3)',
              background: '#fff', border: '1px solid var(--hf-green-200)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--hf-sh-2)'
            }}>
              <Icon name="upload" size={26} color="var(--hf-green-500)" strokeWidth={1.8} />
            </span>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>Drag &amp; drop file di sini</div>
            <div className="sm">atau</div>
            <button className="btn primary lg">Pilih file dari komputer</button>
            <div className="xs" style={{ marginTop: 4, maxWidth: 480 }}>
              Format didukung: SHP, GeoJSON, KML, SEG-Y, LAS, CSV, PDF, XLSX, GeoTIFF · Maks. 5 GB
            </div>
          </div>

          {/* File list */}
          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="cap">File terpilih (3)</span>
              <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>Clear all</a>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {[
                ['WK_Boundary_ONWJ_2024.shp',        '2.1 MB',  'Uploaded',   100, 'ok',   'map'],
                ['Well_Headers_ONWJ.csv',            '348 KB',  'Uploaded',   100, 'ok',   'database'],
                ['Seismic_3D_NSumatra_NEW.segy',     '2.4 GB',  'Uploading',   67, 'busy', 'activity'],
              ].map(([n, sz, st, p, s, ico], i, arr) => (
                <div key={n} className="row" style={{
                  padding: '12px 14px', gap: 12,
                  borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: 'var(--hf-r-2)',
                    background: 'var(--hf-surface-3)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flex: '0 0 auto'
                  }}>
                    <Icon name={ico} size={15} color="var(--hf-ink-3)" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 12.5 }}>{n}</span>
                      <span className="xs num">{sz}</span>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: 'var(--hf-surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: p + '%', height: '100%',
                          background: s === 'ok' ? 'var(--hf-green-500)' : 'var(--hf-blue-500)'
                        }}></div>
                      </div>
                      <span className="xs" style={{ minWidth: 80, textAlign: 'right' }}>{st} {p < 100 ? p + '%' : ''}</span>
                    </div>
                  </div>
                  <button className="iconbtn" style={{ width: 28, height: 28, border: 0 }}>
                    {s === 'ok' ? <Icon name="check" size={14} color="var(--hf-green-600)" /> : <Icon name="x" size={14} color="var(--hf-ink-4)" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="row" style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--hf-line)' }}>
            <button className="btn"><Icon name="chevL" size={12} /> Kembali</button>
            <div className="row" style={{ marginLeft: 'auto', gap: 8 }}>
              <button className="btn">Simpan sebagai draft</button>
              <button className="btn primary">Lanjut: Metadata <Icon name="chevR" size={12} color="#fff" /></button>
            </div>
          </div>
        </main>

        {/* Right: guidelines */}
        <aside style={{ borderLeft: '1px solid var(--hf-line)', padding: 20, overflowY: 'auto', background: 'var(--hf-surface)' }}>
          <div className="cap" style={{ marginBottom: 8 }}>Guidelines</div>
          <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--hf-ink-2)', marginBottom: 18 }}>
            Setiap data yang diunggah akan melewati <b>validasi otomatis</b> (topology, schema, metadata),
            kemudian di-review oleh tim SKK Migas sebelum dipublikasikan ke ekosistem.
          </div>

          <div className="cap" style={{ marginBottom: 8 }}>SLA Approval</div>
          <div className="card" style={{ padding: 12, marginBottom: 18 }}>
            {[
              ['Validasi otomatis',  '< 10 menit',  'ok'],
              ['Review manual',      '1–3 hari',    ''],
              ['Publikasi',          'Otomatis',    ''],
            ].map(([k, v, s], i, arr) => (
              <div key={k} className="row" style={{
                padding: '6px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0,
                fontSize: 11.5
              }}>
                <span className="muted" style={{ flex: 1 }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="cap" style={{ marginBottom: 8 }}>Pre-flight Checklist</div>
          {[
            ['Geometri valid (no self-intersect)', true],
            ['CRS terdefinisi (EPSG)',              true],
            ['Atribut wajib terisi',                false],
            ['Lisensi & sensitivitas ditentukan',   false],
          ].map(([t, ok]) => (
            <div key={t} className="row" style={{ padding: '5px 0', fontSize: 11.5, gap: 8 }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4,
                border: '1.5px solid ' + (ok ? 'var(--hf-green-500)' : 'var(--hf-line-2)'),
                background: ok ? 'var(--hf-green-500)' : '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flex: '0 0 auto'
              }}>{ok && <Icon name="check" size={10} color="#fff" />}</span>
              <span style={{ color: ok ? 'var(--hf-ink-2)' : 'var(--hf-ink-3)' }}>{t}</span>
            </div>
          ))}

          <div style={{
            marginTop: 18, padding: 14, borderRadius: 'var(--hf-r-3)',
            background: 'linear-gradient(135deg, #f0f3fd, #ede6f6)',
            border: '1px solid var(--hf-blue-100)'
          }}>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--hf-r-2)',
                background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name="sparkle" size={12} color="#fff" />
              </span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>Butuh bantuan?</span>
            </div>
            <div className="xs" style={{ marginBottom: 8 }}>Tanya AI Assistant tentang requirement upload.</div>
            <button className="btn sm" style={{ width: '100%' }}>Buka AI Chat</button>
          </div>
        </aside>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Compliance / Approval (Regulator persona)
// ─────────────────────────────────────────────────────────────
function HfCompliance() {
  const queue = [
    ['WK_Boundary_ONWJ_2024.shp',        'PHE ONWJ',     '2 jam lalu',   'Layer',       'ok',   'low',    true],
    ['Well_Headers_ONWJ_Q3.csv',         'PHE ONWJ',     '4 jam lalu',   'Tabular',     'ok',   'low',    false],
    ['Seismic_3D_NSumatra_NEW.segy',     'Medco E&P',    '6 jam lalu',   'Volume',      'warn', 'med',    true],
    ['PSC_Rokan_Amendment_2024.pdf',     'SKK Migas',    '1 hari',       'Document',    'ok',   'low',    false],
    ['Pipeline_Network_TransJava.kml',   'PHE',          '1 hari',       'Layer',       'err',  'high',   true],
    ['Facility_Inventory_ONWJ.xlsx',     'PHE ONWJ',     '2 hari',       'Tabular',     'ok',   'low',    false],
  ];
  const valToken = { ok: ['green', 'OK'], warn: ['amber', 'Warning'], err: ['red', 'Failed'] };
  const riskToken = { low: 'green', med: 'amber', high: 'red' };

  return (
    <HfPage screenLabel="HF · Compliance (Regulator)">
      <HfTopNav active="MONITORING" user={{ initials: 'CR', org: 'SKK Migas', role: 'Compliance Officer' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="cap" style={{ color: 'var(--hf-green-700)' }}>Regulator workspace</div>
            <div className="h1">Compliance &amp; Approvals</div>
            <div className="body">Review data submission dari seluruh KKKS · Q3 2024</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm">Period: 30 hari <Icon name="chevron" size={11} /></button>
            <button className="btn sm">KKKS: Semua <Icon name="chevron" size={11} /></button>
            <button className="btn sm"><Icon name="download" size={12} /> Export</button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          <HfKpi label="Pending Review"    value="14"    sub="3 urgent · 2 stale" icon="clock"  color="var(--hf-amber-500)" />
          <HfKpi label="Approved (30d)"    value="186"   delta="+12%"   sub="MoM"      icon="check"  />
          <HfKpi label="Rejected (30d)"    value="7"     sub="4 quality · 3 policy"  icon="warn"   color="var(--hf-red-500)" />
          <HfKpi label="Avg Approval"      value="2.4d"  sub="SLA 3 hari"            icon="bolt"   color="var(--hf-blue-500)" />
          <HfKpi label="Compliance Rate"   value="96%"   delta="+2.4%"  sub="all KKKS" icon="shield" />
        </div>

        {/* Queue */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--hf-line)' }}>
            <div className="h3">Approval Queue</div>
            <span className="pill red dot" style={{ marginLeft: 8 }}>3 critical</span>
            <div style={{ marginLeft: 'auto' }} className="row" >
              {[
                ['Pending', 14, 'green', true],
                ['Review',  6,  'ghost', false],
                ['Approved',186,'ghost', false],
                ['Rejected',7,  'ghost', false],
              ].map(([t, c, p, on]) => (
                <span key={t} className={'pill ' + p} style={{ cursor: 'pointer' }}>
                  {t} <span className="num" style={{ marginLeft: 4, opacity: .6 }}>{c}</span>
                </span>
              ))}
            </div>
          </div>
          <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--hf-ink-4)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '.07em' }}>
                {['', 'Dataset', 'KKKS', 'Submitted', 'Type', 'Validation', 'Risk', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid var(--hf-line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map(([n, k, ts, ty, val, risk, urg], i, arr) => {
                const [vCol, vLabel] = valToken[val];
                return (
                  <tr key={i} style={{ background: urg && i % 2 === 0 ? 'var(--hf-red-100)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                      <div style={{ fontWeight: 600 }}>{n}</div>
                      {urg && <div className="xs"><span className="pill red dot" style={{ fontSize: 9 }}>Urgent</span></div>}
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>{k}</td>
                    <td className="muted" style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>{ts}</td>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>{ty}</td>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                      <span className={'pill ' + vCol + ' dot'} style={{ fontSize: 10 }}>{vLabel}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                      <span className={'pill ' + riskToken[risk]} style={{ fontSize: 10, textTransform: 'capitalize' }}>{risk}</span>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
                      <div className="row" style={{ gap: 4 }}>
                        <button className="btn primary sm" style={{ padding: '4px 9px' }}><Icon name="check" size={11} color="#fff" /> Approve</button>
                        <button className="btn sm" style={{ padding: '4px 9px' }}>Review</button>
                        <button className="btn ghost sm" style={{ padding: '4px 8px', color: 'var(--hf-red-500)' }}>Reject</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="h3" style={{ marginBottom: 14 }}>Compliance per KKKS</div>
            {[
              ['PHE ONWJ',              98, 'var(--hf-green-500)',  '12 approved · 0 pending'],
              ['Pertamina Hulu Mahakam', 96, 'var(--hf-green-500)',  '18 approved · 1 pending'],
              ['Medco E&P',              91, 'var(--hf-amber-500)',  '8 approved · 2 review'],
              ['Harbour Energy',         88, 'var(--hf-amber-500)',  '6 approved · 1 review'],
              ['Premier Oil',            78, 'var(--hf-red-500)',    '4 approved · 1 rejected'],
            ].map(([k, v, c, sub]) => (
              <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid var(--hf-line)' }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{k}</span>
                  <span className="num" style={{ fontWeight: 700, color: c }}>{v}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--hf-surface-3)', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                  <div style={{ width: v + '%', height: '100%', background: c }}></div>
                </div>
                <div className="xs">{sub}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="h3">Audit Trail</div>
              <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>Full log →</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['CR',  'citra@skkmigas',  'approved',  'WK_Boundary_ONWJ_2024.shp', 'green', '12:48'],
                ['BD',  'budi@skkmigas',   'started review',  'Seismic_3D_NSumatra.segy', 'blue',  '12:31'],
                ['CR',  'citra@skkmigas',  'approved',  'PSC_Rokan_2024.pdf', 'green', '11:52'],
                ['DW',  'dewi@skkmigas',   'rejected',  'Pipeline_TransJava.kml', 'red',   '11:18'],
                ['—',   'system',          'validated',  'Well_Headers_PHM.csv', 'green', '10:34'],
                ['AH',  'ahmad@skkmigas',  'commented',  'Facility_Inventory.xlsx', 'blue',  '09:12'],
              ].map(([init, who, verb, what, c, time], i, arr) => (
                <div key={i} className="row" style={{
                  padding: '8px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0,
                  gap: 10
                }}>
                  <span className="avatar sm" style={{ width: 22, height: 22, fontSize: 9, background: 'var(--hf-surface-3)', color: 'var(--hf-ink-3)', borderColor: 'var(--hf-line-2)' }}>{init}</span>
                  <div style={{ flex: 1, fontSize: 11.5 }}>
                    <span style={{ fontWeight: 600 }}>{who}</span>{' '}
                    <span className={c === 'red' ? '' : 'muted'} style={{ color: c === 'red' ? 'var(--hf-red-500)' : c === 'green' ? 'var(--hf-green-700)' : 'var(--hf-ink-3)', fontWeight: c === 'red' || c === 'green' ? 600 : 500 }}>{verb}</span>{' '}
                    <span style={{ color: 'var(--hf-blue-600)' }} className="mono">{what}</span>
                  </div>
                  <span className="xs num">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Empty / 404
// ─────────────────────────────────────────────────────────────
function HfEmpty() {
  return (
    <HfPage screenLabel="HF · Empty / 404">
      <HfTopNav active="" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--hf-bg)' }}>
        <div style={{ width: 540, textAlign: 'center' }}>
          {/* Illustration */}
          <div style={{ marginBottom: 28, position: 'relative', height: 180 }}>
            <svg viewBox="0 0 320 180" width="320" height="180" style={{ margin: '0 auto', display: 'block' }}>
              <defs>
                <pattern id="hf-empty-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M20 0H0v20" fill="none" stroke="var(--hf-line)" strokeWidth=".8" />
                </pattern>
                <linearGradient id="hf-empty-land" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--hf-green-100)" />
                  <stop offset="100%" stopColor="var(--hf-green-200)" />
                </linearGradient>
              </defs>
              <rect x="20" y="20" width="280" height="140" rx="10" fill="var(--hf-water)" stroke="var(--hf-line-2)" strokeWidth="1.4" />
              <rect x="20" y="20" width="280" height="140" rx="10" fill="url(#hf-empty-grid)" />
              {/* abstract island */}
              <path d="M120 80 Q150 70 180 90 Q210 110 200 130 Q180 145 150 138 Q125 128 115 110 Q110 92 120 80 Z"
                fill="url(#hf-empty-land)" stroke="var(--hf-green-500)" strokeWidth="1.4" strokeDasharray="4 4" />
              {/* big question */}
              <text x="160" y="120" textAnchor="middle"
                fontFamily="Inter Tight, sans-serif" fontSize="56" fontWeight="700"
                fill="var(--hf-green-700)" opacity=".5">?</text>
              {/* pin */}
              <g transform="translate(220 65)">
                <circle r="11" fill="rgba(255,255,255,.95)" stroke="var(--hf-red-500)" strokeWidth="1.6" />
                <circle r="4" fill="var(--hf-red-500)" />
              </g>
            </svg>
          </div>

          <div className="cap" style={{ color: 'var(--hf-green-700)', marginBottom: 6 }}>404 · Not Found</div>
          <div className="display" style={{ marginBottom: 10 }}>Halaman tidak ditemukan</div>
          <div className="body" style={{ marginBottom: 22, maxWidth: 440, margin: '0 auto 22px' }}>
            Halaman atau dataset yang Anda cari mungkin sudah dipindahkan, dihapus, atau belum
            tersedia di ekosistem SPEKTRUM.
          </div>

          <div className="row" style={{ justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            <button className="btn"><Icon name="chevL" size={12} /> Kembali</button>
            <button className="btn primary lg"><Icon name="map" size={13} color="#fff" /> Ke Explore Data</button>
            <button className="btn">Lapor masalah</button>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div className="cap" style={{ marginBottom: 8, textAlign: 'center' }}>Mungkin Anda cari</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Working Area (WK) Boundary — ONWJ',   'Administrative · SHP'],
                ['Seismic 3D — North Sumatra Basin',    'Seismic · SEG-Y'],
                ['Well Location',                        'Well · SHP'],
                ['PSC Document — Rokan',                 'Document · PDF'],
              ].map(([t, sub]) => (
                <div key={t} className="card" style={{ padding: 12, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 2 }}>{t}</div>
                  <div className="xs">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HfPage>
  );
}

Object.assign(window, { HfLogin, HfUpload, HfCompliance, HfEmpty });
