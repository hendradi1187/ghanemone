/**
 * HomePage — Landing page Ghanem.one di route `/`.
 *
 * Standalone layout TANPA AppShell sidebar. Punya TopNav minimal sendiri
 * (logo + navigasi ke app routes) sehingga merasakan "marketing page" feel
 * yang bersih sebelum user masuk ke platform.
 *
 * Urutan section (top-to-bottom):
 *   1. HomeTopNav      — fixed/sticky nav minimal
 *   2. HeroSection     — ~60-70vh, tagline + CTA
 *   3. StatsStrip      — 4 angka statistik platform + konteks deskripsi
 *   4. AboutSection    — intro platform untuk international visitor
 *   5. FeaturesGrid    — 8 kapabilitas utama platform
 *   6. DataFlowDiagram — 5-step arsitektur SPEKTRUM
 *   7. KeyBenefitsBand — dark navy, 5 benefit items
 *   8. HomeFooter      — minimal footer
 *
 * Routing note: di router.tsx `/` sekarang langsung render HomePage,
 * BUKAN nested di dalam AppShell. AppShell tetap dipakai untuk `/explore`,
 * `/map`, dll via route `/app/*`.
 */
import { useNavigate } from 'react-router-dom';
import { Container } from '@ghanem/ui';
import { DataFlowDiagram } from '../components/home/DataFlowDiagram';
import { KeyBenefitsBand } from '../components/home/KeyBenefitsBand';
import { AboutSection } from '../components/home/AboutSection';
import { FeaturesGrid } from '../components/home/FeaturesGrid';

// ── HomeTopNav ─────────────────────────────────────────────────────────────

/** Nav minimal di atas hero — logo kiri, link navigasi kanan. */
function HomeTopNav(): JSX.Element {
  const navigate = useNavigate();

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-nav',
        'bg-white/95 backdrop-blur-floater',
        'border-b border-line',
        'h-14',
      ].join(' ')}
    >
      <Container size="2xl" paddingX="4" className="h-full flex items-center justify-between">

        {/* Logo "GO" monogram + nama */}
        <a
          href="/"
          className={[
            'flex items-center gap-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-green-500 rounded-1',
          ].join(' ')}
          aria-label="Ghanem.one — Home"
        >
          {/* Monogram "GO" */}
          <span
            aria-hidden="true"
            className={[
              'flex items-center justify-center',
              'w-8 h-8 rounded-2 bg-green-500 text-white',
              'text-sm font-bold font-display tracking-tight leading-none',
            ].join(' ')}
          >
            GO
          </span>
          <span className="text-h3 font-bold font-display text-ink hidden sm:block">
            Ghanem.one
          </span>
        </a>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          <NavLink onClick={() => navigate('/explore')}>Explore</NavLink>
          <NavLink onClick={() => navigate('/map')}>Map</NavLink>
          <NavLink onClick={() => navigate('/')}>Dashboard</NavLink>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={[
              'ml-2 inline-flex items-center',
              'h-8 px-4 rounded-2',
              'bg-green-500 text-white text-sm font-medium',
              'hover:bg-green-600 active:bg-green-700',
              'transition-colors duration-hf ease-hf',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:outline-green-500',
            ].join(' ')}
          >
            Sign In
          </button>
        </nav>

      </Container>
    </header>
  );
}

interface NavLinkProps {
  onClick: () => void;
  children: React.ReactNode;
}

function NavLink({ onClick, children }: NavLinkProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'hidden md:inline-flex items-center',
        'h-8 px-3 rounded-2',
        'text-sm font-medium text-ink-3',
        'hover:text-ink hover:bg-surface-2',
        'transition-colors duration-hf ease-hf',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-green-500',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ── HeroSection ────────────────────────────────────────────────────────────

function HeroSection(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section
      aria-label="Welcome to Ghanem.one"
      className={[
        'relative min-h-[65vh] flex items-center',
        'pt-14', // offset untuk fixed nav
        /* Gradient latar: dari navy-gelap ke hijau-forest sangat subtle */
        'bg-gradient-to-br from-ink-2 via-blue-900 to-green-700',
        'overflow-hidden',
      ].join(' ')}
    >
      {/* Dekorasi pattern — grid dots subtle */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Dekorasi circle blur kanan atas */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl"
      />

      <Container size="xl" paddingX="4" className="relative z-10 py-16 lg:py-24">
        <div className="max-w-3xl">

          {/* Trust badge */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
                'bg-green-500/20 border border-green-400/30',
                'text-green-300 text-xs font-semibold',
              ].join(' ')}
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Official SKK Migas Platform · Platform Resmi
            </span>
          </div>

          {/* H1 — English primary, Indonesian sub */}
          <h1
            className={[
              'font-display font-bold text-white',
              'text-[clamp(28px,5vw,52px)]',
              'leading-tight tracking-display',
              'mb-3',
            ].join(' ')}
          >
            Indonesia's National
            <br />
            <span className="text-green-400">Spatial Intelligence</span> Platform
          </h1>

          {/* Indonesian sub-line */}
          <p className="text-white/50 text-sm font-medium mb-6 uppercase tracking-cap">
            Satu Peta Nasional Hulu Migas Indonesia
          </p>

          {/* Subtitle — English */}
          <p
            className={[
              'text-white/70 leading-normal',
              'text-[clamp(14px,2vw,18px)]',
              'max-w-xl mb-8',
            ].join(' ')}
          >
            One unified platform for SKK Migas and KKKS operators to explore, govern, and
            analyze geospatial data across all 38 active work areas — powered by AI Intelligence
            and built for world-class governance.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className={[
                'inline-flex items-center gap-2',
                'h-12 px-6 rounded-2',
                'bg-green-500 text-white text-sm font-semibold',
                'hover:bg-green-400 active:bg-green-600',
                'transition-colors duration-hf ease-hf shadow-4',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-green-300',
              ].join(' ')}
            >
              <span aria-hidden="true">⊞</span>
              Explore Platform
            </button>

            <button
              type="button"
              onClick={() => navigate('/map')}
              className={[
                'inline-flex items-center gap-2',
                'h-12 px-6 rounded-2',
                'bg-white/10 text-white text-sm font-semibold',
                'border border-white/30',
                'hover:bg-white/20 active:bg-white/30',
                'transition-colors duration-hf ease-hf',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'focus-visible:outline-white/70',
              ].join(' ')}
            >
              <span aria-hidden="true">🗺</span>
              View Interactive Map
            </button>
          </div>

          {/* Partner trust logos — teks saja, ringan */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-white/40 text-xs font-medium uppercase tracking-cap">
              Trusted by:
            </span>
            {['SKK Migas', 'PHE ONWJ', 'Medco E&P', 'PSN', 'Harbour Energy'].map((org) => (
              <span
                key={org}
                className="text-white/60 text-xs font-semibold"
              >
                {org}
              </span>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}

// ── StatsStrip ─────────────────────────────────────────────────────────────

interface Stat {
  value: string;
  label: string;
  /** Konteks tambahan untuk international visitor */
  description: string;
  /** Tone warna angka untuk variasi visual */
  valueClass: string;
}

const STATS: Stat[] = [
  {
    value: '47',
    label: 'Datasets',
    description: 'Across Indonesian upstream operators',
    valueClass: 'text-green-500',
  },
  {
    value: '8',
    label: 'Providers',
    description: 'Major KKKS partners connected',
    valueClass: 'text-blue-500',
  },
  {
    value: '38',
    label: 'WK Concession Blocks',
    description: 'Active work areas nationwide',
    valueClass: 'text-purple-500',
  },
  {
    value: '98%',
    label: 'Data Availability',
    description: 'SLA-backed uptime',
    valueClass: 'text-amber-500',
  },
];

function StatsStrip(): JSX.Element {
  return (
    <section
      aria-label="Platform statistics"
      className="bg-surface border-b border-line py-6"
    >
      <Container size="2xl" paddingX="4">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span
                  className={[
                    'block font-display font-bold text-[clamp(24px,3vw,36px)]',
                    'leading-tight tracking-display',
                    stat.valueClass,
                  ].join(' ')}
                >
                  {stat.value}
                </span>
                <span className="block text-xs font-medium text-ink-4 mt-0.5 uppercase tracking-cap">
                  {stat.label}
                </span>
                <span className="block text-xs text-ink-4 mt-1 leading-tight">
                  {stat.description}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

// ── HomeFooter ─────────────────────────────────────────────────────────────

function HomeFooter(): JSX.Element {
  return (
    <footer
      className="bg-surface border-t border-line py-8"
      aria-label="Footer"
    >
      <Container size="2xl" paddingX="4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          {/* Logo + deskripsi singkat */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex items-center justify-center w-8 h-8 rounded-2 bg-green-500 text-white text-sm font-bold font-display"
            >
              GO
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Ghanem.one</p>
              <p className="text-xs text-ink-4">
                Spatial Intelligence Platform · Indonesia Upstream Oil &amp; Gas
              </p>
            </div>
          </div>

          {/* Copyright + links */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-ink-4">
            <p>&copy; {new Date().getFullYear()} Ghanem Technology. All rights reserved.</p>
            <nav aria-label="Footer navigation" className="flex items-center gap-4">
              <a
                href="/explore"
                className={[
                  'hover:text-ink transition-colors duration-hf ease-hf',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-green-500 rounded-1',
                ].join(' ')}
              >
                Explore Data
              </a>
              <a
                href="/map"
                className={[
                  'hover:text-ink transition-colors duration-hf ease-hf',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-green-500 rounded-1',
                ].join(' ')}
              >
                Map
              </a>
              <a
                href="/login"
                className={[
                  'hover:text-ink transition-colors duration-hf ease-hf',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-green-500 rounded-1',
                ].join(' ')}
              >
                Sign In
              </a>
            </nav>
          </div>

        </div>
      </Container>
    </footer>
  );
}

// ── HomePage (export utama) ────────────────────────────────────────────────

export function HomePage(): JSX.Element {
  return (
    <>
      {/* Skip link untuk aksesibilitas */}
      <a
        href="#main-content"
        className={[
          'sr-only focus:not-sr-only',
          'absolute top-2 left-2 z-tooltip',
          'px-3 py-2 bg-green-700 text-white rounded-2 text-sm font-medium',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-green-500',
        ].join(' ')}
      >
        Skip to main content
      </a>

      <HomeTopNav />

      <main id="main-content" tabIndex={-1}>
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Stats strip */}
        <StatsStrip />

        {/* 3. About platform — context untuk international visitor */}
        <AboutSection />

        {/* 4. Features grid — 8 kapabilitas utama */}
        <FeaturesGrid />

        {/* 5. Data flow architecture */}
        <DataFlowDiagram />

        {/* 6. Key benefits band */}
        <KeyBenefitsBand />

        {/* 7. Footer */}
        <HomeFooter />
      </main>
    </>
  );
}

export default HomePage;
