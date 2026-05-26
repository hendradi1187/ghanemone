// AlasBuana Hi-Fi — Map View, Analytics, Workspace, Apps

// ─────────────────────────────────────────────────────────────
// HF · Map View (full-bleed) — toggleable layers, with Seismic 3D
// cross-section that drops into view when subsurface layer is on.
// ─────────────────────────────────────────────────────────────
function HfMapView() {
  const [layers, setLayers] = React.useState({
    wk: true, block: true, field: true, well: true,
    pipeline: false, facility: false, seismic_survey: false, basemap: true,
    seismic3d: false,
    horizon: true, fault: true,
  });
  const toggle = (k) => setLayers(l => ({ ...l, [k]: !l[k] }));

  const seismicOn = layers.seismic3d;

  return (
    <HfPage screenLabel="HF 05 · Map View">
      <HfTopNav active="MAP" />
      <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>

        {/* MAP region — shrinks when seismic 3D is shown */}
        <div style={{ flex: seismicOn ? '1 1 50%' : '1 1 100%', position: 'relative', minHeight: 0, transition: 'flex .25s var(--hf-ease)' }}>
          <HfMap withPins={layers.well} withCoords />

          {/* Top floating search */}
          <div style={{
            position: 'absolute', top: 16, left: 16, width: 360, zIndex: 500,
            background: '#fff', border: '1px solid var(--hf-line)',
            borderRadius: 'var(--hf-r-3)', boxShadow: 'var(--hf-sh-3)', overflow: 'hidden'
          }}>
            <div className="row" style={{ padding: '10px 14px', gap: 8 }}>
              <Icon name="search" size={15} color="var(--hf-ink-4)" />
              <input placeholder="Cari area, WK, sumur, seismic…" style={{
                flex: 1, border: 0, outline: 0, background: 'transparent',
                font: '400 13px/1.4 var(--hf-font-sans)', color: 'var(--hf-ink)'
              }} />
              <span className="pill ghost">⌘K</span>
            </div>
          </div>

          {/* Left: Layers panel */}
          <div style={{
            position: 'absolute', top: 80, left: 16, width: 280, maxHeight: 'calc(100% - 100px)', zIndex: 500,
            background: '#fff', border: '1px solid var(--hf-line)',
            borderRadius: 'var(--hf-r-3)', boxShadow: 'var(--hf-sh-3)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div className="row" style={{ padding: '12px 14px 10px', justifyContent: 'space-between' }}>
              <div className="h3" style={{ fontSize: 13 }}>Layers</div>
              <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600, cursor: 'pointer' }}>+ Add</a>
            </div>

            <div style={{ padding: '0 14px 14px', overflowY: 'auto' }}>
              {/* Surface */}
              <div className="cap" style={{ marginTop: 2, marginBottom: 6 }}>Surface Layers</div>
              {[
                ['wk',           'Working Area (WK)', 'var(--hf-purple-500)', 248],
                ['block',        'Block / Contract',  'var(--hf-green-500)',   58],
                ['field',        'Field',             'var(--hf-amber-500)',   42],
                ['well',         'Well',              'var(--hf-green-500)', 1024],
                ['pipeline',     'Pipeline',          'var(--hf-blue-500)',   312],
                ['facility',     'Facility',          'var(--hf-red-500)',     86],
                ['seismic_survey','Seismic Survey',   'var(--hf-purple-500)', 167],
                ['basemap',      'Basemap',           '#6b7891',                 1],
              ].map(([k, n, c, count]) => (
                <LayerToggle key={k} k={k} label={n} color={c} count={count}
                  on={layers[k]} onToggle={() => toggle(k)} />
              ))}

              {/* Subsurface */}
              <div className="cap" style={{ marginTop: 14, marginBottom: 6 }}>Subsurface Layers</div>
              <LayerToggle k="seismic3d" label="Seismic 3D" color="var(--hf-red-500)" count={42}
                on={layers.seismic3d} onToggle={() => toggle('seismic3d')} />

              {seismicOn && (
                <>
                  {/* Seismic survey detail (when active) */}
                  <div style={{ marginLeft: 22, marginTop: 6, padding: '8px 10px', background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)' }}>
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>SUMATRA_3D_VOL_01</span>
                      <Icon name="chevron" size={11} color="var(--hf-ink-4)" />
                    </div>
                    <div className="xs" style={{ marginBottom: 4 }}>Amplitude</div>
                    <div style={{
                      height: 8, borderRadius: 4,
                      background: 'linear-gradient(90deg, #000 0%, #5a5550 40%, #a87055 70%, #ff7a3c 100%)'
                    }}></div>
                    <div className="row" style={{ justifyContent: 'space-between', fontSize: 9, marginTop: 2, color: 'var(--hf-ink-5)' }}>
                      <span>Low</span><span>High</span>
                    </div>
                  </div>

                  {/* Horizon group */}
                  <div style={{ marginTop: 10 }}>
                    <LayerToggle k="horizon" label="Horizon" color="var(--hf-blue-500)" count={5}
                      on={layers.horizon} onToggle={() => toggle('horizon')} />
                    {layers.horizon && (
                      <div style={{ marginLeft: 22, marginTop: 2 }}>
                        {[
                          ['#7a5cb8', 'Top Basement'],
                          ['#2a5fb8', 'Top Post-Rift'],
                          ['#2bbfa6', 'Top Syn-Rift'],
                          ['#4ea96c', 'Top Pre-Rift'],
                          ['#f0c419', 'Top Reservoir'],
                        ].map(([c, l]) => (
                          <div key={l} className="row" style={{ padding: '3px 0', fontSize: 11, gap: 8 }}>
                            <span style={{ width: 10, height: 2, background: c, borderRadius: 1, flex: '0 0 auto' }}></span>
                            <span style={{ color: 'var(--hf-ink-2)' }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fault group */}
                  <div style={{ marginTop: 4 }}>
                    <LayerToggle k="fault" label="Fault" color="var(--hf-red-500)" count={2}
                      on={layers.fault} onToggle={() => toggle('fault')} />
                    {layers.fault && (
                      <div style={{ marginLeft: 22, marginTop: 2 }}>
                        <div className="row" style={{ padding: '3px 0', fontSize: 11, gap: 8 }}>
                          <span style={{ width: 14, height: 2, background: 'var(--hf-red-500)', flex: '0 0 auto' }}></span>
                          <span style={{ color: 'var(--hf-ink-2)' }}>Major Fault</span>
                        </div>
                        <div className="row" style={{ padding: '3px 0', fontSize: 11, gap: 8 }}>
                          <span style={{
                            width: 14, height: 0, flex: '0 0 auto',
                            borderTop: '1.8px dashed var(--hf-amber-500)'
                          }}></span>
                          <span style={{ color: 'var(--hf-ink-2)' }}>Minor Fault</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* View toggle (2D / 3D / Split) — top-center */}
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 500,
            display: 'inline-flex', background: '#fff', border: '1px solid var(--hf-line)',
            borderRadius: 'var(--hf-r-2)', padding: 2, boxShadow: 'var(--hf-sh-2)'
          }}>
            <span className={'btn sm ' + (!seismicOn ? 'primary' : 'ghost')} style={{ borderRadius: 4, padding: '5px 12px' }}>
              <Icon name="map" size={12} color={!seismicOn ? '#fff' : 'currentColor'} /> 2D Map
            </span>
            <span className={'btn sm ' + (seismicOn ? 'primary' : 'ghost')} style={{ borderRadius: 4, padding: '5px 12px' }} onClick={() => toggle('seismic3d')}>
              <Icon name="layers" size={12} color={seismicOn ? '#fff' : 'currentColor'} /> 3D Scene
            </span>
            <span className="btn ghost sm" style={{ borderRadius: 4, padding: '5px 12px' }}>
              <Icon name="grid" size={12} /> Split View
            </span>
          </div>

          {/* Right info card — block info OR seismic well details */}
          {!seismicOn && <BlockInfoCard />}

          {/* Bottom toolbar — only when not in seismic mode */}
          {!seismicOn && (
            <div style={{
              position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', zIndex: 500,
              background: '#fff', border: '1px solid var(--hf-line)',
              borderRadius: 'var(--hf-r-pill)', boxShadow: 'var(--hf-sh-3)',
              padding: 4, display: 'flex', gap: 0
            }}>
              {[
                ['layers',  'Layers'],
                ['filter',  'Filters'],
                ['pin',     'Measure'],
                ['download','Export'],
                ['share',   'Share'],
              ].map(([ico, l]) => (
                <button key={l} className="btn ghost sm" style={{ padding: '6px 12px', borderRadius: 'var(--hf-r-pill)' }}>
                  <Icon name={ico} size={13} /> {l}
                </button>
              ))}
            </div>
          )}

          {/* AI assistant */}
          {!seismicOn && <HfAiPill expanded style={{ position: 'absolute', right: 16, bottom: 18, zIndex: 500 }} />}
        </div>

        {/* Seismic 3D cross-section panel */}
        {seismicOn && (
          <div style={{
            flex: '1 1 50%', minHeight: 0,
            borderTop: '1px solid var(--hf-line)',
            background: '#0a0e15',
            position: 'relative', display: 'flex', flexDirection: 'column'
          }}>
            <SeismicCrossSection showHorizons={layers.horizon} showFaults={layers.fault} />
          </div>
        )}
      </div>

      {/* RIGHT panel docks outside the main area when seismic mode is on */}
      {seismicOn && (
        <WellDetailsPanel onClose={() => toggle('seismic3d')} />
      )}
    </HfPage>
  );
}

// Re-usable layer toggle row
function LayerToggle({ k, label, color, count, on, onToggle }) {
  return (
    <div className="row" style={{ padding: '5px 0', fontSize: 12, gap: 8, cursor: 'pointer' }}
      onClick={onToggle}>
      <span style={{
        width: 14, height: 14, borderRadius: 3,
        border: '1.5px solid ' + color, background: on ? color : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
        transition: 'background var(--hf-dur)'
      }}>{on && <Icon name="check" size={9} color="#fff" />}</span>
      <span style={{ flex: 1, color: on ? 'var(--hf-ink)' : 'var(--hf-ink-4)' }}>{label}</span>
      {/* progress / opacity slider hint */}
      <span style={{
        width: 60, height: 4, borderRadius: 2,
        background: 'var(--hf-surface-3)', overflow: 'hidden', flex: '0 0 auto'
      }}>
        {on && <span style={{ display: 'block', width: '100%', height: '100%', background: color }}></span>}
      </span>
      <span className="num xs" style={{ color: 'var(--hf-ink-4)', minWidth: 32, textAlign: 'right' }}>
        {on ? '100%' : count.toLocaleString()}
      </span>
    </div>
  );
}

// Block selection card (visible when not in seismic mode)
function BlockInfoCard() {
  return (
    <div style={{
      position: 'absolute', top: 80, right: 16, width: 320, zIndex: 500,
      background: '#fff', border: '1px solid var(--hf-line)',
      borderRadius: 'var(--hf-r-3)', boxShadow: 'var(--hf-sh-3)', overflow: 'hidden'
    }}>
      <div style={{
        height: 110, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--hf-water), var(--hf-water-2))',
        borderBottom: '1px solid var(--hf-line)'
      }}>
        <svg viewBox="0 0 320 110" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <rect x="60" y="22" width="200" height="70" fill="rgba(31,138,74,.18)" stroke="rgba(31,138,74,.7)" strokeWidth="1.4" />
          {[[100,35],[140,55],[180,40],[210,68],[150,75],[235,50]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="5" fill="rgba(255,255,255,.95)" stroke="var(--hf-green-500)" strokeWidth="1.4" />
              <circle r="1.8" fill="var(--hf-green-500)" />
            </g>
          ))}
        </svg>
      </div>
      <div style={{ padding: 14 }}>
        <div className="row" style={{ gap: 6, marginBottom: 6 }}>
          <span className="pill green-solid" style={{ fontSize: 9 }}>BLOCK</span>
          <span className="pill green dot">Verified</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>WK Boundary — ONWJ</div>
        <div className="sm" style={{ marginBottom: 10 }}>PHE ONWJ · Active · 13,978.45 km²</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
          {[['23','Sumur'],['4','Lapangan'],['12.4K','BOPD']].map(([n, l]) => (
            <div key={l} style={{ padding: '6px 8px', background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)' }}>
              <div className="num" style={{ fontWeight: 700, fontSize: 14 }}>{n}</div>
              <div className="xs">{l}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm" style={{ flex: 1 }}>Details</button>
          <button className="btn primary sm" style={{ flex: 1 }}><Icon name="bolt" size={11} color="#fff" /> Analyze</button>
        </div>
      </div>
    </div>
  );
}

// Well Details panel — replaces the regular info card when seismic mode is on
function WellDetailsPanel({ onClose }) {
  return (
    <aside style={{
      position: 'absolute', top: 72, right: 0, bottom: 0, width: 320,
      background: 'var(--hf-surface)', borderLeft: '1px solid var(--hf-line)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 600, boxShadow: '-8px 0 24px rgba(14,23,38,.06)'
    }}>
      <div className="row" style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--hf-line)' }}>
        <div className="cap">Well Details</div>
        <button className="iconbtn" style={{ width: 26, height: 26, marginLeft: 'auto', border: 0 }}
          onClick={onClose}><Icon name="x" size={14} /></button>
      </div>

      <div style={{ overflowY: 'auto', padding: 16 }}>
        <div className="row" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>GWN-01</span>
          <span className="pill green dot" style={{ marginLeft: 'auto' }}>Active</span>
        </div>
        <div className="row" style={{ marginBottom: 14, gap: 6, color: 'var(--hf-ink-3)', fontSize: 11.5 }}>
          <Icon name="pin" size={12} color="var(--hf-green-500)" />
          <span>Jambi Sub Basin, South Sumatra Basin</span>
        </div>

        <div className="card card-flat" style={{ overflow: 'hidden', marginBottom: 14 }}>
          {[
            ['Well Type',     'Exploration'],
            ['Operator',      'PT. Ghanem Energy'],
            ['Spud Date',     '12 Jan 2022'],
            ['Total Depth',   '3,250 m MD'],
            ['Status',        'Active', 'var(--hf-green-600)'],
            ['TD Date',       '28 Apr 2022'],
            ['Field',         'Ghanem Field'],
            ['Formation',     'Bekasap Formation'],
            ['Reservoir',     'Sandstone'],
            ['Last Update',   '20 May 2024'],
          ].map(([k, v, color], i, arr) => (
            <div key={k} className="row" style={{
              padding: '7px 12px', fontSize: 11.5,
              borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0, gap: 8
            }}>
              <span className="muted" style={{ flex: '0 0 100px', whiteSpace: 'nowrap' }}>{k}</span>
              <span className="num" style={{ fontWeight: 600, color: color || 'var(--hf-ink)', whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="row" style={{ gap: 6, marginBottom: 18 }}>
          <button className="btn sm" style={{ flex: 1 }}><Icon name="doc" size={11} /> Detail</button>
          <button className="btn sm" style={{ flex: 1 }}><Icon name="chart" size={11} /> Chart</button>
          <button className="btn sm" style={{ flex: 1 }}><Icon name="doc" size={11} /> Report</button>
        </div>

        <div className="cap" style={{ marginBottom: 8 }}>Seismic Information</div>
        <div className="card card-flat" style={{ overflow: 'hidden', marginBottom: 14 }}>
          {[
            ['Survey Name',     'SUMATRA_3D_VOL_01'],
            ['Type',            '3D Seismic'],
            ['Inline Range',    '1001 – 1850'],
            ['Xline Range',     '2001 – 2850'],
            ['Sample Interval', '2 ms'],
            ['Bin Size',        '12.5m × 12.5m'],
            ['Vertical Range',  '0 – 8,000 ms'],
            ['Phase',           'Full Stack'],
          ].map(([k, v], i, arr) => (
            <div key={k} className="row" style={{
              padding: '6px 12px', fontSize: 11.5,
              borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0, gap: 8
            }}>
              <span className="muted" style={{ flex: '0 0 100px', whiteSpace: 'nowrap' }}>{k}</span>
              <span className="num" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="cap" style={{ marginBottom: 6 }}>Amplitude</div>
        <div style={{
          height: 10, borderRadius: 5,
          background: 'linear-gradient(90deg, #000 0%, #5a5550 40%, #a87055 70%, #ff7a3c 100%)',
          marginBottom: 4
        }}></div>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 10, color: 'var(--hf-ink-5)', marginBottom: 16 }}>
          <span>Low</span><span>High</span>
        </div>

        <div className="cap" style={{ marginBottom: 8 }}>Horizon Depth (TVDSS)</div>
        <div className="card card-flat" style={{ overflow: 'hidden' }}>
          <div className="row" style={{ padding: '6px 12px', fontSize: 10, color: 'var(--hf-ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--hf-line)' }}>
            <span style={{ flex: 1 }}>Horizon</span>
            <span>Depth (m)</span>
          </div>
          {[
            ['Top Reservoir',  '2,650', '#f0c419'],
            ['Top Pre-Rift',   '3,150', '#4ea96c'],
            ['Top Syn-Rift',   '3,850', '#2bbfa6'],
            ['Top Post-Rift',  '4,650', '#2a5fb8'],
            ['Top Basement',   '6,100', '#7a5cb8'],
          ].map(([k, v, c], i, arr) => (
            <div key={k} className="row" style={{
              padding: '6px 12px', fontSize: 11.5,
              borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0, gap: 8
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flex: '0 0 auto' }}></span>
              <span style={{ flex: 1, color: c, fontWeight: 600 }}>{k}</span>
              <span className="num" style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// SeismicCrossSection — bottom 3D-look cross-section view
// ─────────────────────────────────────────────────────────────
function SeismicCrossSection({ showHorizons = true, showFaults = true }) {
  // Procedurally generated wavy seismic bands.
  // Each "band" is a polyline at increasing depth; we draw a stack of
  // them with subtle tonal variation so the result reads as seismic data.
  const W = 1100, H = 380;
  const wells = [
    { id: 'GWN-01', x: 0.18, color: '#4ea96c' },
    { id: 'GWN-02', x: 0.39, color: '#f0c419' },
    { id: 'GWN-03', x: 0.60, color: '#f0c419' },
    { id: 'GWN-04', x: 0.82, color: '#e8593e' },
  ];

  // Build wavy bands: y0 baseline + amplitude
  const bands = [];
  for (let i = 0; i < 60; i++) {
    const y = 80 + i * 5.2;
    const amp = 8 + (i % 7) * 2;
    const freq1 = 0.007 + (i % 3) * 0.001;
    const freq2 = 0.012 + (i % 4) * 0.001;
    const phase = i * 0.4;
    const pts = [];
    for (let x = 0; x <= W; x += 8) {
      const wave = Math.sin(x * freq1 + phase) * amp + Math.cos(x * freq2 + phase * .7) * amp * .4;
      pts.push(`${x},${y + wave - i * 0.6}`); // slight tilt
    }
    const opacity = 0.35 + ((i * 31) % 100) / 300;
    const tone = ((i * 17) % 100) / 100;
    const col = tone < .4 ? '#1a1f28' : tone < .7 ? '#3a3530' : '#7a5e4a';
    bands.push({ pts: pts.join(' '), opacity, col });
  }

  // Horizon lines — wavy across the section
  const horizons = [
    { color: '#f0c419', baseline: 130, amp: 14, label: 'Top Reservoir' },
    { color: '#4ea96c', baseline: 175, amp: 18, label: 'Top Pre-Rift' },
    { color: '#2bbfa6', baseline: 225, amp: 16, label: 'Top Syn-Rift' },
    { color: '#2a5fb8', baseline: 280, amp: 14, label: 'Top Post-Rift' },
    { color: '#7a5cb8', baseline: 340, amp: 12, label: 'Top Basement' },
  ];

  const horizonPath = (baseline, amp) => {
    const pts = [];
    for (let x = 0; x <= W; x += 18) {
      const w = Math.sin(x * 0.008) * amp + Math.cos(x * 0.014) * amp * .5;
      pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${baseline + w}`);
    }
    return pts.join(' ');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      {/* SVG cross-section */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="seismic-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1a1410" />
              <stop offset="100%" stopColor="#0d0a07" />
            </linearGradient>
            <linearGradient id="seismic-top-shadow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0a0e15" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0a0e15" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Dark seismic background */}
          <rect x="0" y="0" width={W} height={H} fill="url(#seismic-bg)" />

          {/* Stacked wavy bands */}
          {bands.map((b, i) => (
            <polyline key={i} points={b.pts} fill="none" stroke={b.col} strokeWidth="1.2" opacity={b.opacity} />
          ))}

          {/* Slight shadow at top to fade in */}
          <rect x="0" y="0" width={W} height="60" fill="url(#seismic-top-shadow)" />

          {/* Faults */}
          {showFaults && (
            <g>
              {/* Major faults (red, diagonal) */}
              <path d="M 280 60 L 360 380" stroke="#ff4d3d" strokeWidth="1.6" fill="none" opacity=".85" />
              <path d="M 760 60 L 700 380" stroke="#ff4d3d" strokeWidth="1.6" fill="none" opacity=".85" />
              <path d="M 870 80 L 810 380" stroke="#ff4d3d" strokeWidth="1.6" fill="none" opacity=".85" />
              {/* Minor faults (yellow dashed) */}
              <path d="M 480 80 L 520 380" stroke="#f0c419" strokeWidth="1.2" strokeDasharray="6 4" fill="none" opacity=".7" />
              <path d="M 600 80 L 580 380" stroke="#f0c419" strokeWidth="1.2" strokeDasharray="6 4" fill="none" opacity=".7" />
            </g>
          )}

          {/* Horizons */}
          {showHorizons && horizons.map((h, i) => (
            <path key={i} d={horizonPath(h.baseline, h.amp)} stroke={h.color} strokeWidth="1.8" fill="none" opacity=".95" />
          ))}

          {/* Wells (vertical) */}
          {wells.map((w, i) => {
            const x = w.x * W;
            return (
              <g key={w.id}>
                {/* well track */}
                <line x1={x} y1="60" x2={x} y2={H - 20} stroke={w.color} strokeWidth="2" strokeDasharray="4 3" opacity=".9" />
                {/* surface marker */}
                <rect x={x - 6} y="42" width="12" height="12" fill={w.color} />
                {/* TD circle */}
                <circle cx={x} cy={H - 20} r="3" fill={w.color} />
              </g>
            );
          })}

          {/* Depth ticks on left */}
          {[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000].map((d, i) => {
            const y = 60 + (i / 8) * (H - 80);
            return (
              <g key={d}>
                <text x="36" y={y + 4} fill="#9aa4bb" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="end">{d}</text>
                <line x1="40" y1={y} x2={W - 8} y2={y} stroke="#ffffff" strokeWidth=".4" opacity=".05" />
              </g>
            );
          })}
        </svg>

        {/* TWT label */}
        <div style={{
          position: 'absolute', left: 8, bottom: 22,
          fontSize: 9, fontFamily: 'var(--hf-font-mono)', color: '#9aa4bb',
          transform: 'rotate(-90deg)', transformOrigin: 'left bottom'
        }}>TWT (ms)</div>

        {/* Well labels (above SVG, positioned with %) */}
        {wells.map(w => (
          <div key={w.id} style={{
            position: 'absolute', top: 8, left: `${w.x * 100}%`,
            transform: 'translateX(-50%)',
            color: w.color, fontSize: 12, fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap'
          }}>{w.id}</div>
        ))}

        {/* Orientation cube bottom-right */}
        <div style={{
          position: 'absolute', right: 16, bottom: 12, width: 70, height: 70,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 10, fontWeight: 700
        }}>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
            {/* iso cube */}
            <polygon points="50,15 90,35 90,75 50,95 10,75 10,35" fill="none" stroke="#fff" strokeWidth=".8" opacity=".55" />
            <polygon points="10,35 50,55 50,95" fill="rgba(31,138,74,.4)" stroke="#fff" strokeWidth=".8" opacity=".7" />
            <polygon points="50,55 90,35 90,75 50,95" fill="rgba(42,95,184,.4)" stroke="#fff" strokeWidth=".8" opacity=".7" />
            <polygon points="10,35 50,15 90,35 50,55" fill="rgba(192,132,13,.4)" stroke="#fff" strokeWidth=".8" opacity=".7" />
          </svg>
          <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.65)' }}>N</div>
          <div style={{ position: 'absolute', bottom: 2, left: 0, color: 'rgba(255,255,255,.65)' }}>W</div>
          <div style={{ position: 'absolute', bottom: 2, right: 0, color: 'rgba(255,255,255,.65)' }}>E</div>
        </div>
      </div>

      {/* Bottom toolbar — view mode tabs */}
      <div style={{
        flex: '0 0 auto', padding: '10px 16px',
        borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--hf-font-mono)', color: '#9aa4bb' }}>25 km</span>
        <div style={{ width: 60, height: 2, background: 'rgba(255,255,255,.5)' }}></div>

        <div style={{ marginLeft: 20, display: 'flex', gap: 4 }}>
          {[
            ['Cross Section', true],
            ['Inline',        false],
            ['Xline',         false],
            ['Time Slice',    false],
            ['Depth Slice',   false],
          ].map(([t, on]) => (
            <span key={t} style={{
              padding: '5px 12px', fontSize: 11.5, fontWeight: 600,
              borderRadius: 'var(--hf-r-2)', cursor: 'pointer',
              background: on ? 'var(--hf-green-500)' : 'transparent',
              color: on ? '#fff' : '#9aa4bb',
              border: on ? '1px solid var(--hf-green-600)' : '1px solid transparent'
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Analytics (chart builder)
// ─────────────────────────────────────────────────────────────
function HfAnalytics() {
  return (
    <HfPage screenLabel="HF 06 · Analytics">
      <HfTopNav active="ANALYTICS" />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left: Data sources sidebar */}
        <aside style={{
          flex: '0 0 240px', borderRight: '1px solid var(--hf-line)',
          background: 'var(--hf-surface-2)', overflowY: 'auto'
        }}>
          <div style={{ padding: 16 }}>
            <div className="cap" style={{ marginBottom: 8 }}>Datasets (5)</div>
            {[
              ['WK Boundary — ONWJ',          'PH', 'layer', 'var(--hf-amber-500)'],
              ['Well Production Q3',          'PHM', 'database', 'var(--hf-green-500)'],
              ['Seismic 3D N.Sumatra',        'ME', 'map', 'var(--hf-blue-500)'],
              ['Field Boundary',              'PH', 'layer', 'var(--hf-amber-500)'],
              ['Facility Inventory',          'PH', 'database', 'var(--hf-amber-500)'],
            ].map(([n, init, ico, color], i) => (
              <div key={i} style={{
                padding: 8, marginBottom: 4, borderRadius: 'var(--hf-r-2)',
                background: i === 1 ? 'var(--hf-green-50)' : 'transparent',
                border: i === 1 ? '1px solid var(--hf-green-200)' : '1px solid transparent',
                cursor: 'pointer'
              }}>
                <div className="row" style={{ gap: 6, marginBottom: 4 }}>
                  <Icon name={ico} size={13} color={color} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, flex: 1 }}>{n}</span>
                </div>
                <div className="row" style={{ gap: 6, fontSize: 10, color: 'var(--hf-ink-4)' }}>
                  <span className="avatar sm" style={{ width: 16, height: 16, fontSize: 8, background: 'transparent', borderColor: color, color: color }}>{init}</span>
                  <span>· {Math.floor(Math.random() * 90 + 20)} fields</span>
                </div>
              </div>
            ))}
            <button className="btn sm" style={{ width: '100%', marginTop: 8 }}>
              <Icon name="plus" size={11} /> Add dataset
            </button>
          </div>

          <div style={{ padding: '0 16px 16px' }}>
            <div className="cap" style={{ marginBottom: 8 }}>Fields · Well Production Q3</div>
            {[
              ['Well Name',         'text'],
              ['Field',             'text'],
              ['Operator',          'text'],
              ['Production BOPD',   'num'],
              ['Pressure (psi)',    'num'],
              ['Date',              'date'],
              ['Latitude',          'geo'],
              ['Longitude',         'geo'],
            ].map(([n, t], i) => (
              <div key={n} className="row" style={{ padding: '4px 6px', borderRadius: 4, fontSize: 11.5, gap: 6, cursor: 'grab' }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 3, fontSize: 9, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: t === 'num' ? 'var(--hf-blue-50)' : t === 'geo' ? 'var(--hf-green-50)' : t === 'date' ? 'var(--hf-amber-100)' : 'var(--hf-surface-3)',
                  color: t === 'num' ? 'var(--hf-blue-600)' : t === 'geo' ? 'var(--hf-green-700)' : t === 'date' ? 'var(--hf-amber-700)' : 'var(--hf-ink-3)',
                  flex: '0 0 auto'
                }}>{t === 'num' ? '#' : t === 'geo' ? '⌖' : t === 'date' ? '⏱' : 'A'}</span>
                <span style={{ flex: 1, color: 'var(--hf-ink-2)' }}>{n}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: chart canvas */}
        <main style={{ flex: 1, minWidth: 0, padding: 20, overflowY: 'auto', background: 'var(--hf-bg)' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div className="row" style={{ gap: 6 }}>
                <span className="h2">Production Analysis · ONWJ</span>
                <span className="pill ghost">Untitled · draft</span>
              </div>
              <div className="sm">5 datasets joined · 1,248 rows · 14 fields</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm"><Icon name="share" size={12} /> Share</button>
              <button className="btn sm"><Icon name="download" size={12} /> Export</button>
              <button className="btn primary sm"><Icon name="check" size={12} color="#fff" /> Save</button>
            </div>
          </div>

          {/* Main chart card */}
          <div className="card" style={{ padding: 20, marginBottom: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div className="h3">Production BOPD by Field (Q3 2024)</div>
                <div className="sm">Bar chart · grouped by month</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <span className="pill green dot">Live</span>
                <button className="iconbtn"><Icon name="settings" size={13} /></button>
                <button className="iconbtn"><Icon name="more" size={13} /></button>
              </div>
            </div>
            {/* Chart */}
            <div style={{ height: 220, position: 'relative', padding: '0 0 22px 28px' }}>
              {/* y grid */}
              {[0, 0.25, 0.5, 0.75, 1].map(p => (
                <div key={p} style={{
                  position: 'absolute', left: 28, right: 0,
                  top: p * 200, height: 1, background: 'var(--hf-line)'
                }}>
                  <span style={{ position: 'absolute', left: -28, top: -6, fontSize: 10, color: 'var(--hf-ink-5)' }} className="num">{(15 - p * 15).toFixed(0)}K</span>
                </div>
              ))}
              {/* Bars */}
              <div style={{ display: 'flex', height: 200, alignItems: 'flex-end', gap: 6, paddingRight: 4 }}>
                {[
                  [82, 90, 78], [75, 88, 82], [88, 95, 90], [70, 80, 85],
                  [92, 88, 95], [85, 78, 90], [95, 92, 88], [88, 85, 92],
                  [78, 90, 85], [92, 95, 90], [88, 82, 95], [95, 90, 92],
                ].map((g, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', gap: 1, alignItems: 'flex-end', height: '100%' }}>
                    <div style={{ flex: 1, height: g[0] + '%', background: 'var(--hf-green-500)', borderRadius: '2px 2px 0 0' }}></div>
                    <div style={{ flex: 1, height: g[1] + '%', background: 'var(--hf-blue-500)', borderRadius: '2px 2px 0 0' }}></div>
                    <div style={{ flex: 1, height: g[2] + '%', background: 'var(--hf-amber-500)', borderRadius: '2px 2px 0 0' }}></div>
                  </div>
                ))}
              </div>
              {/* x labels */}
              <div style={{ display: 'flex', gap: 6, paddingLeft: 0, marginTop: 4, paddingRight: 4 }}>
                {['Jul-01','Jul-08','Jul-15','Jul-22','Jul-29','Aug-05','Aug-12','Aug-19','Aug-26','Sep-02','Sep-09','Sep-16'].map(d => (
                  <div key={d} className="num" style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: 'var(--hf-ink-5)' }}>{d}</div>
                ))}
              </div>
            </div>
            {/* legend */}
            <div className="row" style={{ gap: 18, marginTop: 8, fontSize: 11, color: 'var(--hf-ink-3)' }}>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--hf-green-500)' }}></span>Field A (BOPD)</span>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--hf-blue-500)' }}></span>Field B (BOPD)</span>
              <span className="row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--hf-amber-500)' }}></span>Field C (BOPD)</span>
            </div>
          </div>

          {/* Lower chart grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="h3">Cumulative Production</div>
                <span className="pill green dot">+12.3% MoM</span>
              </div>
              <HfSpark height={130} data={[18, 22, 28, 35, 42, 48, 58, 64, 72, 80, 88, 95]} />
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div className="h3" style={{ marginBottom: 10 }}>By Operator</div>
              {[
                ['PHE ONWJ',    62, 'var(--hf-amber-500)'],
                ['PHM',         48, 'var(--hf-green-500)'],
                ['Medco E&P',   34, 'var(--hf-blue-500)'],
                ['Harbour',     22, 'var(--hf-purple-500)'],
              ].map(([n, p, c]) => (
                <div key={n} style={{ padding: '6px 0' }}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5, flex: 1 }}>{n}</span>
                    <span className="num" style={{ fontWeight: 600, fontSize: 11.5 }}>{p}K BOPD</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--hf-surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: (p / 70 * 100) + '%', height: '100%', background: c }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right: Inspector panel */}
        <aside style={{
          flex: '0 0 280px', borderLeft: '1px solid var(--hf-line)',
          background: 'var(--hf-surface)', padding: 18, overflowY: 'auto'
        }}>
          <div className="cap" style={{ marginBottom: 10 }}>Chart Inspector</div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)', padding: 2, marginBottom: 14 }}>
            {['Data', 'Style', 'Filters'].map((t, i) => (
              <div key={t} style={{
                flex: 1, textAlign: 'center', padding: '5px 0',
                fontSize: 11, fontWeight: 600, borderRadius: 'var(--hf-r-2)',
                background: i === 0 ? '#fff' : 'transparent',
                color: i === 0 ? 'var(--hf-ink)' : 'var(--hf-ink-3)',
                boxShadow: i === 0 ? 'var(--hf-sh-1)' : 'none',
                cursor: 'pointer'
              }}>{t}</div>
            ))}
          </div>

          <div className="cap" style={{ marginBottom: 4, fontSize: 10 }}>Chart Type</div>
          <div className="row" style={{ marginBottom: 14, gap: 4 }}>
            {[['chart','Bar'], ['activity','Line'], ['pieChart','Pie'], ['map','Map']].map(([ico, l], i) => (
              <div key={l} style={{
                flex: 1, padding: '8px 4px', textAlign: 'center',
                borderRadius: 'var(--hf-r-2)',
                border: '1px solid ' + (i === 0 ? 'var(--hf-green-500)' : 'var(--hf-line)'),
                background: i === 0 ? 'var(--hf-green-50)' : 'transparent',
                color: i === 0 ? 'var(--hf-green-700)' : 'var(--hf-ink-3)',
                fontSize: 10, fontWeight: 600, cursor: 'pointer'
              }}>
                <Icon name={ico} size={14} color={i === 0 ? 'var(--hf-green-600)' : 'var(--hf-ink-4)'} style={{ marginBottom: 2 }} />
                <div>{l}</div>
              </div>
            ))}
          </div>

          {/* X / Y axis */}
          <div className="cap" style={{ marginBottom: 4, fontSize: 10 }}>X Axis</div>
          <div className="row" style={{ marginBottom: 10, padding: '8px 10px', background: 'var(--hf-amber-100)', border: '1px dashed var(--hf-amber-500)', borderRadius: 'var(--hf-r-2)' }}>
            <span style={{ fontSize: 11, color: 'var(--hf-amber-700)', fontWeight: 600 }}>⏱ Date (month)</span>
            <span style={{ marginLeft: 'auto', color: 'var(--hf-amber-700)', cursor: 'pointer' }}>×</span>
          </div>

          <div className="cap" style={{ marginBottom: 4, fontSize: 10 }}>Y Axis</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {[
              ['# Field A — BOPD', 'var(--hf-green-500)'],
              ['# Field B — BOPD', 'var(--hf-blue-500)'],
              ['# Field C — BOPD', 'var(--hf-amber-500)'],
            ].map(([t, c]) => (
              <div key={t} className="row" style={{ padding: '8px 10px', background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, flex: '0 0 auto' }}></span>
                <span style={{ fontSize: 11, flex: 1 }}>{t}</span>
                <span style={{ color: 'var(--hf-ink-4)', cursor: 'pointer' }}>×</span>
              </div>
            ))}
          </div>
          <button className="btn sm" style={{ width: '100%' }}><Icon name="plus" size={11} /> Add measure</button>

          <div className="divider" style={{ margin: '14px 0' }}></div>

          <div className="cap" style={{ marginBottom: 4, fontSize: 10 }}>Group by</div>
          <div className="field" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 11.5 }}>Field</span>
            <Icon name="chevron" size={11} color="var(--hf-ink-4)" style={{ marginLeft: 'auto' }} />
          </div>

          <div className="cap" style={{ marginBottom: 4, fontSize: 10 }}>Filter</div>
          <div className="row" style={{ marginBottom: 6, padding: '7px 10px', background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)' }}>
            <span style={{ fontSize: 11 }}>Status = Active</span>
            <span style={{ marginLeft: 'auto', color: 'var(--hf-ink-4)', cursor: 'pointer' }}>×</span>
          </div>
          <button className="btn sm" style={{ width: '100%' }}><Icon name="plus" size={11} /> Add filter</button>
        </aside>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Workspace
// ─────────────────────────────────────────────────────────────
function HfWorkspace() {
  return (
    <HfPage screenLabel="HF 07 · Workspace">
      <HfTopNav active="WORKSPACE" />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Project sidebar */}
        <aside style={{ flex: '0 0 240px', borderRight: '1px solid var(--hf-line)', background: 'var(--hf-surface-2)', padding: 16, overflowY: 'auto' }}>
          <div className="row" style={{ marginBottom: 14, gap: 6 }}>
            <span className="cap" style={{ flex: 1 }}>My Projects</span>
            <button className="iconbtn" style={{ width: 22, height: 22, border: 0 }}><Icon name="plus" size={12} /></button>
          </div>
          {[
            ['Eksplorasi Sumatra Utara',   'active',   '12 datasets', 4],
            ['ONWJ Production Review',     '',         '8 datasets',  3],
            ['Q3 Compliance Audit',        '',         '24 datasets', 6],
            ['Pipeline Trans-Java',        '',         '6 datasets',  2],
            ['New Field Discovery',        '',         '3 datasets',  1],
          ].map(([n, st, d, m]) => (
            <div key={n} style={{
              padding: 10, marginBottom: 4, borderRadius: 'var(--hf-r-2)',
              background: st === 'active' ? 'var(--hf-surface)' : 'transparent',
              border: st === 'active' ? '1px solid var(--hf-line)' : '1px solid transparent',
              cursor: 'pointer'
            }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{n}</div>
              <div className="row" style={{ gap: 6, fontSize: 10.5, color: 'var(--hf-ink-4)' }}>
                <span>{d}</span><span>·</span>
                <span className="row" style={{ gap: 2 }}>
                  {Array.from({ length: m }).map((_, i) => (
                    <span key={i} className="avatar sm" style={{ width: 14, height: 14, fontSize: 7, marginLeft: i ? -4 : 0, background: ['#ecf6ef','#eef3fb','#fdf1d0','#ede6f6','#fde2dd','#f1ede4'][i % 6] }}>{['SM','AR','BL','DN','EV','FN'][i % 6]}</span>
                  ))}
                </span>
              </div>
            </div>
          ))}

          <div className="cap" style={{ marginTop: 18, marginBottom: 8 }}>Shared with me</div>
          {[
            ['SKK Migas Audit',           '24 items'],
            ['Pertamina E&P Review',      '18 items'],
          ].map(([n, d]) => (
            <div key={n} style={{ padding: 10, marginBottom: 4, fontSize: 12 }}>
              <div style={{ fontWeight: 500 }}>{n}</div>
              <div className="xs">{d}</div>
            </div>
          ))}

          <div className="cap" style={{ marginTop: 18, marginBottom: 8 }}>Saved Layers</div>
          {[
            ['All Indonesia WK',     'layers'],
            ['Active Wells Q3',      'database'],
            ['Pipeline Network',     'map'],
          ].map(([n, ico]) => (
            <div key={n} className="row" style={{ padding: '4px 8px', fontSize: 11.5, gap: 8 }}>
              <Icon name={ico} size={13} color="var(--hf-ink-4)" />
              <span>{n}</span>
            </div>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, padding: 20, overflowY: 'auto' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <div className="cap" style={{ color: 'var(--hf-green-700)', marginBottom: 4 }}>Active project</div>
              <div className="h1">Eksplorasi Sumatra Utara</div>
              <div className="body">Studi pra-eksplorasi cekungan Sumatra Utara — Q4 2024 / Q1 2025.</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm"><Icon name="share" size={12} /> Share</button>
              <button className="btn sm"><Icon name="settings" size={12} /></button>
              <button className="btn primary sm"><Icon name="plus" size={12} color="#fff" /> Add dataset</button>
            </div>
          </div>

          {/* Project team strip */}
          <div className="row" style={{ marginTop: 14, gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--hf-line)' }}>
            <div className="row" style={{ gap: 2 }}>
              {['SM','AR','BL','DN','+2'].map((n, i) => (
                <span key={i} className="avatar" style={{
                  marginLeft: i ? -8 : 0, fontSize: 10,
                  background: ['#ecf6ef','#eef3fb','#fdf1d0','#ede6f6','#f1ede4'][i],
                  color: ['#0d4f2a','#1f4a96','#8b5e07','#7a5cb8','#45516a'][i],
                  borderColor: '#fff', boxShadow: '0 0 0 1px var(--hf-line)'
                }}>{n}</span>
              ))}
            </div>
            <div className="row" style={{ gap: 18, fontSize: 11.5, color: 'var(--hf-ink-3)' }}>
              <span className="row" style={{ gap: 4 }}><Icon name="database" size={12} /> 12 datasets</span>
              <span className="row" style={{ gap: 4 }}><Icon name="map" size={12} /> 3 maps</span>
              <span className="row" style={{ gap: 4 }}><Icon name="chart" size={12} /> 5 analyses</span>
              <span className="row" style={{ gap: 4 }}><Icon name="comment" size={12} /> 24 comments</span>
              <span className="row" style={{ gap: 4 }}><Icon name="clock" size={12} /> Last edit 2h ago</span>
            </div>
          </div>

          {/* Kanban */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
            {[
              ['To Do',       'var(--hf-ink-4)',    [['Cek data seismik area Lhokseumawe', '', 2], ['Validasi WK boundary', 'high', 3], ['Cari historical drilling docs', '', 1]]],
              ['In Progress', 'var(--hf-blue-500)', [['Build production forecast model', 'med', 4], ['Compare 3 prospect areas', '', 2]]],
              ['Review',      'var(--hf-amber-500)',[['Draft eksekutif report Q4', 'high', 3], ['Peta integrasi well + seismic', '', 1]]],
              ['Done',        'var(--hf-green-500)',[['Onboard data PHM Q3', '', 2], ['Setup project workspace', '', 1], ['Initial WK mapping', '', 4]]],
            ].map(([col, c, items]) => (
              <div key={col} className="card" style={{ padding: 12, background: 'var(--hf-surface-2)', border: '1px solid var(--hf-line)' }}>
                <div className="row" style={{ marginBottom: 10 }}>
                  <span className="status-dot" style={{ background: c }}></span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--hf-ink-2)' }}>{col}</span>
                  <span className="pill ghost" style={{ marginLeft: 'auto', fontSize: 10 }}>{items.length}</span>
                </div>
                {items.map(([t, p, m], i) => (
                  <div key={i} className="card" style={{ padding: 10, marginBottom: 6, boxShadow: 'var(--hf-sh-1)' }}>
                    {p && (
                      <div className="row" style={{ marginBottom: 6 }}>
                        <span className={'pill ' + (p === 'high' ? 'red' : 'amber')} style={{ fontSize: 9 }}>{p === 'high' ? '↑ High' : '→ Medium'}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--hf-ink)', fontWeight: 500, marginBottom: 8 }}>{t}</div>
                    <div className="row" style={{ fontSize: 10, color: 'var(--hf-ink-4)' }}>
                      <span className="row" style={{ gap: 2 }}>
                        {Array.from({ length: Math.min(m, 3) }).map((_, j) => (
                          <span key={j} className="avatar sm" style={{
                            width: 14, height: 14, fontSize: 7,
                            marginLeft: j ? -4 : 0,
                            background: ['#ecf6ef','#eef3fb','#fdf1d0','#ede6f6'][j],
                            borderColor: '#fff', boxShadow: '0 0 0 1px var(--hf-line)'
                          }}>{['SM','AR','BL','DN'][j]}</span>
                        ))}
                      </span>
                      <span style={{ marginLeft: 'auto' }} className="row" >
                        <Icon name="comment" size={10} /> {Math.floor(Math.random() * 8) + 1}
                      </span>
                    </div>
                  </div>
                ))}
                <button className="btn ghost sm" style={{ width: '100%', marginTop: 4, justifyContent: 'flex-start', color: 'var(--hf-ink-4)' }}>
                  <Icon name="plus" size={11} /> Add task
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </HfPage>
  );
}

// ─────────────────────────────────────────────────────────────
// HF · Apps (marketplace)
// ─────────────────────────────────────────────────────────────
function HfApps() {
  const apps = [
    ['Seismic Viewer Pro',     'Visualization',   '#1f8a4a', 'map',      4.8, 1240, 'PHE Tech'],
    ['Well Decline Analyzer',  'Analytics',       '#2a5fb8', 'chart',    4.6,  892, 'PHM Lab'],
    ['Pipeline Risk Monitor',  'Monitoring',      '#cf3a2a', 'activity', 4.7,  654, 'SPEKTRUM'],
    ['Production Forecaster',  'Forecasting',     '#7a5cb8', 'bolt',     4.5, 1830, 'Medco Tech'],
    ['Map Builder Studio',     'Authoring',       '#c2840d', 'layers',   4.9, 2240, 'AlasBuana'],
    ['Document AI Reader',     'AI / OCR',        '#7a5cb8', 'sparkle',  4.4,  410, 'AlasBuana'],
    ['Compliance Tracker',     'Governance',      '#2a5fb8', 'shield',   4.3,  280, 'SKK Migas'],
    ['Reserve Estimator',      'Analytics',       '#1f8a4a', 'pieChart', 4.6,  720, 'PHE Tech'],
  ];
  return (
    <HfPage screenLabel="HF 08 · Apps">
      <HfTopNav active="APPS" />
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--hf-bg)' }}>
        {/* Hero */}
        <div style={{
          padding: '32px 20px 24px',
          background: 'linear-gradient(180deg, var(--hf-green-50), var(--hf-bg))',
          borderBottom: '1px solid var(--hf-line)'
        }}>
          <div className="cap" style={{ color: 'var(--hf-green-700)', marginBottom: 4 }}>SPEKTRUM Marketplace</div>
          <div className="display" style={{ marginBottom: 6 }}>Apps & Services</div>
          <div className="body" style={{ maxWidth: 560 }}>
            Aplikasi dan layanan terhubung yang membantu Anda mengeksplorasi, menganalisis,
            dan memantau data ekosistem hulu migas Indonesia.
          </div>

          <div className="row" style={{ marginTop: 18, gap: 8 }}>
            <div className="field" style={{ width: 380 }}>
              <Icon name="search" size={14} color="var(--hf-ink-4)" />
              <input placeholder="Cari aplikasi…" />
            </div>
            <button className="btn"><Icon name="filter" size={13} /> Filter</button>
            <button className="btn sm">Category <Icon name="chevron" size={11} /></button>
            <button className="btn sm">Sort: Featured <Icon name="chevron" size={11} /></button>
          </div>

          <div className="row" style={{ marginTop: 12, gap: 6, flexWrap: 'wrap' }}>
            {['All', 'Visualization', 'Analytics', 'Monitoring', 'AI', 'Authoring', 'Governance', 'Forecasting'].map((t, i) => (
              <span key={t} className={'pill ' + (i === 0 ? 'green' : 'ghost')} style={{ cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {/* Featured row */}
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="h2">Featured</div>
            <a style={{ fontSize: 11.5, color: 'var(--hf-blue-600)', fontWeight: 600 }}>See all 24 →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 24 }}>
            {/* Hero card */}
            <div className="card card-elev" style={{
              padding: 24, position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--hf-green-50), var(--hf-blue-50))'
            }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <span className="pill green-solid">★ FEATURED</span>
                <span className="pill ghost" style={{ marginLeft: 6 }}>Authoring</span>
              </div>
              <div className="h1" style={{ marginBottom: 6 }}>Map Builder Studio</div>
              <div className="body" style={{ maxWidth: 380, marginBottom: 14 }}>
                Buat peta interaktif berbasis data SPEKTRUM dalam hitungan menit. Drag layer,
                styling otomatis, dan publish ke seluruh tim.
              </div>
              <div className="row" style={{ gap: 12, marginBottom: 16 }}>
                <span className="row" style={{ gap: 4, fontSize: 11.5 }}>
                  <Icon name="star" size={13} color="var(--hf-amber-500)" /> <b>4.9</b> <span className="muted">(2,240)</span>
                </span>
                <span className="row" style={{ gap: 4, fontSize: 11.5, color: 'var(--hf-ink-3)' }}>
                  <Icon name="download" size={13} /> 12K installs
                </span>
                <span className="pill green dot">Verified by AlasBuana</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn primary lg"><Icon name="plus" size={14} color="#fff" /> Install</button>
                <button className="btn lg">Preview</button>
              </div>
            </div>

            {/* Side card */}
            <div className="card" style={{ padding: 22 }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <span className="pill green dot">Featured</span>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--hf-r-3)',
                background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10
              }}>
                <Icon name="sparkle" size={22} color="#fff" />
              </div>
              <div className="h2">AI Geospatial Assistant</div>
              <div className="body" style={{ marginBottom: 12 }}>Powered by Claude — tanya apa saja tentang data hulu migas dalam bahasa natural.</div>
              <div className="row" style={{ gap: 12, marginBottom: 12, fontSize: 11.5 }}>
                <span className="row" style={{ gap: 4 }}><Icon name="star" size={12} color="var(--hf-amber-500)" /> <b>4.7</b></span>
                <span className="row" style={{ gap: 4, color: 'var(--hf-ink-3)' }}><Icon name="download" size={12} /> 8K</span>
                <span className="pill blue">Beta</span>
              </div>
              <button className="btn primary" style={{ width: '100%' }}>Coming soon</button>
            </div>
          </div>

          {/* All apps grid */}
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="h2">All apps</div>
            <span className="muted" style={{ fontSize: 11.5 }}>Showing 8 of 24</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {apps.map(([name, cat, color, ico, rating, installs, vendor]) => (
              <div key={name} className="card" style={{ padding: 14, cursor: 'pointer', transition: 'box-shadow var(--hf-dur)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--hf-r-3)',
                  background: color + '14', border: '1px solid ' + color + '55',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8
                }}>
                  <Icon name={ico} size={18} color={color} />
                </div>
                <div className="row" style={{ marginBottom: 4 }}>
                  <span className="pill ghost" style={{ fontSize: 9.5 }}>{cat}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{name}</div>
                <div className="xs" style={{ marginBottom: 10 }}>by {vendor}</div>
                <div className="row" style={{ marginBottom: 10, gap: 10, fontSize: 11 }}>
                  <span className="row" style={{ gap: 3 }}>
                    <Icon name="star" size={11} color="var(--hf-amber-500)" /> <b>{rating}</b>
                  </span>
                  <span className="row" style={{ gap: 3, color: 'var(--hf-ink-4)' }}>
                    <Icon name="download" size={11} /> {installs.toLocaleString()}
                  </span>
                </div>
                <button className="btn sm" style={{ width: '100%' }}>Install</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HfPage>
  );
}

Object.assign(window, { HfMapView, HfAnalytics, HfWorkspace, HfApps });
