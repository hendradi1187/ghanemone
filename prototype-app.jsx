// AlasBuana Interactive Prototype
// State-driven multi-page app: Explore → Detail → Map with AI assistant.
// Reuses hi-fi tokens (.hf class) and the Icon component.

// ─────────────────────────────────────────────────────────────
// Dataset catalog — single source of truth (closure over flows)
// ─────────────────────────────────────────────────────────────
const CATALOG = [
  {
    id: 'wk-onwj',
    title: 'Working Area (WK) Boundary — ONWJ',
    kind: 'LAYER', kindColor: 'var(--hf-green-500)',
    type: 'Administrative', format: 'Vector · SHP, GeoJSON',
    theme: 'admin',
    updated: '2 hari lalu', updatedSort: 2,
    desc: 'Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini.',
    provider: 'PHE ONWJ', providerInit: 'PH', providerColor: 'var(--hf-amber-500)',
    stats: ['128', '3.2K', '12'], verified: true,
    attrs: [
      ['Total Area',       '13,978.45 km²'],
      ['Status',           'Active'],
      ['Operator',         'PHE ONWJ'],
      ['Contract Start',   '2018-08-09'],
      ['Contract End',     '2048-08-08'],
      ['CRS',              'EPSG:4326'],
      ['Geometry',         'MultiPolygon (1)'],
      ['Last Validated',   '2 days ago'],
    ],
    quality: [
      ['Completeness',         98,  'var(--hf-green-500)'],
      ['Positional accuracy',  92,  'var(--hf-green-500)'],
      ['Attribute accuracy',   88,  'var(--hf-green-500)'],
      ['Currency',             85,  'var(--hf-amber-500)'],
      ['Topology',             96,  'var(--hf-green-500)'],
    ],
  },
  {
    id: 'seismic-3d-nsumatra',
    title: 'Seismic 3D — North Sumatra Basin',
    kind: 'VOLUME', kindColor: 'var(--hf-purple-500)',
    type: 'Seismic', format: 'Volume · SEG-Y',
    theme: 'seismic',
    updated: '5 hari lalu', updatedSort: 5,
    desc: 'Data seismik 3D di area Cekungan Sumatera Utara, kualitas tinggi.',
    provider: 'Medco E&P', providerInit: 'ME', providerColor: 'var(--hf-blue-500)',
    stats: ['96', '2.1K', '8'], verified: true,
    attrs: [
      ['Survey Area',  '2,840 km²'],
      ['Vintage',      '2022'],
      ['Bin Size',     '12.5 × 12.5 m'],
      ['Sample Rate',  '4 ms'],
      ['CRS',          'EPSG:23837 (UTM 47N)'],
    ],
    quality: [
      ['Completeness',    96, 'var(--hf-green-500)'],
      ['Signal/Noise',    88, 'var(--hf-green-500)'],
      ['Currency',        78, 'var(--hf-amber-500)'],
    ],
  },
  {
    id: 'well-loc',
    title: 'Well Location — Indonesia',
    kind: 'LAYER', kindColor: 'var(--hf-amber-500)',
    type: 'Well & Drilling', format: 'Vector · SHP',
    theme: 'well',
    updated: 'kemarin', updatedSort: 1,
    desc: 'Lokasi sumur produksi, eksplorasi, dan appraisal di seluruh Indonesia.',
    provider: 'Pertamina Hulu Mahakam', providerInit: 'PHM', providerColor: 'var(--hf-green-500)',
    stats: ['256', '5.4K', '20'], verified: true,
    attrs: [
      ['Total Wells',  '12,482'],
      ['Active',       '3,124'],
      ['Type Mix',     'Prod 64% · Expl 21% · Appr 15%'],
      ['CRS',          'EPSG:4326'],
    ],
    quality: [
      ['Completeness',  99, 'var(--hf-green-500)'],
      ['Currency',      94, 'var(--hf-green-500)'],
    ],
  },
  {
    id: 'psc-rokan',
    title: 'PSC Document — WK Rokan (Amendment 2024)',
    kind: 'DOC', kindColor: 'var(--hf-blue-500)',
    type: 'Document', format: 'PDF · 2.4 MB',
    theme: 'doc',
    updated: '10 hari lalu', updatedSort: 10,
    desc: 'Dokumen Perjanjian Kerja Sama (PSC) Wilayah Kerja Rokan.',
    provider: 'SKK Migas', providerInit: 'SM', providerColor: 'var(--hf-blue-500)',
    stats: ['78', '1.1K', '6'], verified: true,
    attrs: [
      ['Pages',        '186'],
      ['Version',      'v2024.08'],
      ['Status',       'Active'],
      ['Effective',    '2024-08-09'],
    ],
    quality: [
      ['Indexed',  100, 'var(--hf-green-500)'],
      ['OCR',       96, 'var(--hf-green-500)'],
    ],
  },
  {
    id: 'pipeline-network',
    title: 'Pipeline Network — Indonesia',
    kind: 'LAYER', kindColor: 'var(--hf-green-500)',
    type: 'Infrastructure', format: 'GeoJSON · CSV',
    theme: 'pipe',
    updated: '6 hari lalu', updatedSort: 6,
    desc: 'Jaringan pipa minyak & gas di seluruh wilayah kerja Indonesia.',
    provider: 'PHE', providerInit: 'PH', providerColor: 'var(--hf-amber-500)',
    stats: ['64', '1.8K', '4'], verified: true,
    attrs: [
      ['Total length', '8,420 km'],
      ['Onshore',      '6,128 km'],
      ['Offshore',     '2,292 km'],
    ],
    quality: [
      ['Completeness',  92, 'var(--hf-green-500)'],
      ['Currency',      72, 'var(--hf-amber-500)'],
    ],
  },
  {
    id: 'facility',
    title: 'Facility Inventory — Upstream',
    kind: 'LAYER', kindColor: 'var(--hf-red-500)',
    type: 'Facilities', format: 'XLSX · SHP',
    theme: 'facility',
    updated: '14 hari lalu', updatedSort: 14,
    desc: 'Inventarisasi fasilitas hulu — wellhead, CPP, FPSO, dll.',
    provider: 'PHE ONWJ', providerInit: 'PH', providerColor: 'var(--hf-amber-500)',
    stats: ['42', '892', '3'], verified: true,
    attrs: [
      ['Total facilities', '1,248'],
      ['Active',           '986'],
    ],
    quality: [
      ['Completeness',  86, 'var(--hf-green-500)'],
      ['Currency',      62, 'var(--hf-amber-500)'],
    ],
  },
];

const THEMES = [
  ['admin',    'Administrative',  'var(--hf-green-500)'],
  ['well',     'Well & Drilling', 'var(--hf-amber-500)'],
  ['seismic',  'Seismic',         'var(--hf-purple-500)'],
  ['pipe',     'Pipeline',        'var(--hf-green-500)'],
  ['facility', 'Facilities',      'var(--hf-red-500)'],
  ['doc',      'Documents',       'var(--hf-blue-500)'],
];

// ─────────────────────────────────────────────────────────────
// App context — router + cross-page state
// ─────────────────────────────────────────────────────────────
const AppCtx = React.createContext(null);
function useApp() { return React.useContext(AppCtx); }

function AppProvider({ children }) {
  const [page, setPage] = React.useState({ name: 'explore', params: {} });
  const [mapLayers, setMapLayers] = React.useState(new Set(['wk-onwj']));
  const [toasts, setToasts] = React.useState([]);
  const [savedFilters, setSavedFilters] = React.useState({ themes: new Set(), q: '' });

  const navigate = React.useCallback((name, params = {}) => {
    setPage({ name, params });
  }, []);

  const toast = React.useCallback((msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, msg, kind }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200);
  }, []);

  const addToMap = React.useCallback((id) => {
    const ds = CATALOG.find(d => d.id === id);
    setMapLayers(s => { const n = new Set(s); n.add(id); return n; });
    toast(`✓ "${ds.title}" ditambahkan ke peta`, 'ok');
  }, [toast]);

  const toggleLayer = React.useCallback((id) => {
    setMapLayers(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const value = React.useMemo(() => ({
    page, navigate,
    mapLayers, addToMap, toggleLayer,
    toasts,
    filters: savedFilters, setFilters: setSavedFilters,
    catalog: CATALOG,
  }), [page, navigate, mapLayers, addToMap, toggleLayer, toasts, savedFilters]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

// Toast renderer (lives at root)
function ToastStack() {
  const { toasts } = useApp();
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', flexDirection: 'column-reverse', gap: 6,
      pointerEvents: 'none'
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--hf-ink)', color: '#fff',
          padding: '10px 18px', borderRadius: 'var(--hf-r-pill)',
          fontSize: 13, fontWeight: 600,
          boxShadow: 'var(--hf-sh-4)',
          animation: 'toastIn .25s var(--hf-ease)',
          pointerEvents: 'auto'
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive TopNav — clicks route
// ─────────────────────────────────────────────────────────────
function IxTopNav() {
  const { page, navigate } = useApp();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [q, setQ] = React.useState('');

  const links = [
    ['explore',    'EXPLORE DATA'],
    ['map',        'MAP'],
    ['dashboard',  'DASHBOARD'],
    ['analytics',  'ANALYTICS'],
    ['workspace',  'WORKSPACE'],
    ['apps',       'APPS'],
    ['monitoring', 'MONITORING'],
  ];

  const results = q.trim()
    ? CATALOG.filter(d => (d.title + ' ' + d.type + ' ' + d.provider).toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="topnav" style={{ position: 'relative' }}>
      <div className="brand">
        <span className="brand-mark">AB</span>
        <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
          <span>AlasBuana<span className="dot">.com</span></span>
          <span className="sub">AI Intelligence</span>
        </div>
      </div>
      <div className="field" style={{ width: 320, marginLeft: 4, position: 'relative' }}>
        <Icon name="search" size={14} color="var(--hf-ink-4)" />
        <input
          placeholder="Cari dataset, area kerja, sumur, atau dokumen…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
        />
        <span className="pill ghost" style={{ fontSize: 10 }}>⌘K</span>

        {searchOpen && q.trim() && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: '#fff', border: '1px solid var(--hf-line)',
            borderRadius: 'var(--hf-r-3)', boxShadow: 'var(--hf-sh-3)',
            zIndex: 30, padding: 4, maxHeight: 320, overflowY: 'auto'
          }}>
            {results.length === 0 ? (
              <div className="dim" style={{ padding: 14, fontSize: 12, textAlign: 'center' }}>
                Tidak ada hasil untuk "{q}"
              </div>
            ) : (
              <>
                <div className="cap" style={{ padding: '8px 10px 4px' }}>{results.length} hasil</div>
                {results.map(d => (
                  <div key={d.id} onMouseDown={() => { navigate('detail', { id: d.id }); setSearchOpen(false); setQ(''); }}
                    style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hf-surface-3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <span className="pill" style={{ background: d.kindColor, color: '#fff', fontSize: 9 }}>{d.kind}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
                      <div className="xs">{d.provider} · {d.type}</div>
                    </div>
                    <Icon name="arrowR" size={12} color="var(--hf-ink-5)" />
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <div className="links" role="navigation" aria-label="Main">
        {links.map(([k, l]) => (
          <a key={k} className={page.name === k ? 'active' : ''}
            aria-current={page.name === k ? 'page' : undefined}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(k); } }}
            onClick={() => navigate(k)}>{l}</a>
        ))}
      </div>
      <div className="row" style={{ marginLeft: 8, gap: 6 }}>
        <button className="iconbtn" aria-label="Help" title="Help"><Icon name="help" size={15} /></button>
        <button className="iconbtn" aria-label="Notifications (1 new)" title="Notifications" style={{ position: 'relative' }}>
          <Icon name="bell" size={15} />
          <span aria-hidden="true" style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: 'var(--hf-red-500)', border: '1.5px solid #fff' }}></span>
        </button>
        <div className="row" style={{ gap: 8, paddingLeft: 8, marginLeft: 4, borderLeft: '1px solid var(--hf-line)' }}>
          <span className="avatar">SM</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>SKK Migas</span>
            <span style={{ fontSize: 10, color: 'var(--hf-ink-4)' }}>Regulator</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive Sidebar
// ─────────────────────────────────────────────────────────────
function IxSidebar() {
  const { filters, setFilters } = useApp();
  const [open, setOpen] = React.useState('all');

  const browse = [
    ['all',    'All Data',        'grid',     2452],
    ['layer',  'Layers',          'layers',   1832],
    ['doc',    'Documents',       'doc',      412],
    ['map',    'Maps',            'map',      96],
    ['app',    'Apps & Services', 'globe',    24],
  ];

  return (
    <aside className="sidebar">
      <div className="side-group">
        <div className="side-head">Browse</div>
        {browse.map(([k, l, ico, n]) => (
          <div key={k} className={'side-item' + (open === k ? ' active' : '')}
            onClick={() => setOpen(k)}>
            <Icon name={ico} size={15} />
            <span>{l}</span>
            <span className="count num">{n.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="side-group">
        <div className="side-head">Categories</div>
        {THEMES.map(([k, l, c]) => {
          const on = filters.themes.has(k);
          return (
            <div key={k} className={'side-item' + (on ? ' active' : '')}
              onClick={() => setFilters(f => {
                const n = new Set(f.themes);
                if (n.has(k)) n.delete(k); else n.add(k);
                return { ...f, themes: n };
              })}>
              <span className="swatch" style={{ background: c }}></span>
              <span style={{ flex: 1 }}>{l}</span>
              {on
                ? <Icon name="check" size={12} color="var(--hf-green-600)" />
                : <Icon name="chevR" size={12} color="var(--hf-ink-5)" />}
            </div>
          );
        })}
      </div>

      <div className="side-group">
        <div className="side-head">Data provider</div>
        {[
          ['PHM',  'Pertamina Hulu Mahakam',  245, 'var(--hf-green-500)'],
          ['PH',   'PHE ONWJ',                183, 'var(--hf-amber-500)'],
          ['PSN',  'Pertamina Subsurface',    167, 'var(--hf-blue-500)'],
          ['ME',   'Medco E&P',               142, 'var(--hf-blue-500)'],
        ].map(([init, n, c, col]) => (
          <div key={init} className="side-item">
            <span className="avatar sm" style={{ background: 'transparent', borderColor: col, color: col }}>{init}</span>
            <span style={{ flex: 1, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</span>
            <span className="count num">{c}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive Explore Page
// ─────────────────────────────────────────────────────────────
function PageExplore() {
  const { navigate, filters, setFilters, addToMap, mapLayers } = useApp();
  const [localQ, setLocalQ] = React.useState(filters.q || '');
  const [selectedId, setSelectedId] = React.useState('wk-onwj');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => { setFilters(f => ({ ...f, q: localQ })); }, [localQ]);

  // Simulate filter latency to demo skeleton state
  React.useEffect(() => {
    if (!filters.themes.size && !localQ) return;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, [filters.themes.size, localQ]);

  const filtered = CATALOG.filter(d => {
    if (filters.themes.size > 0 && !filters.themes.has(d.theme)) return false;
    if (localQ.trim() && !(d.title + ' ' + d.type + ' ' + d.provider + ' ' + d.desc).toLowerCase().includes(localQ.toLowerCase())) return false;
    return true;
  });

  const selected = CATALOG.find(d => d.id === selectedId) || filtered[0];

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <IxSidebar />

      {/* CENTER: list */}
      <main style={{ flex: '0 0 500px', minWidth: 0, padding: '18px 18px 0', overflowY: 'auto',
        borderRight: '1px solid var(--hf-line)', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div>
          <div className="cap" style={{ color: 'var(--hf-green-700)', marginBottom: 4 }}>SPEKTRUM · Trusted Data</div>
          <div className="h1">Explore Data</div>
          <div className="body" style={{ marginTop: 4 }}>
            Find, access, and use trusted geospatial data from across Indonesia's upstream oil &amp; gas ecosystem.
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <div className="field" style={{ flex: 1 }}>
            <Icon name="search" size={14} color="var(--hf-ink-4)" />
            <input placeholder="Cari datasets, layers, dokumen…"
              value={localQ} onChange={(e) => setLocalQ(e.target.value)} />
            {localQ && <Icon name="x" size={12} color="var(--hf-ink-4)" style={{ cursor: 'pointer' }} onClick={() => setLocalQ('')} />}
          </div>
          <button className="btn"><Icon name="filter" size={13} /> Filters</button>
        </div>

        {/* Active filter chips */}
        <div className="row" style={{ flexWrap: 'wrap', gap: 6, minHeight: 24 }}>
          {[...filters.themes].map(k => {
            const t = THEMES.find(x => x[0] === k);
            if (!t) return null;
            return (
              <span key={k} className="pill" style={{
                background: 'var(--hf-green-50)', color: 'var(--hf-green-700)',
                border: '1px solid var(--hf-green-200)', cursor: 'pointer'
              }} onClick={() => setFilters(f => {
                const n = new Set(f.themes); n.delete(k); return { ...f, themes: n };
              })}>
                {t[1]} <Icon name="x" size={11} color="var(--hf-green-600)" style={{ marginLeft: 2 }} />
              </span>
            );
          })}
          {localQ && (
            <span className="pill" style={{ background: 'var(--hf-blue-50)', color: 'var(--hf-blue-600)', cursor: 'pointer' }}
              onClick={() => setLocalQ('')}>
              "{localQ}" <Icon name="x" size={11} color="var(--hf-blue-600)" style={{ marginLeft: 2 }} />
            </span>
          )}
          {(filters.themes.size > 0 || localQ) && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--hf-green-600)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { setLocalQ(''); setFilters(f => ({ ...f, themes: new Set() })); }}>
              Clear all
            </span>
          )}
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            [filtered.length.toLocaleString(), 'Match',   'database',  'var(--hf-green-500)'],
            ['145',                            'Providers','user',      'var(--hf-blue-500)'],
            ['38',                             'Domains',  'map',       'var(--hf-amber-500)'],
            ['98%',                            'SLA',      'shield',    'var(--hf-purple-500)'],
          ].map(([v, l, ico, c]) => (
            <div key={l} style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--hf-surface)', border: '1px solid var(--hf-line)', borderRadius: 'var(--hf-r-2)' }}>
              <span style={{ width: 28, height: 28, borderRadius: 'var(--hf-r-2)', background: 'var(--hf-surface-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={ico} size={14} color={c} />
              </span>
              <div>
                <div className="num" style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{v}</div>
                <div style={{ fontSize: 10.5, color: 'var(--hf-ink-4)' }}>{l}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <div className="h3">Datasets <span className="muted num" style={{ fontWeight: 500 }}>({filtered.length} of {CATALOG.length})</span></div>
          <button className="btn sm">Sort: Relevance <Icon name="chevron" size={11} /></button>
        </div>

        {/* List */}
        {isLoading ? (
          <div aria-busy="true" aria-live="polite">
            {[0, 1, 2].map(i => <DatasetCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="search"
            title={localQ ? `Tidak ada hasil untuk "${localQ}"` : 'Tidak ada dataset cocok'}
            description="Coba kurangi filter, ubah keyword, atau jelajahi kategori lain."
            action={{ label: 'Reset filter', icon: 'refresh', onClick: () => { setLocalQ(''); setFilters(f => ({ ...f, themes: new Set() })); } }}
          />
        ) : (
          <div role="list" aria-label={`${filtered.length} datasets`}>
            {filtered.map(d => (
              <DsRowInteractive key={d.id} d={d}
                selected={selectedId === d.id}
                onSelect={() => setSelectedId(d.id)}
                onOpen={() => navigate('detail', { id: d.id })}
                onAddToMap={() => addToMap(d.id)} />
            ))}
          </div>
        )}
      </main>

      {/* MAP */}
      <section style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 500, display: 'inline-flex', background: '#fff', border: '1px solid var(--hf-line)', borderRadius: 'var(--hf-r-2)', padding: 2, boxShadow: 'var(--hf-sh-2)' }}>
          <span className="btn primary sm" style={{ borderRadius: 4, padding: '5px 12px' }}><Icon name="map" size={12} color="#fff" /> Map view</span>
          <span className="btn ghost sm" style={{ borderRadius: 4, padding: '5px 12px' }} onClick={() => navigate('map')}>
            <Icon name="arrowUpRight" size={12} /> Open full map
          </span>
        </div>
        <RealMap activeLayers={[...mapLayers]} showCoords={false} />
        <AiAssistant />
      </section>

      {/* DETAIL preview */}
      {selected && (
        <aside style={{ flex: '0 0 280px', borderLeft: '1px solid var(--hf-line)',
          padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto', background: 'var(--hf-surface)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="cap">Data information</span>
          </div>
          <div>
            <div className="row" style={{ gap: 6, marginBottom: 6 }}>
              <span className="pill" style={{ background: selected.kindColor, color: '#fff', fontSize: 9 }}>{selected.kind}</span>
              {selected.verified && <span className="pill green dot">Verified</span>}
            </div>
            <div className="h3" style={{ fontSize: 14, lineHeight: 1.3 }}>{selected.title}</div>
            <div className="sm">{selected.type} · {selected.format}</div>
          </div>

          <div className="sm">{selected.desc}</div>

          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm" style={{ flex: 1 }} onClick={() => navigate('detail', { id: selected.id })}>Details</button>
            <button className="btn primary sm" style={{ flex: 1 }} onClick={() => addToMap(selected.id)}>
              <Icon name="plus" size={11} color="#fff" /> Add to Map
            </button>
          </div>

          <div className="divider"></div>

          <div className="cap">Key Attributes</div>
          {selected.attrs.slice(0, 6).map(([k, v]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 11, gap: 8, alignItems: 'flex-start' }}>
              <span className="muted" style={{ flex: '0 0 110px' }}>{k}</span>
              <span className="num" style={{ fontWeight: 600, textAlign: 'right', flex: 1, minWidth: 0, wordBreak: 'normal' }}>{v}</span>
            </div>
          ))}
        </aside>
      )}
    </div>
  );
}

// Dataset row — interactive
function DsRowInteractive({ d, selected, onSelect, onOpen, onAddToMap }) {
  const { mapLayers } = useApp();
  const onMap = mapLayers.has(d.id);
  return (
    <div className="ds-card"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        background: selected ? 'var(--hf-green-50)' : 'transparent',
        margin: '0 -8px', padding: '14px 8px', borderRadius: 6,
        borderBottom: '1px solid var(--hf-line)'
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--hf-surface-2)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
      <div className="ds-thumb">
        <span className="tag" style={{ background: d.kindColor }}>{d.kind}</span>
      </div>
      <div className="ds-meta">
        {/* Row 1 — title + verified */}
        <div className="row" style={{ gap: 6, alignItems: 'flex-start' }}>
          <span className="title" style={{
            flex: 1, minWidth: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: 1.3
          }}>{d.title}</span>
          {d.verified && <span className="pill green dot" style={{ fontSize: 9.5, flex: '0 0 auto', marginTop: 2 }}>Verified</span>}
        </div>

        {/* Row 2 — sub: allow wrap or shorten if too long */}
        <div className="sm" style={{
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', lineHeight: 1.35
        }}>
          {d.type} · {d.format} · Updated {d.updated}
        </div>

        {/* Row 3 — description (truncated) */}
        <div className="sm" style={{
          color: 'var(--hf-ink-2)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>{d.desc}</div>

        {/* Row 4 — footer: stats LEFT, actions RIGHT, one clean line */}
        <div className="stats">
          <span className="row" style={{ gap: 6, flex: '0 0 auto' }}>
            <span className="avatar sm" style={{ background: 'transparent', borderColor: d.providerColor, color: d.providerColor }}>{d.providerInit}</span>
            <span style={{ color: 'var(--hf-ink-2)', fontWeight: 500, whiteSpace: 'nowrap' }}>{d.provider}</span>
          </span>
          <span className="row" style={{ gap: 4, flex: '0 0 auto' }}>
            <Icon name="download" size={12} /> <span className="num">{d.stats[0]}</span>
          </span>
          <span className="row" style={{ gap: 4, flex: '0 0 auto' }}>
            <Icon name="eye" size={12} /> <span className="num">{d.stats[1]}</span>
          </span>
          <span className="actions">
            <button className="iconbtn" style={{ width: 28, height: 28 }}
              title="Open details"
              onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              <Icon name="arrowUpRight" size={13} />
            </button>
            <button className={'btn sm' + (onMap ? '' : ' primary')}
              onClick={(e) => { e.stopPropagation(); onAddToMap(); }}
              style={onMap
                ? { background: 'var(--hf-green-50)', color: 'var(--hf-green-700)', borderColor: 'var(--hf-green-200)' }
                : {}}>
              {onMap
                ? <><Icon name="check" size={12} color="var(--hf-green-600)" /> On Map</>
                : <><Icon name="plus" size={12} color="#fff" /> Add</>}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive Detail Page
// ─────────────────────────────────────────────────────────────
function PageDetail() {
  const { page, navigate, addToMap, mapLayers } = useApp();
  const d = CATALOG.find(x => x.id === page.params.id) || CATALOG[0];
  const [tab, setTab] = React.useState('overview');

  return (
    <>
      {/* Breadcrumb */}
      <div className="row" style={{ padding: '10px 20px', borderBottom: '1px solid var(--hf-line)',
        fontSize: 11.5, color: 'var(--hf-ink-4)', gap: 6, background: 'var(--hf-surface)',
        whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <a style={{ cursor: 'pointer' }} onClick={() => navigate('explore')}>Explore Data</a>
        <Icon name="chevR" size={11} />
        <a style={{ cursor: 'pointer' }}>{d.type}</a>
        <Icon name="chevR" size={11} />
        <span style={{ color: 'var(--hf-ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</span>
        <div className="row" style={{ marginLeft: 'auto', gap: 6, flex: '0 0 auto' }}>
          <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="share" size={12} /></button>
          <button className="iconbtn" style={{ width: 26, height: 26 }}><Icon name="star" size={12} /></button>
          <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => navigate('explore')}><Icon name="x" size={12} /></button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* MAP */}
        <section style={{ flex: '1 1 55%', position: 'relative', minWidth: 0, borderRight: '1px solid var(--hf-line)' }}>
          <RealMap activeLayers={[d.id, ...mapLayers].filter((v, i, a) => a.indexOf(v) === i)} highlightId={d.id} />
          <div style={{ position: 'absolute', top: 16, left: 16, padding: '8px 12px', background: 'rgba(255,255,255,.96)', border: '1px solid var(--hf-line)', borderRadius: 'var(--hf-r-2)', boxShadow: 'var(--hf-sh-2)', zIndex: 500, whiteSpace: 'nowrap', maxWidth: 'calc(100% - 32px)' }}>
            <div className="cap" style={{ color: 'var(--hf-green-700)' }}>Preview</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</div>
            <div className="xs" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Provider: {d.provider}</div>
          </div>
          <AiAssistant context={d.title} />
        </section>

        {/* INFO panel */}
        <aside style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--hf-surface)' }}>
          {/* Hero */}
          <div style={{ padding: 22, borderBottom: '1px solid var(--hf-line)' }}>
            <div className="row" style={{ gap: 6, marginBottom: 10 }}>
              <span className="pill" style={{ background: d.kindColor, color: '#fff', fontSize: 9.5 }}>{d.kind}</span>
              {d.verified && <span className="pill green dot">Verified</span>}
              <span className="pill ghost">{d.type}</span>
              <span className="pill ghost">{d.format}</span>
            </div>
            <div className="display" style={{ fontSize: 26, marginBottom: 4 }}>{d.title}</div>
            <div className="body" style={{ marginBottom: 14 }}>{d.desc}</div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn primary lg" style={{ flex: 1 }}
                onClick={() => addToMap(d.id)}>
                <Icon name="plus" size={14} color="#fff" /> Add to Map
              </button>
              <button className="btn accent lg" style={{ flex: 1 }}>
                <Icon name="download" size={14} color="#fff" /> Download
              </button>
              <button className="btn lg" onClick={() => navigate('analytics')}>
                <Icon name="bolt" size={14} /> Analytics
              </button>
            </div>
            <div className="row" style={{ marginTop: 14, gap: 14, fontSize: 11, color: 'var(--hf-ink-4)', flexWrap: 'wrap' }}>
              <span className="row" style={{ gap: 6, whiteSpace: 'nowrap' }}>
                <span className="avatar sm" style={{ background: 'transparent', borderColor: d.providerColor, color: d.providerColor }}>{d.providerInit}</span>
                <b style={{ color: 'var(--hf-ink-2)' }}>{d.provider}</b>
              </span>
              <span className="row" style={{ gap: 4, whiteSpace: 'nowrap' }}><Icon name="download" size={12} /> <span className="num">{d.stats[0]}</span></span>
              <span className="row" style={{ gap: 4, whiteSpace: 'nowrap' }}><Icon name="eye" size={12} /> <span className="num">{d.stats[1]}</span></span>
              <span className="row" style={{ marginLeft: 'auto', gap: 4, whiteSpace: 'nowrap' }}><Icon name="clock" size={12} /> {d.updated}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ padding: '0 22px', flex: '0 0 auto' }}>
            {[
              ['overview',  'Overview'],
              ['attrs',     'Attributes (' + d.attrs.length + ')'],
              ['quality',   'Quality'],
              ['lineage',   'Lineage'],
              ['api',       'API'],
            ].map(([k, l]) => (
              <a key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</a>
            ))}
          </div>

          {/* Tab body */}
          <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'overview' && (
              <>
                <div>
                  <div className="cap" style={{ marginBottom: 6 }}>Tags</div>
                  <div className="row" style={{ flexWrap: 'wrap', gap: 4 }}>
                    {[d.type.toLowerCase().replace(/[ &]+/g, '-'), 'verified', d.provider.toLowerCase().replace(/[ &]+/g, '-'), 'indonesia'].map(t => (
                      <span key={t} className="pill ghost" style={{ fontSize: 10.5 }}>#{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="cap" style={{ marginBottom: 8 }}>Key Attributes</div>
                  <div className="card card-flat" style={{ borderRadius: 'var(--hf-r-3)', overflow: 'hidden' }}>
                    {d.attrs.slice(0, 6).map(([k, v], i, arr) => (
                      <div key={k} className="row" style={{ padding: '8px 12px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : '0', fontSize: 11.5, gap: 8 }}>
                        <span className="muted" style={{ flex: '0 0 110px', whiteSpace: 'nowrap' }}>{k}</span>
                        <span className="num" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="cap">Data Quality</div>
                    <span className="pill green dot">{d.quality[0][1] > 90 ? 'Excellent' : 'Good'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {d.quality.map(([k, v, c]) => (
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
              </>
            )}

            {tab === 'attrs' && (
              <div className="card card-flat" style={{ borderRadius: 'var(--hf-r-3)', overflow: 'hidden' }}>
                {d.attrs.map(([k, v], i, arr) => (
                  <div key={k} className="row" style={{ padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--hf-line)' : '0', fontSize: 12, gap: 8 }}>
                    <span className="muted" style={{ flex: '0 0 140px', whiteSpace: 'nowrap' }}>{k}</span>
                    <span className="num" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'quality' && (
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {d.quality.map(([k, v, c]) => (
                    <div key={k}>
                      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{k}</span>
                        <span className="num" style={{ fontWeight: 700, color: c }}>{v}%</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--hf-surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: v + '%', height: '100%', background: c }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'lineage' && (
              <div className="card" style={{ padding: 16 }}>
                <div className="row" style={{ gap: 0 }}>
                  {[
                    ['Source',     d.provider + ' GIS'],
                    ['Connector',  'SPARK v2.4'],
                    ['Validated',  '2024-08-09'],
                    ['Published',  '2024-08-09'],
                  ].map(([k, v], i, arr) => (
                    <React.Fragment key={k}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ width: 36, height: 36, margin: '0 auto 4px', borderRadius: '50%', background: 'var(--hf-green-50)', border: '1px solid var(--hf-green-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={['database','bolt','check','globe'][i]} size={15} color="var(--hf-green-600)" />
                        </div>
                        <div className="xs" style={{ fontWeight: 600, color: 'var(--hf-ink-2)' }}>{k}</div>
                        <div className="xs">{v}</div>
                      </div>
                      {i < arr.length - 1 && <div style={{ flex: '0 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -24 }}><Icon name="chevR" size={14} color="var(--hf-ink-5)" /></div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {tab === 'api' && (
              <div className="card" style={{ padding: 16 }}>
                <div className="cap" style={{ marginBottom: 6 }}>REST API</div>
                <div className="mono" style={{ padding: 10, background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)', fontSize: 10.5, lineHeight: 1.7, color: 'var(--hf-ink-2)' }}>
                  GET /api/v1/datasets/{d.id}.geojson<br />
                  &nbsp;&nbsp;?bbox=…&token=YOUR_TOKEN
                </div>
                <button className="btn sm" style={{ marginTop: 8 }}>Copy curl</button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Interactive Map Page
// ─────────────────────────────────────────────────────────────
function PageMap() {
  const { mapLayers, toggleLayer, navigate } = useApp();
  const [selectedPin, setSelectedPin] = React.useState(null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* MAIN map area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          minWidth: 0, minHeight: 0
        }}>
          {/* MAP region — shrinks to 50% when seismic is on */}
          <div style={{
            flex: seismicOn ? '1 1 50%' : '1 1 100%',
            position: 'relative', minHeight: 0,
            transition: 'flex .25s var(--hf-ease)'
          }}>
            <RealMap activeLayers={[...mapLayers]} fullscreen />

            {/* View toggle (top-center) */}
            <div style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 500,
              display: 'inline-flex', background: '#fff', border: '1px solid var(--hf-line)',
              borderRadius: 'var(--hf-r-2)', padding: 2, boxShadow: 'var(--hf-sh-2)'
            }}>
              <span className={'btn sm ' + (!seismicOn ? 'primary' : 'ghost')} style={{ borderRadius: 4, padding: '5px 12px' }}>
                <Icon name="map" size={12} color={!seismicOn ? '#fff' : 'currentColor'} /> 2D Map
              </span>
              <span className={'btn sm ' + (seismicOn ? 'primary' : 'ghost')} style={{ borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }}
                onClick={() => toggleLayer('seismic-3d-nsumatra')}>
                <Icon name="layers" size={12} color={seismicOn ? '#fff' : 'currentColor'} /> 3D Scene
              </span>
              <span className="btn ghost sm" style={{ borderRadius: 4, padding: '5px 12px' }}>
                <Icon name="grid" size={12} /> Split View
              </span>
            </div>

            {/* Search */}
            <div style={{
              position: 'absolute', top: 70, left: 16, width: 360, zIndex: 500,
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

            {/* Layers panel */}
            <div style={{
              position: 'absolute', top: 134, left: 16, width: 280, maxHeight: 'calc(100% - 154px)', zIndex: 500,
              background: '#fff', border: '1px solid var(--hf-line)',
              borderRadius: 'var(--hf-r-3)', boxShadow: 'var(--hf-sh-3)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
              <div className="row" style={{ padding: '12px 14px 10px' }}>
                <div className="h3" style={{ fontSize: 13 }}>Layers</div>
                <span className="pill green-solid" style={{ marginLeft: 'auto', fontSize: 9 }}>{mapLayers.size} active</span>
              </div>

              <div style={{ padding: '0 14px 14px', overflowY: 'auto' }}>
                <div className="cap" style={{ marginBottom: 6 }}>Surface Layers</div>
                {CATALOG.filter(d => d.id !== 'seismic-3d-nsumatra').map(d => {
                  const on = mapLayers.has(d.id);
                  return (
                    <div key={d.id} className="row" style={{ padding: '5px 0', fontSize: 12, gap: 8, cursor: 'pointer' }}
                      onClick={() => toggleLayer(d.id)}>
                      <span style={{
                        width: 14, height: 14, borderRadius: 3,
                        border: '1.5px solid ' + d.kindColor,
                        background: on ? d.kindColor : 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
                      }}>{on && <Icon name="check" size={9} color="#fff" />}</span>
                      <span style={{ flex: 1, color: on ? 'var(--hf-ink)' : 'var(--hf-ink-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.title}</span>
                    </div>
                  );
                })}

                <div className="cap" style={{ marginTop: 14, marginBottom: 6 }}>Subsurface Layers</div>
                <div className="row" style={{ padding: '5px 0', fontSize: 12, gap: 8, cursor: 'pointer' }}
                  onClick={() => toggleLayer('seismic-3d-nsumatra')}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3,
                    border: '1.5px solid var(--hf-purple-500)',
                    background: seismicOn ? 'var(--hf-purple-500)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
                  }}>{seismicOn && <Icon name="check" size={9} color="#fff" />}</span>
                  <span style={{ flex: 1, color: seismicOn ? 'var(--hf-ink)' : 'var(--hf-ink-4)' }}>Seismic 3D</span>
                  <span className="num xs" style={{ color: 'var(--hf-ink-4)' }}>42</span>
                </div>

                {seismicOn && (
                  <>
                    <div style={{ marginLeft: 22, marginTop: 6, padding: '8px 10px', background: 'var(--hf-surface-3)', borderRadius: 'var(--hf-r-2)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>SUMATRA_3D_VOL_01</div>
                      <div className="xs" style={{ marginBottom: 4 }}>Amplitude</div>
                      <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #000 0%, #5a5550 40%, #a87055 70%, #ff7a3c 100%)' }}></div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="row" style={{ padding: '5px 0', fontSize: 12, gap: 8, cursor: 'pointer' }}
                        onClick={() => setShowHorizons(v => !v)}>
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: '1.5px solid var(--hf-blue-500)',
                          background: showHorizons ? 'var(--hf-blue-500)' : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
                        }}>{showHorizons && <Icon name="check" size={9} color="#fff" />}</span>
                        <span style={{ flex: 1 }}>Horizon</span>
                        <span className="xs">5</span>
                      </div>
                      {showHorizons && (
                        <div style={{ marginLeft: 22, marginTop: 2 }}>
                          {[['#7a5cb8','Top Basement'],['#2a5fb8','Top Post-Rift'],['#2bbfa6','Top Syn-Rift'],['#4ea96c','Top Pre-Rift'],['#f0c419','Top Reservoir']].map(([c, l]) => (
                            <div key={l} className="row" style={{ padding: '3px 0', fontSize: 11, gap: 8 }}>
                              <span style={{ width: 10, height: 2, background: c, borderRadius: 1, flex: '0 0 auto' }}></span>
                              <span>{l}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 4 }}>
                      <div className="row" style={{ padding: '5px 0', fontSize: 12, gap: 8, cursor: 'pointer' }}
                        onClick={() => setShowFaults(v => !v)}>
                        <span style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: '1.5px solid var(--hf-red-500)',
                          background: showFaults ? 'var(--hf-red-500)' : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
                        }}>{showFaults && <Icon name="check" size={9} color="#fff" />}</span>
                        <span style={{ flex: 1 }}>Fault</span>
                        <span className="xs">2</span>
                      </div>
                      {showFaults && (
                        <div style={{ marginLeft: 22, marginTop: 2 }}>
                          <div className="row" style={{ padding: '3px 0', fontSize: 11, gap: 8 }}>
                            <span style={{ width: 14, height: 2, background: 'var(--hf-red-500)', flex: '0 0 auto' }}></span>
                            <span>Major Fault</span>
                          </div>
                          <div className="row" style={{ padding: '3px 0', fontSize: 11, gap: 8 }}>
                            <span style={{ width: 14, height: 0, flex: '0 0 auto', borderTop: '1.8px dashed var(--hf-amber-500)' }}></span>
                            <span>Minor Fault</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button className="btn sm" style={{ marginTop: 10, width: '100%' }} onClick={() => navigate('explore')}>
                  <Icon name="plus" size={11} /> Add layer
                </button>
              </div>
            </div>

            {!seismicOn && <AiAssistant />}

            {mapLayers.size === 0 && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'rgba(255,255,255,.96)', border: '1px solid var(--hf-line)',
                borderRadius: 'var(--hf-r-3)', padding: 28, textAlign: 'center',
                boxShadow: 'var(--hf-sh-4)', zIndex: 500
              }}>
                <Icon name="layers" size={32} color="var(--hf-ink-5)" style={{ marginBottom: 8 }} />
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Belum ada layer di peta</div>
                <div className="sm" style={{ marginBottom: 12 }}>Mulai dengan menambahkan dataset dari Explore.</div>
                <button className="btn primary" onClick={() => navigate('explore')}>
                  <Icon name="search" size={13} color="#fff" /> Cari dataset
                </button>
              </div>
            )}
          </div>

          {/* Seismic cross-section bottom panel */}
          {seismicOn && (
            <SeismicCrossSection showHorizons={showHorizons} showFaults={showFaults} />
          )}
        </div>

        {/* Right Well Details panel (only in seismic mode) */}
        {seismicOn && <SeismicWellDetails onClose={() => toggleLayer('seismic-3d-nsumatra')} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Assistant — pill → expanded → typing → response
// ─────────────────────────────────────────────────────────────
function AiAssistant({ context = null }) {
  const [state, setState] = React.useState('pill'); // pill | open
  const [messages, setMessages] = React.useState([
    { role: 'assistant', text: context
        ? `Saya bisa bantu dengan dataset "${context}". Misalnya, "Berapa sumur aktif di sini?" atau "Bandingkan dengan area lain".`
        : 'Halo! Tanya apa saja tentang data hulu migas di ekosistem SPEKTRUM.' }
  ]);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const ask = async (q) => {
    if (!q.trim() || busy) return;
    setMessages(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const prompt = `Kamu adalah asisten AI di AlasBuana.com, platform data geospasial hulu migas Indonesia.
${context ? `User sedang melihat dataset "${context}".` : ''}
Jawab pertanyaan user dengan singkat (1-3 kalimat) dalam Bahasa Indonesia, gunakan data realistis.
Format respon: hanya teks, tanpa markdown.

Pertanyaan: ${q}`;
      const reply = await window.claude.complete(prompt);
      setMessages(m => [...m, { role: 'assistant', text: reply.trim() }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'Maaf, saya tidak dapat memproses permintaan saat ini.' }]);
    }
    setBusy(false);
  };

  const suggestions = context
    ? ['Berapa sumur aktif di area ini?', 'Rata-rata produksi 2024', 'Bandingkan dengan area terdekat']
    : ['Berapa total dataset di ekosistem?', 'Cari WK di Sumatra', 'Provider mana yang paling aktif?'];

  if (state === 'pill') {
    return (
      <div style={{ position: 'absolute', right: 16, bottom: 16, cursor: 'pointer', zIndex: 600 }}
        onClick={() => setState('open')}>
        <div className="ai-pill">
          <span className="star"><Icon name="sparkle" size={14} color="#fff" /></span>
          <div style={{ display: 'flex', flexDirection: 'column', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2 }}>AI Assistant</span>
            <span style={{ fontSize: 10.5, color: 'var(--hf-ink-4)', lineHeight: 1.2 }}>Ask anything…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', right: 16, bottom: 16, width: 360, maxHeight: 480,
      display: 'flex', flexDirection: 'column',
      background: 'var(--hf-surface)', border: '1px solid var(--hf-line)',
      borderRadius: 'var(--hf-r-4)', boxShadow: 'var(--hf-sh-4)', overflow: 'hidden',
      zIndex: 600
    }}>
      {/* Header */}
      <div className="row" style={{ padding: '12px 14px', borderBottom: '1px solid var(--hf-line)' }}>
        <span style={{
          width: 28, height: 28, borderRadius: 'var(--hf-r-2)',
          background: 'linear-gradient(135deg, #4a7afc, #7a5cb8)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon name="sparkle" size={14} color="#fff" />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>AI Assistant</div>
          <div className="xs">Powered by Claude · SPEKTRUM AI</div>
        </div>
        <button className="iconbtn" style={{ width: 26, height: 26, border: 0 }}
          onClick={() => setState('pill')}><Icon name="x" size={13} /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: 'var(--hf-r-3)',
              fontSize: 12, lineHeight: 1.55,
              background: m.role === 'user' ? 'var(--hf-green-500)' : 'var(--hf-surface-3)',
              color: m.role === 'user' ? '#fff' : 'var(--hf-ink)',
              borderTopRightRadius: m.role === 'user' ? 4 : 'var(--hf-r-3)',
              borderTopLeftRadius: m.role === 'user' ? 'var(--hf-r-3)' : 4,
            }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--hf-r-3)',
              background: 'var(--hf-surface-3)',
              display: 'flex', gap: 4
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--hf-ink-4)', animation: 'aiDot 1.2s ease-in-out infinite' }}></span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--hf-ink-4)', animation: 'aiDot 1.2s ease-in-out -.4s infinite' }}></span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--hf-ink-4)', animation: 'aiDot 1.2s ease-in-out -.8s infinite' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !busy && (
        <div style={{ padding: '0 14px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {suggestions.map(s => (
            <span key={s} className="pill blue" style={{ cursor: 'pointer', alignSelf: 'flex-start' }}
              onClick={() => ask(s)}>{s}</span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="row" style={{ padding: 12, borderTop: '1px solid var(--hf-line)', gap: 8 }}>
        <div className="field" style={{ flex: 1 }}>
          <Icon name="sparkle" size={14} color="var(--hf-blue-500)" />
          <input placeholder="Tanya apa saja…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') ask(input); }}
            disabled={busy} />
        </div>
        <button className="iconbtn" style={{
          background: 'var(--hf-green-500)', color: '#fff',
          borderColor: 'var(--hf-green-600)'
        }} onClick={() => ask(input)} disabled={busy || !input.trim()}>
          <Icon name="arrowR" size={14} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stub pages for top nav coverage
// ─────────────────────────────────────────────────────────────
function PageStub({ title, sub, ico }) {
  const { navigate } = useApp();
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--hf-bg)' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <Icon name={ico} size={48} color="var(--hf-ink-5)" style={{ marginBottom: 12 }} />
        <div className="display">{title}</div>
        <div className="body" style={{ marginTop: 8, marginBottom: 18 }}>{sub}</div>
        <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
          <button className="btn" onClick={() => navigate('explore')}>← Back to Explore</button>
          <button className="btn primary">Open static mockup →</button>
        </div>
        <div className="dim" style={{ fontSize: 11, marginTop: 18 }}>
          Halaman ini belum di-prototype interaktif — lihat versi statisnya di Hi-Fi.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────
function AppRouter() {
  const { page } = useApp();
  const inner = (() => {
    switch (page.name) {
      case 'explore':    return <PageExplore />;
      case 'detail':     return <PageDetail />;
      case 'map':        return <PageMap />;
      case 'dashboard':  return <PageStub title="Dashboard" sub="Ringkasan ekosistem data — KPI, aktivitas, status." ico="grid" />;
      case 'analytics':  return <PageStub title="Analytics" sub="Chart builder & query interface untuk data hulu migas." ico="chart" />;
      case 'workspace':  return <PageStub title="Workspace" sub="Project pribadi, kolaborasi tim, dan layer tersimpan." ico="layers" />;
      case 'apps':       return <PageStub title="Apps" sub="Marketplace aplikasi & layanan data terhubung." ico="globe" />;
      case 'monitoring': return <PageStub title="Monitoring" sub="Live pipeline status, audit log & alerts." ico="activity" />;
      default:           return <PageExplore />;
    }
  })();

  return (
    <div className="hf" style={{ width: '100%', height: '100%' }}>
      <IxTopNav />
      {inner}
    </div>
  );
}

// Top-level
function ProtoApp() {
  return (
    <AppProvider>
      <AppRouter />
      <ToastStack />
    </AppProvider>
  );
}

Object.assign(window, { ProtoApp, AppProvider, AppRouter, ToastStack, useApp });
