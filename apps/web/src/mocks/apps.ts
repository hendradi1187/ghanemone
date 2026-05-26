/**
 * Mock data Apps Marketplace — 15 realistic E&P / spatial apps.
 *
 * Phase 8.13. Deterministic catalog — sama antar reload. Phase 9 replace
 * dengan `/v1/apps` (marketplace API).
 *
 * Permissions adalah daftar scope yang app butuhkan (mirip OAuth scopes).
 * Pricing free | paid (paid hanya display label — billing tidak di-implement
 * di Phase 8).
 */
import type { IconName } from '@ghanem/ui';

export type AppCategory = 'visualization' | 'analysis' | 'integration' | 'utility';
export type AppPricing = 'free' | 'paid';

/** Review item — minimal shape untuk display di Reviews tab. */
export interface AppReview {
  id: string;
  authorName: string;
  authorInitials: string;
  rating: number; // 1-5
  comment: string;
  postedAt: string;
}

export interface AppRecord {
  id: string;
  name: string;
  vendor: string;
  category: AppCategory;
  description: string;
  longDescription: string;
  /** Icon dari @ghanem/ui icon set. */
  iconName: IconName;
  /** Background gradient untuk icon tile — 2-color CSS gradient. */
  gradient: { from: string; to: string };
  /** Mock screenshot placeholders — colored gradient blocks (no external URL). */
  screenshots: Array<{ id: string; from: string; to: string; caption: string }>;
  /** Permissions yang dibutuhkan (mirror OAuth scopes). */
  permissions: string[];
  /** Pricing tier. */
  pricing: AppPricing;
  /** Rating average (0-5). */
  rating: number;
  /** Total downloads (kumulatif). */
  downloads: number;
  /** Version string. */
  version: string;
  /** ISO last-updated timestamp. */
  lastUpdated: string;
  /** Reviews (3-5 per app). */
  reviews: AppReview[];
  /** Key features bullet list. */
  features: string[];
}

const APPS_RAW: ReadonlyArray<AppRecord> = [
  {
    id: 'seismic-viewer-pro',
    name: 'Seismic Viewer Pro',
    vendor: 'GeoSoft Labs',
    category: 'visualization',
    description: 'Visualisasi volume SEG-Y 2D/3D dengan kontrol overlay attribute.',
    longDescription:
      'Seismic Viewer Pro menyediakan rendering high-resolution untuk volume SEG-Y dan ZGY. Mendukung inline/crossline navigation, attribute overlay (RMS, coherence, semblance), dan ekspor session ke project SPEKTRUM.',
    iconName: 'layers',
    gradient: { from: '#2a5fb8', to: '#1f8a4a' },
    screenshots: [
      { id: 'ss-1', from: '#0a1a3a', to: '#2a5fb8', caption: 'Inline view dengan attribute overlay' },
      { id: 'ss-2', from: '#2a5fb8', to: '#7b91ed', caption: 'Crossline navigator + horizon picker' },
      { id: 'ss-3', from: '#1f8a4a', to: '#2a5fb8', caption: 'Time-slice + RMS amplitude' },
    ],
    permissions: ['datasets:read:seismic', 'workspace:read', 'export:image'],
    pricing: 'paid',
    rating: 4.7,
    downloads: 1843,
    version: '3.4.1',
    lastUpdated: '2026-04-18T10:00:00Z',
    features: [
      'Render inline/crossline + time-slice <100ms',
      'Attribute overlay: RMS, coherence, dip-azimuth',
      'Horizon picking + interpolasi',
      'Export ke project SPEKTRUM',
    ],
    reviews: [
      { id: 'r1', authorName: 'Andi Nugroho', authorInitials: 'AN', rating: 5, comment: 'Performansi rendering sangat smooth, attribute overlay membantu interpretasi.', postedAt: '2026-04-15T09:00:00Z' },
      { id: 'r2', authorName: 'Lina Marpaung', authorInitials: 'LM', rating: 4, comment: 'Tools lengkap, tapi shortcut keyboard masih kurang.', postedAt: '2026-03-22T11:00:00Z' },
      { id: 'r3', authorName: 'Budi Adi', authorInitials: 'BA', rating: 5, comment: 'Best seismic viewer di SPEKTRUM. Integrasi project mulus.', postedAt: '2026-02-10T08:00:00Z' },
    ],
  },
  {
    id: 'reservoir-modeler',
    name: 'Reservoir Modeler',
    vendor: 'SubsurfaceWorks',
    category: 'analysis',
    description: 'Build 3D static reservoir model dari well + seismic data.',
    longDescription:
      'Reservoir Modeler mengintegrasikan well log, surface marker, dan seismic volume menjadi grid 3D dengan property modeling (porosity, permeability, NTG). Mendukung P10/P50/P90 stochastic realization.',
    iconName: 'database',
    gradient: { from: '#1f8a4a', to: '#c2840d' },
    screenshots: [
      { id: 'ss-1', from: '#1f8a4a', to: '#c2840d', caption: '3D grid + property model' },
      { id: 'ss-2', from: '#7a5cb8', to: '#1f8a4a', caption: 'Variogram analysis' },
      { id: 'ss-3', from: '#c2840d', to: '#cf3a2a', caption: 'P10/P50/P90 realization' },
    ],
    permissions: ['datasets:read:well-log', 'datasets:read:seismic', 'compute:long-running'],
    pricing: 'paid',
    rating: 4.5,
    downloads: 962,
    version: '2.1.0',
    lastUpdated: '2026-04-02T14:00:00Z',
    features: [
      'Grid 3D dari well + seismic',
      'Property modeling (porosity, perm, NTG)',
      'Stochastic realization P10/P50/P90',
      'Export ke Petrel / Eclipse',
    ],
    reviews: [
      { id: 'r1', authorName: 'Erina Fauzi', authorInitials: 'EF', rating: 5, comment: 'Workflow modeling jauh lebih cepat dari tool tradisional.', postedAt: '2026-03-28T10:00:00Z' },
      { id: 'r2', authorName: 'Rio Kusuma', authorInitials: 'RK', rating: 4, comment: 'Stochastic engine bagus, tapi butuh lebih banyak tutorial.', postedAt: '2026-02-14T13:00:00Z' },
      { id: 'r3', authorName: 'Joko Darmawan', authorInitials: 'JD', rating: 5, comment: 'Integrasi dengan SPEKTRUM well catalog sangat membantu.', postedAt: '2026-01-30T09:00:00Z' },
    ],
  },
  {
    id: 'production-forecast-ai',
    name: 'Production Forecast AI',
    vendor: 'AlasBuana Labs',
    category: 'analysis',
    description: 'Prediksi produksi sumur berbasis decline curve + ML hybrid.',
    longDescription:
      'Production Forecast AI menggabungkan Arps decline curve klasik dengan model machine learning untuk memprediksi produksi sumur 6/12/24 bulan ke depan. Mendukung well-by-well dan field-level aggregation.',
    iconName: 'activity',
    gradient: { from: '#7a5cb8', to: '#2a5fb8' },
    screenshots: [
      { id: 'ss-1', from: '#7a5cb8', to: '#2a5fb8', caption: 'Decline curve fitting' },
      { id: 'ss-2', from: '#2a5fb8', to: '#1f8a4a', caption: 'Hybrid Arps + ML forecast' },
      { id: 'ss-3', from: '#cf3a2a', to: '#c2840d', caption: 'Confidence interval P10/P50/P90' },
    ],
    permissions: ['datasets:read:production', 'datasets:read:well-log', 'compute:ml'],
    pricing: 'paid',
    rating: 4.6,
    downloads: 1421,
    version: '1.8.2',
    lastUpdated: '2026-04-20T08:00:00Z',
    features: [
      'Arps + ML hybrid forecasting',
      'Confidence interval P10/P50/P90',
      'Field-level aggregation',
      'Automated outlier detection',
    ],
    reviews: [
      { id: 'r1', authorName: 'Putri Dewi', authorInitials: 'PD', rating: 5, comment: 'Akurasi prediksi sangat baik untuk sumur konvensional.', postedAt: '2026-04-10T15:00:00Z' },
      { id: 'r2', authorName: 'Hendra Wijaya', authorInitials: 'HW', rating: 4, comment: 'Bagus untuk decline curve, ML masih perlu retrain berkala.', postedAt: '2026-03-05T11:00:00Z' },
    ],
  },
  {
    id: 'compliance-auditor',
    name: 'Compliance Auditor',
    vendor: 'SKK Migas Labs',
    category: 'utility',
    description: 'Audit otomatis kelengkapan metadata + lisensi dataset.',
    longDescription:
      'Compliance Auditor menelusuri seluruh dataset di workspace Anda dan memberi laporan kelengkapan metadata (CRS, license, contact), bbox validity, dan sensitivitas access policy. Wajib untuk monthly SKK Migas reporting.',
    iconName: 'shield',
    gradient: { from: '#cf3a2a', to: '#c2840d' },
    screenshots: [
      { id: 'ss-1', from: '#cf3a2a', to: '#c2840d', caption: 'Dashboard audit summary' },
      { id: 'ss-2', from: '#c2840d', to: '#1f8a4a', caption: 'Detail issue per dataset' },
      { id: 'ss-3', from: '#1f8a4a', to: '#2a5fb8', caption: 'Compliance report export' },
    ],
    permissions: ['datasets:read:*', 'audit:write'],
    pricing: 'free',
    rating: 4.4,
    downloads: 2204,
    version: '4.0.0',
    lastUpdated: '2026-05-01T09:00:00Z',
    features: [
      'Audit metadata kelengkapan',
      'Validasi CRS + bbox',
      'Sensitivity policy check',
      'Export laporan PDF untuk SKK Migas',
    ],
    reviews: [
      { id: 'r1', authorName: 'Sari Indah', authorInitials: 'SI', rating: 5, comment: 'Wajib install untuk regulator. Laporan rapi.', postedAt: '2026-04-20T10:00:00Z' },
      { id: 'r2', authorName: 'Ahmad Faisal', authorInitials: 'AF', rating: 4, comment: 'Berguna, tapi loading scan dataset besar masih lambat.', postedAt: '2026-03-18T14:00:00Z' },
      { id: 'r3', authorName: 'Mira Sari', authorInitials: 'MS', rating: 4, comment: 'UI bersih, export PDF langsung pakai template SKK.', postedAt: '2026-02-25T09:00:00Z' },
    ],
  },
  {
    id: 'field-operations-mobile',
    name: 'Field Operations Mobile',
    vendor: 'PHE Digital',
    category: 'utility',
    description: 'Aplikasi field operator untuk capture meter reading + foto sumur.',
    longDescription:
      'Field Operations Mobile adalah PWA untuk operator lapangan. Catat reading meter, foto kondisi sumur, dan log incident — semua sync offline-first ke SPEKTRUM saat connectivity kembali.',
    iconName: 'pin',
    gradient: { from: '#1f8a4a', to: '#7b91ed' },
    screenshots: [
      { id: 'ss-1', from: '#1f8a4a', to: '#7b91ed', caption: 'Meter reading capture' },
      { id: 'ss-2', from: '#7b91ed', to: '#2a5fb8', caption: 'Well photo log' },
      { id: 'ss-3', from: '#2a5fb8', to: '#1f8a4a', caption: 'Incident report form' },
    ],
    permissions: ['datasets:write:production', 'location:gps', 'camera:capture'],
    pricing: 'free',
    rating: 4.3,
    downloads: 3210,
    version: '2.5.0',
    lastUpdated: '2026-04-12T11:00:00Z',
    features: [
      'Offline-first sync',
      'Geo-tagged photo capture',
      'Meter reading dengan validasi',
      'Incident report wizard',
    ],
    reviews: [
      { id: 'r1', authorName: 'Yudi Pratama', authorInitials: 'YP', rating: 5, comment: 'Offline mode jalan bagus di lapangan Mahakam.', postedAt: '2026-04-08T10:00:00Z' },
      { id: 'r2', authorName: 'Dewa Kurnia', authorInitials: 'DK', rating: 4, comment: 'Capture foto cepat, tapi GPS kadang drift di area terpencil.', postedAt: '2026-03-12T13:00:00Z' },
    ],
  },
  {
    id: 'postgis-query-builder',
    name: 'PostGIS Query Builder',
    vendor: 'OpenSpatial',
    category: 'integration',
    description: 'Build spatial query (ST_Within, ST_Intersects) visual.',
    longDescription:
      'PostGIS Query Builder memungkinkan analyst membuat spatial query kompleks tanpa nulis SQL. Drag dataset, pilih operator (within, intersects, buffer), preview hasil di map, lalu export sebagai SQL atau dataset baru.',
    iconName: 'map',
    gradient: { from: '#2a5fb8', to: '#7a5cb8' },
    screenshots: [
      { id: 'ss-1', from: '#2a5fb8', to: '#7a5cb8', caption: 'Visual query canvas' },
      { id: 'ss-2', from: '#7a5cb8', to: '#1f8a4a', caption: 'Map preview' },
      { id: 'ss-3', from: '#1f8a4a', to: '#2a5fb8', caption: 'Generated SQL output' },
    ],
    permissions: ['datasets:read:concession', 'datasets:read:well-log', 'spatial:query'],
    pricing: 'free',
    rating: 4.5,
    downloads: 987,
    version: '1.3.0',
    lastUpdated: '2026-03-25T15:00:00Z',
    features: [
      'Drag-drop visual query canvas',
      'ST_Within, ST_Intersects, ST_Buffer support',
      'Map preview real-time',
      'Export SQL atau dataset baru',
    ],
    reviews: [
      { id: 'r1', authorName: 'Iwan Setia', authorInitials: 'IS', rating: 5, comment: 'GIS analyst tanpa SQL jadi mungkin. Top.', postedAt: '2026-03-20T09:00:00Z' },
      { id: 'r2', authorName: 'Nia Hartati', authorInitials: 'NH', rating: 4, comment: 'Visual canvas intuitif, buffer operator paling sering dipakai.', postedAt: '2026-02-15T11:00:00Z' },
    ],
  },
  {
    id: 'well-log-studio',
    name: 'Well Log Studio',
    vendor: 'GeoSoft Labs',
    category: 'visualization',
    description: 'Wireline + LWD log composite viewer dengan track customization.',
    longDescription:
      'Well Log Studio menampilkan composite wireline / LWD log dengan track customization lengkap (GR, RHOB, NPHI, RT, DT). Mendukung multi-well correlation, formation tops marker, dan export PDF report.',
    iconName: 'chart',
    gradient: { from: '#c2840d', to: '#cf3a2a' },
    screenshots: [
      { id: 'ss-1', from: '#c2840d', to: '#cf3a2a', caption: 'Composite log view' },
      { id: 'ss-2', from: '#cf3a2a', to: '#7a5cb8', caption: 'Multi-well correlation' },
      { id: 'ss-3', from: '#7a5cb8', to: '#c2840d', caption: 'Formation marker editor' },
    ],
    permissions: ['datasets:read:well-log', 'export:pdf'],
    pricing: 'paid',
    rating: 4.6,
    downloads: 1654,
    version: '5.2.1',
    lastUpdated: '2026-04-08T10:00:00Z',
    features: [
      'Composite log GR/RHOB/NPHI/RT/DT',
      'Multi-well correlation',
      'Formation tops marker',
      'PDF report export',
    ],
    reviews: [
      { id: 'r1', authorName: 'Hendra Pratama', authorInitials: 'HP', rating: 5, comment: 'Petrofisik tools komplit, integrasi log cepat.', postedAt: '2026-04-01T09:00:00Z' },
      { id: 'r2', authorName: 'Rini Wahyuni', authorInitials: 'RW', rating: 4, comment: 'Multi-well correlation membantu, marker editor jelas.', postedAt: '2026-03-08T14:00:00Z' },
      { id: 'r3', authorName: 'Tomi Saputra', authorInitials: 'TS', rating: 5, comment: 'Export PDF rapi untuk presentasi.', postedAt: '2026-02-20T10:00:00Z' },
    ],
  },
  {
    id: 'decline-curve-analyzer',
    name: 'Decline Curve Analyzer',
    vendor: 'PetroAnalytics',
    category: 'analysis',
    description: 'Arps decline curve fitting (exponential, hyperbolic, harmonic).',
    longDescription:
      'Decline Curve Analyzer mendukung 3 model Arps (exponential, hyperbolic, harmonic) dengan auto-fit dan manual override. Output: EUR estimate + ekonomik cutoff.',
    iconName: 'activity',
    gradient: { from: '#c2840d', to: '#1f8a4a' },
    screenshots: [
      { id: 'ss-1', from: '#c2840d', to: '#1f8a4a', caption: 'Decline fit visualization' },
      { id: 'ss-2', from: '#1f8a4a', to: '#7b91ed', caption: 'EUR estimate' },
    ],
    permissions: ['datasets:read:production', 'compute:short'],
    pricing: 'free',
    rating: 4.2,
    downloads: 845,
    version: '1.2.3',
    lastUpdated: '2026-03-15T12:00:00Z',
    features: [
      'Arps exponential/hyperbolic/harmonic',
      'Auto-fit + manual override',
      'EUR estimate dengan ekonomik cutoff',
    ],
    reviews: [
      { id: 'r1', authorName: 'Surya Wibowo', authorInitials: 'SW', rating: 4, comment: 'Cocok untuk decline analysis sederhana, gratis pula.', postedAt: '2026-03-10T11:00:00Z' },
      { id: 'r2', authorName: 'Ayu Lestari', authorInitials: 'AL', rating: 4, comment: 'Auto-fit kadang miss outlier, tapi manual override OK.', postedAt: '2026-02-22T13:00:00Z' },
    ],
  },
  {
    id: 'satellite-monitor',
    name: 'Satellite Monitor',
    vendor: 'OrbitalEdge',
    category: 'integration',
    description: 'Monitor area konsesi via Sentinel-2 + alert anomali.',
    longDescription:
      'Satellite Monitor mengintegrasikan Sentinel-2 imagery untuk monitoring area konsesi. Auto-alert untuk perubahan vegetation index, deteksi flaring, dan land-use change. Cocok untuk ESG reporting.',
    iconName: 'globe',
    gradient: { from: '#1f8a4a', to: '#2a5fb8' },
    screenshots: [
      { id: 'ss-1', from: '#1f8a4a', to: '#2a5fb8', caption: 'Sentinel-2 imagery + NDVI' },
      { id: 'ss-2', from: '#2a5fb8', to: '#7a5cb8', caption: 'Anomaly detection alerts' },
      { id: 'ss-3', from: '#7a5cb8', to: '#1f8a4a', caption: 'Time-lapse change detection' },
    ],
    permissions: ['datasets:read:concession', 'external:sentinel-hub'],
    pricing: 'paid',
    rating: 4.4,
    downloads: 632,
    version: '0.9.5',
    lastUpdated: '2026-04-25T16:00:00Z',
    features: [
      'Sentinel-2 imagery integration',
      'NDVI anomaly detection',
      'Flaring detection (SWIR)',
      'ESG report export',
    ],
    reviews: [
      { id: 'r1', authorName: 'Bayu Adhi', authorInitials: 'BA', rating: 5, comment: 'Untuk ESG monitoring sangat berguna, NDVI alert akurat.', postedAt: '2026-04-15T10:00:00Z' },
      { id: 'r2', authorName: 'Mela Sianipar', authorInitials: 'MS', rating: 4, comment: 'Cocok untuk regulator, time-lapse fitur favorit.', postedAt: '2026-03-22T14:00:00Z' },
    ],
  },
  {
    id: 'doc-ocr-extractor',
    name: 'Doc OCR Extractor',
    vendor: 'AlasBuana Labs',
    category: 'utility',
    description: 'OCR + entity extraction untuk PSC document (PDF).',
    longDescription:
      'Doc OCR Extractor menggunakan OCR + NLP untuk mengekstrak entity (operator, area, contract date, royalty rate) dari PSC document. Output structured JSON yang bisa di-query.',
    iconName: 'doc',
    gradient: { from: '#5b667e', to: '#2a5fb8' },
    screenshots: [
      { id: 'ss-1', from: '#5b667e', to: '#2a5fb8', caption: 'Upload + OCR preview' },
      { id: 'ss-2', from: '#2a5fb8', to: '#1f8a4a', caption: 'Entity extraction results' },
    ],
    permissions: ['datasets:read:document', 'compute:ocr'],
    pricing: 'free',
    rating: 4.1,
    downloads: 1102,
    version: '0.7.2',
    lastUpdated: '2026-03-30T13:00:00Z',
    features: [
      'OCR untuk PDF scanned',
      'Entity extraction (operator, date, royalty)',
      'Output structured JSON',
    ],
    reviews: [
      { id: 'r1', authorName: 'Eka Wahyu', authorInitials: 'EW', rating: 4, comment: 'OCR akurat untuk PDF cetak, scan tangan masih sulit.', postedAt: '2026-03-25T09:00:00Z' },
      { id: 'r2', authorName: 'Lia Kusuma', authorInitials: 'LK', rating: 4, comment: 'Entity extraction sederhana tapi reliable.', postedAt: '2026-02-28T12:00:00Z' },
    ],
  },
  {
    id: 'esg-dashboard',
    name: 'ESG Dashboard',
    vendor: 'SKK Migas Labs',
    category: 'visualization',
    description: 'Dashboard ESG metric (emisi, water, social impact) per WK.',
    longDescription:
      'ESG Dashboard memvisualisasikan metric ESG (carbon emission, water usage, community investment, HSE incident) per Wilayah Kerja. Mendukung benchmark antar KKKS.',
    iconName: 'shield',
    gradient: { from: '#1f8a4a', to: '#5b667e' },
    screenshots: [
      { id: 'ss-1', from: '#1f8a4a', to: '#5b667e', caption: 'ESG dashboard overview' },
      { id: 'ss-2', from: '#5b667e', to: '#2a5fb8', caption: 'Benchmark antar KKKS' },
      { id: 'ss-3', from: '#2a5fb8', to: '#1f8a4a', caption: 'Time-series emission trend' },
    ],
    permissions: ['datasets:read:production', 'esg:read'],
    pricing: 'free',
    rating: 4.5,
    downloads: 1543,
    version: '2.0.0',
    lastUpdated: '2026-05-05T11:00:00Z',
    features: [
      'CO2 emission tracking',
      'Water usage monitoring',
      'HSE incident dashboard',
      'Cross-KKKS benchmarking',
    ],
    reviews: [
      { id: 'r1', authorName: 'Pak Hendra', authorInitials: 'PH', rating: 5, comment: 'Wajib untuk reporting ESG SKK Migas. Lengkap.', postedAt: '2026-04-28T10:00:00Z' },
      { id: 'r2', authorName: 'Bu Sarah', authorInitials: 'BS', rating: 4, comment: 'Visualisasi rapi, butuh lebih banyak metric water management.', postedAt: '2026-04-05T13:00:00Z' },
    ],
  },
  {
    id: 'fault-network-tracker',
    name: 'Fault Network Tracker',
    vendor: 'SubsurfaceWorks',
    category: 'analysis',
    description: 'Interpretasi fault network 3D dari seismic volume.',
    longDescription:
      'Fault Network Tracker membantu interpreter mendeteksi dan men-pick fault dari seismic volume secara semi-automatic (machine-assisted). Output: fault surface mesh + attribute analysis.',
    iconName: 'layers',
    gradient: { from: '#7a5cb8', to: '#cf3a2a' },
    screenshots: [
      { id: 'ss-1', from: '#7a5cb8', to: '#cf3a2a', caption: 'Auto-pick fault candidates' },
      { id: 'ss-2', from: '#cf3a2a', to: '#c2840d', caption: '3D fault surface mesh' },
    ],
    permissions: ['datasets:read:seismic', 'compute:ml', 'export:mesh'],
    pricing: 'paid',
    rating: 4.3,
    downloads: 421,
    version: '1.1.0',
    lastUpdated: '2026-04-01T10:00:00Z',
    features: [
      'ML-assisted fault picking',
      '3D fault surface mesh',
      'Attribute analysis (throw, dip)',
    ],
    reviews: [
      { id: 'r1', authorName: 'Yono Sutarja', authorInitials: 'YS', rating: 4, comment: 'Auto-pick membantu interpreter senior memprioritas fault penting.', postedAt: '2026-03-28T09:00:00Z' },
      { id: 'r2', authorName: 'Wati Indrawati', authorInitials: 'WI', rating: 4, comment: 'Mesh export bagus untuk handover ke modeling.', postedAt: '2026-03-01T14:00:00Z' },
    ],
  },
  {
    id: 'data-quality-monitor',
    name: 'Data Quality Monitor',
    vendor: 'AlasBuana Labs',
    category: 'utility',
    description: 'Monitor real-time kualitas data pipeline KKKS.',
    longDescription:
      'Data Quality Monitor mengecek kualitas data secara real-time untuk pipeline ingestion dari KKKS. Detect schema drift, value range anomaly, missing field, dan SLA breach. Notifikasi via Slack/email.',
    iconName: 'activity',
    gradient: { from: '#cf3a2a', to: '#5b667e' },
    screenshots: [
      { id: 'ss-1', from: '#cf3a2a', to: '#5b667e', caption: 'Pipeline status dashboard' },
      { id: 'ss-2', from: '#5b667e', to: '#1f8a4a', caption: 'Anomaly alert detail' },
    ],
    permissions: ['datasets:read:*', 'pipeline:read', 'notification:write'],
    pricing: 'free',
    rating: 4.4,
    downloads: 1876,
    version: '3.1.0',
    lastUpdated: '2026-04-22T12:00:00Z',
    features: [
      'Real-time pipeline monitoring',
      'Schema drift detection',
      'Value range anomaly',
      'Slack/email alerts',
    ],
    reviews: [
      { id: 'r1', authorName: 'Adi Pranoto', authorInitials: 'AP', rating: 5, comment: 'Alerting reliable, schema drift detection top.', postedAt: '2026-04-18T11:00:00Z' },
      { id: 'r2', authorName: 'Rina Aulia', authorInitials: 'RA', rating: 4, comment: 'Membantu data steward jaga kualitas ingestion.', postedAt: '2026-03-25T15:00:00Z' },
      { id: 'r3', authorName: 'Doni Setiawan', authorInitials: 'DS', rating: 4, comment: 'Notifikasi Slack tepat waktu, dashboard ringkas.', postedAt: '2026-02-12T10:00:00Z' },
    ],
  },
  {
    id: 'pipeline-integrity-pro',
    name: 'Pipeline Integrity Pro',
    vendor: 'Pertagas Digital',
    category: 'analysis',
    description: 'Inspection report + corrosion prediction untuk pipeline.',
    longDescription:
      'Pipeline Integrity Pro menyatukan inspection report (ILI, ECDA), corrosion rate prediction, dan risk-based inspection scheduling. Mendukung pipeline 1000+ km dengan visualization geo.',
    iconName: 'pin',
    gradient: { from: '#c2840d', to: '#2a5fb8' },
    screenshots: [
      { id: 'ss-1', from: '#c2840d', to: '#2a5fb8', caption: 'Pipeline route + corrosion heatmap' },
      { id: 'ss-2', from: '#2a5fb8', to: '#7a5cb8', caption: 'ILI inspection report' },
      { id: 'ss-3', from: '#7a5cb8', to: '#1f8a4a', caption: 'Risk-based inspection schedule' },
    ],
    permissions: ['datasets:read:concession', 'datasets:read:production', 'compute:long-running'],
    pricing: 'paid',
    rating: 4.5,
    downloads: 354,
    version: '2.3.1',
    lastUpdated: '2026-04-15T14:00:00Z',
    features: [
      'ILI + ECDA inspection report',
      'Corrosion rate prediction',
      'Risk-based inspection scheduling',
      'Pipeline route geo-visualization',
    ],
    reviews: [
      { id: 'r1', authorName: 'Faizal Akbar', authorInitials: 'FA', rating: 5, comment: 'Tools wajib untuk pipeline integrity manager.', postedAt: '2026-04-10T10:00:00Z' },
      { id: 'r2', authorName: 'Tuti Susanti', authorInitials: 'TS', rating: 4, comment: 'RBI scheduling bagus, masih perlu integrasi SAP.', postedAt: '2026-03-15T13:00:00Z' },
    ],
  },
  {
    id: 'rig-tracker',
    name: 'Rig Activity Tracker',
    vendor: 'OffshoreOps',
    category: 'integration',
    description: 'Live tracking rig position + drilling progress.',
    longDescription:
      'Rig Activity Tracker mengintegrasikan AIS signal + WITSML feed untuk monitoring posisi rig dan progres drilling secara real-time. Dashboard nasional + per-block view.',
    iconName: 'bolt',
    gradient: { from: '#2a5fb8', to: '#c2840d' },
    screenshots: [
      { id: 'ss-1', from: '#2a5fb8', to: '#c2840d', caption: 'National rig map' },
      { id: 'ss-2', from: '#c2840d', to: '#1f8a4a', caption: 'Per-block drilling progress' },
    ],
    permissions: ['external:ais', 'external:witsml', 'datasets:read:well-log'],
    pricing: 'paid',
    rating: 4.2,
    downloads: 256,
    version: '0.6.4',
    lastUpdated: '2026-03-20T16:00:00Z',
    features: [
      'AIS rig position tracking',
      'WITSML drilling progress feed',
      'Per-block dashboard',
      'Daily activity report',
    ],
    reviews: [
      { id: 'r1', authorName: 'Adi Wibowo', authorInitials: 'AW', rating: 4, comment: 'Real-time tracking handy untuk regulator monitoring.', postedAt: '2026-03-15T11:00:00Z' },
      { id: 'r2', authorName: 'Rio Pranata', authorInitials: 'RP', rating: 4, comment: 'WITSML feed jalan stabil, AIS akurat di offshore.', postedAt: '2026-02-20T14:00:00Z' },
    ],
  },
];

/** Frozen catalog. */
export const APPS_CATALOG: ReadonlyArray<AppRecord> = Object.freeze(APPS_RAW);

/* ─── Categories metadata (untuk filter chips) ─────────────────────────── */

export const APP_CATEGORIES: ReadonlyArray<{ id: AppCategory; label: string }> = [
  { id: 'visualization', label: 'Visualisasi' },
  { id: 'analysis', label: 'Analisis' },
  { id: 'integration', label: 'Integrasi' },
  { id: 'utility', label: 'Utilitas' },
];
