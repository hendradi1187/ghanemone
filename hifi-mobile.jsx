// AlasBuana Hi-Fi — Mobile screens (Explore, Map, Detail)

// Phone bezel
function HfPhone({ children, screenLabel }) {
  return (
    <HfPage screenLabel={screenLabel}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--hf-surface-3)', padding: 28, minHeight: 0
      }}>
        <div style={{
          width: 380, height: 800, background: '#fff',
          border: '8px solid #0e1726', borderRadius: 44,
          boxShadow: '0 24px 60px rgba(14,23,38,.25), inset 0 0 0 1px rgba(255,255,255,.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
        }}>
          {/* status bar */}
          <div className="row" style={{
            height: 30, padding: '0 24px', flex: '0 0 auto',
            justifyContent: 'space-between', fontSize: 12, fontWeight: 700,
            color: 'var(--hf-ink)', position: 'relative', zIndex: 10
          }}>
            <span style={{ marginTop: 6 }} className="num">9:41</span>
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: 6, width: 90, height: 22, background: '#0e1726', borderRadius: 12
            }}></div>
            <span style={{ marginTop: 6, display: 'inline-flex', gap: 5 }}>
              <Icon name="activity" size={11} />
              <Icon name="bell" size={11} />
              <span style={{
                width: 22, height: 11, border: '1px solid currentColor',
                borderRadius: 3, position: 'relative', marginTop: 1
              }}>
                <span style={{ position: 'absolute', inset: 1, background: 'currentColor', width: 16, borderRadius: 1.5 }}></span>
              </span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </HfPage>);

}

// Mobile top app bar
function MTopBar({ title = 'Explore Data', back = false, action }) {
  return (
    <div className="row" style={{
      padding: '8px 16px 12px', gap: 12, flex: '0 0 auto',
      borderBottom: '1px solid var(--hf-line)', background: 'var(--hf-surface)'
    }}>
      {back ?
      <button className="iconbtn" style={{ width: 30, height: 30, border: 0 }}>
          <Icon name="chevL" size={16} />
        </button> :

      <span className="brand-mark" style={{ width: 28, height: 28 }}>GO</span>
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{title}</div>
        {!back && <div className="xs">Trusted geospatial data</div>}
      </div>
      {action ||
      <>
          <button className="iconbtn" style={{ width: 30, height: 30, border: 0 }}><Icon name="search" size={16} /></button>
          <span className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>SM</span>
        </>
      }
    </div>);

}

// Mobile bottom tab bar (iOS-y)
function MTabBar({ active = 'explore' }) {
  const tabs = [
  ['explore', 'database', 'Explore'],
  ['map', 'map', 'Map'],
  ['dash', 'grid', 'Dashboard'],
  ['ws', 'layers', 'Workspace'],
  ['me', 'user', 'Account']];

  return (
    <div className="row" style={{
      borderTop: '1px solid var(--hf-line)',
      padding: '6px 10px 18px', justifyContent: 'space-around',
      flex: '0 0 auto', background: 'rgba(255,255,255,.92)',
      WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)'
    }}>
      {tabs.map(([id, ico, l]) => {
        const on = id === active;
        return (
          <div key={id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? 'var(--hf-green-700)' : 'var(--hf-ink-4)',
            fontWeight: on ? 700 : 500, fontSize: 9.5,
            padding: '4px 8px', borderRadius: 'var(--hf-r-2)',
            background: on ? 'var(--hf-green-50)' : 'transparent'
          }}>
            <Icon name={ico} size={18} color={on ? 'var(--hf-green-600)' : 'var(--hf-ink-4)'} />
            {l}
          </div>);

      })}
    </div>);

}

// HF Mobile · Explore
function HfMobileExplore() {
  return (
    <HfPhone screenLabel="HF · Mobile · Explore">
      <MTopBar title="Ghanem.one" />

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--hf-bg)' }}>
        {/* Greeting */}
        <div>
          <div className="cap" style={{ color: 'var(--hf-green-700)', marginBottom: 2 }}>Selamat siang, Sara</div>
          <div className="h2">Apa yang ingin Anda cari hari ini?</div>
        </div>

        {/* Search */}
        <div className="field" style={{ background: '#fff' }}>
          <Icon name="search" size={14} color="var(--hf-ink-4)" />
          <input placeholder="Cari dataset, area, sumur…" />
          <Icon name="filter" size={13} color="var(--hf-ink-4)" />
        </div>

        {/* Chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
          {[
          ['All', true],
          ['Layers', false],
          ['Wells', false],
          ['Seismic', false],
          ['Pipeline', false],
          ['Docs', false]].
          map(([c, on]) =>
          <span key={c} className={'pill ' + (on ? 'green' : 'ghost')} style={{ flex: '0 0 auto', cursor: 'pointer' }}>{c}</span>
          )}
        </div>

        {/* KPI strip */}
        <div className="card" style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
          ['2,452', 'Datasets', 'var(--hf-green-500)'],
          ['145', 'Providers', 'var(--hf-blue-500)'],
          ['98%', 'SLA', 'var(--hf-amber-500)']].
          map(([n, l, c], i, arr) =>
          <div key={l} style={{ borderRight: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0 }}>
              <div className="num" style={{ fontWeight: 800, fontSize: 18, color: c, letterSpacing: '-0.02em' }}>{n}</div>
              <div className="xs">{l}</div>
            </div>
          )}
        </div>

        {/* Recent / Featured */}
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <span className="cap">Featured for you</span>
          <a style={{ fontSize: 11, color: 'var(--hf-blue-600)', fontWeight: 600 }}>See all</a>
        </div>

        {[
        ['WK Boundary — ONWJ', 'PHE ONWJ', 'PH', 'var(--hf-amber-500)', 'Administrative · SHP', 'LAYER', 'var(--hf-green-500)', true],
        ['Seismic 3D — N. Sumatra', 'Medco E&P', 'ME', 'var(--hf-blue-500)', 'Seismic · SEG-Y', 'VOLUME', 'var(--hf-purple-500)', true],
        ['Well Location — Indonesia', 'PHM', 'PHM', 'var(--hf-green-500)', 'Well · SHP', 'LAYER', 'var(--hf-amber-500)', true],
        ['PSC Doc — WK Rokan', 'SKK Migas', 'SM', 'var(--hf-blue-500)', 'Document · PDF', 'DOC', 'var(--hf-blue-500)', true]].
        map(([t, p, init, pColor, sub, kind, kColor, v], i) =>
        <div key={i} className="card" style={{ padding: 12, display: 'flex', gap: 10 }}>
            <div style={{
            width: 68, height: 68, borderRadius: 'var(--hf-r-2)',
            background: 'linear-gradient(135deg, var(--hf-surface-3), var(--hf-water))',
            border: '1px solid var(--hf-line)',
            position: 'relative', flex: '0 0 auto'
          }}>
              <span style={{
              position: 'absolute', top: 4, left: 4,
              background: kColor, color: '#fff', fontSize: 8, fontWeight: 700,
              letterSpacing: '.06em', padding: '2px 5px', borderRadius: 3
            }}>{kind}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row" style={{ gap: 4, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 12.5, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</span>
                {v && <Icon name="check" size={12} color="var(--hf-green-600)" />}
              </div>
              <div className="xs" style={{ marginBottom: 4 }}>{sub}</div>
              <div className="row" style={{ gap: 6 }}>
                <span className="avatar sm" style={{ width: 16, height: 16, fontSize: 8, background: 'transparent', borderColor: pColor, color: pColor }}>{init}</span>
                <span style={{ fontSize: 10.5, color: 'var(--hf-ink-3)', flex: 1 }}>{p}</span>
                <span style={{ fontSize: 11, color: 'var(--hf-green-700)', fontWeight: 700, cursor: 'pointer' }}>+ Map</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI FAB */}
      <div style={{
        position: 'absolute', right: 16, bottom: 82, zIndex: 10,
        width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
        boxShadow: '0 8px 20px rgba(74,122,252,.4), inset 0 1px 0 rgba(255,255,255,.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon name="sparkle" size={22} color="#fff" />
      </div>

      <MTabBar active="explore" />
    </HfPhone>);

}

// HF Mobile · Map
function HfMobileMap() {
  return (
    <HfPhone screenLabel="HF · Mobile · Map">
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <HfMap withPins withCoords={false} />

        {/* Top floating search */}
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12,
          background: 'rgba(255,255,255,.96)',
          WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--hf-line)', borderRadius: 'var(--hf-r-3)',
          boxShadow: 'var(--hf-sh-3)',
          padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <button className="iconbtn" style={{ width: 28, height: 28, border: 0 }}>
            <Icon name="chevL" size={16} />
          </button>
          <Icon name="search" size={14} color="var(--hf-ink-4)" />
          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--hf-ink-4)' }}>Cari area, WK, sumur…</span>
          <span className="avatar sm" style={{ width: 24, height: 24, fontSize: 9 }}>SM</span>
        </div>

        {/* Right: layer FAB */}
        <div style={{ position: 'absolute', right: 12, top: 80, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
          ['layers', '#1f8a4a'],
          ['filter', '#45516a'],
          ['plus', '#45516a'],
          ['pin', '#45516a']].
          map(([ico, c], i) =>
          <button key={i} className="iconbtn" style={{
            width: 40, height: 40, borderRadius: 'var(--hf-r-3)',
            background: '#fff', boxShadow: 'var(--hf-sh-2)', border: '1px solid var(--hf-line)',
            color: c
          }}><Icon name={ico} size={17} /></button>
          )}
        </div>

        {/* Scale */}
        <div style={{
          position: 'absolute', left: 16, bottom: 285,
          background: 'rgba(255,255,255,.94)', border: '1px solid var(--hf-line)',
          borderRadius: 'var(--hf-r-2)', padding: '4px 9px',
          fontSize: 10, fontFamily: 'var(--hf-font-mono)', color: 'var(--hf-ink-3)'
        }}>−2.5487, 115.2216</div>

        {/* Bottom sheet */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: '#fff', borderTop: '1px solid var(--hf-line)',
          borderRadius: '16px 16px 0 0', padding: '8px 16px 18px',
          boxShadow: '0 -8px 24px rgba(14,23,38,.08)',
          maxHeight: 280, display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2, background: 'var(--hf-line-2)',
            margin: '0 auto 4px'
          }}></div>

          <div className="row">
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 6, marginBottom: 2 }}>
                <span className="pill green-solid" style={{ fontSize: 9 }}>BLOCK</span>
                <span className="pill green dot">Verified</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>WK Boundary — ONWJ</div>
              <div className="xs">PHE ONWJ · 13,978 km² · Active</div>
            </div>
            <button className="iconbtn"><Icon name="star" size={14} /></button>
          </div>

          {/* Inline KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
            ['23', 'Sumur'],
            ['4', 'Lapangan'],
            ['12.4K', 'BOPD']].
            map(([n, l]) =>
            <div key={l} style={{ padding: 8, background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)', textAlign: 'center' }}>
                <div className="num" style={{ fontWeight: 700, fontSize: 15 }}>{n}</div>
                <div className="xs">{l}</div>
              </div>
            )}
          </div>

          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm" style={{ flex: 1 }}>Details</button>
            <button className="btn primary sm" style={{ flex: 1 }}><Icon name="plus" size={11} color="#fff" /> Add to Map</button>
          </div>

          <div className="cap" style={{ marginTop: 4 }}>Nearby</div>
          {[
          ['Well · ONWJ-A-12', '2.4 km', 'database', 'var(--hf-green-500)'],
          ['Pipeline · ONWJ Main', '5.1 km', 'map', 'var(--hf-blue-500)'],
          ['Facility · CPP-A', '6.8 km', 'shield', 'var(--hf-red-500)']].
          map(([n, d, ico, c]) =>
          <div key={n} className="row" style={{ padding: '4px 0', fontSize: 11.5, gap: 8 }}>
              <Icon name={ico} size={13} color={c} />
              <span style={{ flex: 1 }}>{n}</span>
              <span className="num xs">{d}</span>
            </div>
          )}
        </div>
      </div>

      <MTabBar active="map" />
    </HfPhone>);

}

// HF Mobile · Detail
function HfMobileDetail() {
  return (
    <HfPhone screenLabel="HF · Mobile · Detail">
      <MTopBar title="Dataset" back action={
      <>
          <button className="iconbtn" style={{ width: 30, height: 30, border: 0 }}><Icon name="share" size={15} /></button>
          <button className="iconbtn" style={{ width: 30, height: 30, border: 0 }}><Icon name="more" size={15} /></button>
        </>
      } />

      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--hf-bg)' }}>
        {/* mini map */}
        <div style={{ height: 160, position: 'relative' }}>
          <HfMap withPins withCoords={false} />
        </div>

        <div style={{ padding: 16, background: '#fff' }}>
          <div className="row" style={{ gap: 4, marginBottom: 8 }}>
            <span className="pill green-solid" style={{ fontSize: 9 }}>LAYER</span>
            <span className="pill green dot">Verified</span>
            <span className="pill ghost">Admin</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em', lineHeight: 1.25, marginBottom: 4 }}>
            Working Area (WK) Boundary — ONWJ
          </div>
          <div className="sm" style={{ marginBottom: 12 }}>
            Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini.
          </div>

          <div className="row" style={{ gap: 16, marginBottom: 14, fontSize: 11, color: 'var(--hf-ink-4)' }}>
            <span className="row" style={{ gap: 4 }}>
              <span className="avatar sm" style={{ width: 16, height: 16, fontSize: 7, background: 'transparent', borderColor: 'var(--hf-amber-500)', color: 'var(--hf-amber-700)' }}>PH</span>
              PHE ONWJ
            </span>
            <span className="row" style={{ gap: 3 }}><Icon name="download" size={11} /> 128</span>
            <span className="row" style={{ gap: 3 }}><Icon name="star" size={11} /> 12</span>
            <span className="row" style={{ gap: 3 }}><Icon name="clock" size={11} /> 2d</span>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <button className="btn primary" style={{ flex: 1 }}><Icon name="plus" size={13} color="#fff" /> Add to Map</button>
            <button className="btn accent" style={{ flex: 1 }}><Icon name="download" size={13} color="#fff" /> SHP</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#fff', borderTop: '1px solid var(--hf-line)' }}>
          {['Overview', 'Attributes', 'Quality', 'API'].map((t, i) =>
          <a key={t} style={{
            flex: 1, textAlign: 'center', padding: '12px 0',
            fontSize: 12, fontWeight: 600,
            color: i === 0 ? 'var(--hf-green-700)' : 'var(--hf-ink-3)',
            borderBottom: i === 0 ? '2px solid var(--hf-green-500)' : '2px solid var(--hf-line)'
          }}>{t}</a>
          )}
        </div>

        {/* Tab content */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 14 }}>
            <div className="cap" style={{ marginBottom: 8 }}>Key Attributes</div>
            {[
            ['Total Area', '13,978.45 km²'],
            ['Status', 'Active'],
            ['Operator', 'PHE ONWJ'],
            ['Contract End', '2048-08-08'],
            ['CRS', 'EPSG:4326']].
            map(([k, v], i, arr) =>
            <div key={k} className="row" style={{
              padding: '7px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : 0,
              fontSize: 12
            }}>
                <span className="muted" style={{ flex: 1 }}>{k}</span>
                <span className="num" style={{ fontWeight: 600 }}>{v}</span>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 14 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="cap">Data Quality</span>
              <span className="pill green dot">Excellent</span>
            </div>
            {[
            ['Completeness', 98, 'var(--hf-green-500)'],
            ['Positional accuracy', 92, 'var(--hf-green-500)'],
            ['Currency', 85, 'var(--hf-amber-500)']].
            map(([k, v, c]) =>
            <div key={k} style={{ marginBottom: 6 }}>
                <div className="row" style={{ fontSize: 11 }}>
                  <span className="muted" style={{ flex: 1 }}>{k}</span>
                  <span className="num" style={{ fontWeight: 600 }}>{v}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--hf-surface-3)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ width: v + '%', height: '100%', background: c }}></div>
                </div>
              </div>
            )}
          </div>

          {/* AI prompt */}
          <div style={{
            padding: 14, borderRadius: 'var(--hf-r-3)',
            background: 'linear-gradient(135deg, #f0f3fd, #ede6f6)',
            border: '1px solid var(--hf-blue-100)'
          }}>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--hf-r-2)',
                background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon name="sparkle" size={12} color="#fff" />
              </span>
              <span style={{ fontWeight: 700, fontSize: 12 }}>Tanya AI tentang dataset</span>
            </div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 4 }}>
              <span className="pill blue" style={{ fontSize: 10 }}>Berapa sumur aktif di sini?</span>
              <span className="pill blue" style={{ fontSize: 10 }}>Rata-rata produksi 2024</span>
            </div>
          </div>
        </div>
      </div>

      <MTabBar active="explore" />
    </HfPhone>);

}

Object.assign(window, { HfMobileExplore, HfMobileMap, HfMobileDetail });