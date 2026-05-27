/**
 * FeaturesGrid — 8-card grid yang memperlihatkan kapabilitas utama platform.
 *
 * Tujuan: visitor baru (terutama internasional) bisa memahami apa yang
 * platform lakukan dalam beberapa detik, sebelum deep-dive ke detail.
 *
 * Posisi di HomePage: setelah AboutSection, sebelum DataFlowDiagram.
 *
 * Responsive:
 *   - Mobile  (sm-): 1 kolom
 *   - Tablet  (sm) : 2 kolom
 *   - Desktop (lg+): 4 kolom × 2 baris
 */
import { useNavigate } from 'react-router-dom';
import { Container, Icon, type IconName } from '@ghanem/ui';

// ── Tipe data ──────────────────────────────────────────────────────────────

interface Feature {
  /** Nama icon dari IconName — harus ada di iconMap */
  icon: IconName;
  title: string;
  description: string;
  /** Route tujuan saat card di-klik */
  route: string;
}

// ── Data konstanta ─────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    icon: 'map',
    title: 'Interactive Map',
    description: 'Explore WK boundaries, wells, and pipelines across Indonesia with Leaflet + GeoJSON layers.',
    route: '/map',
  },
  {
    icon: 'search',
    title: 'Dataset Explorer',
    description: 'Search 47+ datasets with smart filters by provider, domain, format, and sensitivity.',
    route: '/explore',
  },
  {
    icon: 'sparkle',
    title: 'AI Assistant',
    description: 'Ask questions in natural language and get instant insights from your spatial data.',
    route: '/dashboard',
  },
  {
    icon: 'activity',
    title: 'Real-time Monitoring',
    description: 'Track live pipeline status, data ingestion jobs, and system alerts in one dashboard.',
    route: '/monitoring',
  },
  {
    icon: 'shield',
    title: 'Compliance Workflow',
    description: 'Submit, review, and approve data with audit trails meeting SKK Migas requirements.',
    route: '/compliance',
  },
  {
    icon: 'chart',
    title: 'Analytics Builder',
    description: 'Build custom charts and dashboards with drag-and-drop query construction.',
    route: '/analytics',
  },
  {
    icon: 'user',
    title: 'Team Workspaces',
    description: 'Collaborate on projects with Kanban boards, shared queries, and saved analyses.',
    route: '/workspace',
  },
  {
    icon: 'upload',
    title: 'Secure Upload',
    description: 'KKKS operators submit SHP, KML, SEG-Y, and PDF data through a guided wizard.',
    route: '/upload',
  },
];

// ── Sub-komponen ───────────────────────────────────────────────────────────

interface FeatureCardProps {
  feature: Feature;
  onNavigate: (route: string) => void;
}

function FeatureCard({ feature, onNavigate }: FeatureCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onNavigate(feature.route)}
      className={[
        'group text-left p-5 rounded-3',
        'bg-surface border border-line',
        'hover:border-green-300 hover:shadow-3',
        'transition-all duration-hf ease-hf',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-green-500',
      ].join(' ')}
      aria-label={`Learn more about ${feature.title}`}
    >
      {/* Icon circle */}
      <div
        className={[
          'flex items-center justify-center',
          'w-10 h-10 rounded-2 mb-4',
          'bg-green-50 text-green-700',
          'group-hover:bg-green-100 transition-colors duration-hf',
        ].join(' ')}
        aria-hidden="true"
      >
        <Icon name={feature.icon} size={20} />
      </div>

      {/* Title */}
      <h3 className="text-body font-semibold text-ink mb-2">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-ink-4 leading-normal">
        {feature.description}
      </p>
    </button>
  );
}

// ── Komponen utama ─────────────────────────────────────────────────────────

export function FeaturesGrid(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Platform features"
      className="bg-white py-16 lg:py-24"
    >
      <Container size="xl" paddingX="4">

        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block text-cap text-green-700 font-semibold tracking-cap uppercase mb-3">
            Platform Features
          </span>
          <h2 className="font-display font-bold text-ink text-h1 tracking-display mb-3">
            Everything you need to manage upstream data
          </h2>
          <p className="text-ink-3 text-body leading-normal">
            Eight integrated capabilities — built specifically for Indonesia's
            upstream oil &amp; gas ecosystem.
          </p>
        </div>

        {/* Feature grid 2×4 (mobile: 1 col → sm: 2 col → lg: 4 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              onNavigate={navigate}
            />
          ))}
        </div>

      </Container>
    </section>
  );
}

export default FeaturesGrid;
