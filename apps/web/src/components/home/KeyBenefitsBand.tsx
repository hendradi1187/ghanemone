/**
 * KeyBenefitsBand — dark navy band dengan 5 benefit items.
 *
 * Desain: dark navy background, teks putih, ikon circular overlay, 5 kolom.
 * Referensi: docs/WhatsApp Image 2026-05-26 at 21.42.24.jpeg — bagian paling bawah.
 *
 * Responsive:
 *   - Desktop (lg+): 5 kolom dalam satu baris
 *   - Tablet  (md) : 3 kolom + 2 kolom wrap
 *   - Mobile  (sm-): 1 kolom stack
 */
import { Container } from '@ghanem/ui';

// ── Tipe data ──────────────────────────────────────────────────────────────

interface Benefit {
  /** SVG path untuk ikon (dirender inline — hindari dependency ekstra). */
  iconPath: string;
  /** Viewbox ikon. */
  iconViewBox: string;
  /** Indonesian primary title */
  title: string;
  /** Indonesian subtitle */
  subtitle: string;
  /** English translation line untuk international visitor */
  englishLine: string;
}

// ── Data konstanta ─────────────────────────────────────────────────────────

/**
 * Ikon inline SVG — Lucide-compatible stroke icons.
 * Dipilih berdasarkan semantik benefit masing-masing.
 */
const BENEFITS: Benefit[] = [
  {
    // Globe2 path
    iconPath:
      'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
    iconViewBox: '0 0 24 24',
    title: 'Satu Peta Nasional',
    subtitle: 'Terintegrasi',
    englishLine: 'One Integrated National Map',
  },
  {
    // ShieldCheck path
    iconPath:
      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    iconViewBox: '0 0 24 24',
    title: 'Data Akurat & Terpercaya',
    subtitle: 'Single Source of Truth',
    englishLine: 'Accurate & Trusted Data',
  },
  {
    // Lock path
    iconPath:
      'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4M12 16v2',
    iconViewBox: '0 0 24 24',
    title: 'Keamanan & Governance',
    subtitle: 'Berkelas Dunia',
    englishLine: 'World-class Security & Governance',
  },
  {
    // Sparkles path
    iconPath:
      'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5.5 2l.8 2.2L8.5 5l-2.2.8L5.5 8l-.8-2.2L2.5 5l2.2-.8L5.5 2zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z',
    iconViewBox: '0 0 24 24',
    title: 'Keputusan Lebih Cepat',
    subtitle: 'dengan AI Intelligence',
    englishLine: 'Faster Decisions with AI',
  },
  {
    // TrendingUp path
    iconPath: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
    iconViewBox: '0 0 24 24',
    title: 'Interoperable & Scalable',
    subtitle: 'Untuk Masa Depan',
    englishLine: 'Interoperable & Future-ready',
  },
];

// ── Sub-komponen ───────────────────────────────────────────────────────────

interface BenefitItemProps {
  benefit: Benefit;
}

function BenefitItem({ benefit }: BenefitItemProps): JSX.Element {
  return (
    <div
      className={[
        'flex flex-col items-center text-center gap-3 px-4 py-2',
        'group',
      ].join(' ')}
    >
      {/* Ikon circular dengan hover effect */}
      <div
        aria-hidden="true"
        className={[
          'flex items-center justify-center',
          'w-12 h-12 rounded-full',
          'bg-white/10 text-white',
          'ring-1 ring-white/20',
          'transition-transform duration-hf ease-hf',
          'group-hover:scale-110 group-hover:bg-white/20',
        ].join(' ')}
      >
        <svg
          width="24"
          height="24"
          viewBox={benefit.iconViewBox}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={benefit.iconPath} />
        </svg>
      </div>

      {/* Teks */}
      <div>
        <p className="text-sm font-semibold text-white leading-snug">
          {benefit.title}
        </p>
        <p className="text-xs text-white/60 mt-0.5 leading-tight">
          {benefit.subtitle}
        </p>
        {/* English translation untuk international visitor */}
        <p className="text-[10px] text-white/35 mt-1 leading-tight font-medium">
          {benefit.englishLine}
        </p>
      </div>
    </div>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────

export function KeyBenefitsBand(): JSX.Element {
  return (
    <section
      aria-label="Key benefits of Ghanem.one"
      /* navy: blue-900 dari token (#0a1a3a) */
      className="bg-blue-900 py-12 lg:py-16"
    >
      <Container size="2xl" paddingX="4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-0">

          {/* Label "KEY BENEFITS" di paling kiri */}
          <div className="flex-shrink-0 lg:w-36 lg:pr-6 lg:border-r lg:border-white/20">
            <p
              className={[
                'text-[10px] font-bold uppercase tracking-widest',
                'text-white/50 mb-1',
              ].join(' ')}
            >
              KEY
            </p>
            <h2 className="text-lg font-bold text-white leading-tight">
              BENEFITS
            </h2>
          </div>

          {/* 5 item benefit */}
          <div
            className={[
              'flex-1',
              'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
              'gap-2 lg:gap-0',
              'lg:divide-x lg:divide-white/10',
            ].join(' ')}
          >
            {BENEFITS.map((benefit) => (
              <BenefitItem key={benefit.title} benefit={benefit} />
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}

export default KeyBenefitsBand;
