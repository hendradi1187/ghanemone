/**
 * DataFlowDiagram — 5-langkah arsitektur alur data dari ekosistem SPEKTRUM.
 *
 * Menampilkan diagram horizontal yang memperlihatkan perjalanan data dari
 * KKKS Internal System hingga Consumption Layer (Ghanem.one).
 *
 * Referensi visual: docs/WhatsApp Image 2026-05-26 at 21.42.24.jpeg — bagian bawah.
 *
 * Responsive:
 *   - Desktop (lg+)  : 12-col grid — deskripsi kiri (2), 5 steps (9), legend kanan (1)
 *   - Tablet  (md)   : deskripsi di atas full-width, 5 steps scrollable row
 *   - Mobile  (sm-)  : stack vertikal, setiap step full-width
 */
import { Container } from '@ghanem/ui';

// ── Tipe data ──────────────────────────────────────────────────────────────

interface StepItem {
  icon: string; // Karakter unicode / emoji sederhana — no dep extra
  label: string;
}

interface FlowStep {
  id: number;
  title: string;
  layer: string;
  /** Tailwind color key — hanya digunakan untuk border-top accent. */
  accentClass: string;
  /** Badge teks untuk logo brand kecil (opsional). */
  brandBadge?: string;
  items: StepItem[];
}

interface LegendItem {
  label: string;
  /** Tailwind border/text color class untuk garis indikator. */
  colorClass: string;
  /** Tipe garis: solid | dashed | dotted. */
  lineType: 'solid' | 'dashed' | 'dotted';
}

// ── Data konstanta ─────────────────────────────────────────────────────────

const STEPS: FlowStep[] = [
  {
    id: 1,
    title: 'KKKS INTERNAL SYSTEM',
    layer: 'Data Owner',
    accentClass: 'border-blue-500',
    items: [
      { icon: '🗺', label: 'GIS Studio' },
      { icon: '📄', label: 'PSC Documents' },
      { icon: '🏭', label: 'Physical Warehouse' },
      { icon: '📁', label: 'Files in Workstation' },
    ],
  },
  {
    id: 2,
    title: 'CONNECTOR & FEDERATION',
    layer: 'Connector Layer',
    accentClass: 'border-blue-300',
    items: [
      { icon: '⚡', label: 'SPARK Connector' },
      { icon: '↓', label: 'Metadata Harvesting' },
      { icon: '🔄', label: 'Data Transformation' },
      { icon: '🔒', label: 'Secure Transmission' },
    ],
  },
  {
    id: 3,
    title: 'SPEKTRUM DATASPACE',
    layer: 'Dataspace Layer',
    accentClass: 'border-purple-500',
    brandBadge: 'DBEP',
    items: [
      { icon: '🗄', label: 'Metadata Broker' },
      { icon: '📋', label: 'Policy & Contract' },
      { icon: '📍', label: 'Spatial & Context' },
      { icon: '🔐', label: 'Security & Consent' },
      { icon: '📊', label: 'Audit & Monitoring' },
    ],
  },
  {
    id: 4,
    title: 'GOVERNANCE & APPLICATION',
    layer: 'Governance Layer',
    accentClass: 'border-amber-500',
    brandBadge: 'GO',
    items: [
      { icon: '↑', label: 'Data Submission' },
      { icon: '✓', label: 'Verification & Review' },
      { icon: '📎', label: 'Compliance & Audit' },
      { icon: '✉', label: 'Approval & Publication' },
    ],
  },
  {
    id: 5,
    title: 'CONSUMPTION LAYER',
    layer: 'Application Layer',
    accentClass: 'border-green-500',
    brandBadge: 'GHANEM.ONE',
    items: [
      { icon: '🗺', label: 'Interactive Map' },
      { icon: '📈', label: 'Analytics & AI' },
      { icon: '📡', label: 'Monitoring & Reporting' },
      { icon: '🔌', label: 'API & Data Services' },
    ],
  },
];

const LEGEND_ITEMS: LegendItem[] = [
  { label: 'Data Connection', colorClass: 'text-blue-500', lineType: 'solid' },
  { label: 'Governance Flow', colorClass: 'text-amber-500', lineType: 'dashed' },
  { label: 'Metadata Flow', colorClass: 'text-purple-500', lineType: 'dotted' },
  { label: 'Monitoring & Audit', colorClass: 'text-green-500', lineType: 'dashed' },
];

// ── Sub-komponen ───────────────────────────────────────────────────────────

/** Badge angka step (1–5) dengan warna accent border-top. */
function StepBadge({ id }: { id: number }): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink-2 text-white text-xs font-bold flex-shrink-0"
    >
      {id}
    </span>
  );
}

/** Brand badge kecil untuk DBEP, GO, dan GHANEM.ONE */
function BrandBadge({ text }: { text: string }): JSX.Element {
  const isGhanem = text === 'GHANEM.ONE' || text === 'GO';
  return (
    <span
      className={[
        'inline-flex items-center px-1.5 py-0.5 rounded-1',
        'text-[9px] font-bold tracking-widest leading-none',
        isGhanem
          ? 'bg-green-500 text-white'
          : 'bg-blue-500 text-white',
      ].join(' ')}
    >
      {text}
    </span>
  );
}

/** Satu kolom step dalam diagram. */
function StepColumn({ step }: { step: FlowStep }): JSX.Element {
  return (
    <article
      aria-label={`Step ${step.id}: ${step.title}`}
      className={[
        'flex flex-col rounded-3 bg-surface border border-line',
        'border-t-4',
        step.accentClass,
        'shadow-1 min-w-[160px]',
      ].join(' ')}
    >
      {/* Header step */}
      <div className="flex items-start gap-2 p-3 pb-2">
        <StepBadge id={step.id} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-[10px] font-bold uppercase tracking-cap text-ink leading-tight">
              {step.title}
            </h3>
            {step.brandBadge && <BrandBadge text={step.brandBadge} />}
          </div>
        </div>
      </div>

      {/* Divider tipis */}
      <div className="h-px bg-line mx-3" aria-hidden="true" />

      {/* Item list */}
      <ul
        className="flex-1 p-3 pt-2 space-y-1.5"
        aria-label={`Components of ${step.title}`}
      >
        {step.items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-1.5 text-xs text-ink-3"
          >
            <span aria-hidden="true" className="text-sm flex-shrink-0 w-4 text-center">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      {/* Footer layer label */}
      <div className="px-3 pb-3 pt-1">
        <span className="text-[9px] text-ink-4 font-medium tracking-cap">
          ({step.layer})
        </span>
      </div>
    </article>
  );
}

/** Indikator garis untuk item legend */
function LegendLine({
  colorClass,
  lineType,
}: {
  colorClass: string;
  lineType: LegendItem['lineType'];
}): JSX.Element {
  const borderStyle =
    lineType === 'solid'
      ? 'border-solid'
      : lineType === 'dashed'
        ? 'border-dashed'
        : 'border-dotted';

  return (
    <span
      aria-hidden="true"
      className={[
        'inline-block w-6 h-0 border-t-2',
        borderStyle,
        colorClass.replace('text-', 'border-'),
      ].join(' ')}
    />
  );
}

/** Legend kanan — tipe aliran data */
function DataFlowLegend(): JSX.Element {
  return (
    <aside aria-label="Data flow legend" className="lg:flex flex-col gap-2">
      <h3 className="text-[10px] font-bold uppercase tracking-cap text-ink mb-2">
        DATA FLOW
      </h3>
      <ul className="space-y-2">
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <LegendLine colorClass={item.colorClass} lineType={item.lineType} />
            <span className={['text-[10px] font-medium', item.colorClass].join(' ')}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Panah penghubung antar step (hanya visible di ≥ lg, horizontal) */
function StepArrow(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex items-center justify-center self-center flex-shrink-0"
    >
      <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="text-ink-5">
        <path
          d="M0 6h16M12 2l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────

export function DataFlowDiagram(): JSX.Element {
  return (
    <section
      aria-label="Data Sources from the SPEKTRUM Ecosystem"
      className="bg-surface-bg py-12 lg:py-16"
    >
      <Container size="2xl" paddingX="4">
        {/* Grid utama 12 kolom */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6 items-start">

          {/* ── Kolom kiri: deskripsi (col-span-12 mobile → col-span-2 lg) ── */}
          <div className="col-span-12 lg:col-span-2 bg-ink-2 text-white rounded-3 p-5 flex flex-col gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-cap text-green-400 mb-1 uppercase">
                Architecture
              </p>
              <h2 className="text-sm font-bold leading-snug text-white">
                SUMBER DATA DARI EKOSISTEM SPEKTRUM
              </h2>
              {/* English subtitle untuk international visitor */}
              <p className="text-[10px] text-green-300/70 mt-1 leading-snug">
                Data Sources from the SPEKTRUM Ecosystem
              </p>
            </div>
            <p className="text-[11px] text-ink-6 leading-relaxed">
              Semua data pada Ghanem.one berasal dari ekosistem SPEKTRUM Dataspace yang
              terhubung secara aman dan tergovernance dari seluruh KKKS mitra.
            </p>
            <a
              href="/explore"
              className={[
                'inline-flex items-center gap-1 text-xs font-medium text-green-400',
                'hover:text-green-200 transition-colors duration-hf ease-hf',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-green-400 rounded-1',
              ].join(' ')}
            >
              Learn more
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* ── 5 Step columns (col-span-12 mobile → col-span-9 lg) ── */}
          <div className="col-span-12 lg:col-span-9">
            {/* Scrollable wrapper di mobile/tablet — snap horizontal */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-visible">
              <div className="flex gap-2 lg:grid lg:grid-cols-5 lg:gap-3 min-w-max lg:min-w-0">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-stretch gap-2 w-[168px] lg:w-auto">
                    <StepColumn step={step} />
                    {/* Panah antar step — kecuali setelah step terakhir */}
                    {index < STEPS.length - 1 && <StepArrow />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Legend kanan (col-span-12 mobile → col-span-1 lg) ── */}
          <div className="col-span-12 lg:col-span-1">
            <DataFlowLegend />
          </div>

        </div>
      </Container>
    </section>
  );
}

export default DataFlowDiagram;
